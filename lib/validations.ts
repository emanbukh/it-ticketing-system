import { TicketCategory, TicketStatus } from "@prisma/client";
import { ZodError, z } from "zod";

export const userLoginSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  staffId: z.string().trim().min(3, "Staff ID is required."),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3, "Username is required."),
  password: z.string().trim().min(6, "Password is required."),
});

export const ticketSchema = z.object({
  category: z.nativeEnum(TicketCategory, {
    errorMap: () => ({ message: "Please select an issue category." }),
  }),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
});

export const replySchema = z.object({
  message: z.string().trim().min(2, "Reply must be at least 2 characters."),
});

export const userProfileSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(2, "Name is required."),
  staffId: z.string().trim().min(3, "Staff ID is required."),
});

export const userUpsertSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2, "Name is required."),
  staffId: z.string().trim().min(3, "Staff ID is required."),
  password: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || value.length >= 6, "Password must be at least 6 characters."),
});

export const adminSettingsSchema = z
  .object({
    id: z.string().cuid(),
    name: z.string().trim().min(2, "Name is required."),
    username: z.string().trim().min(3, "Username is required."),
    currentPassword: z.string().trim().optional(),
    newPassword: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword && value.newPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be at least 6 characters.",
        path: ["newPassword"],
      });
    }
  });

export const statusUpdateSchema = z.object({
  ticketId: z.string().cuid(),
  status: z.nativeEnum(TicketStatus),
});

export function zodErrors(error: ZodError) {
  return error.flatten().fieldErrors;
}
