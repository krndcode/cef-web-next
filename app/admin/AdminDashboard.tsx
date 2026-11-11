"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  Settings,
  ShieldPlus,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import type { AdminActivity, AdminDashboardSummary, AdminTrend } from "@/lib/admin-dashboard-queries";
import type { StoreOrder, StoreUser } from "@/lib/store-types";
import { formatGhs } from "@/lib/store-types";
import {
  AdminInvitePanel,
  AdminMessagesPanel,
  AdminSettingsPanel,
} from "./AdminWorkspacePanels";

export type AdminTab =
  | "overview"
  | "store"
  | "production"
  | "orders"
  | "admins"
  | "messages"
  | "settings";

type DashboardPreferences = { collapsed: boolean; darkMode: boolean; compact: boolean };
const preferencesKey = "cef-admin-preferences";
const preferencesEvent = "cef-admin-preferences-change";
const defaultPreferences: DashboardPreferences = {
  collapsed: false,
  darkMode: false,
  compact: false,
};

function subscribePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferencesEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferencesEvent, callback);
  };
}

function getPreferencesSnapshot() {
  try {
    return localStorage.getItem(preferencesKey) ?? "";
  } catch (error) {
    console.error("Could not read dashboard preferences.", error);
    return "";
  }
}

function parsePreferences(value: string): DashboardPreferences {
  if (!value) return defaultPreferences;
  try {
    const saved = JSON.parse(value) as Partial<DashboardPreferences>;
    return {
      collapsed: typeof saved.collapsed === "boolean" ? saved.collapsed : false,
      darkMode: typeof saved.darkMode === "boolean" ? saved.darkMode : false,
      compact: typeof saved.compact === "boolean" ? saved.compact : false,
    };
  } catch (error) {
    console.error("Could not parse dashboard preferences.", error);
    return defaultPreferences;
  }
}

function updatePreferences(patch: Partial<DashboardPreferences>) {
  try {
    const saved = parsePreferences(getPreferencesSnapshot());
    localStorage.setItem(preferencesKey, JSON.stringify({ ...saved, ...patch }));
    window.dispatchEvent(new Event(preferencesEvent));
  } catch (error) {
    console.error("Could not save dashboard preferences.", error);
  }
}

type AdminDashboardProps = {
  initialTab: AdminTab;
  admin: StoreUser;
  users: StoreUser[];
  storeDashboard: ReactNode;
  ordersDashboard: ReactNode;
  productionDashboard: ReactNode;
  summary: AdminDashboardSummary;
  recentOrders: Array<StoreOrder & { customerEmail: string }>;
  activity: AdminActivity[];
  filter: string;
  mostViewedProductions: AdminTrend[];
  mostPurchasedProducts: AdminTrend[];
};

