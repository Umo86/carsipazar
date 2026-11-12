import { requireShop } from "@/lib/auth";
import { PROMO_KINDS, PROMO_MAX_WEEKS, type Locale, type PromoKind } from "@/lib/config";
import { fmt, formatDate, getDict, pick } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { paymentsMode } from "@/lib/payments";
import { lastBookableIso, promotionsByShop, spotlightTaken, todayIso } from "@/lib/promotions";
import { listingsByShop } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { bookPromo, cancelPromo } from "@/lib/actions/promo";
import SubmitButton from "@/components/SubmitButton";

const day = (isoDate: string, lang: Locale) => formatDate(new Date(`${isoDate}T12:00:00Z`), lang);

export default async function PromotePage({ params, searchParams }: PageProps<"/[lang]/dashboard/promote">) {
  const lang = (await params).lang as Locale;
  const t = getDict(lang);
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  const [items, mine, settings, taken] = await Promise.all([
    listingsByShop(shop.id),
    promotionsByShop(shop.id),
    getSettings(),
    spotlightTaken(),
  ]);
  const kinds = Object.keys(PROMO_KINDS) as PromoKind[];
  const error = typeof sp.error === "string" ? (t.promo.err[sp.error as keyof typeof t.promo.err] ?? t.promo.err.fields) : null;
  const canBook = shop.status === "approved" && items.length > 0;
  const radio =
    "flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-5 transition-colors duration-200 has-[:checked]:border-cobalt has-[:checked]:bg-sky";

  return (
    <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
      <section>
        <h2 className="text-3xl">{t.promo.title}</h2>
        <p className="mt-2 max-w-xl text-soft">{t.promo.intro}</p>
        {sp.booked && <p className="notice mt-5" role="status">{t.promo.booked}</p>}
        {sp.cancelled && <p className="notice mt-5" role="status">{t.promo.cancelledNote}</p>}
        {error && <p className="notice notice-error mt-5" role="alert">{error}</p>}
        {paymentsMode() === "demo" && <p className="hint mt-4">{t.promo.demo}</p>}

        {!canBook ? (
          <p className="notice mt-6">{shop.status === "approved" ? t.promo.needItem : t.promo.needApproval}</p>
        ) : (
          <form action={bookPromo} className="mt-6 grid gap-6">
            <input type="hidden" name="lang" value={lang} />
            <fieldset className="grid gap-3">
              <legend className="label mb-2">{t.promo.choose}</legend>
              {kinds.map((k, i) => (
                <label key={k} className={radio}>
                  <input type="radio" name="kind" value={k} defaultChecked={i === 0} className="mt-1.5" />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-medium">{t.promo.kind[k]}</span>
                      <span className="font-medium whitespace-nowrap">
                        {fmt(t.promo.perWeek, { amount: formatGBP(settings[PROMO_KINDS[k].priceKey]) })}
                      </span>
                    </span>
                    <span className="hint block">{t.promo.where[k]}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="field">
              <span>{t.promo.item}</span>
              <select name="listing" className="input" required>
                {items.map((l) => (
                  <option key={l.id} value={l.id}>
                    {pick(lang, l.title_tr, l.title_en).text} ({formatGBP(l.price_pence)})
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="field">
                <span>{t.promo.start}</span>
                <input
                  className="input"
                  type="date"
                  name="starts_on"
                  defaultValue={todayIso()}
                  min={todayIso()}
                  max={lastBookableIso()}
                  required
                />
              </label>
              <label className="field">
                <span>{t.promo.weeks}</span>
                <select name="weeks" className="input" defaultValue="1">
                  {Array.from({ length: PROMO_MAX_WEEKS }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </label>
            </div>
            {taken.length > 0 && (
              <p className="hint">
                {t.promo.takenDates}{" "}
                {taken.map((r) => `${day(r.starts_on, lang)} – ${day(r.ends_on, lang)}`).join("; ")}
              </p>
            )}
            <div>
              <SubmitButton>{t.promo.submit}</SubmitButton>
              <p className="hint mt-3">{t.promo.terms}</p>
            </div>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-3xl">{t.promo.mine}</h2>
        {mine.length === 0 ? (
          <p className="mt-4 text-soft">{t.promo.none}</p>
        ) : (
          <ul className="mt-5 grid gap-4">
            {mine.map((p) => (
              <li key={p.id} className="panel p-5" data-promo={p.kind} data-phase={p.phase}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-medium">{t.promo.kind[p.kind]}</p>
                  <span className={`tag ${p.phase === "live" ? "bg-sky text-cobalt" : ""}`}>{t.promo.phase[p.phase]}</span>
                </div>
                <p className="mt-1">{pick(lang, p.title_tr, p.title_en).text}</p>
                <p className="mt-1 text-sm text-soft">
                  {day(p.starts_on, lang)} – {day(p.ends_on, lang)} · {formatGBP(p.price_pence)}
                </p>
                {p.phase === "upcoming" && (
                  <form action={cancelPromo} className="mt-3">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn btn-ghost btn-sm">{t.promo.cancel}</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
