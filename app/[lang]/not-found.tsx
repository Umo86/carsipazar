import Link from "next/link";

// Shown for unknown pages. It cannot know the language, so it shows both.
export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <h1 className="text-4xl md:text-6xl">Aradığın sayfa bu sokakta değil.</h1>
      <p className="mt-4 text-soft">That page is not on this street.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/tr" className="btn">Ana sayfa</Link>
        <Link href="/en" className="btn btn-ghost">Home page</Link>
      </div>
    </div>
  );
}
