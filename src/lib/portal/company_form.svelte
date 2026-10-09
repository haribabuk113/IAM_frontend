<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount as on_mount } from "svelte";
  import { get } from "svelte/store";
  import { company_records } from "./workspace_state.js";
  import { toast } from "./state.js";
  import { location_name } from "./filter_options.js";
  import Image_field from "./image_field.svelte";
  import Heading from "./page_heading.svelte";
  import Notice from "./preview_notice.svelte";
  import Location_picker from "./location_picker.svelte";
  export let editing = false;
  let form = {
    name: "",
    id: "",
    tagline: "",
    size: "11–50 people",
    domains: "",
    headquarters: [],
    branches: [],
    address: "",
    description: "",
    website: "",
    linkedin: "",
    social: "",
    founded: "",
    products: [],
    benefits: [],
    logo: "",
    cover: "",
  };
  let error = "";
  let slug_edited = false;
  on_mount(() => {
    if (editing) {
      const found = get(company_records).find(
        (c) => c.id === $page.params.slug,
      );
      if (found) form = structuredClone(found);
    }
  });
  function set_slug() {
    if (!slug_edited && !editing)
      form.id = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
  }
  function move(key, index, direction) {
    const items = [...form[key]];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    form = { ...form, [key]: items };
  }
  function save() {
    error = "";
    const domains = form.domains
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (
      !/^[a-z0-9-]{3,60}$/.test(form.id) ||
      ["admin", "jobs", "login", "create", "dashboard"].includes(form.id)
    ) {
      error = "Choose a link with 3–60 lowercase letters, numbers or hyphens.";
      return;
    }
    if (!editing && $company_records.some((c) => c.id === form.id)) {
      error = "That company link is already used in this preview.";
      return;
    }
    if (
      domains.length < 1 ||
      domains.length > 5 ||
      domains.some((s) => s.length > 25)
    ) {
      error =
        "Add 1–5 industries, up to 25 characters each, separated by commas.";
      return;
    }
    if (form.headquarters.length !== 1) {
      error = "Choose one headquarters city.";
      return;
    }
    const saved = {
      ...form,
      sector: domains[0],
      location: location_name(form.headquarters[0]),
      color: "#3155ef",
      background: "#e9edff",
    };
    company_records.update((items) =>
      editing
        ? items.map((c) => (c.id === saved.id ? saved : c))
        : [saved, ...items],
    );
    toast(
      editing
        ? "Company changes saved in this preview."
        : "Company created in this browser preview.",
    );
    goto(`/company/${saved.id}`);
  }
</script>

<svelte:head
  ><title>{editing ? "Edit company" : "Create a company"} — Referise</title
  ></svelte:head
