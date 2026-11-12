import "server-only";
import { cache } from "react";
import { q, tx } from "./db";

// The operator's legal identity. UK law requires a trading website to show
// most of these; they are never invented. A page that needs one that is still
// empty shows a clear "to be added" marker instead.
export const SITE_DETAIL_KEYS = [
  "legal_name", // registered company name, or the sole trader's own name
  "legal_form", // e.g. "Private limited company registered in England and Wales"
  "company_no", // Companies House number, if a company
  "registered_address", // registered office (company) or business address
  "contact_address", // geographic address customers can write to, if different
  "email", // customer contact email
  "phone", // optional
  "vat_no", // only if VAT registered
  "ico_no", // ICO data protection registration number
  "complaints_email", // optional; falls back to email
] as const;

export type SiteDetailKey = (typeof SITE_DETAIL_KEYS)[number];
export type SiteDetails = Record<SiteDetailKey, string>;

export const SITE_DETAIL_MAX = 300;

export const getSiteDetails = cache(async (): Promise<SiteDetails> => {
  const out = Object.fromEntries(SITE_DETAIL_KEYS.map((k) => [k, ""])) as SiteDetails;
  const rows = await q<{ key: string; value: string }>("select key, value from site_details");
  for (const r of rows) {
    if ((SITE_DETAIL_KEYS as readonly string[]).includes(r.key)) out[r.key as SiteDetailKey] = r.value;
  }
  return out;
});

// Saves the given details; an empty value removes the row.
export async function saveSiteDetails(entries: [SiteDetailKey, string][]) {
  await tx(async (c) => {
    for (const [key, raw] of entries) {
      const value = raw.trim().slice(0, SITE_DETAIL_MAX);
      if (value === "") await c.query("delete from site_details where key = $1", [key]);
      else
        await c.query(
          `insert into site_details (key, value) values ($1, $2)
           on conflict (key) do update set value = excluded.value`,
          [key, value],
        );
    }
  });
}
