import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/i18n";
import { paymentsMode } from "@/lib/payments";
import type { Locale } from "@/lib/config";
import { LAST_UPDATED, type Block, type Doc } from "@/lib/content/types";
import { buildTokens, type TokenMap } from "@/lib/content/tokens";
import PrintButton from "@/components/PrintButton";

const UI = {
  en: {
    toc: "On this page",
    updated: "Last updated",
    draft: "Draft. This page still needs the business's details and a solicitor's review before the site takes real payments.",
    languages:
      "This page is provided in English and Turkish. If the two differ, the English version prevails. Your legal rights as a consumer are never reduced by the translation.",
  },
  tr: {
    toc: "Bu sayfada",
    updated: "Son güncelleme",
    draft: "Taslak. Site gerçek ödeme almadan önce bu sayfanın işletme bilgileriyle tamamlanması ve bir avukat tarafından incelenmesi gerekir.",
    languages:
      "Bu sayfa İngilizce ve Türkçe olarak sunulur. İki metin arasında fark olursa İngilizce sürüm esas alınır. Tüketici olarak sahip olduğun yasal haklar çeviri nedeniyle hiçbir şekilde azalmaz.",
  },
} as const;

const BOLD = /\*\*([^*]+)\*\*/;

// Turns the inline syntax into React nodes. Unknown tokens throw.
export function inline(text: string, lang: Locale, tokens: TokenMap, key = "i"): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\{\{[^}]*\}\})/);
  return parts.map((part, i): ReactNode => {
    const k = `${key}-${i}`;
    if (!part) return null;
    if (part.startsWith("{{")) {
      const name = part.slice(2, -2).trim();
      const v = tokens[name];
      if (!v) throw new Error(`Unknown content token {{${name}}} in: ${text.slice(0, 80)}`);
      if (v.kind === "missing") {
        const label = lang === "tr" ? `[eklenecek: ${v.label}]` : `[to be added: ${v.label}]`;
        return (
          <span key={k} data-missing className="rounded bg-sand px-1.5 py-0.5 text-[0.9em] text-[#6f5527] ring-1 ring-brass/40 print:ring-0">
            {label}
          </span>
        );
      }
      if (v.kind === "email")
        return (
          <a key={k} href={`mailto:${v.text}`} className="underline underline-offset-4 hover:text-cobalt">
            {v.text}
          </a>
        );
      return <span key={k}>{v.text}</span>;
    }
    const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (m) {
      const [, label, href] = m;
      const cls = "text-cobalt underline underline-offset-4 hover:text-cobalt-deep";
      if (href.startsWith("/")) {
        const [path, hash] = href.split("#");
        return (
          <Link key={k} href={`/${lang}${path === "/" ? "" : path}${hash ? `#${hash}` : ""}`} className={cls}>
            {label}
          </Link>
        );
      }
      return (
        <a key={k} href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
          {label}
        </a>
      );
    }
    const b = BOLD.exec(part);
    if (b && part.startsWith("**")) return <strong key={k} className="font-medium text-ink">{b[1]}</strong>;
    return part;
  });
}

