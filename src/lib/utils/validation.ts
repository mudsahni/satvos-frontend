import { z } from "zod";

export const loginSchema = z.object({
  tenant_slug: z
    .string()
    .min(1, "Tenant is required")
    .regex(/^[a-z0-9-]+$/, "Invalid tenant format"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(1, "Full name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "manager", "member", "viewer"]),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  full_name: z.string().min(1, "Full name is required").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["admin", "manager", "member", "viewer"]).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;

export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  description: z.string().max(1000, "Description is too long").optional(),
});

export type UpdateCollectionFormData = z.infer<typeof updateCollectionSchema>;

export const addPermissionSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  permission_level: z.enum(["owner", "editor", "viewer"]),
});

export type AddPermissionFormData = z.infer<typeof addPermissionSchema>;

export const createDocumentSchema = z.object({
  file_id: z.string().uuid("Invalid file ID"),
  collection_id: z.string().uuid("Invalid collection ID"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  parse_mode: z.enum(["single", "dual"]).default("single"),
});

export type CreateDocumentFormData = z.infer<typeof createDocumentSchema>;

export const reviewDocumentSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type ReviewDocumentFormData = z.infer<typeof reviewDocumentSchema>;
