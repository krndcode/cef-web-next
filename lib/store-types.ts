export type StoreRole = "customer" | "admin";

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  deliveryNote: string | null;
  role: StoreRole;
  isActive: boolean;
  isPrimaryAdmin: boolean;
  createdAt: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  pricePesewas: number;
  stockQuantity: number;
  imageUrl: string | null;
  badge: string | null;
  productType: "book" | "free_resource";
  /** Google Drive share link for the customer PDF, when this is a free resource. */
  downloadUrl: string | null;
  isActive: boolean;
};

/**
 * Public catalog shape. The Google Drive URL is deliberately removed so it is
 * never serialized into the storefront page; customers only reach it through
 * the access-checked download route after checkout.
 */
export type StoreCatalogProduct = Omit<StoreProduct, "downloadUrl"> & {
  hasDownload: boolean;
};

export type StoreDownload = {
  id: string;
  title: string;
  category: string;
};

export type StoreOrderItem = {
  id: string;
  productId: string | null;
  productTitle: string;
  quantity: number;
  unitPricePesewas: number;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotalPesewas: number;
  deliveryFeePesewas: number | null;
  totalPesewas: number | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  deliveryNote: string | null;
  createdAt: string;
  items: StoreOrderItem[];
};

export function formatGhs(pesewas: number | null): string {
  if (pesewas === null) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(pesewas / 100);
}
