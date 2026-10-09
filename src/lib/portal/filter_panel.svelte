<script>
  import Location_picker from "./location_picker.svelte";
  import { notice_periods } from "./filter_options.js";
  import { filter_error } from "./search.js";
  export let filters;
  export let scope = "search";
  function toggle(key, value) {
    filters = {
      ...filters,
      [key]: filters[key].includes(value)
        ? filters[key].filter((item) => item !== value)
        : [...filters[key], value],
    };
  }
</script>

<div class="filter_panel compact_filters" data-scope={scope}>
  {#each [{ key: "modes", title: "Workplace", options: ["Remote", "Hybrid", "On-site"] }, { key: "types", title: "Job type", options: ["Full-time", "Part-time", "Contract", "Gig", "Volunteering", "Advisory", "Others"] }] as group}
    <fieldset>
      <legend>{group.title}</legend>
      <div class="filter_chips">
        {#each group.options as option}<label
            class:chosen={filters[group.key].includes(option)}
            ><input
              type="checkbox"
              checked={filters[group.key].includes(option)}
              on:change={() => toggle(group.key, option)}
            />{option}</label
          >{/each}
      </div>
    </fieldset>
  {/each}
  <div class="filter_pair">
    <label class="field_label"
      >Experience (years)<input
        class="field_input"
        type="number"
        min="0"
        max="99"
        step="1"
        bind:value={filters.min_experience}
        placeholder="Minimum"
      /></label
    ><label class="field_label"
      >Posted within<select
        class="field_input"
        bind:value={filters.posted_within}
        >{#each [1, 3, 9, 15, 30] as days}<option value={days}
            >{days === 1 ? "24 hours" : `${days} days`}</option
          >{/each}</select
      ></label
    >
  </div>
  <details class="filter_disclosure secondary_filters">
    <summary>More filters</summary>
    <label class="filter_checkbox"
      ><input type="checkbox" bind:checked={filters.worldwide} />Worldwide
      remote</label
    >
    <details class="filter_disclosure">
      <summary>Choose locations</summary><Location_picker
        bind:selected={filters.locations}
      />
    </details>
    <fieldset>
      <legend>Annual salary</legend><label class="field_label"
        >Currency<select
          class="field_input"
          bind:value={filters.currency}
          on:change={() => {
            filters.min_salary = 0;
            filters.max_salary = 0;
          }}
          ><option>INR</option><option>USD</option><option>EUR</option><option
            >GBP</option
          ></select
        ></label
      >
      <div class="filter_pair">
        <label class="field_label"
          >From<input
            class="field_input"
            type="number"
            min="0"
            bind:value={filters.min_salary}
          /></label
        ><label class="field_label"
          >To<input
            class="field_input"
            type="number"
            min="0"
            bind:value={filters.max_salary}
          /></label
        >
      </div>
      <small>0 leaves the limit open. Preview exchange rates.</small>
    </fieldset>
    <details class="filter_disclosure">
      <summary>Notice & relocation</summary>
      <fieldset>
        <legend>Notice period</legend>{#each notice_periods as option}<label
            class="filter_checkbox"
            ><input
              type="checkbox"
              checked={filters.notice.includes(option)}
              on:change={() => toggle("notice", option)}
            />{option}</label
          >{/each}
      </fieldset>
      <fieldset>
        <legend>Relocation</legend
        >{#each ["On their own", "Supported locally", "Supported internationally"] as option}<label
            class="filter_checkbox"
            ><input
              type="checkbox"
              checked={filters.relocation.includes(option)}
              on:change={() => toggle("relocation", option)}
            />{option}</label
          >{/each}
      </fieldset>
    </details>
    <label class="field_label"
      >Maximum interview rounds<input
        class="field_input"
        type="number"
        min="0"
        max="20"
        step="1"
        placeholder="Any"
        bind:value={filters.rounds}
      /></label
    >
    <label class="field_label"
      >Listing category<select
        class="field_input"
        value={filters.methods.includes("External")
          ? "External"
          : filters.tiers.includes("Premium")
            ? "Premium"
            : ""}
        on:change={(e) => {
          const value = e.currentTarget.value;
          filters = {
            ...filters,
            tiers: value === "Premium" ? ["Premium"] : [],
            methods: value === "External" ? ["External"] : [],
          };
        }}
        ><option value="">All searchable listings</option><option
          >Premium</option
        ><option>External</option></select
      ><small>Free listings are shared by direct link.</small></label
    >
  </details>
  {#if filter_error(filters)}<p class="filter_error" role="alert">
      {filter_error(filters)}
    </p>{/if}
</div>
