import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  markStoreOrderPaid,
  PaymentConfigurationError,
  PaymentVerificationError,
  recordPaystackEvent,
  verifyPaystackTransaction,
} from "@/lib/paystack";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
  }

  const expected = createHmac("sha512", secret).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
  }

  try {
    const payload: unknown = JSON.parse(rawBody);
    const event = z
      .object({
        event: z.string(),
        data: z.object({ reference: z.string().min(8).max(100) }),
      })
      .safeParse(payload);

    if (!event.success) {
      return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
    }

    await recordPaystackEvent(
      event.data.data.reference,
      event.data.event,
      payload,
    );

    if (event.data.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const verified = await verifyPaystackTransaction(event.data.data.reference);
    await markStoreOrderPaid(verified);
    return NextResponse.json({ received: true });
  } catch (error) {
    if (
      error instanceof PaymentVerificationError ||
      error instanceof PaymentConfigurationError
    ) {
      console.error("Paystack webhook payment verification failed.", error);
      return NextResponse.json({ error: "Payment verification failed." }, { status: 502 });
    }
    console.error("Paystack webhook processing failed.", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
