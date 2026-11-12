// A small content model for pages made of text: help, legal, pricing.
// Text lives in content files as { en, tr } pairs; one renderer
// (components/InfoDoc.tsx) draws them all.
//
// Inline syntax inside any text string:
//   [label](/legal/terms)   a link; a path starting with "/" gets the language added
//   **bold**
//   {{token}}               filled from the site details and settings (see tokens.ts).
//                           An unknown token throws, so a typo never reaches a reader.

export type Bi<T> = { en: T; tr: T };

export type Block =
  | { t: "p"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; text: string; title?: string }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "qa"; items: { q: string; a: string }[] }
  | { t: "form"; title: string; intro: string; fields: string[]; outro?: string };

export type Section = { id: string; heading: string; blocks: Block[] };

export type Doc = {
  title: string;
  description: string; // meta description
  lead?: string;
  sections: Section[];
  // A legal page: shows the draft notice while payments are in demo mode and
  // the line about English and Turkish.
  legal?: boolean;
  // Offer a Print button (used on the returns page for the cancellation form).
  print?: string;
};

export const LAST_UPDATED = new Date("2026-11-12T12:00:00Z");

export const STATUS = ["REQUIRED", "EXPECTED", "OPTIONAL"] as const;
export type PageStatus = (typeof STATUS)[number];
