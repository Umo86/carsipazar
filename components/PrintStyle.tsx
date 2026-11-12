// Print rules for a document page (order confirmation, cancellation form): A4 and tight spacing.
// What is left off the paper (header, utility bar, navigation, footer, .no-print) is decided by the
// one global @media print rule in app/globals.css.
export default function PrintStyle() {
  return (
    <style>{`
      @media print {
        @page { size: A4; margin: 16mm; }
        body:has([data-doc]) main { padding: 0 !important; }
        [data-doc] { padding: 0 !important; max-width: none !important; font-size: 9.5pt; line-height: 1.3; }
        [data-doc] h1 { font-size: 19pt; line-height: 1.1; }
        [data-doc] h2 { font-size: 12.5pt; line-height: 1.2; }
        [data-doc] h3 { font-size: 10.5pt; line-height: 1.2; }
        [data-doc] section { margin-top: 0.55rem !important; padding-top: 0.45rem !important; padding-bottom: 0 !important; }
        [data-doc] [class*="mt-"] { margin-top: 0.3rem !important; }
        [data-doc] [class*="py-1.5"] { padding-top: 0.05rem !important; padding-bottom: 0.05rem !important; }
        [data-doc] [class*="pb-"], [data-doc] [class*="gap-4"] { padding-bottom: 0.05rem; row-gap: 0.25rem; }
        [data-doc] a { text-decoration: none; color: inherit; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `}</style>
  );
}
