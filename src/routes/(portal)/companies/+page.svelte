<script>
  import { page } from "$app/stores";
  import Heading from "$lib/portal/page_heading.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  import Icon from "$lib/portal/icon.svelte";
  import Company_logo from "$lib/portal/company_logo.svelte";
  import { company_records } from "$lib/portal/workspace_state.js";
  let query = $page.url.searchParams.get("q") || "";
  let location = $page.url.searchParams.get("location") || "";
  let applied_query = query;
  let applied_location = location;
  $: results = $company_records.filter(
    (c) =>
      `${c.name} ${c.sector} ${c.domains}`
        .toLowerCase()
        .includes(applied_query.toLowerCase()) &&
      c.location.toLowerCase().includes(applied_location.toLowerCase()),
  );
</script>

<svelte:head><title>Explore companies — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="FIND YOUR PEOPLE"
    title="Good things happen"
    accent="with the right team."
    description="Get to know the people, purpose and culture behind a company."
    companion="sage"
  />
  <Notice />
  <form
    class="workspace_toolbar"
    on:submit|preventDefault={() => {
      applied_query = query;
      applied_location = location;
    }}
  >
    <input
      aria-label="Company name or industry"
      placeholder="Company name or industry"
      bind:value={query}
    /><input
      aria-label="Company location"
      placeholder="City or country"
      bind:value={location}
    /><button class="button button_dark"
      >Find companies <Icon name="arrow-right" size={16} /></button
    >
  </form>
  <div class="panel_heading">
    <h2>{results.length} teams to explore</h2>
    <a href="/company/create">Create your company page ↗</a>
  </div>
  {#if results.length}<div class="workspace_tiles">
      {#each results as company}<a
          class="directory_card"
          href={`/company/${company.id}`}
          ><Company_logo id={company.id} size={48} />
          <div>
            <h2>{company.name}</h2>
            <p>{company.tagline}</p>
          </div>
          <span class="workspace_badge">{company.sector}</span>
          <p>{company.description}</p>
          <div class="card_bottom">
            <span>{company.location} · {company.size}</span><Icon
              name="arrow-up-right"
              size={20}
            />
          </div></a
        >{/each}
    </div>{:else}<Empty
      title="A team worth finding."
      text="No companies match this search. Try a different name or location."
      ><button
        class="button button_dark"
        on:click={() => {
          query = "";
          location = "";
          applied_query = "";
          applied_location = "";
        }}>Clear search</button
      ></Empty
    >{/if}
</main>
