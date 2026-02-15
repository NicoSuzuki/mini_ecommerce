const { z } = require("zod");

exports.updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled"]),
});
