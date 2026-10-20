<script>
  export let skills = [];
  let expanded = false;
</script>

<div class="skill_line" class:expanded>
  <div class="skill_line_items">
    {#each skills as skill}<span>{skill}</span>{/each}
  </div>
  {#if skills.length > 1}<button
      class="text_link"
      type="button"
      aria-expanded={expanded}
      on:click={() => (expanded = !expanded)}
      >{expanded ? "Less" : `Show all (${skills.length})`}</button
    >{/if}
</div>
