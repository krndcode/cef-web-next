import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { sendStoreOrderEmail } from "@/lib/store-email";
import {
  inspectPaystackTransaction,
  markStoreOrderPaid,
} from "@/lib/paystack";
import { parseGhsToPesewas } from "@/lib/store-validation";
import { z } from "zod";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("quote"),
    deliveryFeeGhs: z.union([z.string(), z.number()]),
  }),
  z.object({
    action: z.literal("status"),
    status: z.enum(["shipped", "delivered", "cancelled"]),
  }),
]);

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const actor = await getStoreUser();
    if (actor?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = await context.params;
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
    }

    let confirmedFailedReference: string | null = null;
    if (
      parsed.data.action === "status" &&
      parsed.data.status === "cancelled"
    ) {
      const paymentResult = await getStoreDb().query<{
        paystack_reference: string | null;
        payment_is_stale: boolean;
      }>(
        `SELECT paystack_reference,
                updated_at <= NOW() - INTERVAL '15 minutes' AS payment_is_stale
         FROM store_orders
         WHERE id = $1 AND payment_status = 'pending'`,
        [id],
      );
      const pendingPayment = paymentResult.rows[0];
      if (pendingPayment) {
        if (!pendingPayment.payment_is_stale || !pendingPayment.paystack_reference) {
          return NextResponse.json(
            { error: "A payment is still in progress and cannot be cancelled yet." },
            { status: 409 },
          );
        }

        const inspectedPayment = await inspectPaystackTransaction(
          pendingPayment.paystack_reference,
        );
        if (inspectedPayment.status === "success") {
          await markStoreOrderPaid(inspectedPayment);
          return NextResponse.json(
            { error: "Payment was confirmed; the paid order cannot be cancelled here." },
            { status: 409 },
          );
        }
        if (!["failed", "abandoned"].includes(inspectedPayment.status)) {
          return NextResponse.json(
            { error: "The previous payment is unresolved and cannot be cancelled yet." },
            { status: 409 },
          );
        }
        confirmedFailedReference = pendingPayment.paystack_reference;
      }
    }

    const client = await getStoreDb().connect();
    try {
      await client.query("BEGIN");
      const orderResult = await client.query<{
        id: string;
        order_number: string;
        status: string;
        payment_status: string;
        subtotal_pesewas: number;
        paystack_reference: string | null;
        recipient_name: string;
        customer_name: string;
        email: string;
      }>(
        `SELECT o.id, o.order_number, o.status, o.payment_status,
                o.subtotal_pesewas, o.paystack_reference, o.recipient_name,
                u.name AS customer_name, u.email
         FROM store_orders o
         JOIN store_users u ON u.id = o.user_id
         WHERE o.id = $1
         FOR UPDATE OF o`,
        [id],
      );
      const order = orderResult.rows[0];
      if (!order) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      let quoteItems: Array<{
        title: string;
        quantity: number;
        unitPricePesewas: number;
      }> = [];
      let confirmedDeliveryFee: number | null = null;
      if (parsed.data.action === "quote") {
        const fee = parseGhsToPesewas(parsed.data.deliveryFeeGhs);
        if (
          fee === null ||
          fee > 2_147_483_647 - order.subtotal_pesewas ||
          order.status !== "pending_delivery_quote" ||
          order.payment_status !== "unpaid"
        ) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "A valid delivery fee can only be confirmed once for an unpaid order awaiting a quote." },
            { status: 409 },
          );
        }

        await client.query(
          `UPDATE store_orders
           SET delivery_fee_pesewas = $2, total_pesewas = subtotal_pesewas + $2,
               status = 'awaiting_payment', updated_at = NOW()
           WHERE id = $1`,
          [id, fee],
        );
        confirmedDeliveryFee = fee;
        const itemsResult = await client.query<{
          product_title: string;
          quantity: number;
          unit_price_pesewas: number;
        }>(
          `SELECT product_title, quantity, unit_price_pesewas
           FROM store_order_items
           WHERE order_id = $1
           ORDER BY product_title`,
          [id],
        );
        quoteItems = itemsResult.rows.map((item) => ({
          title: item.product_title,
          quantity: item.quantity,
          unitPricePesewas: item.unit_price_pesewas,
        }));
      } else if (parsed.data.status === "cancelled") {
        if (order.payment_status === "pending") {
          if (
            !confirmedFailedReference ||
            order.paystack_reference !== confirmedFailedReference
          ) {
            await client.query("ROLLBACK");
            return NextResponse.json(
              { error: "The payment changed while checking it. Refresh the order before cancelling." },
              { status: 409 },
            );
          }
          await client.query(
            `UPDATE store_orders
             SET payment_status = 'failed', updated_at = NOW()
             WHERE id = $1 AND payment_status = 'pending'
               AND paystack_reference = $2`,
            [id, confirmedFailedReference],
          );
          order.payment_status = "failed";
        }

        if (
          !["pending_delivery_quote", "awaiting_payment"].includes(order.status) ||
          !["unpaid", "failed"].includes(order.payment_status)
        ) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "Only unpaid orders without an active payment can be cancelled." },
            { status: 409 },
          );
        }

        const items = await client.query<{
          product_id: string | null;
          quantity: number;
        }>(
          `SELECT product_id, quantity
           FROM store_order_items
           WHERE order_id = $1`,
          [id],
        );
        for (const item of items.rows) {
          if (item.product_id) {
            await client.query(
              `UPDATE store_products
               SET stock_quantity = stock_quantity + $2, updated_at = NOW()
               WHERE id = $1`,
              [item.product_id, item.quantity],
            );
          }
        }
        await client.query(
          `UPDATE store_orders
           SET status = 'cancelled', updated_at = NOW()
           WHERE id = $1`,
          [id],
        );
      } else if (
        parsed.data.status === "shipped" &&
        order.status === "processing" &&
        order.payment_status === "paid"
      ) {
        await client.query(
          `UPDATE store_orders SET status = 'shipped', updated_at = NOW() WHERE id = $1`,
          [id],
        );
      } else if (
        parsed.data.status === "delivered" &&
        order.status === "shipped" &&
        order.payment_status === "paid"
      ) {
        await client.query(
          `UPDATE store_orders SET status = 'delivered', updated_at = NOW() WHERE id = $1`,
          [id],
        );
      } else {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "That order status transition is not allowed." },
          { status: 409 },
        );
      }

      await client.query("COMMIT");
      if (parsed.data.action === "quote" && confirmedDeliveryFee !== null) {
        try {
          await sendStoreOrderEmail({
            kind: "delivery_fee_confirmed",
            to: order.email,
            customerName: order.customer_name,
            orderId: order.id,
            orderNumber: order.order_number,
            items: quoteItems,
            subtotalPesewas: order.subtotal_pesewas,
            deliveryFeePesewas: confirmedDeliveryFee,
          });
          return NextResponse.json({ updated: true, notificationSent: true });
        } catch (emailError) {
          console.error("Delivery quote was saved, but its customer email failed.", emailError);
          return NextResponse.json({
            updated: true,
            notificationSent: false,
            notificationError:
              "Delivery fee was saved, but the customer email could not be sent. Check the email configuration and contact the customer.",
          });
        }
      }

      return NextResponse.json({ updated: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Admin order update failed.", error);
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
