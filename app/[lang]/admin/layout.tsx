import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import PanelNav from "@/components/PanelNav";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  await requireAdmin(lang);
  const base = `/${lang}/admin`;
  return (
    <div className="wrap pt-10">
      <h1 className="text-5xl">{t.admin.title}</h1>
      <PanelNav
        items={[
          { href: base, label: t.admin.overview },
          { href: `${base}/sellers`, label: t.admin.sellers },
          { href: `${base}/listings`, label: t.admin.listings },
          { href: `${base}/orders`, label: t.admin.orders },
          { href: `${base}/reviews`, label: t.admin.reviews },
          { href: `${base}/promotions`, label: t.promo.adminTab },
          { href: `${base}/customers`, label: t.account.customers },
          { href: `${base}/settings`, label: t.admin.settings },
        ]}
      />
      <div className="pt-8">{children}</div>
    </div>
  );
}
