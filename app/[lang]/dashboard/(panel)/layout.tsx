import { notFound } from "next/navigation";
import { requireShop } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { sellerOrdersToAct } from "@/lib/panel-queries";
import { sellerNavCounts } from "@/lib/actions/navcounts";
import PanelShell from "@/components/PanelShell";

export const metadata = { robots: { index: false } };

export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const base = `/${lang}/dashboard`;
  const toAct = await sellerOrdersToAct(shop.id);
  const g = t.sellerx.groups;

  return (
    <PanelShell
      refreshBadges={sellerNavCounts}
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
        { label: g.overview, items: [{ href: base, label: t.dash.overview, icon: "home" }] },
        {
          label: g.selling,
          items: [
            { href: `${base}/listings`, label: t.dash.listings, icon: "box" },
            { href: `${base}/orders`, label: t.dash.orders, icon: "receipt", badge: toAct, badgeKey: "orders" },
            { href: `${base}/reviews`, label: t.dash.reviews, icon: "star" },
          ],
        },
        { label: g.money, items: [{ href: `${base}/payouts`, label: t.sellerx.nav.payouts, icon: "wallet" }] },
        {
          label: g.grow,
          items: [
            { href: `${base}/promote`, label: t.promo.tab, icon: "tag" },
            { href: `${base}/social`, label: t.social.tab, icon: "share" },
          ],
        },
        { label: g.shop, items: [{ href: `${base}/shop`, label: t.dash.shop, icon: "shop" }] },
      ]}
    >
      {children}
    </PanelShell>
  );
}
