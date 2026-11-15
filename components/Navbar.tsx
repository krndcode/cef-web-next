"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleUserRound,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { signInHref } from "@/lib/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "The 3 Trees", href: "/trees" },
  { name: "Production", href: "/production" },
  { name: "Store", href: "/store" },
  { name: "Contact", href: "/contact" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // The layout keeps pages static, so the navbar renders the signed-out
  // controls first and swaps to the account menu once the session resolves.
  const { data: session } = neonAuthClient.useSession();
  const user = session?.user ?? null;

  // Send people back to the page they were on after signing in, unless they
  // are already on one of the auth pages.
  const isAuthPage = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);
  const afterAuthPath = isAuthPage ? "/store" : pathname;
  const signInUrl = signInHref(afterAuthPath);

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    try {
      const result = await neonAuthClient.signOut();
      if (result.error) {
        console.error("Could not sign out.", result.error);
      }
    } catch (error) {
      console.error("Neon Auth sign-out request failed.", error);
    } finally {
      setSigningOut(false);
      setIsOpen(false);
      router.refresh();
    }
  }

  const authControls = user ? (
    <>
      <Link
        href="/store/profile"
        title="My profile"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-cefPurple"
      >
        <CircleUserRound className="h-4 w-4" aria-hidden="true" />
        <span className="hidden xl:inline">My Profile</span>
      </Link>
      <Link
        href="/contact"
        title="Contact support"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-cefPurple"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span className="hidden xl:inline">Contact Support</span>
      </Link>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        title="Sign out"
        aria-label="Sign out"
        className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        {signingOut ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </>
  ) : (
    <Link
      href={signInUrl}
      className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-purple-900/20 transition hover:bg-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
    >
      <CircleUserRound className="h-4 w-4" aria-hidden="true" />
      Sign in
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* OFFICIAL BRAND LOGO & TITLE */}
          <Link href="/" className="flex shrink-0 items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-purple-50 border border-purple-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition duration-300">
              <Image
                src="/logo.png"
                alt="Christ The Entirety Foundation Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-tight group-hover:text-cefPurple transition">
                Christ The Entirety Foundation
              </span>
              <span className="text-[10px] sm:text-xs text-cefBlue font-bold tracking-wider uppercase">
                Jesus is Lord
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-0.5 font-semibold text-sm text-gray-600">
            {navLinks.map((link) => {
              const isActive = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 rounded-xl transition duration-200 relative ${
                    isActive
                      ? "text-cefPurple bg-purple-50/80 shadow-xs"
                      : "hover:text-cefPurple hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP ACCOUNT */}
          <div className="hidden lg:flex items-center gap-2">
            {authControls}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:text-cefPurple hover:bg-purple-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="site-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div
          id="site-menu"
          className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 pt-3 pb-6 space-y-2 shadow-xl"
        >
          {navLinks.map((link) => {
            const isActive = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-purple-50 text-cefPurple font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-cefPurple"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            {user ? (
              <>
                <div className="px-4 pb-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  href="/store/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-cefPurple"
                >
                  <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                  My Profile
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-cefPurple"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contact Support
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {signingOut ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  )}
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </>
            ) : (
              <Link
                href={signInUrl}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-cefPurple px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cefPurple focus-visible:ring-offset-2"
              >
                <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
