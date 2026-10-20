<script>
  import { leaves } from "./filter_options.js";
  export let node;
  export let query = "";
  function matches(item) {
    return (
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.children?.some(matches)
    );
  }
  $: own_match = node.name.toLowerCase().includes(query.toLowerCase());
  $: visible_children = query
    ? (node.children?.filter((item) => own_match || matches(item)) ?? [])
    : (node.children ?? []);
  export let selected = [];
  export let expanded = [];
  $: ids = leaves([node]).map((item) => item.id);
  $: count = ids.filter((id) => selected.includes(id)).length;
  $: open = !!query || expanded.includes(node.id);
  function partial(element, value) {
    element.indeterminate = value;
    return {
      update(next) {
        element.indeterminate = next;
      },
    };
  }
  function toggle() {
    selected =
      count === ids.length
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])];
  }
  function expand(value) {
    expanded = value
      ? [...new Set([...expanded, node.id])]
      : expanded.filter((id) => id !== node.id);
  }
</script>

<li>
  <div class="location_row">
    {#if node.children}<button
        type="button"
        aria-label={`${open ? "Collapse" : "Expand"} ${node.name}`}
        aria-expanded={open}
        on:click={() => expand(!open)}>{open ? "−" : "+"}</button
      >{:else}<span class="location_leaf"></span>{/if}
    <label
      ><input
        type="checkbox"
        checked={count === ids.length}
        use:partial={count > 0 && count < ids.length}
        on:change={toggle}
        on:keydown={(event) => {
          if (
            node.children &&
            ["ArrowRight", "ArrowLeft"].includes(event.key)
          ) {
            event.preventDefault();
            expand(event.key === "ArrowRight");
          }
        }}
      />{node.name}</label
    >
  </div>
  {#if node.children && open}<ul>
      {#each visible_children as child}<svelte:self
          node={child}
          query={own_match ? "" : query}
          bind:selected
          bind:expanded
        />{/each}
    </ul>{/if}
</li>
