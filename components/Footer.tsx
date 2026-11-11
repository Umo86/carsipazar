import Link from "next/link";
import { CATEGORIES, SITE_NAME, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import { paymentsMode } from "@/lib/payments";

export default function Footer({ lang, t }: { lang: Locale; t: Dict }) {
  return (
    <footer className="bg-mist">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl uppercase tracking-[-0.02em]" lang="en">{SITE_NAME}</p>
          <p className="mt-3 max-w-sm text-soft">{t.footer.line}</p>
        </div>
        <div>
          <p className="font-medium">{t.footer.buyers}</p>
          <ul className="mt-3 grid gap-2 text-soft">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${lang}/c/${c.slug}`} className="hover:text-ink hover:underline underline-offset-4">
                  {c[lang]}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${lang}/shops`} className="hover:text-ink hover:underline underline-offset-4">
                {t.nav.shops}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{t.footer.sellers}</p>
          <ul className="mt-3 grid gap-2 text-soft">
            <li>
              <Link href={`/${lang}/sell`} className="hover:text-ink hover:underline underline-offset-4">
                {t.footer.openShop}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/dashboard`} className="hover:text-ink hover:underline underline-offset-4">
                {t.nav.dashboard}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {paymentsMode() === "demo" && (
        <p className="border-t border-line py-4 text-center text-sm text-soft">{t.footer.demo}</p>
      )}
    </footer>
  );
}
