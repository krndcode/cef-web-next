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
  downloadPath: string | null;
  isActive: boolean;
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
