import { writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { default_profile, jobs } from "./data";
import { default_filters } from "./search.js";
export const search_filters = writable(default_filters());
export const viewing_currency = writable("INR");
export const saved_jobs = writable([]);
export const applications = writable([]);
export const application_snapshots = writable([]);
export const saved_searches = writable([]);
export const profile = writable(structuredClone(default_profile));
export const resume_file = writable(null);
export const notification = writable("");
let hydrated = false;
let timer;
// Same shape the job proxy accepts; the search API takes at most 200 job ids.
const job_id_pattern = /^[a-z0-9][a-z0-9-]{1,148}$/;
const max_saved = 200;
export function toast(message) {
  clearTimeout(timer);
  notification.set(message);
  timer = setTimeout(() => notification.set(""), 4200);
}
function read(key) {
  try {
    return JSON.parse(
      localStorage.getItem(`referise-preview:${key}`) ?? "null",
    );
  } catch {
    return null;
  }
}
function persist(key, value) {
  try {
    localStorage.setItem(`referise-preview:${key}`, JSON.stringify(value));
  } catch {
    toast(
      "Your browser could not save this change. It will last for this visit.",
    );
  }
}
export function hydrate_preview() {
  if (!browser || hydrated) return;
  hydrated = true;
  // Saved jobs are live job ids (uuids, or slugs for older jobs); applications
  // are still sample-only, so they keep only sample ids.
  const sample_ids = new Set(jobs.map((job) => job.id));
  const valid = {
    saved: (id) => job_id_pattern.test(id),
    applications: (id) => sample_ids.has(id),
  };
  for (const [key, store] of [
    ["saved", saved_jobs],
    ["applications", applications],
  ]) {
    const value = read(key);
    if (Array.isArray(value))
      store.set(
        [...new Set(value.filter((id) => typeof id === "string" && valid[key](id)))].slice(-max_saved),
      );
    store.subscribe((next) => persist(key, next));
  }
  const saved = read("searches");
  if (Array.isArray(saved))
    saved_searches.set(
      saved.filter(
        (entry) =>
          entry &&
          typeof entry.name === "string" &&
          typeof entry.query === "string",
      ),
    );
  saved_searches.subscribe((next) => persist("searches", next));
  try {
    localStorage.removeItem("referise-preview:profile"); // profiles are stored on the server now
  } catch {}
}
export function toggle_saved(id) {
  const was_saved = get(saved_jobs).includes(id);
  saved_jobs.update((value) =>
    was_saved ? value.filter((item) => item !== id) : [...value, id].slice(-max_saved),
  );
  toast(
    was_saved
      ? "Job removed from your saved list."
      : "Job saved. Find it in Saved jobs.",
  );
}
