<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount as on_mount } from "svelte";
  import { get } from "svelte/store";
  import {
    company_records,
    recruitment_jobs,
  } from "$lib/portal/workspace_state.js";
  import { jobs } from "$lib/portal/data.js";
  import { notice_periods, work_types } from "$lib/portal/filter_options.js";
  import {
    new_job_form,
    job_form_error,
    normalise_job_post,
  } from "$lib/portal/job_post_rules.js";
  import { toast } from "$lib/portal/state.js";
  import Markdown_editor from "$lib/portal/markdown_editor.svelte";
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Location_picker from "$lib/portal/location_picker.svelte";
  import Modal from "$lib/portal/modal.svelte";
  let form = new_job_form();
  let skill_text = "";
  let error = "";
  let confirming = false;
  let completed = false;
  let preview_id = "";
  const skill_options = [...new Set(jobs.flatMap((j) => j.skills))];
  on_mount(() => {
    const id = $page.url.searchParams.get("edit");
    if (id) {
      const job = get(recruitment_jobs).find((j) => j.id === id);
      if (job)
        form = {
          ...new_job_form(),
          ...job,
          modes: job.modes || [job.mode],
          types: job.types || [job.type],
          locations: job.locations || ["in-blr"],
          description: job.description || job.summary || "",
          company_name: job.company_name || "",
          min_experience: job.min_experience ?? job.experience_years ?? 0,
          rounds: job.rounds ?? job.interview_rounds ?? 1,
          salary_hidden: !!job.salary_hidden,
        };
    }
  });
  $: if (form.tier === "Free") {
    form.salary_hidden = false;
    form.application = "Easy apply";
  }
  $: if (!form.company) form.payment = "personal";
  function toggle(key, value) {
    form = {
      ...form,
      [key]: form[key].includes(value)
        ? form[key].filter((v) => v !== value)
        : [...form[key], value],
    };
  }
  function add_skill() {
    const value = skill_text.trim();
    if (!value) return;
    if (form.skills.length >= 15) {
      error = "A job can include up to 15 skills.";
      return;
    }
    if (!form.skills.some((s) => s.toLowerCase() === value.toLowerCase()))
      form.skills = [...form.skills, value];
    skill_text = "";
    error = "";
  }
  function save(status = "Draft") {
    const id = form.id || `draft-${Date.now().toString(36)}`;
    const existing = get(recruitment_jobs).find((j) => j.id === id);
    const company_name =
      form.company_name.trim() ||
      get(company_records).find((c) => c.id === form.company)?.name ||
      "Confidential";
    const post = {
      ...normalise_job_post({ ...form, company_name }),
      id,
      status,
      applicants: existing?.applicants || 0,
      views: existing?.views || 0,
      posted: existing?.posted || 0,
    };
    recruitment_jobs.update((items) => [
      post,
      ...items.filter((j) => j.id !== id),
    ]);
    form.id = id;
    preview_id = id;
    if (status === "Draft") {
      toast("Draft saved in this browser.");
      goto("/recruiter/jobs?status=Draft");
    } else {
      confirming = false;
      completed = true;
    }
  }
  function review() {
    error = job_form_error(form);
    if (!error) confirming = true;
  }
</script>

