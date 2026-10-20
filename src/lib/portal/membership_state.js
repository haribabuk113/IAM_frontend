import { writable, derived, get } from "svelte/store";
import { browser } from "$app/environment";
import {
  default_membership_settings,
  is_premium,
  free_remaining,
  purchase_preview,
} from "./membership_rules.js";
export const membership_settings = writable(
  structuredClone(default_membership_settings),
);
export const preview_account = writable({
  enabled: false,
  credits: 500,
  premium_until: 0,
  application_days: [],
});
export const membership_open = writable(false);
export const membership_clock = writable(Date.now());
export const premium_active = derived(
  [preview_account, membership_clock],
  ([$account, $clock]) => is_premium($account, $clock),
);
export const applications_remaining = derived(
  [preview_account, membership_settings, membership_clock],
  ([$account, $settings, $clock]) =>
    free_remaining($account, $settings, $clock),
);
let hydrated = false;
export function hydrate_membership() {
  if (!browser || hydrated) return;
  hydrated = true;
  for (const [key, store] of [
    ["membership_settings", membership_settings],
    ["membership_account", preview_account],
  ]) {
    try {
      const value = JSON.parse(localStorage.getItem(`referise-preview:${key}`));
      if (value && typeof value === "object") {
        if (
          key === "membership_settings" &&
          ["daily_free", "day_price", "month_price", "credit_price"].every(
            (k) =>
              Number.isFinite(value[k]) &&
              value[k] >= (k === "credit_price" ? 0.01 : 0),
          ) &&
          ["INR", "USD", "EUR", "GBP"].includes(value.currency) &&
          Array.isArray(value.premium_filters)
        )
          store.set({ ...default_membership_settings, ...value });
        if (
          key === "membership_account" &&
          Number.isFinite(value.credits) &&
          value.credits >= 0 &&
          Array.isArray(value.application_days)
        )
          store.set(value);
      }
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    store.subscribe((value) => {
      try {
        localStorage.setItem(`referise-preview:${key}`, JSON.stringify(value));
      } catch {
        /* Keep this visit usable. */
      }
    });
  }
}
export function buy_preview_premium(days) {
  const next = purchase_preview(
    get(preview_account),
    days,
    get(membership_settings),
  );
  if (!next) return false;
  preview_account.set(next);
  membership_clock.set(Date.now());
  return true;
}
export function record_preview_application() {
  membership_clock.set(Date.now());
  if (!get(premium_active) && get(applications_remaining) === 0) {
    membership_open.set(true);
    return false;
  }
  preview_account.update((a) => ({
    ...a,
    enabled: true,
    application_days: [
      ...a.application_days,
      new Date().toISOString().slice(0, 10),
    ],
  }));
  return true;
}
