import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyShop, getUser } from "@/lib/auth";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import PanelShell from "@/components/PanelShell";

export const metadata = { robots: { index: false } };

// "My account": the buyer's side, for everyone who is logged in (buyers, sellers and admins
// all buy). Each page asks for the login itself, with its own address as `next`; a visitor
// who is not logged in gets the bare page, which redirects before anything is shown.
export default async function MyLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await getUser();
  if (!user) return <>{children}</>;
  const t = getDict(lang);
  const shop = await getMyShop(user.id);
  const base = `/${lang}`;
  const n = t.my.nav;
  const link = "text-sm underline underline-offset-4 hover:text-cobalt";

  return (
    <PanelShell
      title={t.account.title}
      subtitle={user.name}
      notice={
        shop || user.role === "admin" ? (
          <p className="mb-6 flex flex-wrap gap-x-6 gap-y-2" data-role-links>
            {shop && <Link href={`${base}/dashboard`} className={link}>{t.my.sellerLink}</Link>}
            {user.role === "admin" && <Link href={`${base}/admin`} className={link}>{t.my.adminLink}</Link>}
          </p>
        ) : null
      }
      groups={[
        {
          items: [
            { href: `${base}/account`, label: n.overview, icon: "home" },
            { href: `${base}/orders`, label: n.orders, icon: "receipt" },
            { href: `${base}/favourites`, label: n.favourites, icon: "heart" },
            { href: `${base}/account/reviews`, label: n.reviews, icon: "star" },
            { href: `${base}/account#details`, label: n.details, icon: "user" },
          ],
        },
      ]}
    >
      {children}
    </PanelShell>
  );
}
