import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(12).max(72),
});

export const signInSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(1).max(72),
});

export const orderSchema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(32),
  addressLine1: z.string().trim().min(4).max(200),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().min(2).max(100),
  deliveryNote: z.string().trim().max(500).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

export const storeProfilePatchSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().max(32).optional(),
    addressLine1: z.string().trim().max(200).optional(),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    region: z.string().trim().max(100).optional(),
    deliveryNote: z.string().trim().max(500).optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0);

export function parseGhsToPesewas(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const text = String(value).trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) {
    return null;
  }

  const [cedis, pesewas = ""] = text.split(".");
  const amount = Number(cedis) * 100 + Number(pesewas.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount <= 2_147_483_647 ? amount : null;
}

export const adminProductSchema = z.object({
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(80),
  productType: z.enum(["book", "free_resource"]),
  description: z.string().trim().min(5).max(2000),
  priceGhs: z.union([z.string(), z.number()]),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().trim().max(500).optional().default(""),
  downloadPath: z.string().trim().max(500).optional().default(""),
  badge: z.string().trim().max(60).optional().default(""),
  isActive: z.boolean(),
}).superRefine((product, context) => {
  if (
    product.category === "Study Parchments" &&
    product.productType !== "free_resource"
  ) {
    context.addIssue({
      code: "custom",
      path: ["productType"],
      message: "Study parchments must be free PDF resources.",
    });
  }
  if (product.productType === "free_resource") {
    if (product.category !== "Study Parchments") {
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "Free PDF resources must use the Study Parchments category.",
      });
    }
    if (product.priceGhs !== 0 && product.priceGhs !== "0" && product.priceGhs !== "0.00") {
      context.addIssue({
        code: "custom",
        path: ["priceGhs"],
        message: "Free resources cannot have a price.",
      });
    }
    if (!product.downloadPath) {
      context.addIssue({
        code: "custom",
        path: ["downloadPath"],
        message: "A PDF download path is required.",
      });
    }
  }
});
