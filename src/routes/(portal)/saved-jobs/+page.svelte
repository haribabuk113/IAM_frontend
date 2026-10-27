<script>
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import Job_card from "$lib/portal/job_card.svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { saved_jobs, saved_applied, unsave_jobs, clear_applied_saved } from "$lib/portal/state.js";
  import { jobs_api, to_card, to_criteria } from "$lib/portal/jobs_api.js";
  import { default_filters } from "$lib/portal/search.js";
  import { location_label, rates } from "$lib/portal/reference.js";
  let query = "";
  let loaded = [];
  let loading = true;
  let load_error = "";
  let selected = [];
  // Saved ids come from your account (signed in) or this browser; the job
  // cards come from search, restricted to those ids (closed or expired ones
  // drop out). Manual: most recently saved first, no filters or sort.
  // ponytail: one page of 50, paginate if people save more than that.
  $: if (browser) load($saved_jobs);
  async function load(ids) {
    selected = selected.filter((id) => ids.includes(id));
    if (!ids.length) {
      loaded = [];
      loading = false;
      return;
    }
    // Only fetch when a saved id isn't already loaded (unsaving needs no request).
    if (ids.every((id) => loaded.some((j) => j.id === id))) return;
    loading = true;
    const criteria = to_criteria({ ...default_filters(), saved: true }, { rates: $rates, saved: ids, page_size: 50 });
    const result = await jobs_api.search(criteria);
    loading = false;
    load_error = result.ok ? "" : result.error;
    loaded = result.ok ? result.data.jobs.map((j) => to_card(j, $location_label)) : [];
  }
  $: order = new Map($saved_jobs.map((id, i) => [id, i]));
  $: saved = loaded
    .filter((j) => order.has(j.id) && j.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => order.get(a.id) - order.get(b.id));
  $: all_selected = saved.length > 0 && saved.every((j) => selected.includes(j.id));
  $: signed_in = !!$page.data.user;
</script>

<svelte:head><title>Saved jobs — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="KEEP THE POSSIBILITIES CLOSE"
    title="Your next chapter,"
    accent="on the shortlist."
    description="A space for the roles that caught your eye. Come back when you’re ready."
    companion="blue"
  />{#if !signed_in}<Notice text="Saved in this browser. Sign in to keep them on every device." />{/if}
  <div class="workspace_toolbar">
    <input aria-label="Search saved jobs" placeholder="Search your saved roles" bind:value={query} />
    {#if signed_in}<button
        class="button button_outline"
        disabled={!$saved_applied.length}
        title={$saved_applied.length ? "" : "None of your saved jobs have applications yet."}
        on:click={clear_applied_saved}
        >Clear applied jobs{$saved_applied.length ? ` (${$saved_applied.length})` : ""}</button
      >{/if}<a class="button button_outline" href="/jobs">Explore more jobs ↗</a>
  </div>
  {#if saved.length}<div class="saved_bulk_bar">
      <label class="filter_checkbox"
        ><input
          type="checkbox"
          checked={all_selected}
          on:change={(e) => (selected = e.currentTarget.checked ? saved.map((j) => j.id) : [])}
        />Select all</label
      >
      <button
        class="button button_outline button_small"
        disabled={!selected.length}
        on:click={() => {
          unsave_jobs(selected);
          selected = [];
        }}>Unsave selected{selected.length ? ` (${selected.length})` : ""}</button
      >
    </div>{/if}
  {#if load_error}<p class="auth_alert" role="alert">{load_error}</p>{/if}
  {#if saved.length}<div class="results_jobs grid_view">
      {#each saved as job (job.id)}<div class="saved_job">
          <label class="filter_checkbox saved_job_select"
            ><input type="checkbox" value={job.id} bind:group={selected} />Select {job.title}</label
          >
          <Job_card {job} />
        </div>{/each}
    </div>{:else if loading}<p class="form_helper">Loading your saved roles…</p>{:else}<Empty
      title={$saved_jobs.length && query
        ? "No saved roles match this search."
        : $saved_jobs.length
          ? "Your saved roles are no longer open."
          : "A good opportunity is worth keeping."}
      text={$saved_jobs.length && query ? "Try another job title." : "Tap the bookmark on any role to keep it here."}
      ><a class="button button_dark" href="/jobs">Find your next role ↗</a></Empty
    >{/if}
</main>

<style>
  .saved_bulk_bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 0 16px;
  }
  .saved_job {
    display: grid;
    gap: 6px;
  }
  .saved_job_select {
    font-size: 12px;
  }
</style>
