import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, type Locale, type Settings } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/lib/actions/admin";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminSettings({ params, searchParams }: PageProps<"/[lang]/admin/settings">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  await requireAdmin(lang);
  const sp = await searchParams;
  const s = await getSettings();

  // Stored as basis points and pence; shown as percent and pounds. Keys ending in
  // _price include the delivery prices and delivery_max_item_price.
  const shown = (key: keyof Settings) => {
    if (key.endsWith("_bps")) return s[key] / 100;
    if (key === "instalments_min" || key === "instalments_max" || key.endsWith("_price")) return s[key] / 100;
    return s[key];
  };

  // The same fields as ever, in the same form; only the headings are new.
  const keys = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];
  const g = t.adminx.st;
  const groups: { id: string; title: string; keys: (keyof Settings)[] }[] = [
    { id: "commission", title: g.commission, keys: keys.filter((k) => k.endsWith("_bps") || k.endsWith("_fixed")) },
    { id: "limits", title: g.limits, keys: keys.filter((k) => k.startsWith("instalments_")) },
    { id: "promotions", title: g.promotions, keys: keys.filter((k) => k.startsWith("promo_")) },
    { id: "delivery", title: g.delivery, keys: keys.filter((k) => k.startsWith("delivery_")) },
    { id: "payouts", title: g.payouts, keys: keys.filter((k) => k === "release_days") },
  ];

  return (
    <form action={saveSettings} className="grid max-w-xl gap-10">
      <input type="hidden" name="lang" value={lang} />
      {sp.saved && <p className="notice" role="status">{t.admin.saved}</p>}
      {groups.map((grp) => (
        <section key={grp.id} aria-labelledby={`set-${grp.id}`} className="grid gap-5">
          <h2 id={`set-${grp.id}`} className="border-b border-line pb-2 text-3xl">{grp.title}</h2>
          {grp.keys.map((key) => (
            <div key={key} className="grid gap-5">
              {key === "delivery_small_price" && <p className="hint">{t.admin.deliveryNote}</p>}
              <label className="field">
                <span>{t.admin.set[key]}</span>
                <input className="input max-w-40" name={key} inputMode="decimal" defaultValue={shown(key)} required />
              </label>
            </div>
          ))}
        </section>
      ))}
      <div><SubmitButton>{t.admin.save}</SubmitButton></div>
    </form>
  );
}
