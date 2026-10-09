<script>
  import { closed_job_ids } from "$lib/portal/workspace_state.js";
  import { page } from "$app/stores";
  import {
    company_records,
    followed_companies,
    team_members,
    initials,
  } from "$lib/portal/workspace_state.js";
  import { jobs } from "$lib/portal/data.js";
  import { location_name } from "$lib/portal/filter_options.js";
  import { applications } from "$lib/portal/state.js";
  import { filter_jobs, default_filters } from "$lib/portal/search.js";
  import Company_logo from "$lib/portal/company_logo.svelte";
  import Companion from "$lib/portal/companion.svelte";
  import Job_card from "$lib/portal/job_card.svelte";
  import Notice from "$lib/portal/preview_notice.svelte";
  import Empty from "$lib/portal/empty_state.svelte";
  $: company = $company_records.find((c) => c.id === $page.params.slug);
  $: tab = ["overview", "jobs", "culture", "products", "team"].includes(
    $page.url.searchParams.get("tab"),
  )
    ? $page.url.searchParams.get("tab")
    : "overview";
  let filters = default_filters();
  let applied_filters = default_filters();
  $: company_jobs = company
    ? jobs.filter(
        (j) =>
          j.company === company.id &&
          !$closed_job_ids.includes(j.id) &&
          !j.unlisted &&
          j.tier !== "Free" &&
          j.posted <= 30,
      )
    : [];
  $: results = filter_jobs(company_jobs, applied_filters, [], $applications);
  $: members = $team_members.filter(
    (m) => m.company === company?.id && m.status === "Current",
  );
  function follow() {
    followed_companies.update((v) =>
      v.includes(company.id)
        ? v.filter((id) => id !== company.id)
        : [...v, company.id],
    );
  }
</script>

<svelte:head
  ><title>{company?.name || "Company not found"} — Referise</title></svelte:head
