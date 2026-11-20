import { z } from "zod";
import { contact, NO_AGE } from "./content";

export const inquirySchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name.").max(100),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[0-9+()\-.\s]*$/, "Use digits, spaces, + ( ) - only.")
      .optional()
      .or(z.literal("")),
    inquiryType: z.enum(contact.inquiryTypes, { message: "Please choose an inquiry type." }),
    ageGroup: z.enum(contact.ageGroups).optional().or(z.literal("")),
    guardian: z.boolean().optional(),
    message: z
      .string()
      .trim()
      .min(10, "Please write at least a short message (10+ characters).")
      .max(3000),
    // honeypot: must stay empty
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((v) => !v.ageGroup || v.ageGroup === NO_AGE || v.guardian === true, {
    path: ["guardian"],
    message: "A parent or guardian must confirm this inquiry for a minor.",
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
