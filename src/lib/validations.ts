import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Lead Schema
export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[+\d\s-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(255, "Company name must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  service: z
    .string()
    .min(1, "Service is required")
    .max(255, "Service must be less than 255 characters"),
  budget: z
    .string()
    .min(1, "Budget range is required")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "LOST"])
    .default("NEW"),
});

export type LeadInput = z.infer<typeof leadSchema>;

// Client Schema
export const clientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[+\d\s-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .min(1, "Company is required")
    .max(255, "Company name must be less than 255 characters"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "State must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  zipCode: z
    .string()
    .max(20, "Zip code must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  gstin: z
    .string()
    .max(20, "GSTIN must be less than 20 characters")
    .optional()
    .or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Project Schema
export const projectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(255, "Project name must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  clientId: z.string().min(1, "Client is required"),
  status: z
    .enum([
      "PLANNING",
      "IN_PROGRESS",
      "IN_REVIEW",
      "COMPLETED",
      "ON_HOLD",
      "CANCELLED",
    ])
    .default("PLANNING"),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  budget: z.number().positive("Budget must be greater than 0").optional(),
  spent: z.number().nonnegative("Spent must be non-negative").optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Quotation Schema
export const quotationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  items: z
    .array(
      z.object({
        description: z
          .string()
          .min(1, "Item description is required")
          .max(500, "Description must be less than 500 characters"),
        quantity: z.number().positive("Quantity must be greater than 0"),
        rate: z.number().nonnegative("Rate must be non-negative"),
      })
    )
    .min(1, "At least one item is required"),
  validUntil: z.string().datetime().optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"])
    .default("DRAFT"),
});

export type QuotationInput = z.infer<typeof quotationSchema>;

// Invoice Schema
export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional().or(z.literal("")),
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .max(50, "Invoice number must be less than 50 characters"),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  items: z
    .array(
      z.object({
        description: z
          .string()
          .min(1, "Item description is required")
          .max(500, "Description must be less than 500 characters"),
        quantity: z.number().positive("Quantity must be greater than 0"),
        rate: z.number().nonnegative("Rate must be non-negative"),
      })
    )
    .min(1, "At least one item is required"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  termsAndConditions: z
    .string()
    .max(1000, "Terms must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["DRAFT", "SENT", "VIEWED", "PAID", "CANCELLED", "OVERDUE"])
    .default("DRAFT"),
  taxRate: z.number().nonnegative().max(100).optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[+\d\s-()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(255, "Subject must be less than 255 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
  type: z
    .enum(["INQUIRY", "SUPPORT", "FEEDBACK", "PARTNERSHIP"])
    .default("INQUIRY"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
