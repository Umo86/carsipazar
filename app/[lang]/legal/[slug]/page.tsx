import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { findLegal } from "@/lib/content/legal";
import { docMetadata } from "@/lib/content/meta";
import InfoDoc from "@/components/InfoDoc";

export async function generateMetadata({ params }: PageProps<"/[lang]/legal/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = findLegal(slug);
  return isLocale(lang) && page ? docMetadata(lang, `/legal/${slug}`, page.doc[lang]) : {};
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[slug]">) {
  const { lang, slug } = await params;
  const page = findLegal(slug);
  if (!isLocale(lang) || !page) notFound();
  return <InfoDoc lang={lang} doc={page.doc[lang]} />;
}