type SideLink = {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

function NavigationLink({
  item,
  activeTab,
  collapsed,
  darkMode,
  onNavigate,
}: {
  item: SideLink;
  activeTab: AdminTab;
  collapsed: boolean;
  darkMode: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const href = item.id === "overview" ? "/admin" : `/admin?tab=${item.id}`;
  const active = activeTab === item.id;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={`${item.label}${item.badge ? `, ${item.badge} ${item.id === "messages" ? "unread" : "pending"}` : ""}`}
      title={collapsed ? item.label : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple ${
        active
          ? "bg-cefPurple text-white shadow-md shadow-purple-950/15"
          : darkMode
            ? "text-slate-200 hover:bg-slate-800 hover:text-white"
            : "text-gray-700 hover:bg-purple-50 hover:text-cefPurple"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span className={collapsed ? "min-[900px]:hidden" : ""}>{item.label}</span>
      {!!item.badge && (
        <span
          className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-red-100 text-red-800"
          }`}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarNavigation({
  activeTab,
  collapsed,
  pendingOrders,
  unreadMessages,
  darkMode,
  onNavigate,
}: {
  activeTab: AdminTab;
  collapsed: boolean;
  pendingOrders: number;
  unreadMessages: number;
  darkMode: boolean;
  onNavigate: () => void;
}) {
  const groupClass = `px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] ${
    darkMode ? "text-slate-400" : "text-gray-600"
  } ${
    collapsed ? "min-[900px]:hidden" : ""
  }`;

  return (
    <nav aria-label="Administration sections" className="space-y-1">
      <NavigationLink
        item={{ id: "overview", label: "Overview", icon: LayoutDashboard }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <p className={groupClass}>Content</p>
      <NavigationLink
        item={{ id: "store", label: "Store", icon: ShoppingBag }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <NavigationLink
        item={{ id: "production", label: "Production", icon: Clapperboard }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <p className={groupClass}>Operations</p>
      <NavigationLink
        item={{ id: "orders", label: "Orders", icon: Package, badge: pendingOrders }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <NavigationLink
        item={{ id: "messages", label: "Messages", icon: Mail, badge: unreadMessages }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <p className={groupClass}>Settings &amp; team</p>
      <NavigationLink
        item={{ id: "settings", label: "Settings", icon: Settings }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
      <NavigationLink
        item={{ id: "admins", label: "Team", icon: ShieldPlus }}
        activeTab={activeTab}
        collapsed={collapsed}
        darkMode={darkMode}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

export default function AdminDashboard({
  initialTab,
  admin,
  users,
  storeDashboard,
  ordersDashboard,
  productionDashboard,
  summary,
  recentOrders,
  activity,
  filter,
  mostViewedProductions,
  mostPurchasedProducts,
}: AdminDashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const preferenceSnapshot = useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    () => "",
  );
  const { collapsed, darkMode, compact } = parsePreferences(preferenceSnapshot);

  const tabTitles: Record<AdminTab, string> = {
    overview: "Overview",
    store: "Store management",
    production: "Production studio",
    orders: "Order management",
    admins: "Team access",
    messages: "Support inbox",
    settings: "Workspace settings",
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-slate-900"}`}>
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-white/25 sm:h-14 sm:w-14">
              <Image
                src="/logo.png"
                alt="Christ The Entirety Foundation logo"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200">
                Christ The Entirety Foundation
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">
                Administration
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-bold">{admin.name}</span>
              <span className="block text-xs text-slate-300">{admin.email}</span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold">
              {admin.name.trim().slice(0, 1).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open administration menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[900px]:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 min-[900px]:hidden">
          <button
            type="button"
            aria-label="Close administration menu"
            onClick={closeMobileMenu}
            className="absolute inset-0 h-full w-full bg-slate-950/50"
          />
          <aside className={`relative h-full w-[min(20rem,85vw)] overflow-y-auto p-4 shadow-2xl ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            <div className="mb-5 flex items-center justify-between">
              <span className={`font-serif text-lg font-bold ${darkMode ? "text-white" : "text-gray-950"}`}>Workspace menu</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close administration menu"
                className={`flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-cefPurple ${darkMode ? "text-slate-200 hover:bg-slate-800" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNavigation
              activeTab={initialTab}
              collapsed={false}
              pendingOrders={summary.pendingOrderAttentionCount}
              unreadMessages={summary.unreadMessageCount}
              darkMode={darkMode}
              onNavigate={closeMobileMenu}
            />
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-5 px-3 py-4 sm:px-5 min-[900px]:grid-cols-[auto_minmax(0,1fr)] min-[900px]:gap-6 lg:px-8">
        <aside
          className={`hidden rounded-2xl border p-2 shadow-sm transition-all min-[900px]:block ${
            darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
          } ${collapsed ? "min-[900px]:w-[76px]" : "min-[900px]:w-64"
          }`}
        >
          <div className="flex justify-end px-1 pt-1">
            <button
              type="button"
              onClick={() => updatePreferences({ collapsed: !collapsed })}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cefPurple ${darkMode ? "text-slate-200 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          <SidebarNavigation
            activeTab={initialTab}
            collapsed={collapsed}
            pendingOrders={summary.pendingOrderAttentionCount}
            unreadMessages={summary.unreadMessageCount}
            darkMode={darkMode}
            onNavigate={() => undefined}
          />
          {!collapsed && (
            <div className={`mt-4 rounded-xl p-3 text-xs leading-5 ${darkMode ? "bg-slate-800 text-slate-300" : "bg-gray-50 text-gray-700"}`}>
              Admin workspace · Manage the store, media, and community.
            </div>
          )}
        </aside>

        <main
          className={`min-w-0 ${
            initialTab === "overview"
              ? compact ? "px-1 py-2 sm:px-2" : "px-1 py-2 sm:px-2 lg:px-1"
              : `rounded-2xl border shadow-sm ${
                  darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
                } ${compact ? "p-4 sm:p-5" : "p-5 sm:p-7 lg:p-8"}`
          }`}
        >
          {initialTab !== "overview" && (
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
              <h2 className={`font-serif text-2xl font-bold ${darkMode ? "text-white" : "text-gray-950"}`}>
                {tabTitles[initialTab]}
              </h2>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-gray-700"}`}>
                {admin.isPrimaryAdmin ? "Primary admin" : "Administrator"}
              </span>
            </div>
          )}

          {initialTab === "store" ? storeDashboard
            : initialTab === "orders" ? ordersDashboard
              : initialTab === "production" ? productionDashboard
                : initialTab === "admins" ? <AdminInvitePanel admin={admin} users={users} />
                  : initialTab === "messages" ? <AdminMessagesPanel unreadOnly={filter === "unread"} />
                    : initialTab === "settings" ? (
                      <AdminSettingsPanel
                        darkMode={darkMode}
                        compact={compact}
                        onDarkModeChange={(value) => updatePreferences({ darkMode: value })}
                        onCompactChange={(value) => updatePreferences({ compact: value })}
                      />
                    )
                      : (
                        <Overview
                          admin={admin}
                          summary={summary}
                          recentOrders={recentOrders}
                          activity={activity}
                          mostViewedProductions={mostViewedProductions}
                          mostPurchasedProducts={mostPurchasedProducts}
                          darkMode={darkMode}
                        />
                      )}
        </main>
      </div>
    </div>
  );
}

function Overview({
  admin,
  summary,
  recentOrders,
  activity,
  mostViewedProductions,
  mostPurchasedProducts,
  darkMode,
}: {
  admin: StoreUser;
  summary: AdminDashboardSummary;
  recentOrders: Array<StoreOrder & { customerEmail: string }>;
  activity: AdminActivity[];
  mostViewedProductions: AdminTrend[];
  mostPurchasedProducts: AdminTrend[];
  darkMode: boolean;
}) {
  const panelClass = `rounded-2xl border p-5 shadow-sm ${darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`;
  const headingClass = `font-serif text-xl font-bold ${darkMode ? "text-white" : "text-slate-950"}`;
  const textClass = darkMode ? "text-slate-300" : "text-gray-700";
  const [trendPeriod, setTrendPeriod] = useState<"7days" | "30days" | "all">("all");
  const needsAttention = [
    {
      label: "Orders need delivery quote or confirmation",
      count: summary.pendingOrderAttentionCount,
      href: "/admin?tab=orders&filter=attention",
      icon: Clock3,
    },
    {
      label: "Unread messages",
      count: summary.unreadMessageCount,
      href: "/admin?tab=messages&filter=unread",
      icon: Mail,
    },
    {
      label: "Draft broadcasts",
      count: summary.draftVideoCount,
      href: "/admin?tab=production&filter=drafts",
      icon: Clapperboard,
    },
    {
      label: "Products out of stock or low",
      count: summary.lowStockProductCount,
      href: "/admin?tab=store&filter=low-stock",
      icon: Boxes,
    },
  ];

  return (
    <section className="space-y-8" aria-labelledby="admin-overview-heading">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h2 id="admin-overview-heading" className={`font-serif text-3xl font-bold sm:text-4xl ${darkMode ? "text-white" : "text-gray-950"}`}>
            Good to see you, {admin.name.trim().split(/\s+/)[0]}
          </h2>
          <p className={`mt-2 text-sm ${textClass}`}>
            Your foundation workspace at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin?tab=production#add-broadcast"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-cefPurple transition hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple"
          >
            <Clapperboard className="h-4 w-4" aria-hidden="true" />
            + Add broadcast
          </Link>
          <Link
            href="/admin?tab=store#add-product"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cefPurple px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            + Add product
          </Link>
        </div>
      </div>

      <section aria-labelledby="attention-heading">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-cefPurple" aria-hidden="true" />
          <h3 id="attention-heading" className={`text-xs font-bold uppercase tracking-[0.14em] ${textClass}`}>
            Needs attention
          </h3>
        </div>
        {needsAttention.every((item) => item.count === 0) ? (
          <p className={`flex min-h-14 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900`}>
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Nothing needs your attention.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {needsAttention.map(({ label, count, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`flex min-h-[72px] items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple ${
                  count > 0
                    ? "border-red-200 bg-red-50 text-red-950 hover:border-red-300"
                    : `${darkMode ? "border-slate-700 bg-slate-900 text-slate-200" : "border-gray-200 bg-white text-gray-800"}`
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${count > 0 ? "bg-red-100 text-red-800" : "bg-purple-50 text-cefPurple"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-5">{label}</span>
                <span className="text-xl font-bold tabular-nums">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <OverviewCard
          href="/admin?tab=store"
          label="Store products"
          count={summary.productCount}
          context={`${summary.publishedProductCount} published`}
          icon={Package}
          darkMode={darkMode}
        />
        <OverviewCard
          href="/admin?tab=orders"
          label="Customer orders"
          count={summary.orderCount}
          context={`${summary.pendingOrderAttentionCount} need action`}
          icon={ShoppingBag}
          darkMode={darkMode}
        />
        <OverviewCard
          href="/admin?tab=store"
          label="Customer accounts"
          count={summary.customerCount}
          context="Registered customers"
          icon={Users}
          darkMode={darkMode}
        />
        <OverviewCard
          href="/admin?tab=production"
          label="Production videos"
          count={summary.publishedVideoCount + summary.draftVideoCount}
          context={`${summary.totalVideoViews.toLocaleString()} views in total`}
          icon={Clapperboard}
          darkMode={darkMode}
        />
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className={panelClass} aria-labelledby="trending-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="trending-heading" className={headingClass}>Trending production</h3>
              <p className={`mt-1 text-sm ${textClass}`}>Most viewed broadcasts</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1" aria-label="View period">
              {([
                ["7days", "7 days"],
                ["30days", "30 days"],
                ["all", "All time"],
              ] as const).map(([period, label]) => (
                <button
                  key={period}
                  type="button"
                  aria-pressed={trendPeriod === period}
                  onClick={() => setTrendPeriod(period)}
                  className={`min-h-11 rounded-lg px-2.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple ${
                    trendPeriod === period
                      ? "bg-white font-bold text-cefPurple shadow-sm"
                      : "text-gray-700 hover:bg-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {trendPeriod === "all" ? (
            <>
              <p className={`mt-3 text-sm ${textClass}`}>Showing lifetime totals. Recent-period view history is not stored.</p>
              <TrendChart rows={mostViewedProductions} unit="views" darkMode={darkMode} />
            </>
          ) : (
            <p className={`mt-5 rounded-xl border border-dashed p-5 text-sm leading-6 ${
              darkMode ? "border-slate-700 text-slate-200" : "border-gray-300 text-gray-700"
            }`}>
              {trendPeriod === "7days" ? "7-day" : "30-day"} view history is unavailable because individual view timestamps are not stored. Choose All time to see the available lifetime totals.
            </p>
          )}
          {mostPurchasedProducts[0] && (
            <div className={`mt-5 border-t pt-4 text-sm ${darkMode ? "border-slate-700 text-slate-200" : "border-gray-200 text-gray-800"}`}>
              <span className="font-semibold">Top purchased book:</span>{" "}
              {mostPurchasedProducts[0].title} · {mostPurchasedProducts[0].value.toLocaleString()} purchases
            </div>
          )}
        </section>

        <section className={panelClass} aria-labelledby="recent-orders-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 id="recent-orders-heading" className={headingClass}>Recent orders</h3>
              <p className={`mt-1 text-sm ${textClass}`}>The latest customer activity</p>
            </div>
            <Link href="/admin?tab=orders" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-cefPurple hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cefPurple">
              View all
            </Link>
          </div>
          {summary.paidProductCount === 0 || recentOrders.length === 0 ? (
            <p className={`rounded-xl border border-dashed p-5 text-sm leading-6 ${darkMode ? "border-slate-700 text-slate-200" : "border-gray-300 text-gray-700"}`}>
              No orders yet.{" "}
              <Link href="/admin?tab=store#add-product" className="font-bold text-cefPurple underline decoration-purple-300 underline-offset-2">
                Add a product to start selling.
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-1 last:pb-1">
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-bold ${darkMode ? "text-white" : "text-gray-950"}`}>
                      {order.orderNumber} · {order.recipientName}
                    </p>
                    <p className={`mt-1 text-sm ${textClass}`}>
                      {order.createdAt ? formatRelativeTime(order.createdAt) : "Date unavailable"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1.5 text-xs font-bold capitalize ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-900"
                      : order.status === "cancelled"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-amber-100 text-amber-950"
                  }`}>
                    {order.status.replaceAll("_", " ")}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                    {formatGhs(order.totalPesewas ?? order.subtotalPesewas)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={panelClass} aria-labelledby="activity-heading">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-cefPurple" aria-hidden="true" />
          <h3 id="activity-heading" className={headingClass}>Recent activity</h3>
        </div>
        {activity.length === 0 ? (
          <p className={`text-sm ${textClass}`}>No recent activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((event) => (
              <li key={event.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-cefPurple">
                  {event.kind === "order" ? <Package className="h-4 w-4" aria-hidden="true" />
                    : event.kind === "broadcast" ? <Clapperboard className="h-4 w-4" aria-hidden="true" />
                      : <Mail className="h-4 w-4" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>{event.title}</p>
                  <p className={`mt-0.5 text-sm ${textClass}`}>{formatRelativeTime(event.occurredAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function TrendChart({
  rows,
  unit,
  darkMode,
}: {
  rows: AdminTrend[];
  unit: string;
  darkMode: boolean;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) {
    return (
      <p className={`mt-5 rounded-xl border border-dashed p-5 text-sm ${darkMode ? "border-slate-700 text-slate-200" : "border-gray-300 text-gray-700"}`}>
        Published broadcast views will appear here.
      </p>
    );
  }
  return (
    <ul className="mt-5 space-y-4">
      {rows.map((row, index) => (
        <li key={row.id}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className={`min-w-0 truncate font-semibold ${darkMode ? "text-slate-100" : "text-gray-800"}`}>
              <span className="mr-2 text-gray-500">{index + 1}.</span>{row.title}
              <span className={`ml-2 font-normal ${darkMode ? "text-slate-300" : "text-gray-600"}`}>{row.category}</span>
            </span>
            <span className={`shrink-0 font-bold ${darkMode ? "text-slate-100" : "text-gray-800"}`}>{row.value.toLocaleString()} {unit}</span>
          </div>
          <div className={`h-2 overflow-hidden rounded-full ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-cefPurple to-cefBlue" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OverviewCard({
  href,
  label,
  count,
  context,
  icon: Icon,
  darkMode,
}: {
  href: string;
  label: string;
  count: number;
  context: string;
  icon: typeof Package;
  darkMode: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block min-h-[132px] rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple ${
        darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-gray-700"}`}>{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-cefPurple">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-950"}`}>
        {count.toLocaleString()}
      </p>
      <p className={`mt-1 text-sm ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{context}</p>
    </Link>
  );
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, interval] of intervals) {
    if (Math.abs(seconds) >= interval) {
      return formatter.format(Math.round(seconds / interval), unit);
    }
  }
  return formatter.format(seconds, "second");
}
