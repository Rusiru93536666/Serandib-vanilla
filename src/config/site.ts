// CENTRAL CONFIG: edit everything marked [TBC] before launch.
export const TBC = "To be confirmed";
export const site = {
  brand: "Ceylon Vanilla Essence",
  tagline: "Exceptional Vanilla. Rooted in Sri Lanka.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Contact details and social links are edited in Admin → Contact & social (saved in MongoDB).
  // These values are only the starting defaults before anything is saved there.
  email: "",
  whatsapp: "", // international format, digits only
  address: "",
  social: { facebook: "", instagram: "", tiktok: "" } as Record<string, string>,
};

export type Product = {
  slug: string; name: string; short: string; intro: string;
  uses: string[]; note: string; imageNote: string;
  specs: [string, string][]; packaging: string;
  images?: { src: string; alt: string }[];
};

export const products: Product[] = [
  {
    slug: "vanilla-beans", name: "Vanilla Beans",
    short: "Cured vanilla beans for baking, pastry, ice cream and extraction.",
    intro: "Whole cured vanilla beans for manufacturers, bakeries and extract producers. Grade, variety and bean length are listed only once verified for each lot.",
    uses: ["Baking and pastry", "Desserts and custards", "Ice cream", "Vanilla extraction"],
    note: "Do not state a grade (e.g. Grade A) until it is verified against the lot.",
    imageNote: "Replace with photography of cured beans (public/images/vanilla-beans-*.jpg).",
    specs: [["Variety", TBC], ["Bean length", TBC], ["Grade", TBC], ["Moisture content", TBC], ["Packaging", TBC], ["Available quantity", TBC], ["Minimum order quantity", TBC], ["Sample availability", TBC]],
    packaging: "Packaging formats to be confirmed. Add vacuum pack, carton and net weight details once finalised.",
  },
  {
    slug: "vanilla-powder", name: "Vanilla Powder",
    short: "Vanilla powder for dry mixes, confectionery, desserts and beverages.",
    intro: "Vanilla powder for food manufacturers. Composition matters: pure ground vanilla beans differ from blends containing carriers such as sugar or maltodextrin. The exact composition is stated per product.",
    uses: ["Baking and dry mixes", "Confectionery", "Desserts", "Beverage manufacturing"],
    note: "State clearly whether the powder is 100% ground vanilla beans or a blend with carriers.",
    imageNote: "Replace with photography of powder and pods (public/images/vanilla-powder-*.jpg).",
    specs: [["Composition", TBC], ["Ingredient list", TBC], ["Particle size", TBC], ["Packaging", TBC], ["Shelf life", TBC], ["Minimum order quantity", TBC], ["Available quantity", TBC]],
    packaging: "Packaging formats to be confirmed.",
  },
  {
    slug: "vanilla-tea", name: "Vanilla Tea",
    short: "Vanilla-flavoured tea concepts for retail and wholesale.",
    intro: "A vanilla tea range for tea brands and retailers. Confirmed formats and proposed formats are kept separate below. The product is not described as containing real vanilla unless the formulation confirms it.",
    uses: ["Retail tea bags", "Loose-leaf tea", "Private-label tea brands", "Hospitality and cafés"],
    note: "Confirm whether flavouring is natural vanilla, vanilla beans or other before marketing claims.",
    imageNote: "Replace with tea bag, brewed cup and packaging photography (public/images/vanilla-tea-*.jpg).",
    specs: [["Confirmed formats", TBC], ["Proposed formats", TBC], ["Ingredient composition", TBC], ["Tea base", TBC], ["Net weight", TBC], ["Packaging", TBC], ["Shelf life", TBC], ["Minimum order quantity", TBC], ["Private-label options", TBC]],
    packaging: "Packaging formats to be confirmed.",
  },
];

export const nav = [
  { href: "/products", label: "Products" }, { href: "/about", label: "Our Story" },
  { href: "/quality", label: "Quality" }, { href: "/gallery", label: "Gallery" }, { href: "/blog", label: "Blog" }, { href: "/contact", label: "Contact" },
];
