import Link from "next/link";
import { CATEGORIES, SITE_NAME, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

export default function Footer({ lang, t }: { lang: Locale; t: Dict }) {
  const link = "transition-colors duration-200 hover:text-ink hover:underline underline-offset-4";
  return (
    <footer className="bg-mist">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl uppercase tracking-[-0.02em]" lang="en">{SITE_NAME}</p>
          <p className="mt-3 max-w-sm text-soft">{t.footer.line}</p>
          <p className="mt-4 text-soft">
            <Link href={`/${lang}/about`} className={link}>{t.footer.about}</Link>
          </p>
        </div>
        <div>
          <p className="font-medium">{t.footer.buyers}</p>
          <ul className="mt-3 grid gap-2 text-soft">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${lang}/c/${c.slug}`} className={link}>{c[lang]}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">{t.nav.shops}</p>
          <ul className="mt-3 grid gap-2 text-soft">
            <li><Link href={`/${lang}/shops`} className={link}>{t.footer.allShops}</Link></li>
            <li><Link href={`/${lang}/search`} className={link}>{t.listing.all}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{t.footer.sellers}</p>
          <ul className="mt-3 grid gap-2 text-soft">
            <li><Link href={`/${lang}/sell`} className={link}>{t.footer.openShop}</Link></li>
            <li><Link href={`/${lang}/dashboard`} className={link}>{t.nav.dashboard}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
