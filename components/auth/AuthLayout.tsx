import type { ReactNode } from "react";
import {
  BookOpen,
  Download,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

const benefits: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: ShoppingBag,
    title: "Place orders",
    description: "Buy books and study materials in a few taps.",
  },
  {
    icon: Truck,
    title: "Track deliveries",
    description: "Follow every order from confirmation to your door.",
  },
  {
    icon: Download,
    title: "Download free study resources",
    description: "Grow in the Word with resources at no cost.",
  },
];

function PanelPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
      <BookOpen className="h-3.5 w-3.5 text-cefBlue" aria-hidden="true" />
      Voice of the Cross
    </span>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-cefPage px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-2xl shadow-purple-950/10 lg:grid-cols-[1.05fr_1fr]">
        {/* Full promo panel on desktop */}
        <section className="cef-auth-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-12">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cefBlue/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cefPurple/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-7">
            <PanelPill />

            <div className="space-y-4">
              <p className="max-w-sm font-serif text-4xl font-bold leading-[1.15] tracking-tight">
                Words to study.
                <span className="block text-purple-300">Truth to live.</span>
              </p>
              <p className="max-w-sm text-sm leading-7 text-purple-100/80">
                Sign in to place orders, track your deliveries, and download free
                study resources from the CEF bookstore.
              </p>
            </div>

            <ul className="space-y-4 pt-1">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cefBlue">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="space-y-0.5">
                      <span className="block text-sm font-semibold text-white">
                        {benefit.title}
                      </span>
                      <span className="block text-xs leading-5 text-purple-100/70">
                        {benefit.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="relative z-10 mt-10 border-t border-white/10 pt-5 text-xs font-medium leading-5 text-purple-100/70">
            Every purchase supports the work of the foundation.
          </p>
        </section>

        {/* Compact version of the panel above the form on mobile/tablet */}
        <section className="cef-auth-panel relative overflow-hidden px-6 py-7 text-white lg:hidden">
          <div
            className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-cefBlue/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-3">
            <PanelPill />
            <p className="max-w-md font-serif text-2xl font-bold leading-snug">
              Words to study.{" "}
              <span className="text-purple-300">Truth to live.</span>
            </p>
            <p className="max-w-md text-xs leading-6 text-purple-100/75">
              Order books, track deliveries, and download free study resources.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-9 lg:p-10 xl:p-12">{children}</section>
      </div>
    </div>
  );
}
