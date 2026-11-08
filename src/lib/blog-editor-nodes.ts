import { Mark, Node, mergeAttributes } from "@tiptap/core";

// Preset text sizes for the editor's "Size" menu (relative to the article's body text). Only these keys are saved.
export const fontSizes = { sm: { label: "Small", em: ".875em" }, lg: { label: "Large", em: "1.25em" }, xl: { label: "Extra large", em: "1.5em" }, "2xl": { label: "Huge", em: "2em" } } as const;
export type FontSizeKey = keyof typeof fontSizes;
export const isFontSize = (value: unknown): value is FontSizeKey => typeof value === "string" && Object.hasOwn(fontSizes, value);

export const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return { size: { default: "lg" } };
  },
  parseHTML() {
    return [{ tag: "span[data-font-size]", getAttrs: (el) => (isFontSize(el.getAttribute("data-font-size")) ? { size: el.getAttribute("data-font-size") } : false) }];
  },
  renderHTML({ HTMLAttributes }) {
    const size = isFontSize(HTMLAttributes.size) ? HTMLAttributes.size : "lg";
    return ["span", { "data-font-size": size, style: `font-size: ${fontSizes[size].em}` }, 0];
  },
});

export const BlogFigure = Node.create({
  name: "blogFigure",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-blog-figure]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-blog-figure": "true" }), ["img", { src: node.attrs.src, alt: node.attrs.alt }], ["figcaption", node.attrs.caption || "Image caption"]];
  },
});

export const BlogGallery = Node.create({
  name: "blogGallery",
  group: "block",
  atom: true,
  addAttributes() {
    return { images: { default: [] } };
  },
  parseHTML() {
    return [{ tag: "figure[data-blog-gallery]" }];
  },
  renderHTML({ node }) {
    const count = Array.isArray(node.attrs.images) ? node.attrs.images.length : 0;
    return ["figure", { "data-blog-gallery": "true" }, ["figcaption", `Image gallery (${count} images) — select to edit or remove`]];
  },
});

export const BlogChart = Node.create({
  name: "blogChart",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      chartType: { default: "bar" },
      config: { default: { title: "", labels: [], datasets: [] } },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-blog-chart]" }];
  },
  renderHTML({ node }) {
    return ["figure", { "data-blog-chart": "true" }, ["figcaption", `${node.attrs.config?.title || "Chart"} — ${node.attrs.chartType} chart; select to edit or remove`]];
  },
});

export const BlogSection = Node.create({
  name: "blogSection",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return { title: { default: "Section heading" } };
  },
  parseHTML() {
    return [{
      tag: "section[data-blog-section]",
      getAttrs: (element) => ({ title: (element as HTMLElement).querySelector("[data-section-heading]")?.textContent ?? "Section heading" }),
      contentElement: (element) => (element as HTMLElement).querySelector("[data-section-content]") as HTMLElement,
    }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, { "data-blog-section": "true" }), ["h3", { "data-section-heading": "true" }, node.attrs.title], ["div", { "data-section-content": "true" }, 0]];
  },
});
