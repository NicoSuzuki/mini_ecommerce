const { z } = require("zod");

exports.registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(100),
});

exports.loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});
