import { redirect } from "next/navigation";

export default function AdminStorePage() {
  redirect("/admin?tab=store");
}
