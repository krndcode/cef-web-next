import { redirect } from "next/navigation";
import PaymentReturn from "./PaymentReturn";
import { getStoreUser } from "@/lib/store-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PaymentPageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function StorePaymentPage({
  searchParams,
}: PaymentPageProps) {
  const { reference = "" } = await searchParams;

  const user = await getStoreUser();
  if (!user) {
    const nextPath = reference
      ? `/store/payment?reference=${encodeURIComponent(reference)}`
      : "/store/payment";
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return <PaymentReturn reference={reference} />;
}
