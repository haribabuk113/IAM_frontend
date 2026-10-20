<script>
  import Modal from "./modal.svelte";
  import {
    preview_account,
    membership_settings,
    membership_open,
    premium_active,
    applications_remaining,
    buy_preview_premium,
  } from "./membership_state.js";
  import { premium_quote } from "./membership_rules.js";
  import { toast } from "./state.js";
  let days = 2;
  let method = "credits";
  let top_up = false;
  let credits = 500;
  $: quote = premium_quote(days, $membership_settings);
  $: money = new Intl.NumberFormat("en", {
    style: "currency",
    currency: $membership_settings.currency,
  });
  function purchase() {
    if (buy_preview_premium(days)) {
      toast(
        "Premium activated in this browser’s preview. No payment was made.",
      );
      membership_open.set(false);
    }
  }
</script>

<Modal
  title="A little more possibility."
  on:close={() => membership_open.set(false)}
>
  <p class="membership_disclosure">
    Membership preview · No real credits or payments. Live balances and
    purchases need the billing service.
  </p>
  <div class="membership_balance">
    <div>
      <small>Available credits</small><strong>{$preview_account.credits}</strong
      >
    </div>
    <div>
      <small>Applications today</small><strong
        >{$premium_active ? "Unlimited" : $applications_remaining}</strong
      >
    </div>
  </div>
  {#if $premium_active}<p class="premium_status">
      Premium preview active until {new Date(
        $preview_account.premium_until,
      ).toLocaleDateString()}.
    </p>{/if}
  <p>
    Unlimited applications, advanced matching and a gold profile border for the
    days you need.
  </p>
  <form on:submit|preventDefault={purchase} class="membership_form">
    <div class="duration_choices">
      {#each [1, 2, 30, 60, 90] as duration}<button
          type="button"
          class:active={days === duration}
          on:click={() => (days = duration)}>{duration} days</button
        >{/each}
    </div>
    <label class="field_label"
      >Your duration<input
        class="field_input"
        type="number"
        min="1"
        max="3650"
        step="1"
        required
        bind:value={days}
      /></label
    >
    <small
      >{money.format($membership_settings.day_price)} per day · {money.format(
        $membership_settings.month_price,
      )} per 30 days. Full months use the monthly price; remaining days use the daily
      price.</small
    >
    <div class="filter_chips">
      <label
        ><input type="radio" bind:group={method} value="credits" />Use credits</label
      ><label
        ><input type="radio" bind:group={method} value="gateway" />Pay directly</label
      >
    </div>
    {#if quote}<div class="membership_quote">
        <span>{quote.days} days of premium</span><strong
          >{money.format(quote.price)} / {quote.credits} credits</strong
        >
      </div>{:else}<p role="alert">
        Enter a whole number of days between 1 and 3,650.
      </p>{/if}
    {#if method === "credits"}<button
        class="button button_blue"
        disabled={!quote || quote.credits > $preview_account.credits}
        >Confirm preview purchase</button
      >
      {#if quote && quote.credits > $preview_account.credits}<p role="status">
          You need {quote.credits - $preview_account.credits} more credits.
        </p>{/if}
    {:else}<p class="workspace_hint">
        Payment gateway not connected. No money can be collected from this
        preview.
      </p>
      <button class="button button_outline" type="button" disabled
        >Checkout unavailable</button
      >{/if}
  </form>
  <button class="text_link" on:click={() => (top_up = !top_up)}
    >Buy credits · preview</button
  >
  {#if top_up}<form
      class="membership_form"
      on:submit|preventDefault={() => {
        preview_account.update((a) => ({
          ...a,
          enabled: true,
          credits: a.credits + Number(credits),
        }));
        top_up = false;
        toast("Sample credits added. No charge was made.");
      }}
    >
      <label class="field_label"
        >Sample credits<input
          class="field_input"
          type="number"
          min="1"
          max="100000"
          step="1"
          required
          bind:value={credits}
        /></label
      ><span
        >Preview price: {money.format(
          (credits || 0) * $membership_settings.credit_price,
        )}</span
      ><button class="button button_outline">Confirm sample top-up</button>
    </form>{/if}
</Modal>
