import { NextResponse } from "next/server";
import { getStoreUser, isSameOriginRequest } from "@/lib/store-auth";
import { getStoreDb } from "@/lib/store-db";
import {
  inspectPaystackTransaction,
  markStoreOrderPaid,
  PaymentConfigurationError,
  PaymentVerificationError,
} from "@/lib/paystack";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const user = await getStoreUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to verify this payment." }, { status: 401 });
    }

    const body = z.object({ reference: z.string().min(8).max(100) }).safeParse(
      await request.json(),
    );
    if (!body.success) {
      return NextResponse.json({ error: "Payment reference is missing." }, { status: 400 });
    }

    const ownsOrder = await getStoreDb().query(
      `SELECT 1 FROM store_orders
       WHERE user_id = $1 AND paystack_reference = $2`,
      [user.id, body.data.reference],
    );
    if (ownsOrder.rowCount !== 1) {
      return NextResponse.json({ error: "This payment does not belong to your account." }, { status: 404 });
    }

    const verified = await inspectPaystackTransaction(body.data.reference);
    if (verified.status !== "success") {
      if (["failed", "abandoned"].includes(verified.status)) {
        await getStoreDb().query(
          `UPDATE store_orders
           SET payment_status = 'failed', updated_at = NOW()
           WHERE user_id = $1 AND paystack_reference = $2
             AND payment_status = 'pending'`,
          [user.id, body.data.reference],
        );
      }
      return NextResponse.json(
        {
          error:
            verified.status === "pending"
              ? "Paystack is still processing this transaction. Check your orders again shortly."
              : "Paystack has not confirmed a successful payment. You can retry once the failed attempt is resolved.",
        },
        { status: 409 },
      );
    }
    const order = await markStoreOrderPaid(verified);
    return NextResponse.json({ paid: true, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof PaymentConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof PaymentVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Paystack return verification failed.", error);
    return NextResponse.json({ error: "Could not verify the payment." }, { status: 500 });
  }
}
