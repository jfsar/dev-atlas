import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(200, "Password is too long."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const twoFactorCodeSchema = z.object({
  code: z
    .string("Enter your 6-digit code or a backup code.")
    .trim()
    .min(1, "Enter your 6-digit code or a backup code.")
    .max(32, "That code is too long."),
});

export type TwoFactorCodeInput = z.infer<typeof twoFactorCodeSchema>;

export const twoFactorPasswordSchema = z.object({
  password: z
    .string("Confirm with your password.")
    .min(1, "Password is required.")
    .max(200, "Password is too long."),
});

export type TwoFactorPasswordInput = z.infer<typeof twoFactorPasswordSchema>;
