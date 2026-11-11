import Storefront from "./Storefront";
import { getStoreUser } from "@/lib/store-auth";
import {
  getActiveProducts,
  getCustomerOrders,
} from "@/lib/store-queries";
import type { StoreOrder, StoreProduct, StoreUser } from "@/lib/store-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function StoreSetupNotice({ databaseReady }: { databaseReady: boolean }) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="max-w-xl rounded-3xl border border-amber-200 bg-white p-7 shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
          Store setup required
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-gray-950">
          Connect the bookstore database
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {databaseReady
            ? "Neon Auth is connected, but the PostgreSQL store tables are not ready. Configure DATABASE_URL and DATABASE_URL_UNPOOLED, then run npm run db:migrate from cef-web-next."
            : "Neon Auth is connected. Add the Neon PostgreSQL connection strings as DATABASE_URL and DATABASE_URL_UNPOOLED in cef-web-next/.env.local, then run npm run db:migrate."}
        </p>
      </section>
    </main>
  );
}

export default async function StorePage() {
  if (!process.env.DATABASE_URL) {
    return <StoreSetupNotice databaseReady={false} />;
  }

  let user: StoreUser | null = null;
  let products: StoreProduct[] = [];
  let orders: StoreOrder[] = [];
  let setupIssue = false;

  try {
    user = await getStoreUser();
    if (user) {
      [products, orders] = await Promise.all([
        getActiveProducts(),
        getCustomerOrders(user.id),
      ]);
    }
  } catch (error) {
    console.error("Could not load the PostgreSQL store.", error);
    setupIssue = true;
  }

  if (setupIssue) {
    return <StoreSetupNotice databaseReady />;
  }
  return <Storefront user={user} products={products} orders={orders} />;
}
