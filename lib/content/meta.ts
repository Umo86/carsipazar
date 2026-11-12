import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/lib/config";
import type { Doc } from "./types";

// Title, description and the en/tr alternates for one page. `path` has no language, e.g. "/legal/terms".
export function docMetadata(lang: Locale, path: string, doc: Pick<Doc, "title" | "description">): Metadata {
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
    },
  };
}
