<script>
  import Premium_settings from "./premium_settings.svelte";
  import { keep_active_visible } from "$lib/portal/keep_active_visible.js";
  import { taxonomy_entries } from "./workspace_state.js";
  import { toast } from "./state.js";
  import Heading from "./page_heading.svelte";
  import Notice from "./preview_notice.svelte";
  import Modal from "./modal.svelte";
  let tab = "taxonomy";
  let selected = [];
  let master = "";
  let merge = false;
  let editing = null;
  let edit_name = "";
  let schedule = "05:00";
  let report_status = "Open";
  const reports = [
    {
      id: "r1",
      title: "Sample listing contains an outdated application link",
      type: "Job listing",
      date: "2026-10-08",
    },
    {
      id: "r2",
      title: "Sample company profile needs an ownership review",
      type: "Company",
      date: "2026-10-07",
    },
  ];
  let resolved = [];
  function complete_merge() {
    if (!master.trim()) return;
    if (
      new Set(
        $taxonomy_entries
          .filter((t) => selected.includes(t.id))
          .map((t) => t.kind),
      ).size > 1
    ) {
      toast("Merge skills with skills, or designations with designations.");
      return;
    }
    taxonomy_entries.update((items) =>
      items.map((t) =>
        selected.includes(t.id)
          ? { ...t, status: "Merged", master: master.trim() }
          : t,
      ),
    );
    merge = false;
    selected = [];
    toast(
      "Merge marked in the local preview. No live IDs or profiles changed.",
    );
  }
</script>

