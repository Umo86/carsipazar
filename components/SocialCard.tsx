import type { Locale } from "@/lib/config";
import type { Dict } from "@/lib/i18n";
import CopyText from "./CopyText";

const FORMATS = ["post", "story", "square"] as const;
const LANGS = ["tr", "en"] as const;

// Download links (3 formats x 2 languages) for one image route.
export function SocialLinks({ path, t }: { path: string; t: Dict }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {FORMATS.flatMap((f) =>
        LANGS.map((l) => (
          <li key={`${f}-${l}`}>
            <a
              href={`${path}?lang=${l}&format=${f}&download=1`}
              className="btn btn-ghost btn-sm"
              aria-label={t.social.downloadAria
                .replace("{format}", t.social.format[f])
                .replace("{ratio}", t.social.ratio[f])
                .replace("{language}", t.social.langName[l])}
            >
              {t.social.format[f]} · {l.toUpperCase()}
            </a>
          </li>
        )),
      )}
    </ul>
  );
}

// A preview, the download links and a caption: used for items and brand posts.
export default function SocialCard({
  path,
  title,
  lang,
  t,
  caption,
  kind,
}: {
  path: string;
  title: string;
  lang: Locale;
  t: Dict;
  caption: string;
  kind: "item" | "brand";
}) {
  return (
    <li className="panel grid gap-6 p-5 sm:grid-cols-[240px_1fr]" data-social={kind}>
      {/* Plain <img>: the picture is made by our own image route. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${path}?lang=${lang}&format=post`}
        alt={t.social.previewAlt.replace("{name}", title)}
        width={240}
        height={300}
        loading="lazy"
        className="w-60 rounded-xl bg-mist"
      />
      <div className="grid content-start gap-4">
        <h3 className="text-2xl">{title}</h3>
        <SocialLinks path={path} t={t} />
        <CopyText text={caption} label={t.social.caption} copy={t.misc.copy} copied={t.misc.copied} />
      </div>
    </li>
  );
}
