"use client";

import { useActionState } from "react";
import { createResetLink, type ResetLinkState } from "@/lib/actions/account";
import CopyLink from "@/components/CopyLink";

// The button that makes a one-time password reset link. The link comes back in the page itself
// (never in the address bar) and is shown with a copy button.
export default function ResetLinkForm({
  lang,
  userId,
  label,
  ready,
  failed,
  copy,
  copied,
}: {
  lang: string;
  userId: string;
  label: string;
  ready: string;
  failed: string;
  copy: string;
  copied: string;
}) {
  const [state, action, pending] = useActionState<ResetLinkState, FormData>(createResetLink, null);
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="user" value={userId} />
        <button className="btn btn-ghost btn-sm" disabled={pending}>{label}</button>
      </form>
      {state?.link && (
        <div className="notice mt-3 max-w-md" role="status">
          <p className="mb-3">{ready}</p>
          <CopyLink url={state.link} copy={copy} copied={copied} />
        </div>
      )}
      {state?.error && <p className="notice notice-error mt-3 max-w-md" role="alert">{failed}</p>}
    </div>
  );
}
