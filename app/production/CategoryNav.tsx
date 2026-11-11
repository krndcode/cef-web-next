"use client";

import type { ProductionCategory } from "@/lib/production-queries";

type CategoryNavProps = {
  categories: ProductionCategory[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
};

export default function CategoryNav({
  categories,
  selectedSlug,
  onSelect,
}: CategoryNavProps) {
  const tabs = [{ name: "All Broadcasts", slug: "" }, ...categories];

  return (
    <nav
      aria-label="Broadcast categories"
      className="sticky top-20 z-30 border-y border-white/10 bg-gray-950/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {tabs.map((tab) => (
          <button
            key={tab.slug || "all"}
            type="button"
            aria-pressed={selectedSlug === tab.slug}
            onClick={() => onSelect(tab.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
              selectedSlug === tab.slug
                ? "bg-cefPurple text-white"
                : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
