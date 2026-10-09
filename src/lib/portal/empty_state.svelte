<script>
  import Companion from "./companion.svelte";
  export let title = "A little room for what comes next.";
  export let text = "";
</script>

<div class="workspace_empty">
  <Companion kind="sage" size={110} />
  <h2>{title}</h2>
  <p>{text}</p>
  <slot />
</div>
