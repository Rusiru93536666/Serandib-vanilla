import type { Metadata } from "next";
import { getContent } from "@/lib/store";
import SectionsPage from "@/components/SectionsPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Our story", description: "Sri Lankan vanilla for international buyers: origin, sourcing approach and commitment.", alternates: { canonical: "/about" } };

export default async function About() {
  return <SectionsPage
    eyebrow="Rooted in Sri Lanka"
    icon="leaf"
    title="Our story"
    lead="Edit this page with your real story. No company history has been assumed."
    primary={{ href: "/contact", label: "Talk to us" }}
    secondary={{ href: "/products", label: "Explore our vanilla" }}
    sections={(await getContent()).story}
    closing={{ title: "Let's talk vanilla", text: "Tell us what your business needs, from samples to repeat orders, and we will get back to you.", cta: { href: "/contact", label: "Talk to us" } }}
  />;
}
