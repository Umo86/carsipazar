import Link from "next/link";
import { CATEGORIES, SITE_NAME, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import { footerText } from "@/lib/content/footer";
import { getSiteDetails } from "@/lib/site-details";

export default async function Footer({ lang, t }: { lang: Locale; t: Dict }) {
  const f = footerText[lang];
  const d = await getSiteDetails();
  const link = "transition-colors duration-200 hover:text-ink hover:underline underline-offset-4";
  const heading = "font-medium";
  const list = "mt-3 grid gap-2 text-soft";
  const fine = [
    d.company_no && `${f.companyNo} ${d.company_no}`,
    d.registered_address && `${f.registeredOffice}: ${d.registered_address}`,
  ].filter(Boolean);

  return (
    <footer className="bg-mist print:hidden">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl uppercase tracking-[-0.02em]" lang="en">{SITE_NAME}</p>
          <p className="mt-3 max-w-sm text-soft">{t.footer.line}</p>
          <p className="mt-4 text-soft">
            <Link href={`/${lang}/about`} className={link}>{t.footer.about}</Link>
          </p>
        </div>
        <nav aria-labelledby="footer-shop">
          <p id="footer-shop" className={heading}>{f.shop}</p>
          <ul className={list}>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${lang}/c/${c.slug}`} className={link}>{c[lang]}</Link>
              </li>
            ))}
            <li><Link href={`/${lang}/search`} className={link}>{t.listing.all}</Link></li>
            <li><Link href={`/${lang}/shops`} className={link}>{t.footer.allShops}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-help">
          <p id="footer-help" className={heading}>{f.help}</p>
          <ul className={list}>
            <li><Link href={`/${lang}/help`} className={link}>{f.helpCentre}</Link></li>
            <li><Link href={`/${lang}/help/delivery`} className={link}>{f.delivery}</Link></li>
            <li><Link href={`/${lang}/help/returns`} className={link}>{f.returns}</Link></li>
            <li><Link href={`/${lang}/contact`} className={link}>{f.contact}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-selling">
          <p id="footer-selling" className={heading}>{f.selling}</p>
          <ul className={list}>
            <li><Link href={`/${lang}/sell`} className={link}>{t.footer.openShop}</Link></li>
            <li><Link href={`/${lang}/pricing`} className={link}>{f.pricing}</Link></li>
            <li><Link href={`/${lang}/help/selling`} className={link}>{f.sellerGuide}</Link></li>
            <li><Link href={`/${lang}/dashboard`} className={link}>{t.nav.dashboard}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-legal">
          <p id="footer-legal" className={heading}>{f.legal}</p>
          <ul className={list}>
            <li><Link href={`/${lang}/legal/terms`} className={link}>{f.terms}</Link></li>
            <li><Link href={`/${lang}/legal/seller-terms`} className={link}>{f.sellerTerms}</Link></li>
            <li><Link href={`/${lang}/legal/privacy`} className={link}>{f.privacy}</Link></li>
            <li><Link href={`/${lang}/legal/cookies`} className={link}>{f.cookies}</Link></li>
            <li><Link href={`/${lang}/legal`} className={link}>{f.allLegal}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-1 py-5 text-sm text-soft sm:flex-row sm:flex-wrap sm:gap-x-6">
          <p>© 2026{d.legal_name ? ` ${d.legal_name}` : ""}</p>
          {fine.length > 0 && <p>{fine.join(" · ")}</p>}
        </div>
      </div>
    </footer>
  );
}
