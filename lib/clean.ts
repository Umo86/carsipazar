// Text from outside (forms, the address bar) is cleaned before it goes near the database.
// Postgres refuses a NUL byte, and other control characters have no business in a name or a note.
// Tab and newline stay (textareas); \r\n and a lone \r become \n.
export function cleanText(v: string): string {
  return v
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}
