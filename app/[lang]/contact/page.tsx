import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { contact } from "@/lib/content/help";
import { docMetadata } from "@/lib/content/meta";
import InfoDoc from "@/components/InfoDoc";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? docMetadata(lang, "/contact", contact[lang]) : {};
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <InfoDoc lang={lang} doc={contact[lang]} />;
}
