"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Fragment } from "@tiptap/pm/model";
import { BlogChart, BlogFigure, BlogGallery, BlogSection } from "@/lib/blog-editor-nodes";
import type { BlogNode, BlogPost } from "@/lib/blog";
import { site } from "@/config/site";
import { Spinner } from "@/components/Loaders";
import { Icon, StatusBadge, formatDate, type IconName } from "@/components/AdminUi";

const inputClass = "w-full rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-charcoal/35 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";
const labelClass = "mb-1.5 block text-sm font-medium text-charcoal/85";
const card = "rounded-xl border border-forest/15 bg-white shadow-sm";
const imageTypes = "image/jpeg,image/png,image/webp";
const emptyDoc: BlogNode = { type: "doc", content: [{ type: "paragraph" }] };
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const toLocalDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

function Field({ label, value, onChange, type = "text", required = false, hint, placeholder, max }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; hint?: string; placeholder?: string; max?: number }) {
  return <label className="block">
    <span className="flex items-baseline justify-between gap-2"><span className={labelClass}>{label}</span>{max && <Counter value={value} max={max} />}</span>
    <input className={inputClass} type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    {hint && <span className="mt-1 block text-xs text-charcoal/55">{hint}</span>}
  </label>;
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={`text-xs tabular-nums ${value.length > max ? "text-amber-700" : "text-charcoal/45"}`}>{value.length}/{max}</span>;
}

