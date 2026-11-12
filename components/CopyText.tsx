"use client";

import { useState } from "react";

// A read-only text box with a Copy button, for captions.
export default function CopyText({ text, label, copy, copied }: { text: string; label: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="grid gap-2">
      <label className="label">
        {label}
        <textarea className="input mt-1 font-normal" readOnly rows={7} value={text} />
      </label>
      <div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          }}
        >
          {done ? copied : copy}
        </button>
      </div>
    </div>
  );
}
