<script>
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import Company_logo from "$lib/portal/company_logo.svelte";
  import Modal from "$lib/portal/modal.svelte";
  import { applications } from "$lib/portal/state.js";
  import { jobs, get_company } from "$lib/portal/data.js";
  let detail = null;
  $: applied = jobs.filter((j) => $applications.includes(j.id));
</script>

<svelte:head><title>Your applications — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="EVERY NEXT STEP, IN ONE PLACE"
    title="You made"
    accent="the first move."
    description="Keep track of the roles you’ve applied for and what happens next."
  /><Notice
    text="Preview applications are saved locally. Nothing is sent to employers."
  />
  {#if applied.length}<section class="workspace_panel">
      <div class="panel_heading">
        <h2>Your applications</h2>
        <span class="workspace_badge">{applied.length} saved previews</span>
      </div>
      <div class="workspace_list">
        {#each applied as job}<div>
            <Company_logo id={job.company} size={46} />
            <div class="list_body">
              <strong><a href={`/jobs/${job.id}`}>{job.title}</a></strong>
              <p>{get_company(job.company).name} · {job.location}</p>
            </div>
            <span class="workspace_badge neutral">Preview submitted</span
            ><button
              class="button button_outline button_small"
              on:click={() => (detail = job)}>View status</button
            >
          </div>{/each}
      </div>
    </section>{:else}<Empty
      title="Your next move starts here."
      text="Once you apply to a role, you can follow its progress from this page."
      ><a class="button button_dark" href="/jobs">Explore opportunities ↗</a
      ></Empty
    >{/if}
</main>
{#if detail}<Modal
    title="Your application journey"
    on:close={() => (detail = null)}
    ><h3>{detail.title}</h3>
    <div class="workspace_list">
      <div>
        <span class="workspace_badge green">01</span>
        <div>
          <strong>Application preview saved</strong>
          <p>Saved in this browser for review.</p>
        </div>
      </div>
      <div>
        <span class="workspace_badge neutral">02</span>
        <div>
          <strong>Employer review</strong>
          <p>Awaiting the live application service.</p>
        </div>
      </div>
      <div>
        <span class="workspace_badge neutral">03</span>
        <div>
          <strong>Next steps</strong>
          <p>Interview invitations and hiring updates will appear here.</p>
        </div>
      </div>
    </div></Modal
  >{/if}
