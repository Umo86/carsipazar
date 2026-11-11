import Link from "next/link";
import { CATEGORIES, SITE_NAME, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import type { User } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import LangSwitch from "./LangSwitch";

export default function Header({
  lang,
  t,
  user,
  hasShop,
}: {
  lang: Locale;
  t: Dict;
  user: User | null;
  hasShop: boolean;
}) {
  const link = "hover:text-cobalt underline-offset-4 hover:underline";
  return (
    <header className="border-b border-line">
      <div className="wrap grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-4 pb-3 text-sm">
        <div>
          <LangSwitch lang={lang} label={t.nav.otherLang} />
        </div>
        <Link
          href={`/${lang}`}
          className="font-display text-[1.7rem] leading-none tracking-[-0.02em] uppercase sm:text-4xl md:text-5xl"
          aria-label={SITE_NAME}
          // The name is a brand word, not Turkish text: without this, Turkish
          // capitalisation would turn its "i" into a dotted "İ".
          lang="en"
        >
          {SITE_NAME}
        </Link>
        <nav className="flex items-center justify-end gap-x-4 gap-y-1 flex-wrap">
          {user?.role === "admin" && (
            <Link href={`/${lang}/admin`} className={link}>{t.nav.admin}</Link>
          )}
          {hasShop ? (
            <Link href={`/${lang}/dashboard`} className={link}>{t.nav.dashboard}</Link>
          ) : (
            <Link href={`/${lang}/sell`} className={`${link} hidden sm:inline`}>{t.nav.sell}</Link>
          )}
          {user ? (
            <>
              <Link href={`/${lang}/orders`} className={link}>{t.nav.orders}</Link>
              <form action={logout}>
                <input type="hidden" name="lang" value={lang} />
                <button className={`${link} cursor-pointer text-soft`}>{t.nav.logout}</button>
              </form>
            </>
          ) : (
            <Link href={`/${lang}/login`} className={link}>{t.nav.login}</Link>
          )}
        </nav>
      </div>
      <nav
        aria-label={t.home.streets}
        className="wrap flex gap-x-7 gap-y-1 overflow-x-auto pb-3 text-[0.95rem] whitespace-nowrap md:justify-center"
      >
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/${lang}/c/${c.slug}`} className={link}>
            {c[lang]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
