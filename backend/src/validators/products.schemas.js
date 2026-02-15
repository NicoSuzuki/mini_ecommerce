const { z } = require("zod");

exports.createProductSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .transform((v) => v.trim()),
  description: z.string().max(2000).nullable().optional(),
  price_cents: z.number().int().min(0),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.trim().toUpperCase())
    .default("JPY"),
  stock: z.number().int().min(0),
  image_url: z.string().url().nullable().optional(),
});

exports.updateProductSchema = exports.createProductSchema.partial().extend({
  is_active: z.union([z.literal(0), z.literal(1)]).optional(),
});
