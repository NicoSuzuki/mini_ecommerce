const { z } = require("zod");

exports.checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id_product: z.number().int().positive(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
});
