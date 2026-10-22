import type { BlogNode } from "@/lib/blog";

function marks(text: React.ReactNode, node: BlogNode) {
  return (node.marks ?? []).reduce<React.ReactNode>((value, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{value}</strong>;
    if (mark.type === "italic") return <em key={index}>{value}</em>;
    if (mark.type === "strike") return <s key={index}>{value}</s>;
    if (mark.type === "underline") return <u key={index}>{value}</u>;
    if (mark.type === "code") return <code key={index} className="rounded bg-cream/40 px-1.5 py-0.5 text-[0.9em]">{value}</code>;
    if (mark.type === "link") return <a key={index} href={String(mark.attrs?.href)} className="font-medium text-forest underline decoration-cream decoration-2 underline-offset-4 transition-colors hover:decoration-forest" rel={String(mark.attrs?.href).startsWith("http") ? "noopener noreferrer" : undefined}>{value}</a>;
    return value;
  }, text);
}

function Chart({ node }: { node: BlogNode }) {
  const config = node.attrs?.config as { title?: string; labels?: string[]; datasets?: { label: string; values: number[] }[] } | undefined;
  const labels = config?.labels ?? [];
  const datasets = config?.datasets ?? [];
  if (!labels.length || !datasets.length) return null;
  const colors = ["#183A2C", "#D29A31", "#5C8A75", "#9B6248"];
  const max = Math.max(1, ...datasets.flatMap((dataset) => dataset.values));
  const chartType = String(node.attrs?.chartType ?? "bar");
  return (
    <figure className="my-10 overflow-hidden rounded-2xl border border-forest/10 bg-white p-4 shadow-sm sm:p-6">
      {config?.title && <figcaption className="mb-4 text-center font-serif text-xl text-forest">{config.title}</figcaption>}
      {chartType === "doughnut" && datasets[0].values.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-8 py-4">
          <svg viewBox="0 0 100 100" className="h-48 w-48" role="img" aria-label={config?.title || "Doughnut chart"}>
            <circle cx="50" cy="50" r="36" fill="none" stroke="#e9d7a5" strokeWidth="18" />
            {(() => {
              const total = datasets[0].values.reduce((sum, value) => sum + value, 0) || 1;
              let offset = 0;
              return datasets[0].values.map((value, i) => {
                const length = (value / total) * 226.2;
                const circle = <circle key={i} cx="50" cy="50" r="36" fill="none" stroke={colors[i % colors.length]} strokeWidth="18" strokeDasharray={`${length} ${226.2 - length}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
                offset += length;
                return circle;
              });
            })()}
          </svg>
          <ul className="space-y-2 text-sm">{labels.map((label, i) => <li key={label} className="flex items-center gap-2"><span className="h-3 w-3" style={{ backgroundColor: colors[i % colors.length] }} />{label}: {datasets[0].values[i]}</li>)}</ul>
        </div>
      ) : chartType === "line" ? (
        <svg viewBox="0 0 400 250" className="h-64 w-full overflow-visible" role="img" aria-label={config?.title || "Line chart"}>
          {[0, 1, 2, 3, 4].map((row) => <line key={row} x1="35" y1={25 + row * 42} x2="390" y2={25 + row * 42} stroke="#183a2c" strokeOpacity=".12" />)}
          {datasets.map((dataset, setIndex) => {
            const points = dataset.values.map((value, i) => `${labels.length < 2 ? 200 : 40 + i * (345 / (labels.length - 1))},${205 - (value / max) * 175}`).join(" ");
            return <polyline key={dataset.label} points={points} fill="none" stroke={colors[setIndex % colors.length]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />;
          })}
          {labels.map((label, i) => <text key={label} x={labels.length < 2 ? 200 : 40 + i * (345 / (labels.length - 1))} y="238" textAnchor="middle" fontSize="10" fill="#20231f">{label.slice(0, 12)}</text>)}
        </svg>
      ) : (
        <svg viewBox="0 0 400 250" className="h-64 w-full" role="img" aria-label={config?.title || "Bar chart"}>
          {[0, 1, 2, 3, 4].map((row) => <line key={row} x1="30" y1={20 + row * 43} x2="395" y2={20 + row * 43} stroke="#183a2c" strokeOpacity=".12" />)}
          {labels.map((label, i) => {
            const groupWidth = 345 / labels.length;
            const barWidth = Math.max(3, Math.min(34, groupWidth / (datasets.length + 1)));
            return <g key={label}>
              {datasets.map((dataset, setIndex) => {
                const value = dataset.values[i];
                const height = (value / max) * 175;
                return <rect key={dataset.label} x={40 + i * groupWidth + (setIndex - (datasets.length - 1) / 2) * (barWidth + 2)} y={198 - height} width={barWidth} height={height} fill={colors[setIndex % colors.length]}><title>{`${dataset.label}: ${value}`}</title></rect>;
              })}
              <text x={40 + i * groupWidth + groupWidth / 2} y="224" textAnchor="middle" fontSize="10" fill="#20231f">{label.slice(0, 12)}</text>
            </g>;
          })}
        </svg>
      )}
      {chartType !== "doughnut" && <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">{datasets.map((dataset, i) => <li key={dataset.label} className="flex items-center gap-2"><span className="h-3 w-3" style={{ backgroundColor: colors[i % colors.length] }} />{dataset.label}</li>)}</ul>}
      <details className="mt-3 text-xs"><summary className="cursor-pointer underline">View chart data</summary><div className="mt-2 overflow-x-auto"><table className="min-w-full border-collapse text-left"><thead><tr><th className="p-2">Label</th>{datasets.map((dataset) => <th key={dataset.label} className="p-2">{dataset.label}</th>)}</tr></thead><tbody>{labels.map((label, i) => <tr key={label}><th className="p-2">{label}</th>{datasets.map((dataset) => <td key={dataset.label} className="p-2">{dataset.values[i]}</td>)}</tr>)}</tbody></table></div></details>
    </figure>
  );
}

function NodeView({ node }: { node: BlogNode }) {
  const attrs = node.attrs ?? {};
  const children = node.content?.map((child, i) => <NodeView key={i} node={child} />);
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p className="my-6">{children}</p>;
    case "heading": return Number(attrs.level) === 3 ? <h3 className="mb-3 mt-10 text-2xl leading-snug">{children}</h3> : <h2 className="mb-4 mt-14 text-3xl leading-tight sm:text-[2.125rem]">{children}</h2>;
    case "text": return <>{marks(node.text ?? "", node)}</>;
    case "hardBreak": return <br />;
    case "horizontalRule": return <hr className="mx-auto my-12 w-24 border-t-2 border-cream" />;
    case "bulletList": return <ul className="my-6 list-disc space-y-2.5 pl-7 marker:text-[#D29A31]">{children}</ul>;
    case "orderedList": return <ol className="my-6 list-decimal space-y-2.5 pl-7 marker:font-semibold marker:text-forest" start={Number(attrs.start ?? 1)}>{children}</ol>;
    case "listItem": return <li className="pl-1 [&>p]:my-0">{children}</li>;
    case "blockquote": return <blockquote className="my-10 rounded-r-2xl border-l-4 border-[#D29A31] bg-cream/25 py-2 pl-6 pr-5 font-serif text-xl italic leading-9 text-forest">{children}</blockquote>;
    case "codeBlock": return <pre className="my-6 overflow-x-auto rounded-xl bg-forest p-5 text-sm text-ivory"><code>{children}</code></pre>;
    case "image": return <figure className="my-10"><img src={String(attrs.src)} alt={String(attrs.alt ?? "")} title={String(attrs.title ?? "")} loading="lazy" className="h-auto max-h-[36rem] w-full rounded-2xl object-cover" /></figure>;
    case "blogFigure": return <figure className="my-10"><img src={String(attrs.src)} alt={String(attrs.alt ?? "")} loading="lazy" className="h-auto max-h-[36rem] w-full rounded-2xl object-cover" />{typeof attrs.caption === "string" && attrs.caption && <figcaption className="mt-3 text-center text-sm italic text-charcoal/60">{attrs.caption}</figcaption>}</figure>;
    case "blogGallery": {
      const images = attrs.images as { src: string; alt: string; caption: string }[] | undefined;
      return <div className="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2">{images?.map((image, i) => <figure key={`${image.src}-${i}`}><img src={image.src} alt={image.alt} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />{image.caption && <figcaption className="mt-2 text-sm italic text-charcoal/60">{image.caption}</figcaption>}</figure>)}</div>;
    }
    case "youtube": {
      let videoId = "";
      try {
        const url = new URL(String(attrs.src));
        videoId = url.hostname.includes("youtu.be") ? url.pathname.slice(1) : url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? "";
      } catch { return null; }
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
      return <div className="my-10 aspect-video overflow-hidden rounded-2xl shadow-lg shadow-forest/10"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
    }
    case "table": return <div className="my-10 overflow-x-auto rounded-2xl border border-forest/10 bg-white shadow-sm"><table className="min-w-full border-collapse text-left text-base [&_p]:my-0"><tbody>{children}</tbody></table></div>;
    case "tableRow": return <tr className="border-b border-forest/10 last:border-0 even:bg-ivory/50">{children}</tr>;
    case "tableHeader": return <th className="bg-forest/5 px-4 py-3 font-semibold text-forest">{children}</th>;
    case "tableCell": return <td className="px-4 py-3 align-top">{children}</td>;
    case "blogChart": return <Chart node={node} />;
    case "blogSection": return <section className="my-12"><h2 className="mb-4 text-3xl leading-tight sm:text-[2.125rem]">{String(attrs.title ?? "")}</h2>{children}</section>;
    default: return null;
  }
}

export default function BlogArticleContent({ content }: { content: BlogNode }) {
  return <div className="blog-article-content text-lg leading-[1.85] text-charcoal/90 [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-3 [&>p:first-child]:first-letter:mt-1 [&>p:first-child]:first-letter:font-serif [&>p:first-child]:first-letter:text-6xl [&>p:first-child]:first-letter:leading-[0.85] [&>p:first-child]:first-letter:text-forest"><NodeView node={content} /></div>;
}
