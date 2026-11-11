"use client";

import Link from "next/link";
import {
  Clapperboard,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import type { StoreUser } from "@/lib/store-types";

type AdminTab = "overview" | "store" | "production";

type AdminDashboardProps = {
  initialTab: AdminTab;
  admin: StoreUser;
  storeDashboard: ReactNode;
  productionDashboard: ReactNode;
  productCount: number;
  orderCount: number;
  customerCount: number;
  videoCount: number;
};

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "production", label: "Production", icon: Clapperboard },
];

export default function AdminDashboard({
  initialTab,
  admin,
  storeDashboard,
  productionDashboard,
  productCount,
  orderCount,
  customerCount,
  videoCount,
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="cef-hero-backdrop text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-9 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
              Christ The Entirety Foundation
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Administration
            </h1>
            <p className="mt-2 text-sm text-purple-100/80">
              One workspace for the store and production library.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
            <p className="font-semibold">{admin.name}</p>
            <p className="mt-0.5 text-xs text-purple-100/80">{admin.email}</p>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav
          aria-label="Administration sections"
          className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={id === "overview" ? "/admin" : `/admin?tab=${id}`}
              aria-current={initialTab === id ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                initialTab === id
                  ? "bg-cefPurple text-white shadow-sm"
                  : "text-gray-600 hover:bg-purple-50 hover:text-cefPurple"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {initialTab === "store" ? (
          storeDashboard
        ) : initialTab === "production" ? (
          productionDashboard
        ) : (
          <section aria-labelledby="admin-overview-heading" className="space-y-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cefPurple">
                Workspace overview
              </p>
              <h2
                id="admin-overview-heading"
                className="mt-2 font-serif text-2xl font-bold text-gray-950 sm:text-3xl"
              >
                Good to see you, {admin.name.split(" ")[0]}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Manage products, customer orders, and CEF broadcasts from here.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewCard
                label="Store products"
                count={productCount}
                icon={Package}
              />
              <OverviewCard
                label="Customer orders"
                count={orderCount}
                icon={ShoppingBag}
              />
              <OverviewCard
                label="Customer accounts"
                count={customerCount}
                icon={Users}
              />
              <OverviewCard
                label="Production videos"
                count={videoCount}
                icon={Clapperboard}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Link
                href="/admin?tab=store"
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-cefPurple">
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-950">
                  Manage the store
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Update products and stock, review orders, manage delivery,
                  and administer customer accounts.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cefPurple">
                  Open store management
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
              <Link
                href="/admin?tab=production"
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-cefBlue">
                  <Clapperboard className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-950">
                  Manage production
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Publish broadcasts, organize categories, update featured
                  videos, and curate the media library.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cefPurple">
                  Open production management
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function OverviewCard({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: typeof Package;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-cefPurple">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
        {count.toLocaleString()}
      </p>
    </article>
  );
}
