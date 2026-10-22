export type Section = { h: string; p: string; items?: string[]; image?: string; imageAlt?: string };
export const storyDefault: Section[] = [
 { h: "Origin", p: "Our vanilla comes from Sri Lanka. [Add verified regions, growers and harvest details.]" },
 { h: "Mission", p: "[Add your mission in one or two sentences.]" },
 { h: "Sourcing and suppliers", p: "[Describe supplier relationships and how you select lots.]" },
 { h: "Processing approach", p: "[State what is done in-house and what is done by partners.]" },
 { h: "Commitment to buyers", p: "[Describe your support for repeat and long-term orders, only as far as you can deliver.]" },
];
export const qualityDefault: Section[] = [
 { h: "Specifications and batch identification", p: "Each lot is identified by a batch reference. [Describe your batch coding system.]" },
 { h: "Quality checks and packaging integrity", p: "[List checks actually performed, e.g. visual, moisture, aroma. Remove any that are not.]" },
 { h: "Documents", p: "Mark each document as available only after you hold it. Nothing is shown as certified by default.", items: ["Certificate of Analysis: not yet available", "Microbiological report: not yet available", "Pesticide residue report: not yet available", "Food safety certification: not yet available", "Origin documentation: not yet available"] },
];

export type HomeStep = { title: string; text: string };
export type HomeCard = { title: string; text: string; linkLabel: string; linkHref: string };
export type HomeContent = {
  hero: { eyebrow: string; title: string; text: string; image: string; imageAlt: string; primaryLabel: string; secondaryLabel: string };
  products: { title: string; text: string };
  why: { title: string; text: string; image: string; imageAlt: string };
  process: { title: string; text: string; steps: HomeStep[] };
  applications: { title: string; items: string[] };
  highlights: HomeCard[];
  cta: { title: string; text: string; buttonLabel: string };
};
export const homeDefault: HomeContent = {
  hero: {
    eyebrow: "Sri Lankan vanilla exporter",
    title: "Exceptional Vanilla. Rooted in Sri Lanka.",
    text: "We supply vanilla beans, vanilla powder and vanilla tea to importers, food manufacturers, wholesalers and private-label brands.",
    image: "", imageAlt: "",
    primaryLabel: "Explore our products", secondaryLabel: "Request a quote",
  },
  products: { title: "Our products", text: "Vanilla beans, powder and tea for wholesale and manufacturing." },
  why: {
    title: "Why source vanilla from Sri Lanka",
    text: "Sri Lanka is a tropical island with a long history of spice cultivation and export, and vanilla is a growing specialty crop there.\n\nFor importers, a Sri Lankan source can add origin diversity to a vanilla supply chain. [Add verified facts about your growing regions, harvest season and supplier network.]",
    image: "", imageAlt: "",
  },
  process: {
    title: "From farm to export",
    text: "Mark each step as in place or planned before launch.",
    steps: [
      { title: "Sourcing", text: "Describe your actual sourcing model and supplier relationships here." },
      { title: "Curing and processing", text: "State which steps you perform in-house and which are planned. [Edit]" },
      { title: "Quality checks", text: "List the checks genuinely carried out per batch. [Edit]" },
      { title: "Packaging", text: "Describe confirmed packaging formats. [Edit]" },
      { title: "Export preparation", text: "Describe documentation and shipping support you can provide. [Edit]" },
    ],
  },
  applications: { title: "Applications", items: ["Bakeries", "Confectionery", "Ice cream", "Beverages", "Tea brands", "Food manufacturing"] },
  highlights: [
    { title: "Quality and traceability", text: "Batch information and test documents are shared when available for the lot you are considering.", linkLabel: "How we document quality", linkHref: "/quality" },
    { title: "Wholesale and private label", text: "Ask about bulk supply and custom packaging. Availability depends on the product and quantity.", linkLabel: "Request a wholesale quote", linkHref: "/contact" },
  ],
  cta: { title: "Tell us what you need", text: "Share product, quantity and destination. We will reply with next steps.", buttonLabel: "Request a quote" },
};

// Fills any field missing from saved home content with its default, so new fields never break old data.
export function withHomeDefaults(h: Partial<HomeContent> = {}): HomeContent {
  const d = homeDefault;
  return {
    hero: { ...d.hero, ...h.hero }, products: { ...d.products, ...h.products }, why: { ...d.why, ...h.why },
    process: { ...d.process, ...h.process }, applications: { ...d.applications, ...h.applications },
    highlights: h.highlights ?? d.highlights, cta: { ...d.cta, ...h.cta },
  };
}
