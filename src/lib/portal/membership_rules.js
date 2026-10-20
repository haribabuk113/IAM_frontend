export const default_membership_settings = {
  daily_free: 5,
  day_price: 20,
  month_price: 400,
  credit_price: 1,
  currency: "INR",
  premium_filters: ["min_match", "sort_match"],
};
export const premium_filter_options = {
  query: "Designation keyword",
  designations: "Designations",
  location: "Location keyword",
  locations: "Locations",
  worldwide: "Worldwide remote",
  modes: "Workplace",
  types: "Job type",
  categories: "Department",
  levels: "Experience level",
  min_experience: "Minimum experience",
  max_experience: "Maximum experience",
  posted_within: "Posted date",
  min_salary: "Minimum salary",
  notice: "Notice period",
  relocation: "Relocation",
  rounds: "Interview rounds",
  tiers: "Listing tier",
  methods: "Application method",
  industries: "Industry",
  sizes: "Company size",
  benefits: "Benefits",
  skills: "Skills",
  easy: "Easy apply",
  saved: "Saved jobs",
  radius: "Location radius",
  min_match: "Minimum skill match",
  sort_match: "Highest match sort",
};
export function skill_match(job, skills = []) {
  const required = [
    ...new Set((job.skills ?? []).map((s) => s.trim().toLowerCase())),
  ];
  const owned = new Set(skills.map((s) => s.trim().toLowerCase()));
  return required.length
    ? Math.round(
        (100 * required.filter((s) => owned.has(s)).length) / required.length,
      )
    : 0;
}
export function is_premium(account, now = Date.now()) {
  return Number(account?.premium_until) > now;
}
export function premium_quote(days, settings = default_membership_settings) {
  if (!Number.isInteger(Number(days)) || days < 1 || days > 3650) return null;
  const price =
    Math.floor(days / 30) * settings.month_price +
    (days % 30) * settings.day_price;
  return {
    days: Number(days),
    price,
    credits: Math.ceil(price / settings.credit_price),
    currency: settings.currency,
  };
}
export function purchase_preview(account, days, settings, now = Date.now()) {
  const quote = premium_quote(days, settings);
  if (!quote || account.credits < quote.credits) return null;
  return {
    ...account,
    enabled: true,
    credits: account.credits - quote.credits,
    premium_until:
      Math.max(now, Number(account.premium_until) || 0) + quote.days * 86400000,
  };
}
export function free_remaining(account, settings, now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10);
  return Math.max(
    0,
    settings.daily_free -
      (account.application_days ?? []).filter((d) => d === day).length,
  );
}
export function allowed_filters(filters, defaults, settings, premium) {
  if (premium) return { ...filters };
  const result = { ...filters };
  for (const key of settings.premium_filters) {
    if (key === "sort_match") {
      if (result.sort === "match") result.sort = "newest";
    } else if (Object.hasOwn(defaults, key))
      result[key] = structuredClone(defaults[key]);
  }
  return result;
}
