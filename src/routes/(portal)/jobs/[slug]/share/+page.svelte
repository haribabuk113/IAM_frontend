<script>
  import { page } from "$app/stores";
  import { jobs, get_company } from "$lib/portal/data.js";
  import Heading from "$lib/portal/page_heading.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import { toast } from "$lib/portal/state.js";
  $: job = jobs.find((j) => j.id === $page.params.slug);
  $: url = `${$page.url.origin}/jobs/${$page.params.slug}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Job link copied.");
    } catch {
      toast("Select and copy the link below.");
    }
  }
</script>

<svelte:head><title>Share a job — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="GOOD POSSIBILITIES TRAVEL"
    title="Know someone"
    accent="who would love this?"
    description="A small introduction can lead to a whole new chapter."
    companion="blue"
  />{#if job}<section class="workspace_panel" style="max-width:760px">
      <span class="workspace_badge neutral">Sample opportunity</span>
      <h2 style="margin-top:18px">{job.title}</h2>
      <p>{get_company(job.company).name} · {job.location}</p>
      <label class="field_label"
        >Link to this role<input
          class="field_input"
          readonly
          value={url}
          on:focus={(e) => e.currentTarget.select()}
        /></label
      >
      <div class="workspace_actions">
        <button class="button button_dark" on:click={copy}>Copy link</button><a
          class="button button_outline"
          href={`mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(url)}`}
          >Open email draft ↗</a
        ><a class="button button_outline" href={`/jobs/${job.id}`}
          >Back to role</a
        >
      </div>
    </section>{:else}<Empty
      title="This role could not be found."
      text="Choose a role from job search to share it."
    />{/if}
</main>
