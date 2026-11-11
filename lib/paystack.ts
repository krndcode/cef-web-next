import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getStoreDb } from "@/lib/store-db";

const paystackVerifySchema = z.object({
  status: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    status: z.string(),
    reference: z.string(),
    amount: z.number().int().nonnegative(),
    currency: z.string(),
    customer: z.object({ email: z.email() }),
  }),
});

export class PaymentConfigurationError extends Error {}
export class PaymentVerificationError extends Error {}

function getPaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaymentConfigurationError(
      "Paystack is not configured. Add PAYSTACK_SECRET_KEY to the server environment.",
    );
  }
  return secret;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountPesewas: number;
  reference: string;
  orderNumber: string;
}): Promise<string> {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new PaymentConfigurationError("APP_URL is not configured.");
  }
  const callbackUrl = new URL("/store/payment", appUrl);
  callbackUrl.searchParams.set("reference", input.reference);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: callbackUrl.toString(),
      metadata: { order_number: input.orderNumber },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const result: unknown = await response.json();
  const parsed = z
    .object({
      status: z.boolean(),
      message: z.string().optional(),
      data: z.object({
        authorization_url: z.url(),
        reference: z.string(),
      }),
    })
    .safeParse(result);

  if (!response.ok || !parsed.success || !parsed.data.status) {
    const message = parsed.success
      ? parsed.data.message
      : "Paystack returned an invalid initialization response.";
    throw new PaymentVerificationError(
      message ?? "Paystack could not initialize this payment.",
    );
  }

  if (parsed.data.data.reference !== input.reference) {
    throw new PaymentVerificationError("Paystack returned an unexpected reference.");
  }

  return parsed.data.data.authorization_url;
}

type VerifiedPaystackTransaction = {
  reference: string;
  amountPesewas: number;
  currency: string;
  email: string;
};

export async function inspectPaystackTransaction(
  reference: string,
): Promise<VerifiedPaystackTransaction & { status: string }> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getPaystackSecret()}` },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    },
  );

  const result: unknown = await response.json();
  const parsed = paystackVerifySchema.safeParse(result);
  if (!response.ok || !parsed.success || !parsed.data.status) {
    throw new PaymentVerificationError(
      parsed.success
        ? (parsed.data.message ?? "Paystack could not verify this transaction.")
        : "Paystack returned an invalid verification response.",
    );
  }
  if (parsed.data.data.reference !== reference) {
    throw new PaymentVerificationError("Paystack returned an unexpected reference.");
  }

  return {
    reference,
    amountPesewas: parsed.data.data.amount,
    currency: parsed.data.data.currency,
    email: parsed.data.data.customer.email.trim().toLowerCase(),
    status: parsed.data.data.status,
  };
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<VerifiedPaystackTransaction> {
  const transaction = await inspectPaystackTransaction(reference);
  if (transaction.status !== "success") {
    throw new PaymentVerificationError("The Paystack transaction is not successful.");
  }
  return transaction;
}

export async function markStoreOrderPaid(verified: {
  reference: string;
  amountPesewas: number;
  currency: string;
  email: string;
}): Promise<{ orderNumber: string; alreadyPaid: boolean }> {
  const client = await getStoreDb().connect();

  try {
    await client.query("BEGIN");
    const orderResult = await client.query<{
      id: string;
      order_number: string;
      status: string;
      payment_status: string;
      total_pesewas: number | null;
      email: string;
    }>(
      `SELECT o.id, o.order_number, o.status, o.payment_status,
              o.total_pesewas, u.email
       FROM store_orders o
       JOIN store_users u ON u.id = o.user_id
       WHERE o.paystack_reference = $1
       FOR UPDATE OF o`,
      [verified.reference],
    );
    const order = orderResult.rows[0];

    if (!order) {
      throw new PaymentVerificationError("No store order matches this payment.");
    }

    if (order.payment_status === "paid") {
      await client.query("COMMIT");
      return { orderNumber: order.order_number, alreadyPaid: true };
    }

    if (
      order.status !== "awaiting_payment" ||
      order.total_pesewas === null ||
      order.total_pesewas !== verified.amountPesewas ||
      verified.currency !== "GHS" ||
      order.email.trim().toLowerCase() !== verified.email
    ) {
      throw new PaymentVerificationError(
        "The verified payment does not match the order amount or customer.",
      );
    }

    await client.query(
      `UPDATE store_orders
       SET payment_status = 'paid', status = 'processing',
           paid_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [order.id],
    );
    await client.query("COMMIT");
    return { orderNumber: order.order_number, alreadyPaid: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPaystackEvent(
  reference: string,
  eventType: string,
  payload: unknown,
): Promise<void> {
  await getStoreDb().query(
    `INSERT INTO store_payment_events (id, reference, event_type, payload)
     VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (reference, event_type) DO NOTHING`,
    [randomUUID(), reference, eventType, JSON.stringify(payload)],
  );
}
