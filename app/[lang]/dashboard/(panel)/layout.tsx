import { notFound } from "next/navigation";
import { requireShop } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import PanelShell from "@/components/PanelShell";

export const metadata = { robots: { index: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const base = `/${lang}/dashboard`;

  return (
    <PanelShell
      title={shop.name}
      subtitle={t.dash.title}
      notice={
        shop.status === "pending" ? (
          <p className="notice mb-6">{t.dash.pending}</p>
        ) : shop.status === "suspended" ? (
          <p className="notice notice-error mb-6">{t.dash.suspended}</p>
        ) : null
      }
      groups={[
        {
          items: [
            { href: base, label: t.dash.overview, icon: "home" },
            { href: `${base}/listings`, label: t.dash.listings, icon: "box" },
            { href: `${base}/orders`, label: t.dash.orders, icon: "receipt" },
            { href: `${base}/reviews`, label: t.dash.reviews, icon: "star" },
            { href: `${base}/promote`, label: t.promo.tab, icon: "tag" },
            { href: `${base}/social`, label: t.social.tab, icon: "share" },
            { href: `${base}/shop`, label: t.dash.shop, icon: "shop" },
          ],
        },
      ]}
    >
      {children}
    </PanelShell>
  );
}
