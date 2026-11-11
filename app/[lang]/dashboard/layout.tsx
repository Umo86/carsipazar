import { notFound } from "next/navigation";
import { requireShop } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import PanelNav from "@/components/PanelNav";

export const metadata = { robots: { index: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const base = `/${lang}/dashboard`;

  return (
    <div className="wrap pt-10">
      <p className="text-sm text-soft">{t.dash.title}</p>
      <h1 className="mt-1 text-5xl">{shop.name}</h1>
      {shop.status === "pending" && <p className="notice mt-5">{t.dash.pending}</p>}
      {shop.status === "suspended" && <p className="notice notice-error mt-5">{t.dash.suspended}</p>}
      <PanelNav
        items={[
          { href: base, label: t.dash.overview },
          { href: `${base}/listings`, label: t.dash.listings },
          { href: `${base}/orders`, label: t.dash.orders },
          { href: `${base}/reviews`, label: t.dash.reviews },
          { href: `${base}/shop`, label: t.dash.shop },
        ]}
      />
      <div className="pt-8">{children}</div>
    </div>
  );
}
