import Link from "next/link";
import tr from "@/lib/i18n/tr";
import en from "@/lib/i18n/en";

// Shown for unknown pages. It cannot know the language, so it shows both.
export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <h1 className="text-4xl md:text-6xl">{tr.misc.notFoundTitle}</h1>
      <p className="mt-4 text-soft">{en.misc.notFoundTitle}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/tr" className="btn">{tr.misc.home}</Link>
        <Link href="/en" className="btn btn-ghost">{en.misc.home}</Link>
      </div>
    </div>
  );
}