>
<main id="main-content" class="workspace portal_container">
  {#if company}<Notice />
    <div class="company_cover">
      {#if company.cover}<img
          class="company_cover_image"
          src={company.cover}
          alt={`${company.name} cover`}
        />{:else}<h2>Different people.<br />Shared possibilities.</h2>
        <span class="company_cover_arch" aria-hidden="true"></span>
        <Companion kind="sage" size={205} />{/if}
    </div>
    <div class="company_identity_panel">
      <div class="person_line">
        <Company_logo id={company.id} size={64} />
        <div>
          <h1>{company.name}</h1>
          <p>{company.tagline}</p>
          <span class="workspace_badge">{company.sector}</span>
          <span class="workspace_badge neutral">{company.location}</span>
        </div>
      </div>
      <div class="workspace_actions">
        <button
          class="button button_dark"
          aria-pressed={$followed_companies.includes(company.id)}
          on:click={follow}
          >{$followed_companies.includes(company.id)
            ? "Following ✓"
            : "Follow company +"}</button
        >{#if company.website}<a
            class="button button_outline"
            href={company.website}
            target="_blank"
            rel="noreferrer">Website ↗</a
          >{/if}
      </div>
    </div>
    <nav class="workspace_tabs company_page_tabs" aria-label="Company sections">
      {#each [["overview", "Overview"], ["jobs", "Jobs"], ["culture", "Culture & benefits"], ["products", "Products"], ["team", "Team"]] as [key, label]}<a
          class:active={tab === key}
          aria-current={tab === key ? "page" : undefined}
          href={`?tab=${key}`}>{label}</a
        >{/each}<a href={`/company/${company.id}/dashboard`}>Manage company ↗</a
      >
    </nav>
    {#if tab === "jobs"}<form
        class="workspace_toolbar"
        on:submit|preventDefault={() =>
          (applied_filters = structuredClone(filters))}
      >
        <input
          aria-label="Search company jobs"
          placeholder={`Search roles at ${company.name}`}
          bind:value={filters.query}
        /><select
          aria-label="Workplace"
          value={filters.modes[0] || ""}
          on:change={(e) =>
            (filters.modes = e.currentTarget.value
              ? [e.currentTarget.value]
              : [])}
          ><option value="">Any workplace</option><option>Remote</option><option
            >Hybrid</option
          ><option>On-site</option></select
        ><select
          aria-label="Job type"
          value={filters.types[0] || ""}
          on:change={(e) =>
            (filters.types = e.currentTarget.value
              ? [e.currentTarget.value]
              : [])}
          ><option value="">Any job type</option><option>Full-time</option
          ><option>Part-time</option><option>Contract</option><option
            >Internship</option
          ></select
        ><select aria-label="Sort company jobs" bind:value={filters.sort}
          ><option value="newest">Most recent</option><option value="salary"
            >Highest salary</option
          ></select
        ><button class="button button_dark">Search</button>
        <details class="company_job_options filter_disclosure">
          <summary>Location, experience & salary</summary>
          <div class="form_grid workspace_form">
            <label class="field_label"
              >Location<input
                class="field_input"
                bind:value={filters.location}
                placeholder="City or country"
              /></label
            ><label class="field_label"
              >Experience (years)<input
                class="field_input"
                type="number"
                min="0"
                max="99"
                step="1"
                bind:value={filters.min_experience}
              /></label
            ><label class="field_label"
              >Currency<select class="field_input" bind:value={filters.currency}
                ><option>INR</option><option>USD</option><option>GBP</option
                ><option>EUR</option></select
              ></label
            ><label class="field_label"
              >Minimum annual salary<input
                class="field_input"
                type="number"
                min="0"
                bind:value={filters.min_salary}
              /></label
            >
          </div>
          <p class="work_note">Apply these options with Search.</p>
        </details>
      </form>
      <p class="work_note">{results.length} sample roles at {company.name}</p>
      {#if results.length}<div class="results_jobs grid_view">
          {#each results as job}<Job_card {job} />{/each}
        </div>{:else}<Empty
          title={company_jobs.length
            ? "No roles match these filters."
            : "A little quiet here, for now."}
          text={company_jobs.length
            ? "Try a broader search within this company."
            : `${company.name} has no current openings in this preview.`}
          ><button
            class="button button_outline"
            on:click={() => {
              filters = default_filters();
              applied_filters = default_filters();
            }}>Clear filters</button
          ></Empty
        >{/if}
    {:else if tab === "team"}<div class="workspace_panel">
        <div class="panel_heading">
          <h2>The people behind {company.name}</h2>
          <span class="workspace_badge">Sample team</span>
        </div>
        {#if members.length}<div class="workspace_tiles">
            {#each members as member}<div class="directory_card">
                <span class="person_initials">{initials(member.name)}</span>
                <h3>{member.name}</h3>
                <p>{member.title}</p>
                <span class="workspace_badge neutral">{member.department}</span>
              </div>{/each}
          </div>{:else}<Empty
            title="Meet the team, soon."
            text="Public team profiles have not been added yet."
          />{/if}
      </div>
    {:else}<div class="workspace_grid">
        <div class="workspace_stack">
          {#if tab === "overview"}<section class="workspace_panel">
              <span class="eyebrow_label">A LITTLE ABOUT US</span>
              <h2 style="margin-top:12px">{company.tagline}</h2>
              <p>{company.description}</p>
            </section>{/if}
          {#if tab === "overview" || tab === "products"}<section
              class="workspace_panel"
            >
              <div class="panel_heading">
                <h2>What we’re building</h2>
                <span class="workspace_badge neutral">Products & services</span>
              </div>
              {#each company.products || [] as product}<div
                  class="workspace_hint"
                >
                  {#if product.image}<img
                      class="product_image"
                      src={product.image}
                      alt={product.name}
                    />{/if}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  {#if product.url}<a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer">Explore product ↗</a
                    >{/if}
                </div>{:else}<p>No products added yet.</p>{/each}
            </section>{/if}
          {#if tab === "overview" || tab === "culture"}<section
              class="workspace_panel"
            >
              <h2>Room to do your best work.</h2>
              <div class="workspace_list">
                {#each company.benefits || [] as benefit}<div>
                    <span class="person_initials">✳</span>
                    <div>
                      <strong>{benefit.title}</strong>
                      <p>{benefit.description}</p>
                    </div>
                  </div>{:else}<p>Benefits have not been added yet.</p>{/each}
              </div>
            </section>{/if}
          {#if tab === "overview"}<section class="workspace_panel">
              <h2>Where we work</h2>
              <div class="workspace_hint">
                <strong>{company.location}</strong>
                <p>{company.address || "Headquarters"}</p>
              </div>
              {#if company.branches?.length}<p>
                  Other offices: {company.branches
                    .map(location_name)
                    .join(", ")}
                </p>{/if}
            </section>{/if}
        </div>
        <aside class="workspace_stack">
          <section class="workspace_panel">
            <h2>Company at a glance</h2>
            <dl class="facts_list">
              {#each [["Industry", company.domains || company.sector], ["Team size", company.size], ["Headquarters", company.location], ["Founded", company.founded || "Not provided"]] as [label, value]}<div
                >
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>{/each}
            </dl>
          </section>
          <section class="workspace_panel" style="background:#e6edcf">
            <span class="eyebrow_label">YOUR NEXT CHAPTER</span>
            <h2 style="margin-top:15px">
              Could this be<br />your kind of team?
            </h2>
            <p>Explore the roles and get a feel for the work.</p>
            <a class="button button_dark" href="?tab=jobs"
              >View company jobs ↗</a
            >
          </section>
          {#if company.linkedin || company.social}<section
              class="workspace_panel"
            >
              <h2>Around the web</h2>
              {#if company.linkedin}<a
                  href={company.linkedin}
                  target="_blank"
                  rel="noreferrer">LinkedIn ↗</a
                >{/if}{#if company.social}<p>
                  <a href={company.social} target="_blank" rel="noreferrer"
                    >Company social page ↗</a
                  >
                </p>{/if}
            </section>{/if}
        </aside>
      </div>{/if}
  {:else}<Empty
      title="We couldn’t find this company."
      text="Explore the directory to find the right team."
      ><a href="/companies" class="button button_dark">Explore companies</a
      ></Empty
    >{/if}
</main>
