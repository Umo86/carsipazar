import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { HELP_PAGES } from "@/lib/content/help";
import { docMetadata } from "@/lib/content/meta";
import InfoDoc from "@/components/InfoDoc";

const find = (slug: string) => (Object.hasOwn(HELP_PAGES, slug) ? HELP_PAGES[slug] : null);

export async function generateMetadata({ params }: PageProps<"/[lang]/help/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = find(slug);
  return isLocale(lang) && page ? docMetadata(lang, `/help/${slug}`, page[lang]) : {};
}

export default async function HelpDocPage({ params }: PageProps<"/[lang]/help/[slug]">) {
  const { lang, slug } = await params;
  const page = find(slug);
  if (!isLocale(lang) || !page) notFound();
  return <InfoDoc lang={lang} doc={page[lang]} />;
}