function BlockView({ b, lang, tokens, k }: { b: Block; lang: Locale; tokens: TokenMap; k: string }) {
  const I = (s: string, kk: string) => inline(s, lang, tokens, kk);
  switch (b.t) {
    case "p":
      return <p>{I(b.text, k)}</p>;
    case "h3":
      return <h3 className="mt-2 text-2xl">{I(b.text, k)}</h3>;
    case "ul":
      return (
        <ul className="grid list-disc gap-2 pl-6 marker:text-soft">
          {b.items.map((it, i) => <li key={i}>{I(it, `${k}-${i}`)}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="grid list-decimal gap-2 pl-6 marker:text-soft">
          {b.items.map((it, i) => <li key={i}>{I(it, `${k}-${i}`)}</li>)}
        </ol>
      );
    case "note":
      return (
        <div className="notice">
          {b.title && <p className="font-medium">{I(b.title, `${k}t`)}</p>}
          <p>{I(b.text, k)}</p>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label={b.caption ?? "Table"}>
          <table className="table min-w-[32rem] text-left">
            {b.caption && <caption className="sr-only">{b.caption}</caption>}
            <thead>
              <tr>{b.head.map((h, i) => <th key={i} scope="col" className="pl-3">{I(h, `${k}h${i}`)}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row" className="pl-3 font-medium !text-ink !whitespace-normal">{I(c, `${k}${ri}${ci}`)}</th>
                    ) : (
                      <td key={ci} className="pl-3">{I(c, `${k}${ri}${ci}`)}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "qa":
      return (
        <div className="grid gap-3">
          {b.items.map((it, i) => (
            <details key={i} className="panel group px-5 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                {I(it.q, `${k}q${i}`)}
              </summary>
              <p className="mt-3 text-soft">{I(it.a, `${k}a${i}`)}</p>
            </details>
          ))}
        </div>
      );
    case "form":
      return (
        <div className="rounded-2xl border border-ink/30 bg-paper p-6 print:break-inside-avoid print:border-black">
          <p className="font-display text-2xl">{I(b.title, `${k}t`)}</p>
          <p className="mt-2 text-soft print:text-black">{I(b.intro, `${k}i`)}</p>
          <dl className="mt-5 grid gap-5">
            {b.fields.map((f, i) => (
              <div key={i}>
                <dt className="text-[0.9375rem]">{I(f, `${k}f${i}`)}</dt>
                <dd className="mt-5 border-b border-ink/50" aria-hidden="true" />
              </div>
            ))}
          </dl>
          {b.outro && <p className="mt-5 text-sm text-soft print:text-black">{I(b.outro, `${k}o`)}</p>}
        </div>
      );
  }
}

export default async function InfoDoc({
  lang,
  doc,
  after,
  children,
}: {
  lang: Locale;
  doc: Doc;
  after?: ReactNode;
  children?: ReactNode;
}) {
  const tokens = await buildTokens(lang);
  const ui = UI[lang];
  const showToc = doc.sections.length >= 4;
  const I = (s: string, kk: string) => inline(s, lang, tokens, kk);

  return (
    <div className="wrap pt-5">
      <div className="rounded-3xl bg-sand px-8 py-10 md:px-12 md:py-14 print:bg-transparent print:px-0 print:py-4">
        <h1 className="text-5xl md:text-6xl">{doc.title}</h1>
        {doc.lead && <p className="mt-4 max-w-2xl text-lg text-soft">{I(doc.lead, "lead")}</p>}
        <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-soft">
          <span>
            {ui.updated}: <time dateTime="2026-11-12">{formatDate(LAST_UPDATED, lang)}</time>
          </span>
          {doc.print && <PrintButton>{doc.print}</PrintButton>}
        </p>
      </div>

      {doc.legal && paymentsMode() === "demo" && (
        <p className="notice mt-6 max-w-3xl" role="note" data-draft-notice>{ui.draft}</p>
      )}

      <div className={`mt-10 grid gap-10 ${showToc ? "lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16" : ""}`}>
        {showToc && (
          <nav aria-labelledby="toc-title" className="print:hidden lg:sticky lg:top-28 lg:self-start">
            <p id="toc-title" className="font-medium">{ui.toc}</p>
            <ol className="mt-3 grid gap-1.5 border-l border-line pl-4 text-[0.9375rem] text-soft">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="underline-offset-4 hover:text-ink hover:underline">{s.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="min-w-0 max-w-[42rem] text-[1.0625rem] leading-[1.7]">
          {doc.legal && <p className="mb-10 text-soft">{ui.languages}</p>}
          {children}
          {doc.sections.map((s, si) => (
            <section key={s.id} aria-labelledby={`h-${s.id}`} className="mt-12 first:mt-0 print:break-inside-avoid-page">
              <h2 id={s.id} className="scroll-mt-28 text-3xl md:text-[2.125rem]">
                <a href={`#${s.id}`} id={`h-${s.id}`} className="no-underline hover:underline underline-offset-4">{s.heading}</a>
              </h2>
              <div className="mt-5 grid gap-4">
                {s.blocks.map((b, bi) => (
                  <BlockView key={bi} b={b} lang={lang} tokens={tokens} k={`${si}-${bi}`} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>

      {after}
    </div>
  );
}
