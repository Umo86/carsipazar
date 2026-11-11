"use client";

import { useRef, useState } from "react";

// Shrinks photos in the browser before upload: longest side 1400px, JPEG.
// A phone photo of 5 MB becomes roughly 250 KB, which keeps pages fast.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.8));
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function PhotoInput({
  name,
  max,
  hint,
  wide = false,
}: {
  name: string;
  max: number;
  hint: string;
  wide?: boolean; // preview shape: wide for covers, upright for everything else
}) {
  const input = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, max);
    if (!files.length) return;
    setBusy(true);
    try {
      const small = await Promise.all(files.map(shrink));
      const dt = new DataTransfer();
      small.forEach((f) => dt.items.add(f));
      if (input.current) input.current.files = dt.files;
      setPreviews(small.map((f) => URL.createObjectURL(f)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <input
        ref={input}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        onChange={onChange}
        aria-busy={busy}
        className="block w-full text-sm file:mr-4 file:rounded-full file:border file:border-ink file:bg-paper file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer"
      />
      <p className="hint">{hint}</p>
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={`h-28 bg-mist object-cover ${wide ? "w-72" : "w-[5.6rem]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