>
<main id="main-content" class="workspace portal_container">
  <Heading
    eyebrow="MAKE YOUR TEAM KNOWN"
    title={editing ? "A little more" : "Great teams deserve"}
    accent={editing ? "you." : "a place of their own."}
    description="Tell your story, introduce your work and help the right people find you."
    companion="sage"
  /><Notice />
  <form class="workspace_grid workspace_form" on:submit|preventDefault={save}>
    <div class="workspace_stack">
      <section class="workspace_panel">
        <h2>01 / The essentials</h2>
        <div class="form_grid">
          <label class="field_label"
            >Company name *<input
              class="field_input"
              required
              minlength="2"
              maxlength="120"
              bind:value={form.name}
              on:input={set_slug}
            /></label
          ><label class="field_label"
            >Company link *<input
              class="field_input"
              required
              pattern="[a-z0-9-]{(3, 60)}"
              maxlength="60"
              bind:value={form.id}
              readonly={editing}
              on:input={() => (slug_edited = true)}
            /><small>/company/{form.id || "your-company"}</small></label
          ><label class="field_label full"
            >Tagline<input
              class="field_input"
              maxlength="150"
              bind:value={form.tagline}
            /><small>{form.tagline.length}/150</small></label
          ><label class="field_label"
            >Team size *<select class="field_input" bind:value={form.size}
              >{#each ["1–10 people", "11–50 people", "51–200 people", "201–500 people", "501–1,000 people", "1,001–5,000 people", "5,000+ people"] as size}<option
                  >{size}</option
                >{/each}</select
            ></label
          ><label class="field_label"
            >Founded<input
              class="field_input"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              bind:value={form.founded}
            /></label
          ><label class="field_label full"
            >Industries *<input
              class="field_input"
              required
              bind:value={form.domains}
              placeholder="Workplace technology, B2B software"
            /><small>Up to 5, separated by commas. 25 characters each.</small
            ></label
          >
        </div>
      </section>
      <section class="workspace_panel">
        <h2>02 / Places & people</h2>
        <p class="form_caption">
          Choose one headquarters city. Other offices can be added below.
        </p>
        <Location_picker bind:selected={form.headquarters} /><label
          class="field_label"
          >Street address<input
            class="field_input"
            maxlength="250"
            bind:value={form.address}
          /></label
        >
        <details class="filter_disclosure">
          <summary>Branch locations</summary><Location_picker
            bind:selected={form.branches}
          />
        </details>
      </section>
      <section class="workspace_panel">
        <h2>03 / Your story</h2>
        <label class="field_label"
          >About the company<textarea
            class="field_input"
            rows="7"
            maxlength="5000"
            bind:value={form.description}
          ></textarea><small>{form.description.length}/5,000</small></label
        >
        <div class="form_grid">
          <label class="field_label full"
            >Website *<input
              class="field_input"
              type="url"
              required
              pattern="https?://.*"
              placeholder="https://"
              bind:value={form.website}
            /></label
          ><label class="field_label"
            >LinkedIn<input
              class="field_input"
              type="url"
              pattern="https?://.*"
              bind:value={form.linkedin}
            /></label
          ><label class="field_label"
            >Another social or blog link<input
              class="field_input"
              type="url"
              pattern="https?://.*"
              bind:value={form.social}
            /></label
          >
        </div>
      </section>
      <section class="workspace_panel">
        <div class="panel_heading">
          <h2>04 / Products & services</h2>
          <button
            type="button"
            class="button button_outline button_small"
            on:click={() =>
              (form.products = [
                ...form.products,
                { name: "", description: "", url: "", image: "" },
              ])}>Add product +</button
          >
        </div>
        {#each form.products as product, i}<div
            class="workspace_hint"
            style="margin-bottom:15px"
          >
            <label class="field_label"
              >Product name<input
                class="field_input"
                required
                minlength="2"
                maxlength="80"
                bind:value={product.name}
              /></label
            ><label class="field_label"
              >Description<textarea
                class="field_input"
                required
                maxlength="500"
                bind:value={product.description}
              ></textarea></label
            ><Image_field
              label="Product image"
              max_mb={1}
              bind:value={product.image}
            /><label class="field_label"
              >Product link<input
                class="field_input"
                type="url"
                pattern="https?://.*"
                bind:value={product.url}
              /></label
            >
            <div class="workspace_actions">
              <button
                type="button"
                class="button button_outline button_small"
                disabled={i === 0}
                on:click={() => move("products", i, -1)}>Move up</button
              ><button
                type="button"
                class="button button_outline button_small"
                disabled={i === form.products.length - 1}
                on:click={() => move("products", i, 1)}>Move down</button
              ><button
                type="button"
                class="button button_outline button_small"
                on:click={() =>
                  (form.products = form.products.filter((_, n) => n !== i))}
                >Remove</button
              >
            </div>
          </div>{/each}
      </section>
      <section class="workspace_panel">
        <div class="panel_heading">
          <h2>05 / Culture & benefits</h2>
          <button
            type="button"
            class="button button_outline button_small"
            on:click={() =>
              (form.benefits = [
                ...form.benefits,
                { title: "", description: "", icon: "heart" },
              ])}>Add benefit +</button
          >
        </div>
        {#each form.benefits as benefit, i}<div
            class="workspace_hint"
            style="margin-bottom:15px"
          >
            <div class="form_grid">
              <label class="field_label"
                >Benefit title<input
                  class="field_input"
                  required
                  minlength="2"
                  maxlength="60"
                  bind:value={benefit.title}
                /></label
              ><label class="field_label"
                >Icon<select class="field_input" bind:value={benefit.icon}
                  ><option value="heart">Health & care</option><option
                    value="laptop">Workplace</option
                  ><option value="coffee">Lifestyle</option><option
                    value="spark">Learning</option
                  ><option value="money">Financial</option></select
                ></label
              ><label class="field_label full"
                >Details<textarea
                  class="field_input"
                  maxlength="300"
                  bind:value={benefit.description}
                ></textarea></label
              >
            </div>
            <div class="workspace_actions">
              <button
                type="button"
                class="button button_outline button_small"
                disabled={i === 0}
                on:click={() => move("benefits", i, -1)}>Move up</button
              ><button
                type="button"
                class="button button_outline button_small"
                disabled={i === form.benefits.length - 1}
                on:click={() => move("benefits", i, 1)}>Move down</button
              ><button
                type="button"
                class="button button_outline button_small"
                on:click={() =>
                  (form.benefits = form.benefits.filter((_, n) => n !== i))}
                >Remove</button
              >
            </div>
          </div>{/each}
      </section>
    </div>
    <aside class="workspace_stack">
      <section class="workspace_panel">
        <h2>A face for your company</h2>
        <Image_field
          label="Logo"
          max_mb={2}
          bind:value={form.logo}
        /><Image_field
          label="Cover"
          max_mb={5}
          ratio={3}
          bind:value={form.cover}
        />
      </section>
      <section class="workspace_panel">
        <h2>Ready to meet the world?</h2>
        <p>
          You can revisit your details, products and benefits whenever they
          change.
        </p>
        <p class="workspace_hint">
          This creates a local preview. Live publishing and link availability
          checks need the company API.
        </p>
        {#if error}<p class="filter_error" role="alert">{error}</p>{/if}<button
          class="button button_dark button_full"
          type="submit"
          >{editing ? "Save changes" : "Create company preview"} ↗</button
        >
      </section>
    </aside>
  </form>
</main>