<svelte:head><title>Platform admin — Referise</title></svelte:head>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="PLATFORM OPERATIONS"
    title="Keep the details"
    accent="in good hands."
    description="Review the shared data and support a clearer experience for everyone."
    companion="blue"
  /><Notice
    text="Site-admin UI preview · These controls only change sample records. Live admin tools retain their existing access checks."
  />
  <nav
    class="workspace_tabs"
    use:keep_active_visible={tab}
    aria-label="Platform administration"
  >
    {#each [["membership", "Membership & filters"], ["taxonomy", "Skills & designations"], ["reports", "Moderation"], ["currency", "Exchange rates"], ["identity", "Identity & access"]] as [key, label]}<button
        class:active={tab === key}
        on:click={() => (tab = key)}>{label}</button
      >{/each}
  </nav>
  {#if tab === "membership"}<Premium_settings
    />{:else if tab === "taxonomy"}<div class="stat_grid">
      <div class="stat_card featured">
        <span>Pending terms</span><strong
          >{$taxonomy_entries.filter((t) => t.status === "Pending")
            .length}</strong
        ><small>Sample review queue</small>
      </div>
      <div class="stat_card">
        <span>Total usage</span><strong
          >{$taxonomy_entries.reduce((s, t) => s + t.uses, 0)}</strong
        ><small>Sample profiles & listings</small>
      </div>
      <div class="stat_card">
        <span>Asset publishing</span><strong>Preview</strong><small
          >CDN service not connected</small
        >
      </div>
      <div class="stat_card">
        <span>Next step</span><strong>Review</strong><small
          >Approve, edit or merge variants</small
        >
      </div>
    </div>
    <section class="workspace_panel">
      <div class="panel_heading">
        <h2>Make shared terms consistent.</h2>
        <button
          class="button button_dark button_small"
          disabled={selected.length < 2}
          on:click={() => {
            merge = true;
            master = "";
          }}>Merge selected ({selected.length})</button
        >
      </div>
      <div class="workspace_table_wrap">
        <table class="workspace_table">
          <thead
            ><tr
              ><th>Select</th><th>Term</th><th>Type</th><th>Usage</th><th
                >Status</th
              ><th>Actions</th></tr
            ></thead
          ><tbody
            >{#each $taxonomy_entries as term}<tr
                ><td data-label="Select"
                  ><div class="table_cell_value">
                    <input
                      type="checkbox"
                      aria-label={`Select ${term.name}`}
                      value={term.id}
                      bind:group={selected}
                      disabled={term.status !== "Pending"}
                    />
                  </div></td
                ><td data-label="Term"
                  ><div class="table_cell_value">
                    <strong>{term.name}</strong>{#if term.master}<small
                        >Master: {term.master}</small
                      >{/if}
                  </div></td
                ><td data-label="Type"
                  ><div class="table_cell_value">{term.kind}</div></td
                ><td data-label="Usage"
                  ><div class="table_cell_value">{term.uses}</div></td
                ><td data-label="Status"
                  ><div class="table_cell_value">
                    <span class="workspace_badge">{term.status}</span>
                  </div></td
                ><td data-label="Actions"
                  ><div class="table_cell_value">
                    {#if term.status === "Pending"}<button
                        class="text_action"
                        on:click={() =>
                          taxonomy_entries.update((items) =>
                            items.map((t) =>
                              t.id === term.id
                                ? { ...t, status: "Approved" }
                                : t,
                            ),
                          )}>Approve</button
                      ><button
                        class="text_action"
                        on:click={() => {
                          editing = term;
                          edit_name = term.name;
                        }}>Edit</button
                      ><button
                        class="text_action"
                        on:click={() =>
                          taxonomy_entries.update((items) =>
                            items.map((t) =>
                              t.id === term.id
                                ? { ...t, status: "Rejected" }
                                : t,
                            ),
                          )}>Reject</button
                      >{/if}
                  </div></td
                ></tr
              >{/each}</tbody
          >
        </table>
      </div>
      <p class="work_note">
        Live merges will update affected profile/job IDs and regenerate the
        versioned reference assets through the backend.
      </p>
    </section>
  {:else if tab === "reports"}<section class="workspace_panel">
      <div class="panel_heading">
        <h2>Reports to review</h2>
        <select
          class="field_input"
          style="width:auto"
          aria-label="Report status"
          bind:value={report_status}
          ><option>Open</option><option>Resolved</option></select
        >
      </div>
      <div class="workspace_list">
        {#each reports.filter( (r) => (report_status === "Resolved" ? resolved.includes(r.id) : !resolved.includes(r.id)) ) as report}<div
          >
            <div class="list_body">
              <span class="workspace_badge neutral">{report.type}</span>
              <h3 style="margin-top:10px">{report.title}</h3>
              <p>{report.date} · Sample report</p>
            </div>
            <button
              class="button button_outline button_small"
              on:click={() =>
                (resolved = resolved.includes(report.id)
                  ? resolved.filter((id) => id !== report.id)
                  : [...resolved, report.id])}
              >{resolved.includes(report.id)
                ? "Reopen"
                : "Mark resolved"}</button
            >
          </div>{:else}<p>No reports in this view.</p>{/each}
      </div>
    </section>
  {:else if tab === "currency"}<div class="workspace_grid">
      <section class="workspace_panel">
        <h2>Currency reference data</h2>
        <p>
          INR is the baseline. The client uses the daily rates artifact for
          display conversions.
        </p>
        <div class="workspace_table_wrap">
          <table class="workspace_table">
            <thead
              ><tr
                ><th>Currency</th><th>Sample rate to INR</th><th>Source</th></tr
              ></thead
            ><tbody
              >{#each [["INR", 1], ["USD", 85], ["GBP", 110], ["EUR", 95]] as [currency, rate]}<tr
                  ><td data-label="Currency"
                    ><div class="table_cell_value">{currency}</div></td
                  ><td data-label="Sample rate to INR"
                    ><div class="table_cell_value">{rate}</div></td
                  ><td data-label="Source"
                    ><div class="table_cell_value">
                      Illustrative fixture
                    </div></td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>
        <p class="workspace_hint warning">
          These are not live exchange rates. No fetch or publish job is
          connected.
        </p>
      </section>
      <form
        class="workspace_panel workspace_form"
        on:submit|preventDefault={() =>
          toast(
            "Schedule preview saved for this visit. The server cron has not changed.",
          )}
      >
        <h2>Daily update schedule</h2>
        <label class="field_label"
          >Run time · IST<input
            class="field_input"
            type="time"
            required
            bind:value={schedule}
          /></label
        >
        <p>
          After three failed retries, keep the last valid artifact and alert
          administrators.
        </p>
        <button class="button button_dark">Save schedule preview</button>
      </form>
    </div>
  {:else}<section class="workspace_panel">
      <h2>Identity & account administration</h2>
      <p>
        User accounts and authentication providers are managed through the
        existing IAM screens. Those screens require their normal administrator
        access.
      </p>
      <div class="workspace_actions">
        <a class="button button_dark" href="/admin/users">Manage users ↗</a><a
          class="button button_outline"
          href="/admin/providers">Authentication providers ↗</a
        >
      </div>
    </section>{/if}
</main>
{#if merge}<Modal title="Merge term variants" on:close={() => (merge = false)}
    ><form class="workspace_form" on:submit|preventDefault={complete_merge}>
      <p>
        {selected.length} sample entries selected. Choose the canonical name that
        profiles and listings should use.
      </p>
      <label class="field_label"
        >Master term<input
          class="field_input"
          required
          maxlength="100"
          bind:value={master}
        /></label
      >
      <p class="form_helper">
        This preview does not rewrite production records.
      </p>
      <div class="form_actions">
        <button
          type="button"
          class="button button_outline"
          on:click={() => (merge = false)}>Cancel</button
        ><button class="button button_dark">Merge in preview</button>
      </div>
    </form></Modal
  >{/if}
{#if editing}<Modal title="Edit shared term" on:close={() => (editing = null)}
    ><form
      class="workspace_form"
      on:submit|preventDefault={() => {
        taxonomy_entries.update((items) =>
          items.map((t) =>
            t.id === editing.id ? { ...t, name: edit_name.trim() } : t,
          ),
        );
        editing = null;
      }}
    >
      <label class="field_label"
        >Term name<input
          class="field_input"
          required
          maxlength="100"
          bind:value={edit_name}
        /></label
      ><button class="button button_dark">Save preview change</button>
    </form></Modal
  >{/if}
