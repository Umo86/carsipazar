import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/config";
import { LEGAL_PAGES } from "@/lib/content/legal";
import { docMetadata } from "@/lib/content/meta";
import type { Doc } from "@/lib/content/types";
import InfoDoc from "@/components/InfoDoc";

const indexDoc = (lang: Locale): Doc => ({
  title: lang === "tr" ? "Yasal bilgiler" : "Legal information",
  description:
    lang === "tr"
      ? "CarsiPazar'ın koşulları, gizlilik bildirimi, çerezler, şikâyetler ve diğer yasal sayfaları."
      : "CarsiPazar's terms, privacy notice, cookies, complaints and other legal pages.",
  lead:
    lang === "tr"
      ? "Koşullarımız ve politikalarımız bir arada. Her sayfa sade bir dille yazıldı."
      : "Our terms and policies in one place, written in plain language.",
  legal: true,
  sections: [
    {
      id: "pages",
      heading: lang === "tr" ? "Tüm sayfalar" : "All pages",
      blocks: [
        {
          t: "ul",
          items: [
            ...LEGAL_PAGES.map((p) => `[${p.doc[lang].title}](/legal/${p.slug}): ${p.blurb[lang]}`),
            lang === "tr"
              ? "[İade, geri ödeme ve cayma](/help/returns): iade koşullarımız ve cayma formu."
              : "[Returns, refunds and cancellation](/help/returns): our returns policy and the cancellation form.",
          ],
        },
      ],
    },
  ],
});

export async function generateMetadata({ params }: PageProps<"/[lang]/legal">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? docMetadata(lang, "/legal", indexDoc(lang)) : {};
}

export default async function LegalIndexPage({ params }: PageProps<"/[lang]/legal">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <InfoDoc lang={lang} doc={indexDoc(lang)} />;
}
