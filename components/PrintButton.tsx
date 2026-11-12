"use client";

// Opens the browser's print dialog. A plain button, not a submit button.
export default function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      {children}
    </button>
  );
}
