<script>
  import Companion from "./companion.svelte";
  export let eyebrow = "YOUR NEXT CHAPTER";
  export let title = "";
  export let accent = "";
  export let description = "";
  export let companion = "peach";
</script>

<div class="workspace_heading">
  <div>
    <span class="eyebrow_label">{eyebrow}</span>
    <h1>{title} <span>{accent}</span></h1>
    <p>{description}</p>
    <slot />
  </div>
  <div class="workspace_companion">
    <span class="workspace_arch"></span><Companion
      kind={companion}
      size={165}
    /><i>✳</i>
  </div>
</div>
