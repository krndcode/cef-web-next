import { getStoreDb } from "@/lib/store-db";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-dashboard-constants";

export type AdminTrend = {
  id: string;
  title: string;
  category: string;
  value: number;
};

export type AdminDashboardSummary = {
  productCount: number;
  publishedProductCount: number;
  paidProductCount: number;
  orderCount: number;
  pendingOrderAttentionCount: number;
  customerCount: number;
  publishedVideoCount: number;
  draftVideoCount: number;
  totalVideoViews: number;
  unreadMessageCount: number;
  lowStockProductCount: number;
};

export type AdminActivity = {
  id: string;
  kind: "order" | "broadcast" | "message";
  title: string;
  occurredAt: string;
};

type SummaryRow = {
  product_count: number;
  published_product_count: number;
  paid_product_count: number;
  order_count: number;
  pending_order_attention_count: number;
  customer_count: number;
  published_video_count: number;
  draft_video_count: number;
  total_video_views: number;
  unread_message_count: number;
  low_stock_product_count: number;
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const result = await getStoreDb().query<SummaryRow>(
    `SELECT
       (SELECT COUNT(*)::int FROM store_products) AS product_count,
       (SELECT COUNT(*)::int FROM store_products WHERE is_active = TRUE) AS published_product_count,
       (SELECT COUNT(*)::int FROM store_products
        WHERE is_active = TRUE AND product_type = 'book' AND price_pesewas > 0) AS paid_product_count,
       (SELECT COUNT(*)::int FROM store_orders) AS order_count,
       (SELECT COUNT(*)::int FROM store_orders
        WHERE status IN ('pending_delivery_quote', 'awaiting_payment'))
        AS pending_order_attention_count,
       (SELECT COUNT(*)::int FROM store_users WHERE role = 'customer') AS customer_count,
       (SELECT COUNT(*)::int FROM production_videos
        WHERE published_at IS NOT NULL AND published_at <= NOW()) AS published_video_count,
       (SELECT COUNT(*)::int FROM production_videos WHERE published_at IS NULL) AS draft_video_count,
       (SELECT COALESCE(SUM(views), 0)::int FROM production_videos) AS total_video_views,
       (SELECT COUNT(*)::int FROM support_messages WHERE is_read = FALSE) AS unread_message_count,
       (SELECT COUNT(*)::int FROM store_products
        WHERE is_active = TRUE AND product_type = 'book'
          AND stock_quantity <= $1) AS low_stock_product_count`,
    [LOW_STOCK_THRESHOLD],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Could not load admin dashboard summary.");
  }
  return {
    productCount: row.product_count,
    publishedProductCount: row.published_product_count,
    paidProductCount: row.paid_product_count,
    orderCount: row.order_count,
    pendingOrderAttentionCount: row.pending_order_attention_count,
    customerCount: row.customer_count,
    publishedVideoCount: row.published_video_count,
    draftVideoCount: row.draft_video_count,
    totalVideoViews: row.total_video_views,
    unreadMessageCount: row.unread_message_count,
    lowStockProductCount: row.low_stock_product_count,
  };
}

export async function getAdminRecentActivity(): Promise<AdminActivity[]> {
  const result = await getStoreDb().query<{
    id: string;
    kind: AdminActivity["kind"];
    title: string;
    occurred_at: Date;
  }>(
    `SELECT id, kind, title, occurred_at
     FROM (
       SELECT id, 'order'::text AS kind,
              'New order · ' || order_number AS title,
              created_at AS occurred_at
       FROM store_orders
       UNION ALL
       SELECT id, 'broadcast'::text AS kind,
              'Broadcast published · ' || title AS title,
              published_at AS occurred_at
       FROM production_videos
       WHERE published_at IS NOT NULL
       UNION ALL
       SELECT id, 'message'::text AS kind,
              'Message received · ' || topic AS title,
              created_at AS occurred_at
       FROM support_messages
     ) activity
     ORDER BY occurred_at DESC
     LIMIT 5`,
  );
  return result.rows
    .filter((row) => row.occurred_at instanceof Date && !Number.isNaN(row.occurred_at.getTime()))
    .map((row) => ({
      id: `${row.kind}-${row.id}`,
      kind: row.kind,
      title: row.title,
      occurredAt: row.occurred_at.toISOString(),
    }));
}

export async function getAdminDashboardTrends(): Promise<{
  mostViewedProductions: AdminTrend[];
  mostPurchasedProducts: AdminTrend[];
}> {
  const [productions, products] = await Promise.all([
    getStoreDb().query<AdminTrend>(
      `SELECT v.id, v.title, c.name AS category, v.views AS value
       FROM production_videos v
       JOIN production_categories c ON c.id = v.category_id
       WHERE v.published_at IS NOT NULL AND v.published_at <= NOW()
       ORDER BY v.views DESC, v.published_at DESC NULLS LAST
       LIMIT 5`,
    ),
    getStoreDb().query<AdminTrend>(
      `SELECT p.id, p.title, p.category, SUM(i.quantity)::int AS value
       FROM store_order_items i
       JOIN store_orders o ON o.id = i.order_id
       JOIN store_products p ON p.id = i.product_id
       WHERE o.payment_status = 'paid' AND p.product_type = 'book'
       GROUP BY p.id, p.title, p.category
       ORDER BY SUM(i.quantity) DESC, p.title
       LIMIT 5`,
    ),
  ]);
  return {
    mostViewedProductions: productions.rows,
    mostPurchasedProducts: products.rows,
  };
}
