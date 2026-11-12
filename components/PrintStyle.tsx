// Print rules for a document page (order confirmation, cancellation form): A4, and the site
// header, footer and anything marked .no-print are left off the paper.
export default function PrintStyle() {
  return (
    <style>{`
      @media print {
        @page { size: A4; margin: 16mm; }
        body:has([data-doc]) header, body:has([data-doc]) footer, body:has([data-doc]) nav, .no-print { display: none !important; }
        body:has([data-doc]) main { padding: 0 !important; }
        [data-doc] { padding: 0 !important; max-width: none !important; font-size: 11pt; }
        [data-doc] a { text-decoration: none; color: inherit; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `}</style>
  );
}
