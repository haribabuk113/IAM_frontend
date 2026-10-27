<script>
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import Job_card from "$lib/portal/job_card.svelte";
  import { browser } from "$app/environment";
  import { saved_jobs } from "$lib/portal/state.js";
  import { jobs_api, to_card, to_criteria } from "$lib/portal/jobs_api.js";
  import { default_filters } from "$lib/portal/search.js";
  import { location_label, rates } from "$lib/portal/reference.js";
  let query = "";
  let loaded = [];
  let loading = true;
  let load_error = "";
  // Saved ids live in this browser; the jobs come from search, restricted to
  // those ids (closed or expired ones drop out).
  // ponytail: one page of 50, paginate if people save more than that.
  $: if (browser) load($saved_jobs);
  async function load(ids) {
    if (!ids.length) {
      loaded = [];
      loading = false;
      return;
    }
    loading = true;
    const criteria = to_criteria({ ...default_filters(), saved: true }, { rates: $rates, saved: ids, page_size: 50 });
    const result = await jobs_api.search(criteria);
    loading = false;
    load_error = result.ok ? "" : result.error;
    loaded = result.ok ? result.data.jobs.map((j) => to_card(j, $location_label)) : [];
  }
  $: saved = loaded.filter(
    (j) =>
      $saved_jobs.includes(j.id) &&
      j.title.toLowerCase().includes(query.toLowerCase()),
  );
</script>

<svelte:head><title>Saved jobs — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="KEEP THE POSSIBILITIES CLOSE"
    title="Your next chapter,"
    accent="on the shortlist."
    description="A space for the roles that caught your eye. Come back when you’re ready."
    companion="blue"
  /><Notice text="Saved jobs are kept in this browser." />
  <div class="workspace_toolbar">
    <input
      aria-label="Search saved jobs"
      placeholder="Search your saved roles"
      bind:value={query}
    /><a class="button button_outline" href="/jobs">Explore more jobs ↗</a>
  </div>
  {#if load_error}<p class="auth_alert" role="alert">{load_error}</p>{/if}
  {#if saved.length}<div class="results_jobs grid_view">
      {#each saved as job (job.id)}<Job_card {job} />{/each}
    </div>{:else if loading}<p class="form_helper">Loading your saved roles…</p>{:else}<Empty
      title={$saved_jobs.length && query
        ? "No saved roles match this search."
        : $saved_jobs.length
          ? "Your saved roles are no longer open."
          : "A good opportunity is worth keeping."}
      text={$saved_jobs.length && query
        ? "Try another job title."
        : "Tap the bookmark on any role to keep it here."}
      ><a class="button button_dark" href="/jobs">Find your next role ↗</a
      ></Empty
    >{/if}
</main>
