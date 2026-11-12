import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { getSiteDetails, SITE_DETAIL_KEYS, SITE_DETAIL_MAX } from "@/lib/site-details";
import SiteDetailsForm from "@/components/SiteDetailsForm";

export default async function AdminSite({ params }: PageProps<"/[lang]/admin/site">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const d = await getSiteDetails();
  const x = t.adminx.si;
  const isEmail = (k: string) => k === "email" || k === "complaints_email";

  return (
    <div className="max-w-2xl">
      <p className="rounded-3xl bg-sky p-6 text-[0.9375rem]">{x.intro}</p>
      <SiteDetailsForm
        lang={lang}
        fields={SITE_DETAIL_KEYS.map((k) => ({ key: k, label: x.f[k].label, hint: x.f[k].hint, email: isEmail(k) }))}
        initial={d}
        max={SITE_DETAIL_MAX}
        errEmail={x.errEmail}
        errLong={x.errLong}
        saved={x.saved}
        save={t.admin.save}
      />
    </div>
  );
}
