<script>
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import Job_card from "$lib/portal/job_card.svelte";
  import { saved_jobs } from "$lib/portal/state.js";
  import { jobs } from "$lib/portal/data.js";
  let query = "";
  $: saved = jobs.filter(
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
  /><Notice />
  <div class="workspace_toolbar">
    <input
      aria-label="Search saved jobs"
      placeholder="Search your saved roles"
      bind:value={query}
    /><a class="button button_outline" href="/jobs">Explore more jobs ↗</a>
  </div>
  {#if saved.length}<div class="results_jobs grid_view">
      {#each saved as job}<Job_card {job} />{/each}
    </div>{:else}<Empty
      title={$saved_jobs.length
        ? "No saved roles match this search."
        : "A good opportunity is worth keeping."}
      text={$saved_jobs.length
        ? "Try another job title."
        : "Tap the bookmark on any role to keep it here."}
      ><a class="button button_dark" href="/jobs">Find your next role ↗</a
      ></Empty
    >{/if}
</main>
