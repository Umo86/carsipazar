import { notFound } from "next/navigation";
import { requireShop } from "@/lib/auth";
import { CATEGORIES, deliveryPrice, MAX_IMAGES, PARCEL_SIZE_KEYS, type Locale } from "@/lib/config";
import { fmt, getDict, parcelLimits } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";
import { getListing, listingImageIds } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { saveListing } from "@/lib/actions/shop";
import PhotoInput from "@/components/PhotoInput";
import SubmitButton from "@/components/SubmitButton";

// One form for both adding (/listings/new) and editing (/listings/<id>).
export default async function ListingForm({ params, searchParams }: PageProps<"/[lang]/dashboard/listings/[id]">) {
  const { lang: rawLang, id } = await params;
  const lang = rawLang as Locale;
  const t = getDict(lang);
  const f = t.dash.f;
  const { shop } = await requireShop(lang);
  const sp = await searchParams;
  const s = await getSettings();

  const isNew = id === "new";
  const l = isNew ? null : await getListing(id);
  if (!isNew && (!l || l.shop_id !== shop.id || l.status === "removed")) notFound();
  const images = l ? await listingImageIds(l.id) : [];
  const pounds = (p: number) => (p / 100).toFixed(2).replace(/\.00$/, "");
  const platform = l?.delivery_method === "platform";
  const collection = l?.collection ?? "no";
  const box = "rounded-md border border-[#b9b4a8] p-4";

  return (
    <form action={saveListing} className="grid max-w-3xl gap-6">
      <input type="hidden" name="lang" value={lang} />
      {l && <input type="hidden" name="id" value={l.id} />}
      <h2 className="text-4xl">{isNew ? t.dash.newListing : t.dash.editListing}</h2>
      {sp.error && (
        <p className="notice notice-error" role="alert">
          {sp.error === "parcel"
            ? f.errParcel
            : sp.error === "limit"
              ? fmt(f.errLimit, { max: formatGBP(s.delivery_max_item_price) })
              : f.errFields}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field">
          <span>{f.titleTr}</span>
          <input className="input" name="title_tr" maxLength={120} defaultValue={l?.title_tr} lang="tr" />
        </label>
        <label className="field">
          <span>{f.titleEn}</span>
          <input className="input" name="title_en" maxLength={120} defaultValue={l?.title_en} lang="en" />
        </label>
        <label className="field">
          <span>{f.descTr}</span>
          <textarea className="input" name="description_tr" defaultValue={l?.description_tr} lang="tr" />
        </label>
        <label className="field">
          <span>{f.descEn}</span>
          <textarea className="input" name="description_en" defaultValue={l?.description_en} lang="en" />
        </label>
      </div>
      <p className="hint -mt-3">{f.langHint}</p>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="field sm:col-span-1">
          <span>{f.category}</span>
          <select className="input" name="category" defaultValue={l?.category ?? CATEGORIES[0].slug}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c[lang]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{f.price}</span>
          <input className="input" name="price" inputMode="decimal" required defaultValue={l ? pounds(l.price_pence) : ""} />
        </label>
        <label className="field">
          <span>{f.stock}</span>
          <input className="input" name="stock" type="number" min={0} max={9999} defaultValue={l?.stock ?? 1} />
        </label>
      </div>

      {/* Both groups are always visible so the form works without JavaScript; the chosen radio decides. */}
      <fieldset className="grid gap-3">
        <legend className="label mb-2">{f.delivery}</legend>
        <div className={`${box} has-[input[value=seller]:checked]:border-cobalt has-[input[value=seller]:checked]:bg-mist`}>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" name="delivery_method" value="seller" defaultChecked={!platform} className="mt-1.5" />
            <span>
              <span className="block font-medium">{f.sellerOption}</span>
              <span className="hint">{f.sellerOptionHint}</span>
            </span>
          </label>
          <label className="field mt-4 max-w-40">
            <span>{f.postage}</span>
            <input className="input" name="postage" inputMode="decimal" defaultValue={l && !platform ? pounds(l.postage_pence) : "0"} />
          </label>
          <p className="hint mt-2">{f.postageHint}</p>
        </div>

        <div className={`${box} has-[input[value=platform]:checked]:border-cobalt has-[input[value=platform]:checked]:bg-mist`}>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" name="delivery_method" value="platform" defaultChecked={platform} className="mt-1.5" />
            <span>
              <span className="block font-medium">{f.platformOption}</span>
              <span className="hint">{f.platformHint}</span>
            </span>
          </label>
          {s.delivery_max_item_price > 0 && (
            <p className="hint mt-2">{fmt(f.maxItem, { amount: formatGBP(s.delivery_max_item_price) })}</p>
          )}
          <div className="mt-4 grid gap-2">
            {PARCEL_SIZE_KEYS.map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper p-3 has-[:checked]:border-cobalt"
              >
                <input type="radio" name="parcel_size" value={size} defaultChecked={l?.parcel_size === size} className="mt-1.5" />
                <span>
                  <span className="block font-medium">{t.delivery.size[size]}</span>
                  <span className="hint block">{parcelLimits(t, size)}</span>
                  <span className="hint block">
                    {deliveryPrice(size, s) === 0
                      ? t.listing.freePostage
                      : fmt(f.buyerPays, { amount: formatGBP(deliveryPrice(size, s)) })}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="hint mt-3">{f.tooBig}</p>
          <p className="hint mt-2">{f.platformSteps}</p>
        </div>

        {/* "Collection only" overrides the two choices above on the server, so this works without JavaScript. */}
        <fieldset className={`${box} grid gap-3`}>
          <legend className="label px-1">{f.collection}</legend>
          {(["no", "optional", "only"] as const).map((mode) => (
            <label key={mode} className="flex cursor-pointer items-start gap-3">
              <input type="radio" name="collection" value={mode} defaultChecked={collection === mode} className="mt-1.5" />
              <span>
                <span className="block font-medium">
                  {{ no: f.collectionNo, optional: f.collectionOptional, only: f.collectionOnly }[mode]}
                </span>
                <span className="hint">
                  {{ no: f.collectionNoHint, optional: f.collectionOptionalHint, only: f.collectionOnlyHint }[mode]}
                </span>
              </span>
            </label>
          ))}
          <p className="hint">{f.collectionNoteHint}</p>
        </fieldset>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[#b9b4a8] p-4 has-[:checked]:border-cobalt has-[:checked]:bg-mist">
        <input type="checkbox" name="instalments" defaultChecked={l ? l.instalments : true} className="mt-1.5" />
        <span>
          <span className="block font-medium">{f.instalments}</span>
          <span className="hint">
            {fmt(f.instalmentsHint, { card: s.card_bps / 100, klarna: s.klarna_bps / 100 })}
          </span>
        </span>
      </label>

      <div className="grid gap-3">
        <p className="label">{f.photos}</p>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={`/img/${img.id}`} alt="" className="h-28 w-[5.6rem] bg-mist object-cover" />
            ))}
          </div>
        )}
        <PhotoInput
          name="photos"
          max={MAX_IMAGES}
          hint={`${fmt(f.photosHint, { n: MAX_IMAGES })}${images.length ? ` ${f.keepPhotos}` : ""}`}
        />
      </div>

      <div><SubmitButton>{f.save}</SubmitButton></div>
    </form>
  );
}
