import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, SITE_NAME } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { getMyShop, getUser } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLocale(lang) ? lang : "tr");
  return {
    title: { default: `${SITE_NAME}: ${t.home.coverLine}`, template: `%s | ${SITE_NAME}` },
    description: t.home.coverSub,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const user = await getUser();
  const shop = user ? await getMyShop(user.id) : null;

  return (
    // lang="tr" matters: it makes browsers capitalise i/ı and İ/I correctly.
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        >
          {t.nav.skipToContent}
        </a>
        <Header lang={lang} t={t} user={user} hasShop={Boolean(shop)} />
        <main id="main" tabIndex={-1} className="flex-1 pb-24 focus:outline-none">{children}</main>
        <Footer lang={lang} t={t} />
      </body>
    </html>
  );
}
