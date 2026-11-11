import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import {
  inspectPaystackTransaction,
  initializePaystackTransaction,
  markStoreOrderPaid,
  PaymentConfigurationError,
  PaymentVerificationError,
} from "@/lib/paystack";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to pay for an order." }, { status: 401 });
    }

    const { id } = await context.params;
    const orderResult = await getStoreDb().query<{
      id: string;
      order_number: string;
      status: string;
      payment_status: string;
      total_pesewas: number | null;
      paystack_reference: string | null;
      payment_is_stale: boolean;
    }>(
      `SELECT id, order_number, status, payment_status, total_pesewas,
              paystack_reference,
              updated_at <= NOW() - INTERVAL '15 minutes' AS payment_is_stale
       FROM store_orders
       WHERE id = $1 AND user_id = $2`,
      [id, user.id],
    );
    const order = orderResult.rows[0];

    if (!order || order.status !== "awaiting_payment" || order.total_pesewas === null) {
      return NextResponse.json(
        { error: "This order is not ready for payment. Delivery must be confirmed first." },
        { status: 409 },
      );
    }
    if (order.payment_status === "pending") {
      if (!order.payment_is_stale) {
        return NextResponse.json(
          { error: "A payment is already in progress for this order. Please wait and refresh." },
          { status: 409 },
        );
      }
      if (!order.paystack_reference) {
        return NextResponse.json(
          { error: "The previous payment attempt needs store support before retrying." },
          { status: 409 },
        );
      }

      const previousPayment = await inspectPaystackTransaction(
        order.paystack_reference,
      );
      if (previousPayment.status === "success") {
        const paidOrder = await markStoreOrderPaid(previousPayment);
        return NextResponse.json({
          paid: true,
          orderNumber: paidOrder.orderNumber,
        });
      }
      if (!["failed", "abandoned"].includes(previousPayment.status)) {
        return NextResponse.json(
          { error: "The previous payment is still unresolved. Please wait before retrying." },
          { status: 409 },
        );
      }

      const failedAttempt = await getStoreDb().query(
        `UPDATE store_orders
         SET payment_status = 'failed', updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND status = 'awaiting_payment'
           AND payment_status = 'pending' AND paystack_reference = $3
           AND updated_at <= NOW() - INTERVAL '15 minutes'`,
        [order.id, user.id, order.paystack_reference],
      );
      if (failedAttempt.rowCount !== 1) {
        return NextResponse.json(
          { error: "The order changed while checking its payment. Refresh and try again." },
          { status: 409 },
        );
      }
    }

    const reference = `CEF-${randomUUID().replaceAll("-", "").toUpperCase()}`;
    const reservation = await getStoreDb().query(
      `UPDATE store_orders
       SET payment_status = 'pending', paystack_reference = $3, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'awaiting_payment'
         AND (payment_status <> 'pending' OR updated_at <= NOW() - INTERVAL '15 minutes')
       RETURNING id`,
      [order.id, user.id, reference],
    );

    if (reservation.rowCount !== 1) {
      return NextResponse.json(
        { error: "A payment is already in progress. Refresh the order and try again." },
        { status: 409 },
      );
    }

    try {
      const authorizationUrl = await initializePaystackTransaction({
        email: user.email,
        amountPesewas: order.total_pesewas,
        reference,
        orderNumber: order.order_number,
      });
      return NextResponse.json({ authorizationUrl });
    } catch (error) {
      await getStoreDb().query(
        `UPDATE store_orders
         SET payment_status = 'failed', paystack_reference = NULL, updated_at = NOW()
         WHERE id = $1 AND paystack_reference = $2 AND payment_status = 'pending'`,
        [order.id, reference],
      );
      if (error instanceof PaymentConfigurationError) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
      if (error instanceof PaymentVerificationError) {
        console.error("Paystack could not initialize the order payment.", error);
        return NextResponse.json({ error: error.message }, { status: 502 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Could not initialize store payment.", error);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 500 },
    );
  }
}
