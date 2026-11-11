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
        <Header lang={lang} t={t} user={user} hasShop={Boolean(shop)} />
        <main className="flex-1 pb-24">{children}</main>
        <Footer lang={lang} t={t} />
      </body>
    </html>
  );
}
