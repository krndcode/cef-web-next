
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  Download,
  LockKeyhole,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { StoreOrder, StoreProduct, StoreUser } from "@/lib/store-types";
import { formatGhs } from "@/lib/store-types";
import { neonAuthClient } from "@/lib/neon-auth-client";

type StorefrontProps = {
  user: StoreUser | null;
  products: StoreProduct[];
  orders: StoreOrder[];
  focusOrderId?: string;
};

type ApiResponse = {
  error?: string;
  authorizationUrl?: string;
  paid?: boolean;
  confirmationEmailSent?: boolean;
  orderNumber?: string;
  user?: StoreUser;
  order?: { id: string; orderNumber: string };
};

export default function Storefront({
  user,
  products,
  orders,
  focusOrderId,
}: StorefrontProps) {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Email verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => cart[product.id] > 0)
        .map((product) => ({ product, quantity: cart[product.id] })),
    [cart, products],
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.pricePesewas * item.quantity,
    0,
  );
  const productCategories = [
    ...new Set(products.map((product) => product.category)),
  ];
  const [downloadingProductId, setDownloadingProductId] = useState("");

  async function checkoutResource(product: StoreProduct) {
    setDownloadingProductId(product.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/store/resources/${product.id}/checkout`,
        { method: "POST" },
      );
      const result: ApiResponse & { downloadUrl?: string } =
        await response.json();
      if (!response.ok || !result.downloadUrl) {
        setError(result.error ?? "Could not prepare this free download.");
        return;
      }
      setNotice(`${product.title} is ready to download.`);
      window.location.assign(result.downloadUrl);
    } catch (requestError) {
      console.error("Free resource checkout failed.", requestError);
      setError("Could not prepare this free download. Please try again.");
    } finally {
      setDownloadingProductId("");
    }
  }

  async function sendVerificationCode(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return false;
    }

    const result = await neonAuthClient.emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: "email-verification",
    });

    if (result.error) {
      setError(
        result.error.message || "Could not send the verification code.",
      );
      return false;
    }

    setVerificationEmail(normalizedEmail);
    setVerificationCode("");
    setVerificationStep(true);
    setError("");
    setNotice("A verification code has been sent to your email.");

    return true;
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result =
        mode === "register"
          ? await neonAuthClient.signUp.email({ name, email, password })
          : await neonAuthClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message || "Could not authenticate.");
        return;
      }

      if (
        mode === "register" &&
        result.data?.user &&
        !result.data.user.emailVerified
      ) {
        await sendVerificationCode(email);
        return;
      }

      const profileResponse = await fetch("/api/store/profile", {
        method: "POST",
      });

      const profileResult: ApiResponse = await profileResponse.json();

      if (!profileResponse.ok) {
        setError(
          profileResult.error ?? "Could not prepare your store account.",
        );
        return;
      }

      router.refresh();
    } catch (requestError) {
      console.error("Neon Auth request failed.", requestError);
      setError(
        "Could not complete your authentication request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await neonAuthClient.emailOtp.verifyEmail({
        email: verificationEmail,
        otp: verificationCode.trim(),
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Invalid or expired verification code. Please try again.",
        );
        return;
      }

      setVerificationStep(false);
      setVerificationCode("");
      setMode("login");

      setNotice(
        "Your email has been verified successfully. Please sign in to access the bookstore.",
      );
    } catch (requestError) {
      console.error("Email verification failed.", requestError);
      setError(
        "Could not verify your email. Please check your code and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendVerificationCode() {
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await neonAuthClient.emailOtp.sendVerificationOtp({
        email: verificationEmail,
        type: "email-verification",
      });

      if (result.error) {
        setError(
          result.error.message || "Could not resend the verification code.",
        );
        return;
      }

      setNotice("A new verification code has been sent to your email.");
      setVerificationCode("");
    } catch (requestError) {
      console.error("Could not resend verification code.", requestError);
      setError("Could not resend the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    setBusy(true);

    try {
      const result = await neonAuthClient.signOut();

      if (result.error) {
        setError(result.error.message || "Could not sign out.");
        return;
      }

      router.refresh();
    } catch (requestError) {
      console.error("Neon Auth sign-out request failed.", requestError);
      setError("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function updateQuantity(product: StoreProduct, change: number) {
    setCart((current) => {
      const quantity = Math.max(
        0,
        Math.min(
          product.stockQuantity,
          (current[product.id] ?? 0) + change,
        ),
      );

      const next = { ...current };

      if (quantity === 0) {
        delete next[product.id];
      } else {
        next[product.id] = quantity;
      }

      return next;
    });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    const details = new FormData(event.currentTarget);

    const payload = {
      recipientName: String(details.get("recipientName") ?? ""),
      phone: String(details.get("phone") ?? ""),
      addressLine1: String(details.get("addressLine1") ?? ""),
      addressLine2: String(details.get("addressLine2") ?? ""),
      city: String(details.get("city") ?? ""),
      region: String(details.get("region") ?? ""),
      deliveryNote: String(details.get("deliveryNote") ?? ""),
      items: cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    };

    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.order) {
        setError(result.error ?? "Could not place the order.");
        return;
      }

      setCart({});

      setNotice(result.confirmationEmailSent === false
        ? `Order ${result.order.orderNumber} was placed. We’ll confirm its delivery fee before payment, but the email confirmation could not be sent. You can check your orders below or contact support.`
        : `Order ${result.order.orderNumber} was placed. We’ll confirm its delivery fee before payment, and an email confirmation has been sent.`);

      router.refresh();
    } catch (requestError) {
      console.error("Store checkout request failed.", requestError);
      setError("Could not reach the store. Your order was not submitted.");
    } finally {
      setBusy(false);
    }
  }

  async function startPayment(orderId: string) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/store/orders/${orderId}/pay`, {
        method: "POST",
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.paid && result.orderNumber) {
        setNotice(
          `Payment for order ${result.orderNumber} is already confirmed.`,
        );
        router.refresh();
        return;
      }

      if (!response.ok || !result.authorizationUrl) {
        setError(result.error ?? "Could not start payment.");
        return;
      }

      window.location.assign(result.authorizationUrl);
    } catch (requestError) {
      console.error("Could not start Paystack checkout.", requestError);
      setError("Could not reach Paystack. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Authentication and email verification interface
  if (!user) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-purple-950/5 lg:grid-cols-2">
          <section className="cef-hero-backdrop relative flex min-h-72 flex-col justify-between overflow-hidden p-7 text-white sm:p-10 lg:p-12">
            <div className="relative z-10 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Voice of the Cross
              </span>

              <h1 className="max-w-lg font-serif text-3xl font-bold leading-tight sm:text-4xl">
                Words to study.
                <span className="block text-purple-300">
                  Truth to live.
                </span>
              </h1>

              <p className="max-w-md text-sm leading-7 text-purple-100/80">
                Browse CEF books and study parchments after signing in.
                Place your order, receive a confirmed delivery total, and
                pay securely online.
              </p>
            </div>

            <p className="relative z-10 mt-10 text-xs font-medium text-purple-100/70">
              Every purchase supports the work of the foundation.
            </p>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-cefPurple">
              {verificationStep ? (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              ) : mode === "login" ? (
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              ) : (
                <CircleUserRound className="h-5 w-5" aria-hidden="true" />
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefBlue">
              Member bookstore
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-950">
              {verificationStep
                ? "Verify your email"
                : mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {verificationStep
                ? "Enter the verification code sent to your email address."
                : mode === "login"
                  ? "Sign in to browse publications and manage your orders."
                  : "Create a verified Neon account to access the CEF bookstore."}
            </p>

            {notice && (
              <p
                role="status"
                className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              >
                {notice}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            {verificationStep ? (
              <form onSubmit={verifyEmail} className="mt-6 space-y-5">
                <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
                  Email address
                  <input
                    type="email"
                    value={verificationEmail}
                    onChange={(event) =>
                      setVerificationEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
                  Verification code
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter your code"
                    required
                    minLength={6}
                    maxLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                  <span className="block text-xs font-normal text-gray-500">
                    Enter the six-digit code sent to your email.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={busy || verificationCode.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition hover:bg-purple-900 disabled:cursor-wait disabled:opacity-60"
                >
                  {busy ? "Verifying..." : "Verify email"}
                  {!busy && (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={resendVerificationCode}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-cefPurple transition hover:bg-purple-50 disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Resend verification code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep(false);
                    setVerificationCode("");
                    setNotice("");
                    setError("");
                    setMode("login");
                  }}
                  className="w-full text-center text-sm font-semibold text-gray-500 hover:text-cefPurple"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={submitAuth} className="mt-6 space-y-4">
                  {mode === "register" && (
                    <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
                      Full name
                      <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        minLength={2}
                        maxLength={120}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                      />
                    </label>
                  )}

                  <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                    />
                  </label>

                  <label className="block space-y-1.5 text-sm font-semibold text-gray-700">
                    Password
                    <input
                      name="password"
                      type="password"
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      minLength={mode === "register" ? 12 : 1}
                      maxLength={72}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-normal outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                    />

                    {mode === "register" && (
                      <span className="block text-xs font-normal text-gray-500">
                        Use at least 12 characters.
                      </span>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition hover:bg-purple-900 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy
                      ? "Please wait..."
                      : mode === "login"
                        ? "Sign in"
                        : "Create account"}

                    {!busy && (
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep(true);
                    setVerificationEmail("");
                    setVerificationCode("");
                    setNotice(
                      "Enter the email address you registered with and your verification code.",
                    );
                    setError("");
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-cefPurple hover:underline"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Already have a verification code?
                </button>

                <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
                  {mode === "login"
                    ? "New to the store?"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setError("");
                      setNotice("");
                    }}
                    className="font-bold text-cefPurple hover:underline"
                  >
                    {mode === "login" ? "Create an account" : "Sign in"}
                  </button>
                </p>
                <p className="mt-5 text-center text-sm text-gray-500">
                  Need help with your account?{" "}
                  <Link
                    href="/contact"
                    className="font-bold text-cefPurple hover:underline"
                  >
                    Contact support
                  </Link>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    );
  }

  // Signed-in bookstore interface
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="cef-hero-backdrop relative overflow-hidden px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest">
              CEF Bookstore
            </span>

            <h1 className="font-serif text-3xl font-bold sm:text-4xl">
              Books &amp; study parchments
            </h1>

            <p className="text-sm font-semibold text-purple-100/80">Welcome back</p>
            <p className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
              {user.name}
            </p>
            <p className="max-w-2xl text-base leading-7 text-purple-100/90 sm:text-lg">
              Browse books for sale and check out free study resources to download.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact support
            </Link>
            <Link
              href="/store/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20"
            >
              <CircleUserRound className="h-4 w-4" aria-hidden="true" />
              My Profile
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin/store"
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20"
              >
                Store dashboard
              </Link>
            )}

            <button
              type="button"
              onClick={signOut}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-9 sm:px-6 lg:px-8">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            {notice}
          </p>
        )}

        <section aria-labelledby="catalog-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefBlue">
                Published by Voice of the Cross
              </p>

              <h2
                id="catalog-title"
                className="mt-1 font-serif text-2xl font-bold text-gray-950 sm:text-3xl"
              >
                Available publications
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600">
              <ShoppingCart
                className="h-4 w-4 text-cefPurple"
                aria-hidden="true"
              />
              {cartItems.reduce((count, item) => count + item.quantity, 0)} items
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
              No products are currently available. Please check back soon.
            </div>
          ) : (
            <div className="space-y-10">
              {productCategories.map((category) => (
                <section key={category} aria-label={`${category} catalog`}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="font-serif text-xl font-bold text-gray-950 sm:text-2xl">
                      {category}
                    </h3>
                    <span className="text-xs font-medium text-gray-500">
                      {products.filter((product) => product.category === category).length} available
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.filter((item) => item.category === category).map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-cefPurple to-cefBlue">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative flex h-28 w-20 items-center justify-center rounded-r-lg border-l-4 border-white/30 bg-white/10 text-white shadow-2xl backdrop-blur-sm">
                          <BookOpen className="h-9 w-9" aria-hidden="true" />
                        </div>
                        <span className="absolute bottom-4 left-5 right-5 line-clamp-2 text-center font-serif text-sm font-bold text-white">
                          {product.title}
                        </span>
                      </>
                    )}

                    {product.badge && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cefPurple">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cefBlue">
                        {product.category}
                      </span>

                      {product.productType === "free_resource" ? (
                        <span className="text-xs font-semibold text-emerald-700">
                          Free PDF resource
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-semibold ${
                            product.stockQuantity > 0
                              ? "text-emerald-700"
                              : "text-gray-500"
                          }`}
                        >
                          {product.stockQuantity > 0
                            ? `${product.stockQuantity} in stock`
                            : "Currently unavailable"}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold leading-snug text-gray-950">
                      {product.title}
                    </h3>

                    <p className="min-h-12 text-sm leading-6 text-gray-600">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      {product.productType === "free_resource" ? (
                        <>
                          <span className="text-lg font-extrabold text-emerald-700">Free</span>
                          <button
                            type="button"
                            disabled={!product.downloadPath || downloadingProductId === product.id}
                            onClick={() => void checkoutResource(product)}
                            className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            {!product.downloadPath
                              ? "PDF coming soon"
                              : downloadingProductId === product.id
                                ? "Preparing..."
                                : "Checkout & download"}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-extrabold text-gray-950">
                            {formatGhs(product.pricePesewas)}
                          </span>
                          <button
                            type="button"
                            disabled={product.stockQuantity < 1}
                            onClick={() => updateQuantity(product, 1)}
                            className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                            Add to cart
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        {cartItems.length > 0 && (
          <section
            aria-labelledby="checkout-title"
            className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-cefPurple">
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                </span>

                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-950">
                    Your cart
                  </h2>
                  <p className="text-xs text-gray-500">
                    Prices shown in Ghana cedis
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {cartItems.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {product.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatGhs(product.pricePesewas)} each
                      </p>

                      <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-1">
                        <button
                          type="button"
                          aria-label={`Remove one ${product.title}`}
                          onClick={() => updateQuantity(product, -1)}
                          className="text-gray-500 hover:text-cefPurple"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        <span className="min-w-4 text-center text-xs font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Add one ${product.title}`}
                          disabled={quantity >= product.stockQuantity}
                          onClick={() => updateQuantity(product, 1)}
                          className="text-gray-500 hover:text-cefPurple disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-gray-900">
                      {formatGhs(product.pricePesewas * quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between border-t border-gray-100 pt-4 text-sm">
                <span className="font-semibold text-gray-600">
                  Items subtotal
                </span>

                <span className="font-extrabold text-gray-950">
                  {formatGhs(subtotal)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Delivery is not included yet. We’ll confirm the fee and final
                total before you pay.
              </p>
            </div>

            <form
              onSubmit={submitOrder}
              className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-cefBlue">
                  <PackageCheck className="h-5 w-5" aria-hidden="true" />
                </span>

                <div>
                  <h2
                    id="checkout-title"
                    className="font-serif text-xl font-bold text-gray-950"
                  >
                    Delivery details
                  </h2>

                  <p className="text-xs text-gray-500">
                    An administrator will confirm your delivery fee.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-bold text-gray-700">
                  Recipient name
                  <input
                    name="recipientName"
                    required
                    maxLength={120}
                    defaultValue={user.name}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700">
                  Phone number
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={32}
                    defaultValue={user.phone ?? ""}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700 sm:col-span-2">
                  Delivery address
                  <input
                    name="addressLine1"
                    autoComplete="street-address"
                    required
                    maxLength={200}
                    defaultValue={user.addressLine1 ?? ""}
                    placeholder="House number, street, neighbourhood"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700 sm:col-span-2">
                  Address details (optional)
                  <input
                    name="addressLine2"
                    maxLength={200}
                    defaultValue={user.addressLine2 ?? ""}
                    placeholder="Apartment, landmark, or additional directions"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700">
                  City / town
                  <input
                    name="city"
                    required
                    maxLength={100}
                    autoComplete="address-level2"
                    defaultValue={user.city ?? ""}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700">
                  Region
                  <input
                    name="region"
                    required
                    maxLength={100}
                    autoComplete="address-level1"
                    defaultValue={user.region ?? ""}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>

                <label className="space-y-1.5 text-xs font-bold text-gray-700 sm:col-span-2">
                  Delivery instructions (optional)
                  <textarea
                    name="deliveryNote"
                    rows={3}
                    maxLength={500}
                    defaultValue={user.deliveryNote ?? ""}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm font-normal outline-none focus:border-cefPurple focus:ring-2 focus:ring-purple-100"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={busy || cartItems.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cefPurple px-5 py-3.5 text-sm font-bold text-white shadow transition hover:bg-purple-900 disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Submitting..." : "Place order for delivery quote"}

                {!busy && (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <p className="text-center text-[11px] leading-5 text-gray-500">
                Your selected stock is reserved when you submit this order.
                Payment is only requested after the delivery total is confirmed.
              </p>
            </form>
          </section>
        )}

        <section id="orders" aria-labelledby="orders-title">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefBlue">
                Account
              </p>

              <h2
                id="orders-title"
                className="mt-1 font-serif text-2xl font-bold text-gray-950"
              >
                Your orders
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              Your placed orders will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  id={`order-${order.id}`}
                  className={`scroll-mt-6 rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${
                    focusOrderId === order.id
                      ? "border-purple-400 ring-2 ring-purple-300 ring-offset-2"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-cefPurple">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-GH",
                          { dateStyle: "medium" },
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold capitalize text-cefPurple">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-4 text-gray-600"
                      >
                        <span>
                          {item.quantity} × {item.productTitle}
                        </span>

                        <span className="shrink-0 font-medium">
                          {formatGhs(item.unitPricePesewas * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-500">
                      <p>Items: {formatGhs(order.subtotalPesewas)}</p>
                      <p>
                        Delivery: {formatGhs(order.deliveryFeePesewas)}
                      </p>
                      <p className="mt-1 font-bold text-gray-900">
                        Total: {formatGhs(order.totalPesewas)}
                      </p>
                    </div>

                    {order.status === "awaiting_payment" &&
                      order.paymentStatus !== "paid" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => startPayment(order.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                          Pay securely
                          <ArrowRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
