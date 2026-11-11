import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import { sendStoreOrderEmail } from "@/lib/store-email";
import { orderSchema } from "@/lib/store-validation";

export const runtime = "nodejs";

type ProductRow = {
  id: string;
  title: string;
  price_pesewas: number;
  stock_quantity: number;
  product_type: "book" | "free_resource";
};

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to place an order." }, { status: 401 });
    }

    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Complete the delivery details and select at least one item." },
        { status: 400 },
      );
    }

    const mergedItems = new Map<string, number>();
    for (const item of parsed.data.items) {
      mergedItems.set(
        item.productId,
        (mergedItems.get(item.productId) ?? 0) + item.quantity,
      );
    }
    if ([...mergedItems.values()].some((quantity) => quantity > 20)) {
      return NextResponse.json({ error: "Maximum quantity per product is 20." }, { status: 400 });
    }

    const pool = getStoreDb();
    const client = await pool.connect();
    const orderId = randomUUID();
    const orderNumber = `CEF-${Date.now().toString(36).toUpperCase()}-${randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

    try {
      await client.query("BEGIN");
      const productIds = [...mergedItems.keys()];
      const products = await client.query<ProductRow>(
        `        SELECT id, title, price_pesewas, stock_quantity, product_type
         FROM store_products
        WHERE is_active = TRUE AND product_type = 'book'
          AND id = ANY($1::uuid[])
         FOR UPDATE`,
        [productIds],
      );

      if (products.rowCount !== productIds.length) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "One or more selected products are no longer available." },
          { status: 409 },
        );
      }

      let subtotal = 0;
      const items: Array<{
        product: ProductRow;
        quantity: number;
      }> = [];
      for (const product of products.rows) {
        const quantity = mergedItems.get(product.id);
        if (!quantity || product.stock_quantity < quantity) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: `${product.title} does not have enough stock for that quantity.` },
            { status: 409 },
          );
        }
        subtotal += product.price_pesewas * quantity;
        if (subtotal > 2_147_483_647) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            { error: "The order total is too high to process. Please contact the store." },
            { status: 400 },
          );
        }
        items.push({ product, quantity });
      }

      const details = parsed.data;
      await client.query(
        `INSERT INTO store_orders (
           id, order_number, user_id, subtotal_pesewas, recipient_name, phone,
           address_line_1, address_line_2, city, region, delivery_note
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          orderId,
          orderNumber,
          user.id,
          subtotal,
          details.recipientName,
          details.phone,
          details.addressLine1,
          details.addressLine2 || null,
          details.city,
          details.region,
          details.deliveryNote || null,
        ],
      );

      for (const { product, quantity } of items) {
        await client.query(
          `UPDATE store_products
           SET stock_quantity = stock_quantity - $2, updated_at = NOW()
           WHERE id = $1`,
          [product.id, quantity],
        );
        await client.query(
          `INSERT INTO store_order_items (
             id, order_id, product_id, product_title, quantity, unit_price_pesewas
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            randomUUID(),
            orderId,
            product.id,
            product.title,
            quantity,
            product.price_pesewas,
          ],
        );
      }

      await client.query("COMMIT");
      let confirmationEmailSent = true;
      try {
        await sendStoreOrderEmail({
          kind: "order_received",
          to: user.email,
          customerName: user.name,
          orderId,
          orderNumber,
          items: items.map(({ product, quantity }) => ({
            title: product.title,
            quantity,
            unitPricePesewas: product.price_pesewas,
          })),
          subtotalPesewas: subtotal,
        });
      } catch (emailError) {
        confirmationEmailSent = false;
        console.error("Store order was placed, but its confirmation email failed.", emailError);
      }

      return NextResponse.json(
        {
          order: { id: orderId, orderNumber, status: "pending_delivery_quote" },
          confirmationEmailSent,
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Store order creation failed.", error);
    return NextResponse.json(
      { error: "The order could not be placed. Please try again." },
      { status: 500 },
    );
  }
}
