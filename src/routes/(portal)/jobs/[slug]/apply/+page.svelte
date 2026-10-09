<script>
  import { closed_job_ids } from "$lib/portal/workspace_state.js";
  import { page } from "$app/stores";
  import { onMount as on_mount } from "svelte";
  import { jobs, get_company } from "$lib/portal/data.js";
  import {
    profile,
    applications,
    resume_file,
    toast,
  } from "$lib/portal/state.js";
  import { notice_periods } from "$lib/portal/filter_options.js";
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  let name = "",
    email = "",
    location = "",
    notice = "",
    expected = "",
    experience = 0,
    note = "",
    consent = false,
    error = "",
    complete = false;
  $: job = jobs.find((j) => j.id === $page.params.slug);
  on_mount(() => {
    name = $profile.name;
    email = $profile.email;
    location = $profile.location;
    notice = $profile.notice;
    expected = $profile.expected;
    experience = $profile.experience_years;
  });
  function upload(e) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(file.name)) {
      error = "Choose a PDF or DOCX under 5 MB.";
      return;
    }
    resume_file.set(file);
    error = "";
  }
  function submit() {
    if (!consent) return;
    applications.update((v) => (v.includes(job.id) ? v : [...v, job.id]));
    complete = true;
  }
</script>

<svelte:head
  ><title>Apply for {job?.title || "a job"} — Referise</title></svelte:head
>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="A LITTLE COURAGE. A NEW POSSIBILITY."
    title="Make your"
    accent="next move."
    description={job
      ? `${job.title} at ${get_company(job.company).name}`
      : "Find a role to begin your application."}
  /><Notice
    text="Application preview · No information is submitted to an employer."
  />
  {#if !job}<Empty
      title="This role could not be found."
      text="Explore current opportunities to get started."
    />{:else if $closed_job_ids.includes(job.id)}<Empty
      title="This role is now closed."
      text="Explore current opportunities to find your next move."
      ><a class="button button_dark" href="/jobs">Find another role</a></Empty
    >{:else if complete || $applications.includes(job.id)}<Empty
      title="Your application preview is saved."
      text="You can find it in your applications. Nothing has been sent to the employer."
      ><a class="button button_dark" href="/applications"
        >View my applications ↗</a
      ></Empty
    >{:else if job.application !== "Easy apply"}<section
      class="workspace_panel"
    >
      <h2>Continue with the employer</h2>
      <p>
        This role uses {job.application === "External"
          ? "an external application site"
          : "email applications"}. A verified destination is not available for
        this sample job.
      </p>
      <a class="button button_outline" href={`/jobs/${job.id}`}
        >Back to the role</a
      >
    </section>{:else}<form
      class="workspace_grid workspace_form"
      on:submit|preventDefault={submit}
    >
      <section class="workspace_panel">
        <h2>A quick introduction.</h2>
        <p class="form_caption">
          Prefilled from your profile. Check your details before continuing.
        </p>
        <div class="form_grid">
          <label class="field_label"
            >Name *<input
              class="field_input"
              required
              minlength="2"
              maxlength="100"
              bind:value={name}
            /></label
          ><label class="field_label"
            >Email *<input
              class="field_input"
              type="email"
              required
              bind:value={email}
            /></label
          ><label class="field_label"
            >Location *<input
              class="field_input"
              required
              bind:value={location}
            /></label
          ><label class="field_label"
            >Notice period<select class="field_input" bind:value={notice}
              >{#each notice_periods as value}<option>{value}</option
                >{/each}</select
            ></label
          ><label class="field_label"
            >Experience (years)<input
              class="field_input"
              type="number"
              min="0"
              max="99"
              step="1"
              bind:value={experience}
            /></label
          ><label class="field_label"
            >Expected annual compensation<input
              class="field_input"
              bind:value={expected}
            /></label
          ><label class="field_label full"
            >Résumé · PDF or DOCX, up to 5 MB<input
              class="field_input"
              type="file"
              accept=".pdf,.docx"
              on:change={upload}
            /><small
              >{$resume_file?.name ||
                "No file selected. The demo can use your sample profile."}</small
            ></label
          ><label class="field_label full"
            >A note for the team (optional)<textarea
              class="field_input"
              maxlength="2000"
              rows="5"
              bind:value={note}
            ></textarea></label
          >
        </div>
        {#if error}<p class="filter_error" role="alert">{error}</p>{/if}<label
          class="filter_checkbox"
          ><input type="checkbox" required bind:checked={consent} />I’ve
          reviewed the details in this application preview.</label
        >
        <div class="form_actions">
          <a class="button button_outline" href={`/jobs/${job.id}`}
            >Back to role</a
          ><button class="button button_dark" disabled={!!error}
            >Save application preview ↗</button
          >
        </div>
      </section>
      <aside class="workspace_panel" style="align-self:start">
        <span class="eyebrow_label">YOUR NEXT CHAPTER</span>
        <h2 style="margin-top:15px">{job.title}</h2>
        <p>{get_company(job.company).name}</p>
        <dl class="facts_list">
          <div>
            <dt>Location</dt>
            <dd>{job.location}</dd>
          </div>
          <div>
            <dt>Workplace</dt>
            <dd>{job.mode}</dd>
          </div>
          <div>
            <dt>Job type</dt>
            <dd>{job.type}</dd>
          </div>
        </dl>
        <p class="workspace_hint">
          Your résumé is intended for this employer’s application review. It
          does not change your public résumé preference.
        </p>
      </aside>
    </form>{/if}
</main>
