import "server-only";
import { cache } from "react";
import { DEFAULT_SETTINGS, type Settings } from "./config";
import { q } from "./db";

// Fee settings: defaults from config, overridden by rows the admin has saved.
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await q<{ key: string; value: number }>("select key, value from settings");
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in out) out[r.key as keyof Settings] = r.value;
  }
  return out;
});

export async function saveSetting(key: keyof Settings, value: number) {
  await q(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value`,
    [key, value],
  );
}