<svelte:head><title>Post a job — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="MAKE ROOM FOR YOUR NEXT GREAT HIRE"
    title="Good work starts"
    accent="with a clear brief."
    description="Tell people what they’ll do, how they’ll work and what they can expect."
  /><Notice />
  {#if completed}<section class="workspace_panel review_success">
      <span class="workspace_badge green">PREVIEW SAVED</span>
      <h2>A new possibility, ready to review.</h2>
      <p>
        Your job is saved locally. It has not been published and no payment was
        taken.
      </p>
      <div class="workspace_actions" style="justify-content:center">
        <a class="button button_dark" href={`/recruiter/jobs/${preview_id}`}
          >View job preview ↗</a
        ><a class="button button_outline" href="/recruiter/jobs">Manage jobs</a>
      </div>
    </section>
  {:else}<form
      class="workspace_grid workspace_form"
      on:submit|preventDefault={review}
    >
      <div class="workspace_stack">
        <section class="workspace_panel">
          <h2>01 / Start with the right listing</h2>
          <div class="step_choices">
            {#each [["Free", "A direct link to share. No posting fee."], ["Premium", "Discoverable in search. Posting fee applies."]] as [value, text]}<label
                class:selected={form.tier === value}
                ><input type="radio" bind:group={form.tier} {value} /><strong
                  >{value}</strong
                ><small>{text}</small></label
              >{/each}
          </div>
          <p class="workspace_hint">
            {form.tier === "Free"
              ? "Free jobs are unlisted. Share the direct link yourself. Salary stays visible and applications stay on the platform."
              : "Paid jobs appear in search. An approved company connection also places the job on its company page."}
          </p>
          <label class="field_label"
            >Company connection<select
              class="field_input"
              bind:value={form.company}
              ><option value="">Unlinked / confidential</option
              >{#each $company_records.filter((c) => c.id === "forma") as company}<option
                  value={company.id}
                  >{company.name} · approved sample membership</option
                >{/each}</select
            ></label
          ><label class="field_label"
            >Company display name<input
              class="field_input"
              maxlength="120"
              bind:value={form.company_name}
              placeholder={form.company
                ? "Forma"
                : "Confidential (if left blank)"}
            /></label
          >{#if form.tier === "Premium"}<label class="field_label"
              >Payment method<select
                class="field_input"
                bind:value={form.payment}
                ><option value="personal">Out of pocket</option><option
                  value="credits"
                  disabled={!form.company}>Company credits</option
                ></select
              ></label
            >{/if}
        </section>
        <section class="workspace_panel">
          <h2>02 / The work</h2>
          <label class="field_label"
            >Job title *<input
              class="field_input"
              list="job_designations"
              required
              maxlength="120"
              bind:value={form.title}
            /><datalist id="job_designations"
              >{#each jobs as job}<option value={job.title} />{/each}</datalist
            ></label
          ><label class="field_label"
            >Required skills *
            <div class="inline_fields">
              <input
                class="field_input"
                list="job_skills"
                bind:value={skill_text}
                on:keydown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add_skill();
                  }
                }}
                placeholder="Type a skill"
              /><button
                type="button"
                class="button button_outline"
                on:click={add_skill}>Add</button
              >
            </div>
            <datalist id="job_skills"
              >{#each skill_options as skill}<option
                  value={skill}
                />{/each}</datalist
            ></label
          >
          <div class="filter_chips">
            {#each form.skills as skill}<button
                class="button button_outline button_small"
                type="button"
                aria-label={`Remove ${skill}`}
                on:click={() =>
                  (form.skills = form.skills.filter((s) => s !== skill))}
                >{skill} ×</button
              >{/each}
          </div>
          <p class="form_caption">
            {form.skills.length}/15 skills. Custom terms can be reviewed later.
          </p>
          <label class="field_label"
            >Minimum experience (years) *<input
              class="field_input"
              type="number"
              min="0"
              max="99"
              step="1"
              required
              bind:value={form.min_experience}
            /></label
          >
          <fieldset>
            <legend>Eligible work locations *</legend><Location_picker
              bind:selected={form.locations}
            />
          </fieldset>
        </section>
        <section class="workspace_panel">
          <h2>03 / Pay & practical details</h2>
          <div class="form_grid">
            <label class="field_label"
              >Currency<select class="field_input" bind:value={form.currency}
                ><option>INR</option><option>USD</option><option>GBP</option
                ><option>EUR</option></select
              ></label
            ><label class="field_label"
              >Maximum annual salary *<input
                class="field_input"
                type="number"
                min="1"
                step="1"
                required
                bind:value={form.salary_max}
              /></label
            >
          </div>
          <label class="filter_checkbox"
            ><input
              type="checkbox"
              bind:checked={form.salary_hidden}
              disabled={form.tier === "Free"}
            />Display “Competitive” instead of salary</label
          >
          <p class="form_caption">
            An exact maximum budget is required even when hidden, so salary
            matching can work.
          </p>
          {#each [{ key: "modes", label: "Workplace *", options: ["On-site", "Hybrid", "Remote"] }, { key: "types", label: "Employment type *", options: work_types.filter((v) => v !== "Gig") }, { key: "notice", label: "Accepted notice periods", options: notice_periods }] as group}<fieldset
            >
              <legend>{group.label}</legend>
              <div class="filter_chips">
                {#each group.options as option}<label
                    class:chosen={form[group.key].includes(option)}
                    ><input
                      type="checkbox"
                      checked={form[group.key].includes(option)}
                      on:change={() => toggle(group.key, option)}
                    />{option}</label
                  >{/each}
              </div>
            </fieldset>{/each}
          <div class="form_grid">
            <label class="field_label"
              >Relocation support<select
                class="field_input"
                bind:value={form.relocation}
                ><option>Supported</option><option>Not supported</option><option
                  >On your own</option
                ></select
              ></label
            ><label class="field_label"
              >Interview rounds *<input
                class="field_input"
                type="number"
                min="0"
                max="20"
                step="1"
                required
                bind:value={form.rounds}
              /></label
            >
          </div>
        </section>
        <section class="workspace_panel">
          <h2>04 / Application & description</h2>
          <label class="field_label"
            >Application method<select
              class="field_input"
              bind:value={form.application}
              disabled={form.tier === "Free"}
              ><option>Easy apply</option><option>External</option></select
            ></label
          >{#if form.application === "External"}<label class="field_label"
              >External application URL *<input
                class="field_input"
                type="url"
                pattern="https://.*"
                required
                placeholder="https://"
                bind:value={form.external_url}
              /></label
            >{/if}<Markdown_editor bind:value={form.description} />
        </section>
      </div>
      <aside class="workspace_stack">
        <section class="workspace_panel">
          <span class="eyebrow_label">YOUR LISTING, AT A GLANCE</span>
          <h2 style="margin-top:18px">
            {form.title || "Your next great hire."}
          </h2>
          <p>
            {form.company_name || (form.company ? "Forma" : "Confidential")}
          </p>
          <dl class="facts_list">
            <div>
              <dt>Listing</dt>
              <dd>{form.tier}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>
                {form.tier === "Free" ? "Direct link only" : "Public search"}
              </dd>
            </div>
            <div>
              <dt>Application</dt>
              <dd>{form.application}</dd>
            </div>
            <div>
              <dt>Posting fee</dt>
              <dd>{form.tier === "Free" ? "₹0" : "Awaiting pricing API"}</dd>
            </div>
          </dl>
          <div class="workspace_actions">
            <button
              type="button"
              class="button button_outline button_full"
              on:click={() => save()}>Save as draft</button
            ><button class="button button_dark button_full" type="submit"
              >Review job preview ↗</button
            >
          </div>
          {#if error}<p class="filter_error" role="alert">{error}</p>{/if}
          <p class="work_note">
            Drafts are saved locally. Publishing, credit checks and payments
            need the job API.
          </p>
        </section>
      </aside>
    </form>{/if}
</main>
{#if confirming}<Modal
    title={form.tier === "Free" ? "Review free job" : "Review paid job"}
    on:close={() => (confirming = false)}
    ><div class="workspace_hint">
      <h3>{form.title}</h3>
      <p>
        {form.tier === "Free"
          ? "This job will be accessible by direct link only. It will not appear in public search or on a company page. Salary is public."
          : form.company
            ? "This job is intended for public search and your approved company page."
            : "This unlinked job is intended for public search only. It will not appear on an official company page."}
      </p>
      {#if form.tier === "Premium"}<p>
          Payment method: {form.payment === "credits"
            ? "Company credits"
            : "Out of pocket"}. The actual fee and available allowance must be
          checked before live publishing.
        </p>{/if}
    </div>
    <p class="form_helper">
      Confirming saves a local preview. No credits are deducted.
    </p>
    <div class="form_actions">
      <button
        class="button button_outline"
        on:click={() => (confirming = false)}>Keep editing</button
      ><button class="button button_dark" on:click={() => save("Preview")}
        >Confirm preview</button
      >
    </div></Modal
  >{/if}
