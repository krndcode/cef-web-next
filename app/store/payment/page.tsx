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
  const user = await getStoreUser();
  if (!user) {
    redirect("/store");
  }

  const { reference = "" } = await searchParams;
  return <PaymentReturn reference={reference} />;
}
