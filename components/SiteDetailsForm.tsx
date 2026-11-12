"use client";

import { useActionState, useState } from "react";
import { saveSiteDetailsForm, type SiteFormState } from "@/lib/actions/admin";
import SubmitButton from "@/components/SubmitButton";

type Field = { key: string; label: string; hint: string; email: boolean };

// The site details form. Whatever the admin typed stays in the fields when something is wrong,
// and each message sits under the field it is about.
export default function SiteDetailsForm({
  lang,
  fields,
  initial,
  max,
  errEmail,
  errLong,
  saved,
  save,
}: {
  lang: string;
  fields: Field[];
  initial: Record<string, string>;
  max: number;
  errEmail: string;
  errLong: string;
  saved: string;
  save: string;
}) {
  const [state, action] = useActionState<SiteFormState, FormData>(saveSiteDetailsForm, null);
  const [values, setValues] = useState(initial);
  return (
    <form action={action} className="mt-8 grid gap-6">
      <input type="hidden" name="lang" value={lang} />
      {state?.saved && <p className="notice" role="status">{saved}</p>}
      {fields.map((f) => {
        const err = state?.errors[f.key as keyof NonNullable<SiteFormState>["errors"]];
        const msg = err === "email" ? errEmail.replace("{field}", f.label) : err === "long" ? errLong.replace("{field}", f.label) : "";
        return (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            <input
              className="input"
              name={f.key}
              type={f.email ? "email" : "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              maxLength={max}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${f.key}-err ${f.key}-hint` : `${f.key}-hint`}
              autoComplete="off"
            />
            {err && <span id={`${f.key}-err`} className="notice notice-error" role="alert">{msg}</span>}
            <span id={`${f.key}-hint`} className="hint !font-normal">{f.hint}</span>
          </label>
        );
      })}
      <div><SubmitButton>{save}</SubmitButton></div>
    </form>
  );
}
