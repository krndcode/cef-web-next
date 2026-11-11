"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

type PaymentState =
  | { status: "checking" }
  | { status: "paid"; orderNumber: string }
  | { status: "error"; message: string };

export default function PaymentReturn({ reference }: { reference: string }) {
  const [payment, setPayment] = useState<PaymentState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      try {
        const response = await fetch("/api/store/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const result: { error?: string; orderNumber?: string } =
          await response.json();
        if (cancelled) {
          return;
        }
        if (!response.ok || !result.orderNumber) {
          setPayment({
            status: "error",
            message:
              result.error ??
              "We could not confirm this payment yet. Your order remains in your account; please contact us if your account was charged.",
          });
          return;
        }
        setPayment({ status: "paid", orderNumber: result.orderNumber });
      } catch (error) {
        console.error("Payment return verification request failed.", error);
        if (!cancelled) {
          setPayment({
            status: "error",
            message:
              "We could not reach the store to confirm payment. Check your orders again in a moment.",
          });
        }
      }
    }

    if (reference) {
      void verifyPayment();
    }

    return () => {
      cancelled = true;
    };
  }, [reference]);

  const displayPayment: PaymentState = reference
    ? payment
    : { status: "error", message: "Payment reference is missing." };

  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-7 text-center shadow-xl sm:p-10">
        {displayPayment.status === "checking" && (
          <>
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-cefPurple" />
            <h1 className="mt-5 font-serif text-2xl font-bold text-gray-950">
              Confirming your payment
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please keep this page open while we verify the transaction with
              Paystack.
            </p>
          </>
        )}
        {displayPayment.status === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-600" />
            <h1 className="mt-5 font-serif text-2xl font-bold text-gray-950">
              Payment confirmed
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Order {displayPayment.orderNumber} is paid and is being prepared.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex rounded-xl bg-cefPurple px-5 py-3 text-sm font-bold text-white hover:bg-purple-900"
            >
              Return to your store
            </Link>
          </>
        )}
        {displayPayment.status === "error" && (
          <>
            <CircleAlert className="mx-auto h-11 w-11 text-amber-600" />
            <h1 className="mt-5 font-serif text-2xl font-bold text-gray-950">
              Payment not confirmed yet
            </h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-gray-600">
              {displayPayment.message}
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
            >
              Check your orders
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
