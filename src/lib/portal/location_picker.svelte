<script>
  import Location_node from "./location_node.svelte";
  import { location_tree } from "./filter_options.js";
  export let selected = [];
  export let query = "";
  export let searchable = true;
  export let allow_worldwide = false;
  export let worldwide = false;
  export let disabled_worldwide = false;
  let expanded = [];
  function matches(node) {
    return (
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.children?.some(matches)
    );
  }
  $: visible_tree = query ? location_tree.filter(matches) : location_tree;
</script>

<div class="location_picker">
  {#if allow_worldwide}<label class="filter_checkbox"
      ><input
        type="checkbox"
        bind:checked={worldwide}
        disabled={disabled_worldwide}
      />Worldwide remote{disabled_worldwide ? " · Premium" : ""}</label
    >{/if}
  {#if searchable}<label class="field_label"
      >Find a location<input
        class="field_input"
        placeholder="Country, state or city"
        bind:value={query}
      /></label
    >{/if}
  <div class="location_actions">
    <button
      type="button"
      on:click={() =>
        (expanded = location_tree.flatMap((country) => [
          country.id,
          ...country.children.map((region) => region.id),
        ]))}>Expand all</button
    ><button type="button" on:click={() => (expanded = [])}>Collapse all</button
    >
  </div>
  <ul>
    {#each visible_tree as node}<Location_node
        {node}
        {query}
        bind:selected
        bind:expanded
      />{/each}
  </ul>
  <small
    >Sample locations · {selected.length}
    {selected.length === 1 ? "city" : "cities"} selected</small
  >
</div>
