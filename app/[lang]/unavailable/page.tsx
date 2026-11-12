import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";

export const metadata = { robots: { index: false } };

// Where a buyer lands when the item they were buying has been removed or its shop paused.
export default async function UnavailablePage({ params }: PageProps<"/[lang]/unavailable">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang).checkout;
  return (
    <div className="wrap max-w-2xl pt-16" data-unavailable>
      <h1 className="text-5xl">{t.goneTitle}</h1>
      <p className="notice mt-6" role="status">{t.goneBody}</p>
      <p className="mt-8 flex flex-wrap gap-3">
        <Link href={`/${lang}`} className="btn">{t.goneHome}</Link>
        <Link href={`/${lang}/search`} className="btn btn-ghost">{t.goneSearch}</Link>
      </p>
    </div>
  );
}
