import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStoreUser } from "@/lib/store-auth";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "My Profile | CEF Bookstore",
  description: "Manage your CEF Bookstore contact and delivery details.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function StoreProfilePage() {
  const user = await getStoreUser();
  if (!user) {
    redirect("/store");
  }

  return (
    <ProfileForm
      initialProfile={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        region: user.region,
        deliveryNote: user.deliveryNote,
      }}
    />
  );
}
