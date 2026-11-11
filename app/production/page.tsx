import Footer from "@/components/Footer";
import ProductionHub from "./ProductionHub";
import {
  getProductionCategories,
  getPublishedProductionVideos,
} from "@/lib/production-queries";
import type {
  ProductionCategory,
  ProductionVideo,
} from "@/lib/production-queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ProductionSetupNotice({ databaseReady }: { databaseReady: boolean }) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-950 px-4 py-12 text-white">
      <section className="max-w-xl rounded-3xl border border-white/10 bg-gray-900 p-7 shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cefBlue">
          Production library setup
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold">
          Broadcasts are being prepared
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          {databaseReady
            ? "The media tables are not ready yet. Run npm run db:migrate to set up the broadcast library."
            : "Configure DATABASE_URL, then run npm run db:migrate to set up the broadcast library."}
        </p>
      </section>
    </main>
  );
}

export default async function ProductionPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <>
        <ProductionSetupNotice databaseReady={false} />
        <Footer />
      </>
    );
  }

  let categories: ProductionCategory[] = [];
  let videos: ProductionVideo[] = [];
  let setupIssue = false;
  try {
    [categories, videos] = await Promise.all([
      getProductionCategories(),
      getPublishedProductionVideos(),
    ]);
  } catch (error) {
    console.error("Could not load the production library.", error);
    setupIssue = true;
  }
  if (setupIssue) {
    return (
      <>
        <ProductionSetupNotice databaseReady />
        <Footer />
      </>
    );
  }
  return (
    <>
      <ProductionHub categories={categories} videos={videos} />
      <Footer />
    </>
  );
}
