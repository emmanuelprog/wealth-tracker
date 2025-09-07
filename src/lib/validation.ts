import { z } from "zod";
import { validatePasswordStrength, validateEmail, sanitizeInput } from "./security";

// Enhanced input sanitization helper
export const sanitizeString = (input: string): string => {
  return sanitizeInput(input);
};

// Enhanced authentication validation schemas
export const authSignUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((email) => validateEmail(email).isValid, {
      message: "Please enter a valid email address"
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((password) => validatePasswordStrength(password).isValid, {
      message: "Password must contain uppercase, lowercase, numbers, and special characters"
    }),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .refine((val) => sanitizeString(val).length > 0, "First name cannot be empty"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .refine((val) => sanitizeString(val).length > 0, "Last name cannot be empty"),
  preferredCurrency: z.string().length(3, "Currency must be a valid 3-letter code")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const authSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((email) => validateEmail(email).isValid, {
      message: "Please enter a valid email address"
    }),
  password: z
    .string()
    .min(1, "Password is required")
});

// Common validation schemas
export const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(100, "Account name must be less than 100 characters")
    .refine((val) => sanitizeString(val).length > 0, "Account name cannot be empty"),
  account_type: z.enum(["checking", "savings", "credit_card", "investment", "loan", "other"], {
    errorMap: () => ({ message: "Please select a valid account type" })
  }),
  institution_name: z
    .string()
    .max(100, "Institution name must be less than 100 characters")
    .optional(),
  balance: z
    .number()
    .min(-1000000, "Balance cannot be less than -1,000,000")
    .max(1000000000, "Balance cannot exceed 1,000,000,000")
    .refine((val) => !isNaN(val), "Balance must be a valid number"),
  currency: z.string().length(3, "Currency must be a valid 3-letter code")
});

export const transactionFormSchema = z.object({
  merchant: z
    .string()
    .min(1, "Merchant/Description is required")
    .max(200, "Merchant name must be less than 200 characters"),
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed 1,000,000")
    .refine((val) => !isNaN(val), "Amount must be a valid number"),
  account_id: z.string().uuid("Please select a valid account"),
  category_id: z.string().uuid("Please select a valid category").optional(),
  transaction_type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Please select income or expense" })
  }),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
});

export const goalFormSchema = z.object({
  title: z
    .string()
    .min(1, "Goal title is required")
    .max(100, "Goal title must be less than 100 characters"),
  target_amount: z
    .number()
    .min(1, "Target amount must be greater than 0")
    .max(1000000000, "Target amount cannot exceed 1,000,000,000"),
  current_amount: z
    .number()
    .min(0, "Current amount cannot be negative")
    .max(1000000000, "Current amount cannot exceed 1,000,000,000"),
  goal_type: z.enum(["savings", "debt_payoff", "investment", "purchase", "emergency"], {
    errorMap: () => ({ message: "Please select a valid goal type" })
  }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  target_date: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional()
});

export const profileFormSchema = z.object({
  first_name: z
    .string()
    .max(50, "First name must be less than 50 characters")
    .optional(),
  last_name: z
    .string()
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  display_name: z
    .string()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[\+]?[0-9\-\s\(\)]*$/, "Invalid phone number format")
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  preferred_currency: z.string().length(3, "Currency must be a valid 3-letter code").optional()
});

export const userSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  budget_alerts: z.boolean(),
  goal_reminders: z.boolean(),
  transaction_notifications: z.boolean(),
  weekly_summary: z.boolean(),
  monthly_report: z.boolean(),
  low_balance_threshold: z
    .number()
    .min(0, "Threshold cannot be negative")
    .max(1000000, "Threshold cannot exceed 1,000,000")
});

export type AuthSignUpData = z.infer<typeof authSignUpSchema>;
export type AuthSignInData = z.infer<typeof authSignInSchema>;
export type AccountFormData = z.infer<typeof accountFormSchema>;
export type TransactionFormData = z.infer<typeof transactionFormSchema>;
export type GoalFormData = z.infer<typeof goalFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type UserSettingsData = z.infer<typeof userSettingsSchema>;