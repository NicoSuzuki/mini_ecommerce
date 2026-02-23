const { z } = require("zod");

const currencySchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => v.length === 3, "currency must be a 3-letter code");

const imageUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      v.startsWith("/uploads/") ||
      v.startsWith("http://") ||
      v.startsWith("https://"),
    "image_url must be /uploads/... or a valid URL",
  );

exports.createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional(),
  price_cents: z.coerce.number().int().min(0),
  currency: currencySchema.default("JPY"),
  stock: z.coerce.number().int().min(0),
  image_url: imageUrlSchema.nullable().optional(),
});

exports.updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  price_cents: z.coerce.number().int().min(0).optional(),
  currency: currencySchema.optional(),
  stock: z.coerce.number().int().min(0).optional(),
  image_url: imageUrlSchema.nullable().optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
});
