import Link from "next/link";
import { CATEGORIES, SITE_NAME, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import type { User } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import LangSwitch from "./LangSwitch";
import Icon from "./Icon";

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
  const action =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9375rem] transition-colors duration-200 hover:bg-mist";
  const street =
    "relative py-3 transition-colors duration-200 hover:text-cobalt after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-cobalt after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <>
      <div className="bg-mist text-[0.8125rem]">
        <div className="wrap flex items-center justify-between gap-4 py-2">
          <p className="hidden text-soft sm:block">{t.nav.tagline}</p>
          <div className="ml-auto flex items-center gap-5">
            {!hasShop && (
              <Link href={`/${lang}/sell`} className="underline-offset-4 hover:text-cobalt hover:underline">
                {t.nav.sell}
              </Link>
            )}
            <LangSwitch lang={lang} label={t.nav.otherLang} />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2.5 py-3 lg:flex-nowrap lg:gap-x-10 lg:py-4">
          <Link
            href={`/${lang}`}
            className="font-display text-[1.7rem] leading-none tracking-[-0.02em] uppercase lg:text-[2.15rem]"
            aria-label={SITE_NAME}
            // The name is a brand word, not Turkish text: without this, Turkish
            // capitalisation would turn its "i" into a dotted "İ".
            lang="en"
          >
            {SITE_NAME}
          </Link>

          <form
            action={`/${lang}/search`}
            role="search"
            className="order-3 flex h-12 w-full items-center rounded-full bg-mist pr-1.5 pl-1.5 ring-cobalt transition-shadow duration-200 focus-within:ring-2 lg:order-none lg:max-w-2xl lg:flex-1"
          >
            <label className="hidden h-full items-center border-r border-line pr-1 sm:flex">
              <span className="sr-only">{t.search.category}</span>
              <select
                name="c"
                defaultValue=""
                className="h-9 cursor-pointer rounded-full bg-transparent pr-1 pl-3 text-[0.9375rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                <option value="">{t.search.allCategories}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c[lang]}</option>
                ))}
              </select>
            </label>
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t.search.label}</span>
              <input
                name="q"
                type="search"
                placeholder={t.search.placeholder}
                className="h-12 w-full bg-transparent px-4 text-[0.9375rem] placeholder:text-soft focus:outline-none"
              />
            </label>
            {/* No type attribute on purpose: it submits the search form by default. */}
            <button
              aria-label={t.search.submit}
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-paper transition-colors duration-200 hover:bg-cobalt"
            >
              <Icon name="search" size={18} />
            </button>
          </form>

          <nav aria-label={t.nav.account} className="ml-auto flex items-center">
            {user?.role === "admin" && (
              <Link href={`/${lang}/admin`} className={action}>{t.nav.admin}</Link>
            )}
            {hasShop && (
              <Link href={`/${lang}/dashboard`} className={action}>
                <Icon name="shop" />
                <span className="hidden md:inline">{t.nav.dashboard}</span>
                <span className="sr-only md:hidden">{t.nav.dashboard}</span>
              </Link>
            )}
            {user ? (
              <>
                <Link href={`/${lang}/orders`} className={action}>
                  <Icon name="bag" />
                  <span className="hidden md:inline">{t.nav.orders}</span>
                  <span className="sr-only md:hidden">{t.nav.orders}</span>
                </Link>
                <form action={logout}>
                  <input type="hidden" name="lang" value={lang} />
                  <button className={`${action} cursor-pointer text-soft`}>{t.nav.logout}</button>
                </form>
              </>
            ) : (
              <Link href={`/${lang}/login`} className={action}>
                <Icon name="user" />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <nav aria-label={t.home.streets} className="border-b border-line">
        <div className="wrap no-scrollbar flex gap-x-8 overflow-x-auto text-[0.9375rem] font-medium whitespace-nowrap">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${lang}/c/${c.slug}`} className={street}>
              {c[lang]}
            </Link>
          ))}
          <Link href={`/${lang}/search`} className={street}>{t.listing.all}</Link>
          <Link href={`/${lang}/shops`} className={street}>{t.nav.shops}</Link>
          <Link href={`/${lang}/search?i=1`} className={`${street} md:ml-auto`}>{t.nav.instalments}</Link>
        </div>
      </nav>
    </>
  );
}
