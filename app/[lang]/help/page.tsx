import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { hub } from "@/lib/content/help";
import { docMetadata } from "@/lib/content/meta";
import InfoDoc from "@/components/InfoDoc";

export async function generateMetadata({ params }: PageProps<"/[lang]/help">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? docMetadata(lang, "/help", hub[lang]) : {};
}

export default async function HelpPage({ params }: PageProps<"/[lang]/help">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <InfoDoc lang={lang} doc={hub[lang]} />;
}
