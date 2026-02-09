import { z } from "zod";

// ============================================
// Password Policy
// ============================================

/**
 * Strong password requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
    "Password must contain at least one special character"
  );

/**
 * Password requirements for display
 */
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 12 characters", pattern: /.{12,}/ },
  { id: "uppercase", label: "One uppercase letter", pattern: /[A-Z]/ },
  { id: "lowercase", label: "One lowercase letter", pattern: /[a-z]/ },
  { id: "number", label: "One number", pattern: /[0-9]/ },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
  },
];

/**
 * Check if a password meets all requirements
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  requirements: { id: string; met: boolean }[];
} {
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    id: req.id,
    met: req.pattern.test(password),
  }));

  const metCount = requirements.filter((r) => r.met).length;
  const score = (metCount / requirements.length) * 100;
  const isValid = metCount === requirements.length;

  return { isValid, score, requirements };
}

// ============================================
// Email Schema
// ============================================

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .transform((email) => email.toLowerCase().trim());

// ============================================
// Login Schema
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Registration Schema
// ============================================

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// Password Change Schema
// ============================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// Password Reset Schema
// ============================================

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================
// 2FA Schemas
// ============================================

export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export type TwoFactorCodeInput = z.infer<typeof twoFactorCodeSchema>;

export const twoFactorDisableSchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(),
});

export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>;
