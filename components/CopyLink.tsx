"use client";

import { useState } from "react";

export default function CopyLink({ url, copy, copied }: { url: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="rounded-md bg-mist px-3 py-2 text-sm break-all">{url}</code>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }}
      >
        {done ? copied : copy}
      </button>
    </div>
  );
}
