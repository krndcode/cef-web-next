import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import PublicSiteChrome from "@/components/PublicSiteChrome";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Christ The Entirety Foundation (CEF)",
  description: "Jesus is Lord — Official Website of Christ The Entirety Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <body className="font-sans bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col">
        <PublicSiteChrome />

        {/* Page Content */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}