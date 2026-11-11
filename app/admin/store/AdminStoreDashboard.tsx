"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Check,
  CircleUserRound,
  ClipboardList,
  PackagePlus,
  Save,
} from "lucide-react";
import type { StoreOrder, StoreProduct, StoreUser } from "@/lib/store-types";
import { formatGhs } from "@/lib/store-types";

type AdminOrder = StoreOrder & { customerEmail: string };

type AdminStoreDashboardProps = {
  admin: StoreUser;
  products: StoreProduct[];
  orders: AdminOrder[];
  customers: StoreUser[];
  embedded?: boolean;
};

type ApiResult = { error?: string };

const adminInputClassName =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-cefPurple focus:ring-2 focus:ring-purple-100";

async function sendAdminRequest(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<ApiResult & { ok: boolean }> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result: ApiResult = await response.json();
  return { ...result, ok: response.ok };
}

function ProductFields({ product }: { product?: StoreProduct }) {
  return (
    <>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Title
        <input
          name="title"
          required
          minLength={2}
          maxLength={180}
          defaultValue={product?.title ?? ""}
          className={adminInputClassName}
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Category
        <input
          name="category"
          required
          maxLength={80}
          defaultValue={product?.category ?? ""}
          className={adminInputClassName}
          placeholder="V.O.C Books"
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Price (GHS)
        <input
          name="priceGhs"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={
            product ? (product.pricePesewas / 100).toFixed(2) : ""
          }
          className={adminInputClassName}
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Available stock
        <input
          name="stockQuantity"
          type="number"
          min="0"
          max="1000000"
          step="1"
          required
          defaultValue={product?.stockQuantity ?? 0}
          className={adminInputClassName}
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700 sm:col-span-2">
        Description
        <textarea
          name="description"
          required
          minLength={5}
          maxLength={2000}
          rows={3}
          defaultValue={product?.description ?? ""}
          className={adminInputClassName}
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Local image path (optional)
        <input
          name="imageUrl"
          maxLength={500}
          defaultValue={product?.imageUrl ?? ""}
          className={adminInputClassName}
          placeholder="/products/book-cover.jpg"
        />
      </label>
      <label className="space-y-1.5 text-xs font-bold text-gray-700">
        Badge (optional)
        <input
          name="badge"
          maxLength={60}
          defaultValue={product?.badge ?? ""}
          className={adminInputClassName}
          placeholder="New release"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={product?.isActive ?? true}
          className="h-4 w-4 accent-cefPurple"
        />
        Show in customer catalog
      </label>
    </>
  );
}

