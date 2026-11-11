"use client";

import { usePathname } from "next/navigation";
import Crawler from "@/components/Crawler";
import Navbar from "@/components/Navbar";

export default function PublicSiteChrome() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <>
      <Crawler />
      <Navbar />
    </>
  );
}
