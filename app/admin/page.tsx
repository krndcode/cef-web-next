import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import AdminStoreDashboard from "./store/AdminStoreDashboard";
import ProductionAdminDashboard from "./production/ProductionAdminDashboard";
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

type AdminPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
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

  try {
    user = await getStoreUser();
    if (user?.role === "admin") {
      [
        products,
        orders,
        customers,
        categories,
        videos,
      ] = await Promise.all([
        getAllStoreProducts(),
        getAllStoreOrders(),
        getStoreUsers(),
        getProductionCategories(),
        getAdminProductionVideos(),
      ]);
    }
  } catch (error) {
    console.error("Could not load unified administration dashboard.", error);
    return <AdminSetupNotice />;
  }

  if (!user || user.role !== "admin") {
    redirect("/store");
  }

  const { tab } = await searchParams;
  const initialTab =
    tab === "store" || tab === "production" ? tab : "overview";

  return (
    <AdminDashboard
      key={initialTab}
      initialTab={initialTab}
      admin={user}
      storeDashboard={
        <AdminStoreDashboard
          admin={user}
          products={products}
          orders={orders}
          customers={customers}
          embedded
        />
      }
      productionDashboard={
        <ProductionAdminDashboard
          admin={user}
          categories={categories}
          videos={videos}
          embedded
        />
      }
      productCount={products.length}
      orderCount={orders.length}
      customerCount={customers.length}
      videoCount={videos.length}
    />
  );
}
