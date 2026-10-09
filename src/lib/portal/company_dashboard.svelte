<script>
  import { page } from "$app/stores";
  import {
    company_records,
    team_members,
    recruitment_jobs,
    wallet_transactions,
    preview_role,
    inr,
    initials,
    download_csv,
  } from "./workspace_state.js";
  import { toast, profile } from "./state.js";
  import Heading from "./page_heading.svelte";
  import Notice from "./preview_notice.svelte";
  import Empty from "./empty_state.svelte";
  import Icon from "./icon.svelte";
  import Modal from "./modal.svelte";
  export let section = "overview";
  let member_tab = "Current";
  let member_query = "";
  let editing_member = null;
  let limit = 0;
  let cap_type = "Monthly";
  let role = "Employee";
  let action_error = "";
  let topup = false;
  let amount = 5000;
  let payment_review = false;
  let offboard_member = null;
  let invite = false;
  let invite_email = "";
  let invite_role = "HR / Recruiter";
  let invite_saved = false;
  let date_range = "7";
  $: company = $company_records.find((c) => c.id === $page.params.slug);
  $: base = `/company/${$page.params.slug}/dashboard`;
  $: members = $team_members.filter((m) => m.company === $page.params.slug);
  $: current = members.filter((m) => m.status === "Current");
  $: pending = members.filter((m) => m.status === "Pending");
  $: filtered_members = members.filter(
    (m) =>
      m.status === member_tab &&
      `${m.name} ${m.title}`.toLowerCase().includes(member_query.toLowerCase()),
  );
  $: company_jobs = $recruitment_jobs.filter(
    (j) => j.company === $page.params.slug,
  );
  $: ledger = $page.params.slug === "forma" ? $wallet_transactions : [];
  $: wallet = ledger.reduce((sum, t) => sum + t.amount, 0);
  $: spent = -ledger
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  $: allocated = current.reduce(
    (sum, m) => sum + Math.max(0, m.limit - m.spent),
    0,
  );
  $: admins = current.filter((m) => m.role === "Company Admin");
  $: tabs = [
    ["overview", "Overview", "grid", base],
    ["employees", "Employees", "users", `${base}/employees`],
    ["analytics", "Analytics", "chart", `${base}/analytics`],
    ["hierarchy", "Workforce", "building", `${base}/hierarchy`],
    ["wallet", "Wallet & billing", "money", `${base}/wallet`],
  ];
  function review_member(member) {
    editing_member = member;
    limit = member.limit;
    cap_type = member.cap_type;
    role = member.role;
    action_error = "";
  }
  function save_member() {
    if (
      role !== "Company Admin" &&
      editing_member.role === "Company Admin" &&
      admins.length === 1
    ) {
      action_error =
        "Assign another company admin before changing the sole admin’s role.";
      return;
    }
    if (!Number.isFinite(limit) || limit < editing_member.spent) {
      action_error = "The limit cannot be lower than the amount already spent.";
      return;
    }
    if (
      limit - editing_member.spent >
      Math.max(
        0,
        wallet -
          allocated +
          Math.max(0, editing_member.limit - editing_member.spent),
      )
    ) {
      action_error = "This limit exceeds the unallocated wallet balance.";
      return;
    }
    team_members.update((items) =>
      items.map((m) =>
        m.id === editing_member.id ? { ...m, limit, cap_type, role } : m,
      ),
    );
    editing_member = null;
    toast("Team permissions and budget updated in this preview.");
  }
  function claim(member, status) {
    if (member.signature) {
      const e = $profile.experiences[member.profile_entry];
      if (
        !e ||
        member.signature !==
          JSON.stringify([
            e.company,
            e.title,
            e.type,
            e.start,
            e.end,
            e.current,
            e.description,
          ])
      ) {
        toast(
          "This experience changed. Ask the candidate to request a fresh review.",
        );
        return;
      }
    }
    if (member.profile_entry !== undefined)
      profile.update((p) => ({
        ...p,
        experiences: p.experiences.map((entry, i) =>
          i === member.profile_entry
            ? {
                ...entry,
                verification: status === "Current" ? "Verified" : "Rejected",
              }
            : entry,
        ),
      }));
    team_members.update((items) =>
      items.map((m) => (m.id === member.id ? { ...m, status, limit: 0 } : m)),
    );
    toast(
      `Employment claim ${status === "Current" ? "approved" : "rejected"} in this preview. No notification sent.`,
    );
  }
  function offboard() {
    if (offboard_member.role === "Company Admin" && admins.length === 1) {
      action_error =
        "The sole admin must appoint another admin before leaving.";
      return;
    }
    team_members.update((items) =>
      items.map((m) =>
        m.id === offboard_member.id ? { ...m, status: "Past", limit: 0 } : m,
      ),
    );
    offboard_member = null;
    toast("Member moved to past employees. Unused allocation released.");
  }
  function export_ledger() {
    download_csv(
      "referise-preview-transactions.csv",
      ["Date", "Action", "By", "Amount (INR)", "Reference"],
      ledger.map((t) => [t.date, t.type, t.by, t.amount, t.reference]),
    );
  }
