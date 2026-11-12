import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/i18n";
import { paymentsMode } from "@/lib/payments";
import { docMetadata } from "@/lib/content/meta";
import Icon from "@/components/Icon";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return { title: getDict("tr").about.title };
  const a = getDict(lang).about;
  return docMetadata(lang, "/about", { title: a.title, description: a.lead });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const a = t.about;
  const points = [
    ["check", a.p1Title, a.p1Body],
    ["shield", a.p2Title, a.p2Body],
    ["bag", a.p3Title, a.p3Body],
    ["heart", a.p4Title, a.p4Body],
  ] as const;

  return (
    <div className="wrap pt-5">
      <div className="rounded-3xl bg-sand px-8 py-10 md:px-12 md:py-14">
        <h1 className="text-5xl md:text-6xl">{a.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">{a.lead}</p>
      </div>

      <section className="mt-14">
        <h2 className="text-3xl md:text-[2.5rem]">{a.howTitle}</h2>
        <ul className="mt-7 grid gap-5 sm:grid-cols-2">
          {points.map(([icon, title, body]) => (
            <li key={title} className="panel flex gap-4 p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky text-cobalt">
                <Icon name={icon} size={22} />
              </span>
              <div>
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-[0.9375rem] text-soft">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid items-center gap-6 rounded-3xl bg-cobalt-deep px-8 py-10 text-paper md:grid-cols-[3fr_2fr] md:px-12">
        <div>
          <h2 className="text-3xl md:text-4xl">{a.sellTitle}</h2>
          <p className="mt-3 max-w-xl text-paper/80">{a.sellBody}</p>
        </div>
        <div className="md:justify-self-end">
          <Link href={`/${lang}/sell`} className="btn btn-light">{t.home.sellCta}</Link>
        </div>
      </section>

      {/* The test-site notice and photo credits live here, not in the footer. */}
      <section id="site" className="mt-14 max-w-2xl scroll-mt-32">
        <h2 className="text-3xl">{a.siteTitle}</h2>
        {paymentsMode() === "demo" && <p className="mt-4">{a.testNote}</p>}
        <p className="mt-2 text-soft">
          {a.credit.split(/(Pixabay|Unsplash)/).map((part, i) =>
            part === "Pixabay" || part === "Unsplash" ? (
              <a
                key={i}
                href={`https://${part.toLowerCase()}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-ink"
              >
                {part}
              </a>
            ) : (
              part
            ),
          )}
        </p>
      </section>
    </div>
  );
}
