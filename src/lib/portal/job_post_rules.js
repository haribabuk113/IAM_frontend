export const new_job_form = () => ({
  id: "",
  title: "",
  tier: "Free",
  company: "",
  company_name: "",
  payment: "personal",
  skills: [],
  min_experience: 0,
  locations: [],
  worldwide: false,
  salary_max: "",
  currency: "INR",
  salary_hidden: false,
  modes: [],
  types: [],
  notice: [],
  relocation: "On your own",
  rounds: 1,
  application: "Easy apply",
  external_url: "",
  description: "",
});
export function job_form_error(form) {
  if (!form.title.trim()) return "Add a job title.";
  if (!form.skills.length || form.skills.length > 15)
    return "Choose between 1 and 15 skills.";
  if (!form.locations.length && !form.worldwide)
    return "Select an eligible location or worldwide remote.";
  if (
    form.worldwide &&
    (!form.modes.includes("Remote") ||
      form.modes.some((mode) => mode !== "Remote"))
  )
    return "Worldwide remote requires a remote-only workplace.";
  if (
    !Number.isInteger(Number(form.min_experience)) ||
    form.min_experience < 0 ||
    form.min_experience > 99
  )
    return "Experience must be a whole number between 0 and 99.";
  if (
    !form.salary_max ||
    !Number.isFinite(Number(form.salary_max)) ||
    form.salary_max <= 0
  )
    return "Enter a positive maximum annual salary.";
  if (!form.modes.length || !form.types.length)
    return "Choose a workplace and employment type.";
  if (!Number.isInteger(Number(form.rounds)) || form.rounds < 0)
    return "Interview rounds must be a non-negative whole number.";
  if (!form.description.trim()) return "Add a job description.";
  if (form.description.length > 10000)
    return "Keep the description under 10,000 characters.";
  if (form.tier === "Premium" && form.application === "External") {
    try {
      const url = new URL(form.external_url);
      if (
        url.protocol !== "https:" ||
        !url.hostname ||
        url.username ||
        url.password
      )
        return "Add a valid HTTPS application link.";
    } catch {
      return "Add a valid HTTPS application link.";
    }
  }
  return "";
}
export function normalise_job_post(form) {
  return {
    ...form,
    location_type: form.worldwide ? "world_remote" : "specific",
    company: form.tier === "Free" ? "" : form.company,
    salary_hidden: form.tier === "Free" ? false : form.salary_hidden,
    application: form.tier === "Free" ? "Easy apply" : form.application,
    external_url: form.tier === "Free" ? "" : form.external_url,
    payment: form.tier === "Free" || !form.company ? "personal" : form.payment,
    unlisted: form.tier === "Free",
  };
}
