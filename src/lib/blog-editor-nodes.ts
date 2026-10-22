import { Node, mergeAttributes } from "@tiptap/core";

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