export default function AdminStoreDashboard({
  admin,
  products,
  orders,
  customers,
  embedded = false,
}: AdminStoreDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitProduct(
    event: FormEvent<HTMLFormElement>,
    productId?: string,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title") ?? ""),
      category: String(data.get("category") ?? ""),
      description: String(data.get("description") ?? ""),
      priceGhs: String(data.get("priceGhs") ?? ""),
      stockQuantity: Number(data.get("stockQuantity")),
      imageUrl: String(data.get("imageUrl") ?? ""),
      badge: String(data.get("badge") ?? ""),
      isActive: data.get("isActive") === "on",
    };

    try {
      const result = await sendAdminRequest(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        productId ? "PATCH" : "POST",
        payload,
      );
      if (!result.ok) {
        setError(result.error ?? "Could not save this product.");
        return;
      }
      setNotice(productId ? "Product updated." : "Product added.");
      if (!productId) {
        form.reset();
      }
      router.refresh();
    } catch (requestError) {
      console.error("Admin product save request failed.", requestError);
      setError("Could not reach the store. Try saving again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOrderAction(
    orderId: string,
    action: "quote" | "status",
    value: string,
  ) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await sendAdminRequest(
        `/api/admin/orders/${orderId}`,
        "PATCH",
        action === "quote"
          ? { action, deliveryFeeGhs: value }
          : { action, status: value },
      );
      if (!result.ok) {
        setError(result.error ?? "Could not update this order.");
        return;
      }
      setNotice(action === "quote" ? "Delivery charge confirmed." : "Order updated.");
      router.refresh();
    } catch (requestError) {
      console.error("Admin order update request failed.", requestError);
      setError("Could not reach the store. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function updateCustomer(userId: string, isActive: boolean) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await sendAdminRequest(
        `/api/admin/users/${userId}`,
        "PATCH",
        { isActive },
      );
      if (!result.ok) {
        setError(result.error ?? "Could not update the customer.");
        return;
      }
      setNotice(isActive ? "Customer account enabled." : "Customer account suspended.");
      router.refresh();
    } catch (requestError) {
      console.error("Admin customer update request failed.", requestError);
      setError("Could not reach the store. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={embedded ? "text-gray-800" : "min-h-screen bg-gray-50 text-gray-800"}>
      {!embedded && (
        <header className="cef-hero-backdrop text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <h1 className="font-serif text-3xl font-bold sm:text-4xl">
                Store administration
              </h1>
              <p className="mt-2 text-sm text-purple-100/80">
                Signed in as {admin.name} · {admin.email}
              </p>
            </div>
          </div>
        </header>
      )}

      <div className={embedded ? "space-y-10" : "mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8"}>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </p>
        )}

        <section aria-labelledby="orders-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-cefPurple">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="orders-heading" className="font-serif text-2xl font-bold text-gray-950">
                Orders
              </h2>
              <p className="text-xs text-gray-500">
                Confirm delivery costs before customers pay; update fulfilment after payment.
              </p>
            </div>
          </div>
          {orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No orders have been placed.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-950">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.customerEmail} · {order.phone}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.recipientName}, {order.addressLine1}
                        {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                        {order.city}, {order.region}
                      </p>
                      {order.deliveryNote && (
                        <p className="mt-1 text-xs text-gray-500">
                          Delivery note: {order.deliveryNote}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold capitalize text-cefPurple">
                        {order.status.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 capitalize text-gray-500">
                        Payment: {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4">
                        <span>{item.quantity} × {item.productTitle}</span>
                        <span>{formatGhs(item.unitPricePesewas * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500">
                      <p>Items: {formatGhs(order.subtotalPesewas)}</p>
                      <p>Delivery: {formatGhs(order.deliveryFeePesewas)}</p>
                      <p className="mt-1 font-bold text-gray-900">
                        Total: {formatGhs(order.totalPesewas)}
                      </p>
                    </div>
                    {order.status === "pending_delivery_quote" && (
                      <form
                        className="flex flex-wrap items-end gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          void submitOrderAction(
                            order.id,
                            "quote",
                            String(formData.get("deliveryFeeGhs") ?? ""),
                          );
                        }}
                      >
                        <label className="space-y-1 text-xs font-bold text-gray-700">
                          Delivery fee (GHS)
                          <input
                            name="deliveryFeeGhs"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            className={`${adminInputClassName} w-36`}
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-cefPurple px-4 py-3 text-xs font-bold text-white hover:bg-purple-900 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Confirm delivery fee
                        </button>
                      </form>
                    )}
                    {order.status === "processing" && order.paymentStatus === "paid" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitOrderAction(order.id, "status", "shipped")}
                        className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                      >
                        Mark as shipped
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitOrderAction(order.id, "status", "delivered")}
                        className="rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Mark as delivered
                      </button>
                    )}
                    {["pending_delivery_quote", "awaiting_payment"].includes(order.status) &&
                      ["unpaid", "failed", "pending"].includes(order.paymentStatus) && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => submitOrderAction(order.id, "status", "cancelled")}
                          className="rounded-xl border border-red-200 px-4 py-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {order.paymentStatus === "pending"
                            ? "Resolve payment & cancel"
                            : "Cancel order"}
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="products-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-cefBlue">
              <Boxes className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="products-heading" className="font-serif text-2xl font-bold text-gray-950">
                Products
              </h2>
              <p className="text-xs text-gray-500">
                Set accurate prices and available stock; archive products to hide them without deleting order history.
              </p>
            </div>
          </div>

          <details className="mb-5 rounded-2xl border border-purple-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-bold text-cefPurple">
              <PackagePlus className="h-5 w-5" aria-hidden="true" />
              Add a product
            </summary>
            <form
              onSubmit={(event) => void submitProduct(event)}
              className="grid gap-4 border-t border-gray-100 p-5 sm:grid-cols-2"
            >
              <ProductFields />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cefPurple px-4 py-3 text-sm font-bold text-white hover:bg-purple-900 disabled:opacity-50 sm:col-span-2"
              >
                <PackagePlus className="h-4 w-4" aria-hidden="true" />
                Add product
              </button>
            </form>
          </details>

          {products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No products are set up.
            </p>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {products.map((product) => (
                <form
                  key={product.id}
                  onSubmit={(event) => void submitProduct(event, product.id)}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="relative flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-purple-100 text-cefPurple">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <PackagePlus className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-gray-950">{product.title}</h3>
                        <p className="text-xs text-gray-500">
                          {formatGhs(product.pricePesewas)} · {product.stockQuantity} in stock
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      product.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.isActive ? "Live" : "Archived"}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProductFields product={product} />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-800 transition hover:border-cefPurple hover:text-cefPurple disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save product
                  </button>
                </form>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="customers-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="customers-heading" className="font-serif text-2xl font-bold text-gray-950">
                Customer accounts
              </h2>
              <p className="text-xs text-gray-500">
                Suspend access when needed. Suspended customers’ active sessions are revoked.
              </p>
            </div>
          </div>
          {customers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No customer accounts yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0 sm:px-5"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{customer.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      customer.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {customer.isActive ? "Active" : "Suspended"}
                    </span>
                    <button
                      type="button"
                      disabled={busy || customer.role !== "customer"}
                      onClick={() => updateCustomer(customer.id, !customer.isActive)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:border-cefPurple hover:text-cefPurple disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {customer.isActive ? "Suspend" : "Restore"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
