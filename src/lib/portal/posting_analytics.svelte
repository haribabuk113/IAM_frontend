<script>
  let period = 90;
  const records = [
    {
      age: 12,
      tier: "Free",
      posts: 2,
      views: 184,
      applications: 22,
      matched_views: 0,
      matched_applications: 0,
    },
    {
      age: 42,
      tier: "Premium",
      posts: 3,
      views: 620,
      applications: 64,
      matched_views: 384,
      matched_applications: 48,
    },
    {
      age: 105,
      tier: "Free",
      posts: 1,
      views: 96,
      applications: 9,
      matched_views: 0,
      matched_applications: 0,
    },
    {
      age: 150,
      tier: "Premium",
      posts: 2,
      views: 310,
      applications: 32,
      matched_views: 202,
      matched_applications: 25,
    },
  ];
  $: totals = ["Free", "Premium"].map((tier) =>
    records
      .filter((r) => r.tier === tier && r.age <= period)
      .reduce(
        (sum, r) => ({
          ...sum,
          posts: sum.posts + r.posts,
          views: sum.views + r.views,
          applications: sum.applications + r.applications,
          matched_views: sum.matched_views + r.matched_views,
          matched_applications:
            sum.matched_applications + r.matched_applications,
        }),
        {
          tier,
          posts: 0,
          views: 0,
          applications: 0,
          matched_views: 0,
          matched_applications: 0,
        },
      ),
  );
</script>

<section class="profile_section">
  <div class="profile_section_heading">
    <h2>Open doors. New connections.</h2>
    <label class="field_label"
      ><span class="sr_only">Job analytics period</span><select
        class="field_input"
        bind:value={period}
        ><option value={90}>Past 90 days</option><option value={180}
          >Past 6 months</option
        ></select
      ></label
    >
  </div>
  <p class="small_text">
    Illustrative posting analytics · Public aggregate totals, with no applicant
    identities.
  </p>
  <div class="posting_analytics_grid">
    {#each totals as row}<article class:premium={row.tier === "Premium"}>
        <h3>{row.tier} listings</h3>
        <dl>
          <div>
            <dt>Jobs posted</dt>
            <dd>{row.posts}</dd>
          </div>
          <div>
            <dt>Listing views</dt>
            <dd>{row.views}</dd>
          </div>
          <div>
            <dt>Applications</dt>
            <dd>{row.applications}</dd>
          </div>
          <div>
            <dt>View-to-application rate</dt>
            <dd>
              {row.views
                ? ((100 * row.applications) / row.views).toFixed(1)
                : 0}%
            </dd>
          </div>
          {#if row.tier === "Premium"}<div>
              <dt>Views from 70%+ matches</dt>
              <dd>{row.matched_views}</dd>
            </div>
            <div>
              <dt>Applications with 70%+ match</dt>
              <dd>{row.matched_applications}</dd>
            </div>{/if}
        </dl>
      </article>{/each}
  </div>
</section>
