<script>
  import { membership_settings } from "./membership_state.js";
  import { premium_filter_options } from "./membership_rules.js";
  import { toast } from "./state.js";
  let draft = structuredClone($membership_settings);
</script>

<section class="workspace_panel">
  <h2>Membership & search access</h2>
  <p>
    Sample configuration for this browser. Production pricing and entitlements
    must be enforced by the billing and search APIs.
  </p>
  <form
    class="membership_form"
    on:submit|preventDefault={() => {
      membership_settings.set(structuredClone(draft));
      toast("Preview pricing and premium filters saved.");
    }}
  >
    <div class="form_grid">
      {#each [["daily_free", "Free applications per day"], ["day_price", "Price per day"], ["month_price", "Price per 30 days"], ["credit_price", "Price of one credit"]] as [key, label]}<label
          class="field_label"
          >{label}<input
            class="field_input"
            required
            type="number"
            min={key === "credit_price" ? 0.01 : 0}
            max="1000000"
            step={key === "daily_free" ? 1 : 0.01}
            bind:value={draft[key]}
          /></label
        >{/each}<label class="field_label"
        >Pricing currency<select class="field_input" bind:value={draft.currency}
          ><option>INR</option><option>USD</option><option>EUR</option><option
            >GBP</option
          ></select
        ></label
      >
    </div>
    <fieldset>
      <legend>Require premium for these filters</legend>
      <div class="premium_filter_grid">
        {#each Object.entries(premium_filter_options) as [key, label]}<label
            ><input
              type="checkbox"
              value={key}
              bind:group={draft.premium_filters}
            />{label}</label
          >{/each}
      </div>
    </fieldset>
    <button class="button button_blue">Save preview settings</button>
  </form>
</section>
