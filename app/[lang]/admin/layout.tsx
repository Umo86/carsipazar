import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { navCounts } from "@/lib/admin-queries";
import { getDict } from "@/lib/i18n";
import PanelShell from "@/components/PanelShell";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  await requireAdmin(lang);
  const counts = await navCounts();
  const base = `/${lang}/admin`;
  const n = t.panel.nav;
  return (
    <PanelShell
      title={t.panel.adminName}
      subtitle={t.panel.adminSub}
      groups={[
        { label: t.panel.groups.overview, items: [{ href: base, label: n.overview, icon: "home" }] },
        {
          label: t.panel.groups.people,
          items: [
            { href: `${base}/customers`, label: n.users, icon: "users" },
            { href: `${base}/sellers`, label: n.sellers, icon: "shop", badge: counts.shops },
          ],
        },
        {
          label: t.panel.groups.catalogue,
          items: [
            { href: `${base}/listings`, label: n.items, icon: "box" },
            { href: `${base}/reviews`, label: n.reviews, icon: "star" },
            { href: `${base}/reports`, label: n.reports, icon: "flag", badge: counts.reports },
          ],
        },
        {
          label: t.panel.groups.money,
          items: [
            { href: `${base}/orders`, label: n.orders, icon: "receipt" },
            { href: `${base}/payouts`, label: n.payouts, icon: "wallet" },
            { href: `${base}/promotions`, label: n.promotions, icon: "tag" },
          ],
        },
        {
          label: t.panel.groups.site,
          items: [
            { href: `${base}/social`, label: n.social, icon: "share" },
            { href: `${base}/site`, label: n.siteDetails, icon: "building" },
            { href: `${base}/settings`, label: n.settings, icon: "sliders" },
            { href: `${base}/activity`, label: n.activity, icon: "clock" },
          ],
        },
      ]}
    >
      {children}
    </PanelShell>
  );
}
