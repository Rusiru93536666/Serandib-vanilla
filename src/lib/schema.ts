import { z } from "zod";
export const MULTIPLE_PRODUCTS = "Multiple Products";
export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  company: z.string().trim().min(2, "Enter your company name").max(150),
  email: z.string().trim().email("Enter a valid business email").max(150),
  country: z.string().trim().min(2, "Enter your country").max(80),
  buyerType: z.enum(["Importer","Wholesaler","Distributor","Food manufacturer","Bakery","Tea brand","Private-label buyer","Other"], { message: "Select a buyer type" }),
  product: z.string({ message: "Select a product" }).trim().min(1, "Select a product").max(100),
  quantity: z.string().trim().min(1, "Enter the quantity you need").max(30),
  unit: z.enum(["g","kg","units"], { message: "Select a unit" }),
  intendedUse: z.string().trim().max(300).optional().default(""),
  packaging: z.string().trim().max(300).optional().default(""),
  sample: z.enum(["yes","no"]).default("no"),
  shippingTerms: z.enum(["Not sure","FOB","CIF","Other"]).default("Not sure"),
  targetDate: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm consent to be contacted" }) }),
  website: z.string().max(0).optional(), // honeypot
});
export type Inquiry = z.infer<typeof inquirySchema>;
