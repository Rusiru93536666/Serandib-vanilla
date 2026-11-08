"use client";

import { useMemo, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { BlogFigure } from "@/lib/blog-editor-nodes";
import type { BlogNode } from "@/lib/blog";
import { Icon, type IconName } from "@/components/Icon";
import { Spinner } from "@/components/Loaders";

const emptyDoc: BlogNode = { type: "doc", content: [{ type: "paragraph" }] };

// True when the document has no text and no media, so it can be saved as "no description".
export function isEmptyDoc(doc: BlogNode | undefined) {
  const hasContent = (node: BlogNode): boolean => !!node.text?.trim() || !["doc", "paragraph", "hardBreak", "text"].includes(node.type) || (node.content ?? []).some(hasContent);
  return !doc || !hasContent(doc);
}

function ToolButton({ icon, text, label, onClick, active = false, disabled = false }: { icon?: IconName; text?: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick}
    className={`inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm transition-colors disabled:opacity-35 ${active ? "bg-forest text-ivory" : "text-charcoal/75 hover:bg-forest/10 hover:text-forest"}`}>
    {icon && <Icon name={icon} />}{text && <span className={icon ? "hidden text-xs sm:inline" : "text-xs font-semibold"}>{text}</span>}
  </button>;
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-forest/15" />;
const tableButton = "rounded-md px-2 py-1 text-charcoal/70 hover:bg-forest/10 hover:text-forest";

// Rich-text editor for a product's detailed description. Produces the same document format as blog posts.
export default function ProductDescriptionEditor({ value, onChange }: { value?: BlogNode; onChange: (doc: BlogNode | undefined) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const extensions = useMemo(() => [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Image.configure({ inline: false, allowBase64: false }),
    LinkExtension.configure({ openOnClick: false, autolink: false, protocols: ["mailto"] }),
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    Youtube.configure({ nocookie: true, controls: true, modestBranding: true }),
    Placeholder.configure({ placeholder: "Describe the product in depth: origin, grading, processing, flavour profile, applications…" }),
    BlogFigure,
  ], []);
  const editor = useEditor({
    extensions,
    content: value ?? emptyDoc,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => { const doc = e.getJSON() as BlogNode; onChange(isEmptyDoc(doc) ? undefined : doc); },
    editorProps: { attributes: { class: "blog-rich-editor min-h-[260px] px-4 py-5 text-[0.975rem] focus:outline-none sm:px-6", "aria-label": "Product detailed description editor" } },
  });
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? {
      bold: e.isActive("bold"), italic: e.isActive("italic"), h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"), link: e.isActive("link"), table: e.isActive("table"),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    } : null,
  });

  function addImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setError(""); setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload?dest=products", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Image upload failed.");
        const alt = window.prompt("Describe this image for accessibility:", file.name.replace(/\.[^.]+$/, "")) ?? "";
        const caption = window.prompt("Optional image caption:", "") ?? "";
        editor?.chain().focus().insertContent({ type: "blogFigure", attrs: { src: data.url, alt, caption } }).run();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Image upload failed.");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  function addVideo() {
    const src = window.prompt("Paste a YouTube video URL:");
    if (src) editor?.chain().focus().setYoutubeVideo({ src }).run();
  }

  return <div className="overflow-hidden rounded-lg border border-charcoal/20 bg-white shadow-sm focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20">
    <div role="toolbar" aria-label="Description formatting" className="flex flex-wrap items-center gap-0.5 border-b border-forest/10 bg-ivory/60 px-2 py-1.5">
      <ToolButton icon="undo" label="Undo" disabled={!active?.canUndo} onClick={() => editor?.chain().focus().undo().run()} />
      <ToolButton icon="redo" label="Redo" disabled={!active?.canRedo} onClick={() => editor?.chain().focus().redo().run()} />
      <Divider />
      <ToolButton text="H2" label="Heading 2" active={active?.h2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolButton text="H3" label="Heading 3" active={active?.h3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
      <ToolButton icon="bold" label="Bold" active={active?.bold} onClick={() => editor?.chain().focus().toggleBold().run()} />
      <ToolButton icon="italic" label="Italic" active={active?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()} />
      <Divider />
      <ToolButton icon="list" label="Bulleted list" active={active?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
      <ToolButton icon="listOrdered" label="Numbered list" active={active?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
      <ToolButton icon="quote" label="Quote" active={active?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
      <ToolButton icon="link" label="Add link" active={active?.link} onClick={() => { const href = window.prompt("Paste a secure HTTPS link or mailto URL:"); if (href) editor?.chain().focus().setLink({ href }).run(); }} />
      {active?.link && <ToolButton icon="unlink" label="Remove link" onClick={() => editor?.chain().focus().unsetLink().run()} />}
      <Divider />
      <ToolButton icon="image" text="Image" label="Upload image" disabled={uploading} onClick={addImage} />
      <ToolButton icon="video" text="Video" label="Embed a YouTube video in the description" onClick={addVideo} />
      <ToolButton icon="table" text="Table" label="Insert table" active={active?.table} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      {uploading && <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-charcoal/60"><Spinner className="h-3.5 w-3.5" />Uploading…</span>}
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
    {error && <p role="alert" className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>}
  </div>;
}
