export type StoreEmailLineItem = {
  title: string;
  quantity: number;
  unitPricePesewas: number;
};

type StoreOrderEmailInput = {
  kind: "order_received" | "delivery_fee_confirmed";
  to: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  items: StoreEmailLineItem[];
  subtotalPesewas: number;
  deliveryFeePesewas?: number;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function formatGhs(pesewas: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(pesewas / 100);
}

function getOrderUrl(orderId: string): string {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  let url: URL;
  try {
    url = new URL("/store", appUrl);
  } catch {
    throw new Error("APP_URL must be an absolute URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("APP_URL must use HTTP or HTTPS.");
  }

  url.searchParams.set("order", orderId);
  url.hash = `order-${orderId}`;
  return url.toString();
}

export async function sendStoreOrderEmail(
  input: StoreOrderEmailInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error(
      "RESEND_API_KEY and RESEND_FROM_EMAIL must be configured to send store emails.",
    );
  }

  const orderUrl = getOrderUrl(input.orderId);
  const isQuote = input.kind === "delivery_fee_confirmed";
  const subject = isQuote
    ? `Delivery fee confirmed for order ${input.orderNumber}`
    : `We received your CEF Store order ${input.orderNumber}`;
  const greeting = `Hello ${input.customerName},`;
  const itemRows = input.items
    .map(
      (item) =>
        `<li>${item.quantity} × ${escapeHtml(item.title)} — ${formatGhs(item.unitPricePesewas * item.quantity)}</li>`,
    )
    .join("");
  const total = isQuote
    ? input.subtotalPesewas + (input.deliveryFeePesewas ?? 0)
    : null;
  const summary = isQuote
    ? `Your delivery fee is ${formatGhs(input.deliveryFeePesewas ?? 0)}. Your total is ${formatGhs(total ?? input.subtotalPesewas)}.`
    : "Your order is in our system. We’ll confirm the delivery fee before asking you to pay.";
  const action = isQuote
    ? "Review your order and continue to secure payment."
    : "You can return to the store to check your order status.";
  const text = [
    greeting,
    "",
    isQuote
      ? `The delivery fee for order ${input.orderNumber} has been confirmed.`
      : `We received order ${input.orderNumber}.`,
    summary,
    "",
    "Items:",
    ...input.items.map(
      (item) =>
        `${item.quantity} x ${item.title} — ${formatGhs(item.unitPricePesewas * item.quantity)}`,
    ),
    "",
    action,
    orderUrl,
    "",
    "Christ The Entirety Foundation",
  ].join("\n");
  const html = `<main style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6"><p>${escapeHtml(greeting)}</p><p>${escapeHtml(summary)}</p><p><strong>Order ${escapeHtml(input.orderNumber)}</strong></p><ul>${itemRows}</ul><p>${escapeHtml(action)}</p><p><a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:12px 18px;background:#5b21b6;color:#fff;text-decoration:none;border-radius:8px">View your order</a></p><p>Christ The Entirety Foundation</p></main>`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `cef-store-${input.kind}-${input.orderId}`,
      },
      body: JSON.stringify({ from, to: input.to, subject, html, text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Resend rejected the store email (HTTP ${response.status}).`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
