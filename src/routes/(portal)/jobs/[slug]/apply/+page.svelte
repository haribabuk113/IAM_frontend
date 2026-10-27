<script>
  import { invalidateAll as invalidate_all } from "$app/navigation";
  import { focus_feedback } from "$lib/portal/focus_feedback.js";
  import { jobs_api } from "$lib/portal/jobs_api.js";
  import { my_skill_ids } from "$lib/portal/my_skills.js";
  import { load_quota } from "$lib/portal/membership_state.js";
  import Heading from "$lib/portal/page_heading.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  export let data;
  // Manual: Easy Apply sends the profile itself (no form to retype). The
  // server snapshots it with the privacy rules applied and computes the match.
  $: job = data.job;
  $: p = data.profile;
  $: company_name = job.company?.name || job.company_name || "Confidential";
  $: skill_ids = job.skill_ids ?? [];
  $: match = skill_ids.length
    ? Math.round((100 * skill_ids.filter((id) => $my_skill_ids.has(id)).length) / skill_ids.length)
    : 0;
  $: money = (amount) =>
    amount
      ? new Intl.NumberFormat("en", { style: "currency", currency: p.salary_currency, maximumFractionDigits: 0 }).format(amount)
      : "Not set";
  $: shared = [
    ["Name", p.name],
    ["Email", p.email || "Not set"],
    ["Phone", p.phone || "Not set"],
    ["Location", p.location || "Not set"],
    ["Experience", `${p.experience_years || 0} years`],
    ["Notice period", p.notice || "Not set"],
    ["Expected salary", money(p.expected_salary)],
    ["Current salary", p.current_salary_private ? "Kept private (not shared)" : money(p.current_salary)],
    ["Skills", p.skills.length ? p.skills.join(", ") : "None yet"],
  ];
  let consent = false;
  let busy = false;
  let error = "";
  let needs_profile = false;
  let done = null;
  async function submit() {
    if (!consent || busy) return;
    busy = true;
    error = "";
    const result = await jobs_api.apply(job.id);
    busy = false;
    if (!result.ok) {
      error = result.error;
      needs_profile = result.status === 409 && !p.saved;
      return;
    }
    done = result.data;
    load_quota();
    invalidate_all();
  }
</script>

<svelte:head><title>Apply for {job.title} — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="A LITTLE COURAGE. A NEW POSSIBILITY."
    title="Make your"
    accent="next move."
    description={`${job.title} at ${company_name}`}
  />
  {#if done || job.applied_at}<div class="feedback_panel" tabindex="-1" use:focus_feedback>
      <Empty
        title="Your application is in."
        text={`Sent to the ${company_name} hiring team on ${new Date(done?.submitted_at || job.applied_at).toLocaleDateString("en-IN")}. Follow its progress in your applications.`}
        ><a class="button button_dark" href="/applications">View my applications ↗</a></Empty
      >
    </div>{:else if job.status !== "active"}<Empty
      title="This role is no longer open."
      text="Explore current opportunities to find your next move."
      ><a class="button button_dark" href="/jobs">Find another role</a></Empty
    >{:else if job.application !== "Easy apply"}<Empty
      title="This role takes applications on the employer’s site."
      text="Open the role and use “Apply on the company’s site”."
      ><a class="button button_dark" href={`/jobs/${job.id}`}>Back to the role</a></Empty
    >{:else}<form class="workspace_grid workspace_form" on:submit|preventDefault={submit}>
      <section class="workspace_panel">
        <h2>What the hiring team will see</h2>
        <p class="form_helper">
          A copy of your profile as it is now. Change anything on
          <a class="text_link" href="/profile">your profile</a> before you apply.
        </p>
        <dl class="facts_list">
          {#each shared as [label, value]}<div>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>{/each}
        </dl>
      </section>
      <aside class="workspace_panel">
        <h2>{match}% skill match</h2>
        <p class="form_helper">The share of this role’s skills on your profile.</p>
        {#if data.quota}<p>
            {data.quota.remaining > 0
              ? `Uses 1 of today’s free applications (${data.quota.remaining} of ${data.quota.limit} left).`
              : `You’ve used today’s ${data.quota.limit} free applications. Paid applications arrive with the wallet; try again tomorrow.`}
          </p>{/if}
        {#if !p.saved}<p class="auth_alert" role="alert">
            Save your profile first so the hiring team has something to read.
            <a class="text_link" href="/profile">Go to your profile ↗</a>
          </p>{/if}
        <label class="filter_checkbox"
          ><input type="checkbox" required bind:checked={consent} />I’ve reviewed these details. My email and
          phone go to this employer even if my public profile hides them.</label
        >
        {#if error}<p class="auth_alert" role="alert">
            {error}{#if needs_profile}. <a class="text_link" href="/profile">Go to your profile ↗</a>{/if}
          </p>{/if}
        <button
          class="button button_terracotta"
          disabled={!consent || busy || !p.saved || data.quota?.remaining === 0}
          >{busy ? "Sending…" : "Send application"}</button
        >
      </aside>
    </form>{/if}
</main>
