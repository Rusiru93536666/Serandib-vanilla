import type { Metadata } from "next";
import { getContent } from "@/lib/store";
import SectionsPage from "@/components/SectionsPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quality and traceability", description: "Specifications, batch identification, quality checks and documents for vanilla exports.", alternates: { canonical: "/quality" } };

export default async function Quality() {
  return <SectionsPage
    eyebrow="Quality & traceability"
    watermark="QUALITY"
    icon="shield"
    title="Quality and traceability"
    lead="Documents are listed only when they exist and can be shared for the specific lot you are considering."
    primary={{ href: "/contact", label: "Ask for documents" }}
    secondary={{ href: "/products", label: "View products" }}
    sections={(await getContent()).quality}
    documents
    closing={{ title: "Need documents for a specific lot?", text: "Tell us the product and quantity you are considering and we will share what is available for that batch.", cta: { href: "/contact", label: "Ask for documents" } }}
  />;
}
