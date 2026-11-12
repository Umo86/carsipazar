import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { pricingCta, pricingDoc } from "@/lib/content/pricing";
import { docMetadata } from "@/lib/content/meta";
import InfoDoc from "@/components/InfoDoc";

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return docMetadata(lang, "/pricing", pricingDoc(lang, await getSettings()));
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const cta = pricingCta[lang];
  return (
    <InfoDoc
      lang={lang}
      doc={pricingDoc(lang, await getSettings())}
      after={
        <section className="mt-16 grid items-center gap-6 rounded-3xl bg-cobalt-deep px-8 py-10 text-paper md:grid-cols-[3fr_2fr] md:px-12 print:hidden">
          <div>
            <h2 className="text-3xl md:text-4xl">{cta.title}</h2>
            <p className="mt-3 max-w-xl text-paper/80">{cta.body}</p>
          </div>
          <div className="md:justify-self-end">
            <Link href={`/${lang}/sell`} className="btn btn-light">{t.home.sellCta}</Link>
          </div>
        </section>
      }
    />
  );
}