function Panel({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return <details open={defaultOpen} className={`${card} group`}>
    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
      <h2 className="text-lg">{title}</h2>
      <Icon name="arrowDown" className="h-4 w-4 text-charcoal/40 transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-forest/10 px-5 py-4">{children}</div>
  </details>;
}

function ToolButton({ icon, text, label, onClick, active = false, disabled = false }: { icon?: IconName; text?: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}
    className={`inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm transition-colors disabled:opacity-35 ${active ? "bg-forest text-ivory" : "text-charcoal/75 hover:bg-forest/10 hover:text-forest"}`}>
    {icon && <Icon name={icon} />}{text && <span className={icon ? "hidden text-xs xl:inline" : "text-xs font-semibold"}>{text}</span>}
  </button>;
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-forest/15" />;

function pickFile(onPick: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = imageTypes;
  input.onchange = () => { const file = input.files?.[0]; if (file) onPick(file); };
  input.click();
}

export default function BlogPostEditor({ initial, id }: { initial: BlogPost | null; id?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [customSlug, setCustomSlug] = useState(!!initial);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [status, setStatus] = useState<BlogPost["status"]>(initial?.status ?? "draft");
  const [author, setAuthor] = useState(initial?.author ?? site.brand);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [coverAlt, setCoverAlt] = useState(initial?.coverAlt ?? "");
  const [publishedAt, setPublishedAt] = useState(toLocalDateTime(initial?.publishedAt ?? null));
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(""); return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Image.configure({ inline: false, allowBase64: false }),
    LinkExtension.configure({ openOnClick: false, autolink: false, protocols: ["mailto"] }),
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    Youtube.configure({ nocookie: true, controls: true, modestBranding: true }),
    Placeholder.configure({ placeholder: "Write the article here. Use the toolbar to format text and add content blocks." }),
    BlogFigure, BlogGallery, BlogChart, BlogSection,
  ], []);
  const editor = useEditor({
    extensions,
    content: initial?.content ?? emptyDoc,
    immediatelyRender: false,
    onUpdate: () => setDirty(true),
    editorProps: { attributes: { class: "blog-rich-editor min-h-[420px] px-5 py-6 text-[1.0625rem] focus:outline-none sm:px-8", "aria-label": "Blog post content editor" } },
  });
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? {
      bold: e.isActive("bold"), italic: e.isActive("italic"), h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"), link: e.isActive("link"), table: e.isActive("table"),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
      words: e.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length,
    } : null,
  });

  function run(action: () => void) {
    editor?.chain().focus();
    action();
  }

  function moveSelectedBlock(direction: -1 | 1) {
    if (!editor) return;
    const index = editor.state.selection.$from.index(0);
    const blocks: { pos: number; node: (typeof editor.state.doc.firstChild) }[] = [];
    editor.state.doc.forEach((node, pos) => blocks.push({ pos, node }));
    const target = index + direction;
    if (target < 0 || target >= blocks.length || !blocks[index].node || !blocks[target].node) return;
    const first = Math.min(index, target);
    const left = blocks[first].node;
    const right = blocks[first + 1].node;
    if (!left || !right) return;
    const ordered = direction < 0 ? [right, left] : [right, left];
    const end = blocks[first + 1].pos + right.nodeSize;
    editor.view.dispatch(editor.state.tr.replaceWith(blocks[first].pos, end, Fragment.fromArray(ordered)));
    editor.commands.focus();
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload?dest=blog", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Image upload failed.");
      return data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function addInlineImage(file: File) {
    const url = await upload(file);
    if (!url) return;
    const alt = window.prompt("Describe this image for accessibility:", file.name.replace(/\.[^.]+$/, "")) ?? "";
    const caption = window.prompt("Optional image caption:", "") ?? "";
    editor?.chain().focus().insertContent({ type: "blogFigure", attrs: { src: url, alt, caption } }).run();
  }

  function addVideo() {
    const src = window.prompt("Paste a YouTube video URL:");
    if (!src) return;
    editor?.chain().focus().setYoutubeVideo({ src }).run();
  }

  function addGallery() {
    const selected = editor?.state.doc.nodeAt(editor.state.selection.from);
    if (selected?.type.name !== "blogGallery") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.multiple = true;
      input.onchange = () => {
        const files = Array.from(input.files ?? []).slice(0, 12);
        if (files.length) void addGalleryFiles(files);
      };
      input.click();
      return;
    }
    const current = selected?.type.name === "blogGallery" ? selected.attrs.images as { src: string; alt: string; caption: string }[] : [];
    const raw = window.prompt("One gallery image per line: URL | alt text | optional caption", current.map((image) => `${image.src} | ${image.alt} | ${image.caption}`).join("\n"));
    if (!raw) return;
    try {
      const images = raw.split(/\r?\n/).map((line) => {
        const [src = "", alt = "", caption = ""] = line.split("|").map((part) => part.trim());
        if (!src) throw new Error("Every gallery line needs an image URL.");
        return { src, alt, caption };
      }).filter((image) => image.src);
      if (!Array.isArray(images) || images.length < 1 || images.length > 12) throw new Error("A gallery needs 1 to 12 images.");
      const chain = editor?.chain().focus();
      if (selected?.type.name === "blogGallery") chain?.updateAttributes("blogGallery", { images }).run();
      else chain?.insertContent({ type: "blogGallery", attrs: { images } }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gallery data must be valid JSON.");
    }
  }

  async function addGalleryFiles(files: File[]) {
    const images: { src: string; alt: string; caption: string }[] = [];
    for (const file of files) {
      const src = await upload(file);
      if (!src) return;
      images.push({
        src,
        alt: window.prompt(`Describe ${file.name} for accessibility (leave blank if decorative):`, file.name.replace(/\.[^.]+$/, "")) ?? "",
        caption: window.prompt(`Optional caption for ${file.name}:`, "") ?? "",
      });
    }
    editor?.chain().focus().insertContent({ type: "blogGallery", attrs: { images } }).run();
  }

  function addChart() {
    const selected = editor?.state.doc.nodeAt(editor.state.selection.from);
    const defaults = { chartType: "bar", config: { title: "Vanilla comparison", labels: ["Beans", "Powder", "Tea"], datasets: [{ label: "Volume", values: [12, 18, 9] }] } };
    const current = selected?.type.name === "blogChart" ? selected.attrs : defaults;
    const currentConfig = current.config as { title?: string; labels?: string[]; datasets?: { label: string; values: number[] }[] };
    const title = window.prompt("Chart title:", currentConfig.title ?? "");
    if (title === null) return;
    const rawLabels = window.prompt("Chart labels, separated by commas (up to 12):", (currentConfig.labels ?? []).join(", "));
    if (!rawLabels) return;
    const labels = rawLabels.split(",").map((label) => label.trim()).filter(Boolean);
    const rawDatasets = window.prompt("One dataset per line: name | value, value, value", (currentConfig.datasets ?? []).map((dataset) => `${dataset.label} | ${dataset.values.join(", ")}`).join("\n"));
    if (!rawDatasets) return;
    try {
      if (labels.length < 1 || labels.length > 12) throw new Error("Charts need between 1 and 12 labels.");
      const datasets = rawDatasets.split(/\r?\n/).map((line) => {
        const [label = "", valuesText = ""] = line.split("|");
        const values = valuesText.split(",").map((value) => Number(value.trim()));
        if (!label.trim() || values.length !== labels.length || values.some((value) => !Number.isFinite(value) || value < 0)) {
          throw new Error("Each dataset needs a name and one non-negative number for every label.");
        }
        return { label: label.trim(), values };
      });
      if (datasets.length < 1 || datasets.length > 4) throw new Error("Charts need between 1 and 4 datasets.");
      const chartType = window.prompt("Chart type: bar, line, or doughnut", String(current.chartType));
      if (!chartType || !["bar", "line", "doughnut"].includes(chartType)) throw new Error("Choose bar, line, or doughnut.");
      const config = { title, labels, datasets };
      const chain = editor?.chain().focus();
      if (selected?.type.name === "blogChart") chain?.updateAttributes("blogChart", { chartType, config }).run();
      else chain?.insertContent({ type: "blogChart", attrs: { chartType, config } }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chart data must be valid JSON.");
    }
  }

  function addSection() {
    const heading = window.prompt("Section heading:", "New section");
    if (!heading) return;
    editor?.chain().focus().insertContent({ type: "blogSection", attrs: { title: heading }, content: [{ type: "paragraph" }] }).run();
  }

  async function save(options: { preview?: boolean; forceDraft?: boolean } = {}) {
    if (!editor) return;
    setError("");
    setNotice("");
    if (!title.trim() || !slug.trim()) {
      setError("Add a title and URL slug before saving.");
      return;
    }
    setBusy(true);
    let image = coverImage;
    try {
      if (coverFile) {
        const uploaded = await upload(coverFile);
        if (!uploaded) {
          setBusy(false);
          return;
        }
        image = uploaded;
        setCoverImage(uploaded);
        setCoverFile(null);
      }
      const effectiveStatus = options.forceDraft ? "draft" : status;
      const date = effectiveStatus === "published" && !publishedAt ? new Date() : publishedAt ? new Date(publishedAt) : null;
      const body = {
        slug: slugify(slug),
        title,
        excerpt,
        status: effectiveStatus,
        author,
        category,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        coverImage: image,
        coverAlt,
        content: editor.getJSON(),
        publishedAt: date?.toISOString() ?? null,
        seoTitle,
        metaDescription,
        canonicalUrl,
        ogImage,
        featured,
      };
      const response = await fetch(id ? `/api/admin/blogs/${encodeURIComponent(id)}` : "/api/admin/blogs", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not save the post.");
      setDirty(false);
      setNotice(options.preview ? "Saved. Opening the private preview…" : "Post saved.");
      if (options.preview) {
        window.open(`/admin/blogs/${encodeURIComponent(data.post.id)}/preview`, "_blank", "noopener,noreferrer");
        if (!id) router.replace(`/admin/blogs/${encodeURIComponent(data.post.id)}/edit`);
      } else {
        router.push("/admin/blogs");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the post.");
    } finally {
      setBusy(false);
    }
  }

  const tableButton = "rounded-md px-2 py-1 text-charcoal/75 hover:bg-forest/10 hover:text-forest";
  const words = active?.words ?? 0;
  const urlPreview = canonicalUrl || `${site.url.replace(/^https?:\/\//, "")}/blog/${slug || "your-post"}`;
  const shownCover = coverPreview || coverImage;
  const tagList = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  const statuses: { value: BlogPost["status"]; label: string }[] = [{ value: "draft", label: "Draft" }, { value: "published", label: "Publish" }, { value: "scheduled", label: "Schedule" }];
  function pickCover(file: File) {
    if (!imageTypes.split(",").includes(file.type)) {
      setError("Cover image must be a JPEG, PNG, or WebP file.");
      return;
    }
    setCoverFile(file);
    setDirty(true);
  }

  return (
    <form className="space-y-6" onChange={() => setDirty(true)} onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link className="inline-flex items-center gap-1.5 text-sm text-charcoal/65 hover:text-forest" href="/admin/blogs" onClick={(e) => { if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) e.preventDefault(); }}><Icon name="arrowLeft" />All blog posts</Link>
          <h1 className="mt-2 text-3xl sm:text-4xl">{initial ? "Edit post" : "New blog post"}</h1>
        </div>
        {initial && <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/60"><StatusBadge status={initial.status} /><span>Last updated {formatDate(initial.updatedAt)}</span></div>}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className={`${card} space-y-5 p-5 sm:p-8`}>
            <label className="block">
              <span className="sr-only">Post title</span>
              <input required value={title} placeholder="Post title" onChange={(e) => { setTitle(e.target.value); if (!customSlug) setSlug(slugify(e.target.value)); }}
                className="w-full border-0 bg-transparent p-0 font-serif text-3xl leading-tight text-forest placeholder:text-charcoal/25 focus:outline-none sm:text-4xl" />
            </label>
            <label className="block">
              <span className={labelClass}>URL slug</span>
              <span className="flex overflow-hidden rounded-md border border-charcoal/20 shadow-sm focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20">
                <span className="flex items-center whitespace-nowrap border-r border-charcoal/15 bg-ivory px-3 font-mono text-xs text-charcoal/55">/blog/</span>
                <input className="min-w-0 flex-1 bg-white px-3 py-2 font-mono text-sm focus:outline-none" value={slug} required onChange={(e) => { setCustomSlug(true); setSlug(slugify(e.target.value)); }} />
              </span>
              <span className="mt-1 block text-xs text-charcoal/55">Unique, lowercase URL path. Existing post URLs are retained unless you edit this.</span>
            </label>
            <label className="block">
              <span className="flex items-baseline justify-between gap-2"><span className={labelClass}>Excerpt</span><Counter value={excerpt} max={500} /></span>
              <textarea className={inputClass} rows={3} maxLength={500} value={excerpt} placeholder="A short summary that makes readers want to click…" onChange={(e) => setExcerpt(e.target.value)} />
              <span className="mt-1 block text-xs text-charcoal/55">Shown on blog cards and used as the default meta description.</span>
            </label>
          </section>

          <section className={card} aria-label="Article content">
            <div role="toolbar" aria-label="Formatting" className="sticky top-[4.3rem] z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-forest/10 bg-white/95 px-2 py-1.5 backdrop-blur">
              <ToolButton icon="undo" label="Undo" disabled={!active?.canUndo} onClick={() => editor?.chain().focus().undo().run()} />
              <ToolButton icon="redo" label="Redo" disabled={!active?.canRedo} onClick={() => editor?.chain().focus().redo().run()} />
              <Divider />
              <ToolButton text="H2" label="Heading 2" active={active?.h2} onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())} />
              <ToolButton text="H3" label="Heading 3" active={active?.h3} onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())} />
              <ToolButton icon="bold" label="Bold" active={active?.bold} onClick={() => run(() => editor?.chain().focus().toggleBold().run())} />
              <ToolButton icon="italic" label="Italic" active={active?.italic} onClick={() => run(() => editor?.chain().focus().toggleItalic().run())} />
              <Divider />
              <ToolButton icon="list" label="Bulleted list" active={active?.bullet} onClick={() => run(() => editor?.chain().focus().toggleBulletList().run())} />
              <ToolButton icon="listOrdered" label="Numbered list" active={active?.ordered} onClick={() => run(() => editor?.chain().focus().toggleOrderedList().run())} />
              <ToolButton icon="quote" label="Quote" active={active?.quote} onClick={() => run(() => editor?.chain().focus().toggleBlockquote().run())} />
              <ToolButton icon="link" label="Add link" active={active?.link} onClick={() => { const href = window.prompt("Paste a secure HTTPS link or mailto URL:"); if (href) editor?.chain().focus().setLink({ href }).run(); }} />
              {active?.link && <ToolButton icon="unlink" label="Remove link" onClick={() => editor?.chain().focus().unsetLink().run()} />}
              <Divider />
              <ToolButton icon="image" text="Image" label="Upload image" onClick={() => pickFile((file) => void addInlineImage(file))} />
              <ToolButton icon="gallery" text="Gallery" label="Image gallery (select a gallery to edit it)" onClick={addGallery} />
              <ToolButton icon="video" text="Video" label="YouTube video" onClick={addVideo} />
              <ToolButton icon="chart" text="Chart" label="Chart (select a chart to edit it)" onClick={addChart} />
              <ToolButton icon="table" text="Table" label="Insert table" active={active?.table} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
              <ToolButton icon="section" text="Section" label="Content section" onClick={addSection} />
              <Divider />
              <ToolButton icon="arrowUp" label="Move block up" onClick={() => moveSelectedBlock(-1)} />
              <ToolButton icon="arrowDown" label="Move block down" onClick={() => moveSelectedBlock(1)} />
              {active?.table && <div className="mt-1 flex w-full flex-wrap items-center gap-1 border-t border-forest/10 pt-1.5 text-xs">
                <span className="px-2 font-medium text-charcoal/55">Table</span>
                <button type="button" className={tableButton} onClick={() => editor?.chain().focus().addRowAfter().run()}>Add row</button>
                <button type="button" className={tableButton} onClick={() => editor?.chain().focus().addColumnAfter().run()}>Add column</button>
                <button type="button" className={tableButton} onClick={() => editor?.chain().focus().deleteRow().run()}>Delete row</button>
                <button type="button" className={tableButton} onClick={() => editor?.chain().focus().deleteColumn().run()}>Delete column</button>
                <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-700 hover:bg-red-50" onClick={() => editor?.chain().focus().deleteTable().run()}><Icon name="trash" className="h-3.5 w-3.5" />Delete table</button>
              </div>}
            </div>
            <EditorContent editor={editor} />
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-forest/10 bg-ivory/50 px-5 py-2.5 text-xs text-charcoal/55">
              <span>{words.toLocaleString()} words · {Math.max(1, Math.round(words / 220))} min read</span>
              <span>Select a chart or gallery, then its toolbar button, to edit its data. Unsafe links and embeds are rejected on save.</span>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className={`${card} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Publish</h2>
              {dirty ? <span className="inline-flex items-center gap-1.5 text-xs text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved changes</span>
                : initial && <span className="inline-flex items-center gap-1 text-xs text-forest/70"><Icon name="check" className="h-3.5 w-3.5" />All changes saved</span>}
            </div>
            <fieldset className="mt-4">
              <legend className={labelClass}>Status</legend>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-forest/5 p-1">
                {statuses.map((option) => <label key={option.value} className={`cursor-pointer rounded-md py-1.5 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest ${status === option.value ? "bg-white font-medium text-forest shadow-sm" : "text-charcoal/65 hover:text-forest"}`}>
                  <input type="radio" name="status" value={option.value} checked={status === option.value} onChange={() => setStatus(option.value)} className="sr-only" />{option.label}
                </label>)}
              </div>
            </fieldset>
            <div className="mt-4">
              <Field label={status === "scheduled" ? "Publish at (local time)" : "Publication date (local time)"} type="datetime-local" value={publishedAt} onChange={setPublishedAt} hint={status === "scheduled" ? "Hidden until this time; public pages check the timestamp." : "Leave blank to use the current time when publishing."} />
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-forest/10 px-3 py-2.5 text-sm">
              <span className="inline-flex items-center gap-2"><Icon name="star" className="h-4 w-4 text-amber-600" />Feature on the blog page</span>
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="peer sr-only" />
              <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-charcoal/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-forest peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-forest peer-focus-visible:ring-offset-2" />
            </label>

            {(error || notice) && <p role={error ? "alert" : "status"} className={`mt-4 rounded-md border px-3 py-2 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-forest/20 bg-forest/5 text-forest"}`}>{error || notice}</p>}
            {uploading && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-charcoal/65"><Spinner />Uploading image…</p>}

            <div className="mt-5 space-y-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-ivory shadow-sm hover:bg-charcoal disabled:opacity-60" type="submit" disabled={busy || uploading}>
                {busy ? <Spinner /> : <Icon name="check" />}{busy ? "Saving…" : status === "published" ? "Save and publish" : status === "scheduled" ? "Save schedule" : "Save draft"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-md border border-forest/30 px-3 py-2 text-sm text-forest hover:bg-forest/5 disabled:opacity-60" type="button" disabled={busy || uploading} onClick={() => void save({ preview: true })}><Icon name="eye" />Save &amp; preview</button>
                <button className="rounded-md border border-charcoal/15 px-3 py-2 text-sm text-charcoal/75 hover:bg-charcoal/5 disabled:opacity-60" type="button" disabled={busy || uploading} onClick={() => void save({ forceDraft: true })}>Save as draft</button>
              </div>
            </div>
          </section>

          <Panel title="Cover image">
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) pickCover(file); }}
              className="group/cover relative overflow-hidden rounded-lg border-2 border-dashed border-forest/20 bg-ivory/60 transition-colors hover:border-forest/40">
              {shownCover ? <>
                <img src={shownCover} alt={coverAlt} className="aspect-video w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-charcoal/60 to-transparent p-2 transition-opacity sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
                  <button type="button" className="rounded-md bg-white/90 px-2.5 py-1 text-xs text-forest hover:bg-white" onClick={() => pickFile(pickCover)}>Replace</button>
                  <button type="button" className="rounded-md bg-white/90 px-2.5 py-1 text-xs text-red-700 hover:bg-white" onClick={() => { setCoverFile(null); setCoverImage(""); setDirty(true); }}>Remove</button>
                </div>
              </> : <button type="button" className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 text-sm text-charcoal/60 hover:text-forest" onClick={() => pickFile(pickCover)}>
                <Icon name="upload" className="h-6 w-6" /><span>Click or drop an image</span><span className="text-xs text-charcoal/45">JPEG, PNG, or WebP · 5 MB max</span>
              </button>}
            </div>
            {coverFile && <p role="status" className="text-xs text-charcoal/60">Selected {coverFile.name}. It uploads when you save.</p>}
            {!coverFile && <Field label="Or image URL" value={coverImage} placeholder="https://…" onChange={setCoverImage} />}
            <Field label="Alt text" value={coverAlt} placeholder="Describe the image for screen readers" onChange={setCoverAlt} />
          </Panel>

          <Panel title="Details">
            <Field label="Author" value={author} required onChange={setAuthor} />
            <Field label="Category" value={category} placeholder="e.g. Sourcing" onChange={setCategory} />
            <div>
              <Field label="Tags" value={tags} placeholder="beans, export, quality" onChange={setTags} hint="Separate tags with commas." />
              {tagList.length > 0 && <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tag preview">{tagList.map((tag, i) => <li key={`${tag}-${i}`} className="rounded-full bg-cream/50 px-2.5 py-0.5 text-xs text-forest">{tag}</li>)}</ul>}
            </div>
          </Panel>

          <Panel title="Search & sharing" defaultOpen={false}>
            <div className="rounded-lg border border-forest/10 bg-ivory/50 p-3">
              <p className="text-[0.7rem] uppercase tracking-wider text-charcoal/45">Search result preview</p>
              <p className="mt-1.5 truncate text-xs text-charcoal/55">{urlPreview}</p>
              <p className="mt-0.5 line-clamp-1 text-base text-[#1a0dab]">{seoTitle || title || "Post title"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-charcoal/70">{metaDescription || excerpt || "Add an excerpt or meta description."}</p>
            </div>
            <Field label="SEO title" value={seoTitle} max={60} placeholder={title} onChange={setSeoTitle} hint="Optional; defaults to the post title." />
            <label className="block">
              <span className="flex items-baseline justify-between gap-2"><span className={labelClass}>Meta description</span><Counter value={metaDescription} max={160} /></span>
              <textarea className={inputClass} rows={3} value={metaDescription} placeholder={excerpt} onChange={(e) => setMetaDescription(e.target.value)} />
              <span className="mt-1 block text-xs text-charcoal/55">Optional; defaults to the excerpt.</span>
            </label>
            <Field label="Canonical URL (HTTPS)" value={canonicalUrl} placeholder="https://…" onChange={setCanonicalUrl} />
            <Field label="Open Graph image URL" value={ogImage} placeholder="https://…" onChange={setOgImage} hint="Optional; defaults to the cover image." />
          </Panel>
        </aside>
      </div>
    </form>
  );
}
