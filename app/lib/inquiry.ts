import { z } from "zod";
import { contact, merch, NO_AGE } from "./content";

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
    // Merch orders only (required there; see below).
    address: z.string().trim().max(300).optional().or(z.literal("")),
    fulfillment: z.enum(merch.fulfillment).optional().or(z.literal("")),
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
  })
  .superRefine((v, ctx) => {
    if (v.inquiryType !== "Merch Order") return;
    if ((v.phone ?? "").replace(/\D/g, "").length < 7)
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Please enter a mobile number so we can confirm your order." });
    if ((v.address ?? "").length < 10)
      ctx.addIssue({ code: "custom", path: ["address"], message: "Please enter your full address (street, barangay, city)." });
    if (!v.fulfillment)
      ctx.addIssue({ code: "custom", path: ["fulfillment"], message: "Choose pickup or a delivery option." });
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
