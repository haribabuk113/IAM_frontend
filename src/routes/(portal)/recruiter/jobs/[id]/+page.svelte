<script>
  import { page } from "$app/stores";
  import {
    recruitment_jobs,
    company_records,
  } from "$lib/portal/workspace_state.js";
  import { render_markdown } from "$lib/portal/markdown.js";
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import { location_name } from "$lib/portal/filter_options.js";
  $: job = $recruitment_jobs.find((j) => j.id === $page.params.id);
</script>

<svelte:head
  ><title>{job?.title || "Job preview"} — Referise</title></svelte:head
>
<main id="main-content" class="workspace portal_container">
  {#if job}<Heading
      eyebrow="YOUR JOB PREVIEW"
      title={job.title || "Untitled draft"}
      description={job.company_name ||
        $company_records.find((c) => c.id === job.company)?.name ||
        "Confidential"}
    /><Notice
      text="Saved locally · This is not a published or shareable live job."
    />
    <div class="workspace_grid">
      <section class="workspace_panel">
        <h2>About the role</h2>
        <div class="job_preview_description">
          {@html render_markdown(
            job.description ||
              job.summary ||
              "Add a description to bring this role to life.",
          )}
        </div>
        <h3>Required skills</h3>
        <div class="filter_chips">
          {#each job.skills as skill}<span class="workspace_badge">{skill}</span
            >{/each}
        </div>
        <div class="workspace_actions">
          <a
            class="button button_dark"
            href={`/recruiter/post-job?edit=${job.id}`}>Edit job</a
          ><a class="button button_outline" href="/recruiter/jobs"
            >Manage jobs</a
          >
        </div>
      </section>
      <aside class="workspace_panel">
        <h2>The details</h2>
        <dl class="facts_list">
          {#each [["Status", job.status], ["Visibility", job.unlisted ? "Direct link only" : "Public after publishing"], ["Salary", job.salary_hidden ? "Competitive" : `${job.currency} ${job.salary_max || "—"} / year`], ["Workplace", (job.modes || [job.mode]).join(", ")], ["Locations", (job.locations || [])
                .map(location_name)
                .join(", ")], ["Experience", `${job.min_experience || 0}+ years`], ["Interview rounds", job.rounds ?? "—"]] as [key, value]}<div
            >
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>{/each}
        </dl>
      </aside>
    </div>{:else}<Empty
      title="This draft isn’t in this browser."
      text="Local drafts are available only on the device where they were created."
      ><a class="button button_dark" href="/recruiter/jobs">Back to your jobs</a
      ></Empty
    >{/if}
</main>