</script>

<svelte:head
  ><title>{company?.name || "Company"} · {section} — Referise</title
  ></svelte:head
>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow={`${company?.name || "YOUR COMPANY"} / WORKSPACE`}
    title={section === "overview"
      ? "A little clarity."
      : section === "employees"
        ? "Good people."
        : section === "analytics"
          ? "See the bigger"
          : section === "hierarchy"
            ? "Every person."
            : "Make every"}
    accent={section === "overview"
      ? "A stronger team."
      : section === "employees"
        ? "All together."
        : section === "analytics"
          ? "picture."
          : section === "hierarchy"
            ? "A place to grow."
            : "hire count."}
    description={section === "overview"
      ? "Your people, hiring and company budget, in one considered space."
      : section === "employees"
        ? "Review employment claims, manage your team and keep budgets clear."
        : section === "analytics"
          ? "Understand how people discover your company and move through hiring."
          : section === "hierarchy"
            ? "A simple view of your organisation and the people behind the work."
            : "Keep track of company credits, recruiter allowances and every transaction."}
    companion="sage"
  />
  <Notice
    text="Company admin design preview · Sample records and local actions only."
  />
  <div class="workspace_shell">
    <aside class="workspace_sidenav">
      <span>COMPANY WORKSPACE</span>{#each tabs as [key, label, icon, href]}<a
          {href}
          class:active={section === key}
          ><Icon name={icon} size={17} />{label}</a
        >{/each}<span>MAKE YOUR NEXT MOVE</span><a
        href={`/company/${company?.id}`}
        ><Icon name="eye" size={17} />Public company page</a
      ><a href={`/company/${company?.id}/edit`}
        ><Icon name="edit" size={17} />Edit company</a
      ><a href="/recruiter"
        ><Icon name="briefcase" size={17} />Hiring workspace</a
      >
    </aside>
    <div class="workspace_main">
      <div class="panel_heading">
        <span class="workspace_badge"
          >{company?.name || "Company not found"}</span
        ><label class="inline_fields work_note"
          >Preview as <select class="field_input" bind:value={$preview_role}
            ><option>Company Admin</option><option>HR / Recruiter</option
            ><option>Candidate</option></select
          ></label
        >
      </div>
      {#if !company}<Empty
          title="Company not found."
          text="Choose a company from the directory."
        />
      {:else if $preview_role !== "Company Admin"}<Empty
          title="This space belongs to company admins."
          text="Your current preview role cannot manage company funds or employee records."
          ><button
            class="button button_dark"
            on:click={() => preview_role.set("Company Admin")}
            >Preview company admin</button
          ></Empty
        >
      {:else if section === "overview"}
        <div class="stat_grid">
          {#each [[inr(wallet), "Wallet balance", "Available company credits"], [inr(spent), "Spent this month", "Sample October activity"], [company_jobs.filter((j) => j.status === "Active").length, "Active jobs", `${company_jobs.length} total posts`], [current.length, "Current team", `${pending.length} pending claims`]] as [value, label, note], i}<div
              class="stat_card"
              class:featured={i === 0}
            >
              <span>{label}</span><strong>{value}</strong><small>{note}</small>
            </div>{/each}
        </div>
        <div class="workspace_stack">
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>A few things to move forward.</h2>
              <span class="workspace_badge neutral">TODAY’S FOCUS</span>
            </div>
            <div class="workspace_list">
              <a href={`${base}/employees`}
                ><span class="person_initials"
                  ><Icon name="shield" size={20} /></span
                >
                <div class="list_body">
                  <strong>{pending.length} employment claims to review</strong>
                  <p>Help your team’s experience get recognised.</p>
                </div>
                <Icon name="arrow-right" /></a
              ><a href="/recruiter/post-job"
                ><span class="person_initials"
                  ><Icon name="plus" size={20} /></span
                >
                <div class="list_body">
                  <strong>Make room for your next great hire</strong>
                  <p>Create a clear, thoughtful job post.</p>
                </div>
                <Icon name="arrow-right" /></a
              ><a href={`${base}/wallet`}
                ><span class="person_initials"
                  ><Icon name="money" size={20} /></span
                >
                <div class="list_body">
                  <strong>{inr(allocated)} in remaining team allowances</strong>
                  <p>Keep recruiter budgets aligned with your plans.</p>
                </div>
                <Icon name="arrow-right" /></a
              >
            </div>
          </section>
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>Hiring at a glance</h2>
              <a href="/recruiter/jobs">Manage jobs ↗</a>
            </div>
            <div class="stat_grid">
              {#each [[company_jobs.length, "Total posts"], [company_jobs.filter((j) => j.status === "Draft").length, "Drafts"], [company_jobs.filter((j) => j.status === "Closed").length, "Closed"], [company_jobs.reduce((s, j) => s + (j.applicants || 0), 0), "Applications"]] as [value, label]}<div
                  class="stat_card"
                >
                  <span>{label}</span><strong>{value}</strong>
                </div>{/each}
            </div>
            <p class="work_note">
              {admins.length} company admins · {current.filter(
                (m) => m.role === "HR / Recruiter",
              ).length} recruiters
            </p>
          </section>
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>Recent wallet activity</h2>
              <a href={`${base}/wallet`}>Full history ↗</a>
            </div>
            <div class="workspace_table_wrap">
              <table class="workspace_table">
                <thead
                  ><tr
                    ><th>Date</th><th>Activity</th><th>By</th><th>Amount</th
                    ></tr
                  ></thead
                ><tbody
                  >{#each ledger.slice(0, 5) as t}<tr
                      ><td>{t.date}</td><td>{t.type}</td><td>{t.by}</td><td
                        >{t.amount > 0 ? "+" : ""}{inr(t.amount)}</td
                      ></tr
                    >{/each}</tbody
                >
              </table>
            </div>
          </section>
        </div>
      {:else if section === "employees"}
        <nav class="workspace_tabs" aria-label="Employee status">
          {#each ["Current", "Pending", "Past", "Rejected"] as status}<button
              class:active={member_tab === status}
              on:click={() => (member_tab = status)}
              >{status} ({members.filter((m) => m.status === status)
                .length})</button
            >{/each}
        </nav>
        <div class="workspace_toolbar">
          <input
            aria-label="Search team"
            placeholder="Search name or role"
            bind:value={member_query}
          /><button
            class="button button_dark"
            on:click={() => {
              invite = true;
              invite_saved = false;
            }}>Invite HR / admin +</button
          >
        </div>
        <section class="workspace_panel">
          <div class="panel_heading">
            <h2>
              {member_tab === "Pending"
                ? "Employment claims"
                : `${member_tab} employees`}
            </h2>
            <span class="workspace_badge neutral"
              >{filtered_members.length} people</span
            >
          </div>
          {#if filtered_members.length}<div class="workspace_table_wrap">
              <table class="workspace_table">
                <thead
                  ><tr
                    ><th>Person / role</th><th
                      >{member_tab === "Pending"
                        ? "Claimed start"
                        : "Access"}</th
                    ><th>Limit / spent</th><th>Available</th><th>Actions</th
                    ></tr
                  ></thead
                ><tbody
                  >{#each filtered_members as member}<tr
                      ><td
                        ><div class="person_line">
                          <span class="person_initials"
                            >{initials(member.name)}</span
                          >
                          <div>
                            <strong>{member.name}</strong><small
                              >{member.title}</small
                            ><small>{member.email}</small>
                          </div>
                        </div></td
                      ><td
                        >{member_tab === "Pending"
                          ? member.since
                          : member.role}</td
                      ><td
                        >{inr(member.limit)}<small
                          >{inr(member.spent)} spent · {member.cap_type}</small
                        ></td
                      ><td>{inr(Math.max(0, member.limit - member.spent))}</td
                      ><td
                        >{#if member_tab === "Pending"}<button
                            class="text_action"
                            on:click={() => claim(member, "Current")}
                            >Approve</button
                          ><button
                            class="text_action"
                            on:click={() => claim(member, "Rejected")}
                            >Reject</button
                          >{:else if member_tab === "Current"}<button
                            class="text_action"
                            on:click={() => review_member(member)}
                            >Edit role / limit</button
                          ><button
                            class="text_action"
                            on:click={() => {
                              offboard_member = member;
                              action_error = "";
                            }}>Mark as past</button
                          >{:else}<span class="work_note">No active access</span
                          >{/if}</td
                      ></tr
                    >{/each}</tbody
                >
              </table>
            </div>{:else}<Empty
              title="You’re all caught up."
              text="No people in this view match your search."
            />{/if}
          <p class="work_note">
            Employment claims start from a candidate’s career timeline. HR/admin
            invitations are a separate access flow; they do not verify
            employment.
          </p>
        </section>
      {:else if section === "wallet"}
        <div class="stat_grid">
          {#each [[inr(wallet), "Wallet balance"], [inr(spent), "Spent this month"], [inr(allocated), "Remaining allocations"], [inr(Math.max(0, wallet - allocated)), "Unallocated balance"]] as [value, label], i}<div
              class="stat_card"
              class:featured={i === 0}
            >
              <span>{label}</span><strong>{value}</strong><small
                >INR · Sample balance</small
              >
            </div>{/each}
        </div>
        <div class="workspace_stack">
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>Your company wallet</h2>
              <button
                class="button button_dark"
                on:click={() => {
                  topup = true;
                  payment_review = false;
                }}>Top up wallet +</button
              >
            </div>
            <p class="workspace_hint warning">
              Deposited funds are non-refundable and cannot be withdrawn or
              transferred out. Payments are not connected in this preview.
            </p>
          </section>
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>Transaction history</h2>
              <button
                class="button button_outline button_small"
                on:click={export_ledger}>Export CSV ↓</button
              >
            </div>
            <div class="workspace_table_wrap">
              <table class="workspace_table">
                <thead
                  ><tr
                    ><th>Date / reference</th><th>Activity</th><th
                      >Performed by</th
                    ><th>Amount (INR)</th></tr
                  ></thead
                ><tbody
                  >{#each ledger as t}<tr
                      ><td>{t.date}<small>{t.reference}</small></td><td
                        >{t.type}</td
                      ><td>{t.by}</td><td
                        >{t.amount > 0 ? "+" : ""}{inr(t.amount)}</td
                      ></tr
                    >{/each}</tbody
                >
              </table>
            </div>
          </section>
          <section class="workspace_panel">
            <div class="panel_heading">
              <h2>Recruiter spending limits</h2>
              <a href={`${base}/employees`}>Manage team ↗</a>
            </div>
            <div class="workspace_list">
              {#each current.filter((m) => m.role === "HR / Recruiter") as member}<div
                >
                  <span class="person_initials">{initials(member.name)}</span>
                  <div class="list_body">
                    <strong>{member.name}</strong>
                    <p>
                      {inr(member.spent)} of {inr(member.limit)} · {member.cap_type}
                    </p>
                    <div class="budget_meter">
                      <span
                        style:width={`${member.limit ? Math.min(100, (member.spent / member.limit) * 100) : 0}%`}
                      ></span>
                    </div>
                  </div>
                  <button
                    class="button button_outline button_small"
                    on:click={() => review_member(member)}>Modify limit</button
                  >
                </div>{/each}
            </div>
          </section>
        </div>
      {:else if section === "analytics"}
        <div class="workspace_toolbar">
          <span>Company engagement</span><select
            aria-label="Analytics period"
            bind:value={date_range}
            ><option value="7">Last 7 days</option><option value="30"
              >Last 30 days</option
            ></select
          ><button
            class="button button_outline"
            on:click={() =>
              download_csv(
                "company-preview-analytics.csv",
                ["Period", "Views", "Applications"],
                [
                  [
                    "Sample " + date_range + " days",
                    date_range === "7" ? 482 : 1840,
                    date_range === "7" ? 36 : 128,
                  ],
                ],
              )}>Export summary ↓</button
          >
        </div>
        <div class="stat_grid">
          {#each [[date_range === "7" ? "482" : "1,840", "Company views"], [date_range === "7" ? "186" : "723", "Job views"], [date_range === "7" ? "36" : "128", "Applications"], [date_range === "7" ? "18" : "65", "New followers"]] as [value, label]}<div
              class="stat_card"
            >
              <span>{label}</span><strong>{value}</strong><small
                >Illustrative activity</small
              >
            </div>{/each}
        </div>
        <section class="workspace_panel">
          <div class="panel_heading">
            <h2>A week of new possibilities.</h2>
            <span class="workspace_badge neutral">Sample company views</span>
          </div>
          <div
            class="workspace_chart"
            role="img"
            aria-label="Sample company views: Monday 48, Tuesday 62, Wednesday 51, Thursday 89, Friday 104, Saturday 72, Sunday 56"
          >
            {#each [["Mon", 48], ["Tue", 62], ["Wed", 51], ["Thu", 89], ["Fri", 104], ["Sat", 72], ["Sun", 56]] as [day, value]}<div
              >
                <strong>{value}</strong><i
                  style:height={`${(value / 110) * 140}px`}
                ></i><span>{day}</span>
              </div>{/each}
          </div>
          <p class="work_note">
            Chart shows a sample week. Period cards illustrate the selected
            reporting range.
          </p>
        </section>
      {:else if section === "hierarchy"}<section class="workspace_panel">
          <div class="panel_heading">
            <h2>People make the difference.</h2>
            <span class="workspace_badge neutral">Organisational view</span>
          </div>
          <p>
            Departments group the workforce. Company admins share equal platform
            permissions.
          </p>
          <div class="org_tree">
            <div class="org_root">
              <h3>{company.name}</h3>
              <p>{current.length} current team members</p>
              <span class="workspace_badge">{admins.length} company admins</span
              >
            </div>
            <div class="org_branches">
              {#each [...new Set(current.map((m) => m.department))] as department}<div
                >
                  <h3>{department}</h3>
                  {#each current.filter((m) => m.department === department) as member}<p
                    >
                      <strong>{member.name}</strong><br />{member.title}
                    </p>{:else}<p>No linked members yet</p>{/each}
                </div>{/each}
            </div>
          </div>
          <p class="workspace_hint">
            Reporting lines have not been specified in the requirements. This
            view groups approved team members by department without introducing
            extra admin levels.
          </p>
        </section>{/if}
    </div>
  </div>
</main>
{#if editing_member}<Modal
    title={`Manage ${editing_member.name}`}
    on:close={() => (editing_member = null)}
    ><form class="workspace_form" on:submit|preventDefault={save_member}>
      <label class="field_label"
        >Access role<select class="field_input" bind:value={role}
          ><option>Company Admin</option><option>HR / Recruiter</option><option
            >Employee</option
          ></select
        ></label
      ><label class="field_label"
        >Spending cap type<select class="field_input" bind:value={cap_type}
          ><option>Monthly</option><option>Total</option></select
        ></label
      ><label class="field_label"
        >Limit (INR)<input
          class="field_input"
          type="number"
          min={editing_member.spent}
          required
          step="1"
          bind:value={limit}
        /></label
      >
      <p class="form_helper">
        {inr(editing_member.spent)} already spent. New staff begin with ₹0.
      </p>
      {#if action_error}<p role="alert" class="filter_error">
          {action_error}
        </p>{/if}
      <div class="form_actions">
        <button
          type="button"
          class="button button_outline"
          on:click={() => (editing_member = null)}>Cancel</button
        ><button class="button button_dark">Save preview changes</button>
      </div>
    </form></Modal
  >{/if}
{#if offboard_member}<Modal
    title="Move to past employees?"
    on:close={() => (offboard_member = null)}
    ><p>
      {offboard_member.name} will lose company posting access and their remaining
      allowance will be released. Previous spending stays in the ledger.
    </p>
    {#if action_error}<p class="filter_error" role="alert">
        {action_error}
      </p>{/if}
    <div class="form_actions">
      <button
        class="button button_outline"
        on:click={() => (offboard_member = null)}>Keep member</button
      ><button class="button button_dark" on:click={offboard}
        >Confirm in preview</button
      >
    </div></Modal
  >{/if}
{#if topup}<Modal title="Top up company wallet" on:close={() => (topup = false)}
    >{#if payment_review}<div class="workspace_hint">
        <h3>{inr(amount)} top-up review</h3>
        <p>
          The payment gateway will open here when connected. No payment has been
          taken and the sample balance has not changed.
        </p>
      </div>
      <div class="form_actions">
        <button class="button button_dark" on:click={() => (topup = false)}
          >Back to wallet</button
        >
      </div>{:else}<form
        class="workspace_form"
        on:submit|preventDefault={() => (payment_review = true)}
      >
        <label class="field_label"
          >Amount (INR)<input
            class="field_input"
            type="number"
            required
            min="1"
            max="10000000"
            step="1"
            bind:value={amount}
          /></label
        >
        <p class="workspace_hint warning">
          Wallet deposits are non-refundable. Funds cannot be withdrawn or
          transferred.
        </p>
        <button class="button button_dark">Review top-up</button>
      </form>{/if}</Modal
  >{/if}
{#if invite}<Modal title="Invite a teammate" on:close={() => (invite = false)}
    >{#if invite_saved}<p class="workspace_hint">
        Invitation preview prepared for {invite_email}. No email was sent and no
        access was granted.
      </p>
      <button class="button button_dark" on:click={() => (invite = false)}
        >Done</button
      >{:else}<form
        class="workspace_form"
        on:submit|preventDefault={() => (invite_saved = true)}
      >
        <label class="field_label"
          >Work email<input
            class="field_input"
            type="email"
            required
            bind:value={invite_email}
          /></label
        ><label class="field_label"
          >Role<select class="field_input" bind:value={invite_role}
            ><option>HR / Recruiter</option><option>Company Admin</option
            ></select
          ></label
        >
        <p class="form_helper">
          Recruiters start with ₹0 spending allowance. Company admins have equal
          permissions.
        </p>
        <button class="button button_dark">Preview invitation</button>
      </form>{/if}</Modal
  >{/if}
