import "server-only";
import { cache } from "react";
import { DEFAULT_SETTINGS, PARCEL_SIZE_KEYS, PARCEL_SIZES, type Settings } from "./config";
import { q, tx } from "./db";

// Fee settings: defaults from config, overridden by rows the admin has saved.
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await q<{ key: string; value: number }>("select key, value from settings");
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in out) out[r.key as keyof Settings] = r.value;
  }
  return out;
});

// Saves several settings at once. A changed delivery price also moves every
// CarsiPazar delivery item of that parcel size to the new postage, in the same
// transaction, so the shop never shows a price that differs from the setting.
// Orders already placed keep the postage they were bought with.
export async function saveSettingsBatch(entries: [keyof Settings, number][]) {
  await tx(async (c) => {
    for (const [key, value] of entries) {
      await c.query(
        `insert into settings (key, value) values ($1, $2)
         on conflict (key) do update set value = excluded.value`,
        [key, value],
      );
      const size = PARCEL_SIZE_KEYS.find((k) => PARCEL_SIZES[k].priceKey === key);
      if (size) {
        await c.query(
          "update listings set postage_pence = $2 where delivery_method = 'platform' and parcel_size = $1",
          [size, value],
        );
      }
    }
  });
}
