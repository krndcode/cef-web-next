import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import AdminStoreDashboard from "./store/AdminStoreDashboard";
import ProductionAdminDashboard from "./production/ProductionAdminDashboard";
import {
  getAdminDashboardSummary,
  getAdminDashboardTrends,
  getAdminRecentActivity,
} from "@/lib/admin-dashboard-queries";
import type {
  AdminDashboardSummary,
  AdminActivity,
  AdminTrend,
} from "@/lib/admin-dashboard-queries";
import { getStoreUser } from "@/lib/store-auth";
import {
  getAllStoreOrders,
  getAllStoreProducts,
  getStoreUsers,
} from "@/lib/store-queries";
import {
  getAdminProductionVideos,
  getProductionCategories,
} from "@/lib/production-queries";
import type {
  ProductionCategory,
  ProductionVideo,
} from "@/lib/production-queries";
import type { StoreOrder, StoreProduct, StoreUser } from "@/lib/store-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function AdminSetupNotice() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="max-w-xl rounded-3xl border border-amber-200 bg-white p-7 shadow-xl sm:p-10">
        <h1 className="font-serif text-2xl font-bold text-gray-950">
          Admin database setup required
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Configure the PostgreSQL connection and run npm run db:migrate before
          opening the CEF administration dashboard.
        </p>
      </section>
    </main>
  );
}

function AdminLoadError() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-100 px-4 py-12">
      <section className="max-w-xl rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
        <h1 className="font-serif text-2xl font-bold text-gray-950">
          The dashboard could not load
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          Your data is unchanged. Check the database connection and try loading
          the administration dashboard again.
        </p>
        <a
          href="/admin"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-cefPurple px-4 py-2 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cefPurple"
        >
          Try again
        </a>
      </section>
    </main>
  );
}

type AdminPageProps = {
  searchParams: Promise<{
    tab?: string | string[];
    filter?: string | string[];
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!process.env.DATABASE_URL) {
    return <AdminSetupNotice />;
  }

  let user: StoreUser | null = null;
  let products: StoreProduct[] = [];
  let orders: Array<StoreOrder & { customerEmail: string }> = [];
  let customers: StoreUser[] = [];
  let categories: ProductionCategory[] = [];
  let videos: ProductionVideo[] = [];
  let trends: {
    mostViewedProductions: AdminTrend[];
    mostPurchasedProducts: AdminTrend[];
  } = { mostViewedProductions: [], mostPurchasedProducts: [] };
  let summary: AdminDashboardSummary | null = null;
  let activity: AdminActivity[] = [];

  try {
    user = await getStoreUser();
    if (user?.role === "admin") {
      const [
        productRows,
        orderRows,
        customerRows,
        categoryRows,
        videoRows,
        dashboardTrends,
        dashboardSummary,
        recentActivity,
      ] = await Promise.all([
        getAllStoreProducts(),
        getAllStoreOrders(),
        getStoreUsers(),
        getProductionCategories(),
        getAdminProductionVideos(),
        getAdminDashboardTrends(),
        getAdminDashboardSummary(),
        getAdminRecentActivity(),
      ]);
      products = productRows;
      orders = orderRows;
      customers = customerRows;
      categories = categoryRows;
      videos = videoRows;
      trends = dashboardTrends;
      summary = dashboardSummary;
      activity = recentActivity;
    }
  } catch (error) {
    console.error("Could not load unified administration dashboard.", error);
    return <AdminLoadError />;
  }

  if (!user || user.role !== "admin") {
    redirect("/store");
  }

  const { tab, filter } = await searchParams;
  const allowedTabs = ["store", "production", "orders", "admins", "messages", "settings"] as const;
  const initialTab = allowedTabs.includes(tab as (typeof allowedTabs)[number])
    ? (tab as (typeof allowedTabs)[number])
    : "overview";
  const activeFilter = typeof filter === "string" ? filter : "";
  if (!summary) {
    return <AdminLoadError />;
  }

  return (
    <AdminDashboard
      key={initialTab}
      initialTab={initialTab}
      admin={user}
      users={customers}
      storeDashboard={
        <AdminStoreDashboard
          admin={user}
          products={products}
          orders={orders}
          customers={customers}
          section="store"
          filter={activeFilter === "low-stock" ? "low-stock" : undefined}
          embedded
        />
      }
      ordersDashboard={
        <AdminStoreDashboard
          admin={user}
          products={products}
          orders={orders}
          customers={customers}
          section="orders"
          filter={activeFilter === "attention" ? "attention" : undefined}
          embedded
        />
      }
      productionDashboard={
        <ProductionAdminDashboard
          admin={user}
          categories={categories}
          videos={videos}
          draftsOnly={initialTab === "production" && activeFilter === "drafts"}
          embedded
        />
      }
      summary={summary}
      recentOrders={orders.slice(0, 3)}
      activity={activity}
      filter={activeFilter}
      mostViewedProductions={trends.mostViewedProductions}
      mostPurchasedProducts={trends.mostPurchasedProducts}
    />
  );
}
