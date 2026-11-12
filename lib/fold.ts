// Search ignores case and Turkish letters, so "sandik" finds "sandık" and "SUKRU" finds "Şükrü".
// The same folding is applied to the column (in SQL) and to what was typed (here).
export const FOLD_FROM = "İIÇĞÖŞÜçğıöşüâîû";
export const FOLD_TO = "iicgosucgiosuaiu";
export const foldSql = (expr: string) => `lower(translate(${expr}, '${FOLD_FROM}', '${FOLD_TO}'))`;
export const foldText = (v: string) =>
  [...v].map((ch) => { const i = FOLD_FROM.indexOf(ch); return i < 0 ? ch : FOLD_TO[i]; }).join("").toLowerCase();
