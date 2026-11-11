// A shop's logo framed in the arch. Without a logo, its initial stands in.
export default function ShopMark({
  name,
  logoId,
  className = "w-24",
}: {
  name: string;
  logoId: string | null;
  className?: string;
}) {
  return (
    <div className={`arch aspect-[5/7] shrink-0 bg-cobalt-deep ${className}`}>
      {logoId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/img/${logoId}`} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-end justify-center pb-[18%] font-display text-[2.6em] leading-none text-paper"
        >
          {name.trim().charAt(0).toLocaleUpperCase("tr")}
        </div>
      )}
    </div>
  );
}
