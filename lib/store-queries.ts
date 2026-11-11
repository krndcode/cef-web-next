import { getStoreDb } from "@/lib/store-db";
import type {
  StoreOrder,
  StoreProduct,
  StoreOrderItem,
  StoreUser,
  StoreRole,
} from "@/lib/store-types";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price_pesewas: number;
  stock_quantity: number;
  image_url: string | null;
  badge: string | null;
  product_type: "book" | "free_resource";
  download_path: string | null;
  is_active: boolean;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal_pesewas: number;
  delivery_fee_pesewas: number | null;
  total_pesewas: number | null;
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  region: string;
  delivery_note: string | null;
  created_at: Date;
};

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_title: string;
  quantity: number;
  unit_price_pesewas: number;
};

function toProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    pricePesewas: row.price_pesewas,
    stockQuantity: row.stock_quantity,
    imageUrl: row.image_url,
    badge: row.badge,
    productType: row.product_type,
    downloadPath: row.download_path,
    isActive: row.is_active,
  };
}

function toOrder(row: OrderRow, items: StoreOrderItem[]): StoreOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotalPesewas: row.subtotal_pesewas,
    deliveryFeePesewas: row.delivery_fee_pesewas,
    totalPesewas: row.total_pesewas,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    region: row.region,
    deliveryNote: row.delivery_note,
    createdAt: row.created_at.toISOString(),
    items,
  };
}

async function getOrderItems(orderIds: string[]): Promise<Map<string, StoreOrderItem[]>> {
  if (orderIds.length === 0) {
    return new Map();
  }

  const result = await getStoreDb().query<OrderItemRow & { order_id: string }>(
    `SELECT id, order_id, product_id, product_title, quantity, unit_price_pesewas
     FROM store_order_items
     WHERE order_id = ANY($1::uuid[])
     ORDER BY product_title`,
    [orderIds],
  );
  const itemsByOrder = new Map<string, StoreOrderItem[]>();

  for (const row of result.rows) {
    const items = itemsByOrder.get(row.order_id) ?? [];
    items.push({
      id: row.id,
      productId: row.product_id,
      productTitle: row.product_title,
      quantity: row.quantity,
      unitPricePesewas: row.unit_price_pesewas,
    });
    itemsByOrder.set(row.order_id, items);
  }
  return itemsByOrder;
}

export async function getActiveProducts(): Promise<StoreProduct[]> {
  const result = await getStoreDb().query<ProductRow>(
    `SELECT id, slug, title, category, description, price_pesewas,
            stock_quantity, image_url, badge, product_type, download_path, is_active
     FROM store_products
     WHERE is_active = TRUE
     ORDER BY category, title`,
  );
  return result.rows.map(toProduct);
}

export async function getCustomerOrders(userId: string): Promise<StoreOrder[]> {
  const result = await getStoreDb().query<OrderRow>(
    `SELECT id, order_number, status, payment_status, subtotal_pesewas,
            delivery_fee_pesewas, total_pesewas, recipient_name, phone,
            address_line_1, address_line_2, city, region, delivery_note,
            created_at
     FROM store_orders
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  );
  const itemsByOrder = await getOrderItems(result.rows.map((row) => row.id));
  return result.rows.map((row) =>
    toOrder(row, itemsByOrder.get(row.id) ?? []),
  );
}

export async function getAllStoreProducts(): Promise<StoreProduct[]> {
  const result = await getStoreDb().query<ProductRow>(
    `SELECT id, slug, title, category, description, price_pesewas,
            stock_quantity, image_url, badge, product_type, download_path, is_active
     FROM store_products
     ORDER BY created_at DESC`,
  );
  return result.rows.map(toProduct);
}

export async function getAllStoreOrders(): Promise<
  Array<StoreOrder & { customerEmail: string }>
> {
  const result = await getStoreDb().query<OrderRow & { email: string }>(
    `SELECT o.id, o.order_number, o.status, o.payment_status,
            o.subtotal_pesewas, o.delivery_fee_pesewas, o.total_pesewas,
            o.recipient_name, o.phone, o.address_line_1, o.address_line_2,
            o.city, o.region, o.delivery_note, o.created_at, u.email
     FROM store_orders o
     JOIN store_users u ON u.id = o.user_id
     ORDER BY o.created_at DESC
     LIMIT 100`,
  );
  const itemsByOrder = await getOrderItems(result.rows.map((row) => row.id));
  return result.rows.map((row) => ({
    ...toOrder(row, itemsByOrder.get(row.id) ?? []),
    customerEmail: row.email,
  }));
}

export async function getStoreUsers(): Promise<StoreUser[]> {
  const result = await getStoreDb().query<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    region: string | null;
    delivery_note: string | null;
    role: StoreRole;
    is_active: boolean;
    is_primary_admin: boolean;
    created_at: Date;
  }>(
    `SELECT id, name, email, phone, address_line_1, address_line_2,
            city, region, delivery_note, role, is_active, is_primary_admin, created_at
     FROM store_users
     ORDER BY created_at DESC
     LIMIT 500`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    region: row.region,
    deliveryNote: row.delivery_note,
    role: row.role,
    isActive: row.is_active,
    isPrimaryAdmin: row.is_primary_admin,
    createdAt: row.created_at.toISOString(),
  }));
}
