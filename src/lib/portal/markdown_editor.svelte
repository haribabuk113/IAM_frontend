<script>
  import { tick } from "svelte";
  import { render_markdown } from "./markdown.js";
  export let value = "";
  export let label = "Job description";
  let input;
  let preview = false;
  async function format(kind) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected =
      value.slice(start, end) ||
      (kind === "heading" ? "Section heading" : "Your text");
    const formatted =
      kind === "bold"
        ? `**${selected}**`
        : kind === "italic"
          ? `*${selected}*`
          : kind === "heading"
            ? `\n## ${selected}\n`
            : `\n${selected
                .split("\n")
                .map((line) => `- ${line}`)
                .join("\n")}\n`;
    const next = value.slice(0, start) + formatted + value.slice(end);
    if (next.length > 10000) return;
    value = next;
    await tick();
    input.focus();
    input.setSelectionRange(start, start + formatted.length);
  }
</script>

<div class="markdown_editor">
  <div
    class="markdown_toolbar"
    role="group"
    aria-label="Description formatting"
  >
    {#each [["bold", "Bold"], ["italic", "Italic"], ["heading", "Heading"], ["list", "Bullet list"]] as [kind, name]}<button
        type="button"
        disabled={preview}
        on:click={() => format(kind)}>{name}</button
      >{/each}
    <button
      type="button"
      aria-pressed={preview}
      on:click={() => (preview = !preview)}
      >{preview ? "Edit text" : "Preview"}</button
    >
  </div>
  <label class="field_label"
    >{label} *
    <textarea
      bind:this={input}
      class="field_input"
      class:editor_hidden={preview}
      bind:value
      rows="12"
      maxlength="10000"
      required
      placeholder="The role, responsibilities, required experience and what candidates can expect."
    ></textarea>
  </label>
  {#if preview}<div class="markdown_preview">
      {@html render_markdown(value) ||
        "<p>Your formatted description will appear here.</p>"}
    </div>{/if}
  <p class="form_caption">
    {value.length}/10,000 · Supports **bold**, *italic*, ## headings and -
    bullet lists.
  </p>
</div>

<style>
  .markdown_toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }
  .markdown_toolbar button {
    border: 1px solid #dce2ef;
    background: #f5f7ff;
    color: #142044;
    border-radius: 6px;
    padding: 7px 10px;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .markdown_toolbar button:last-child {
    margin-left: auto;
    color: #3155ef;
  }
  .markdown_toolbar button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .editor_hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    opacity: 0;
    pointer-events: none;
  }
  .markdown_preview {
    min-height: 240px;
    border: 1px solid #dce2ef;
    border-radius: 10px;
    padding: 18px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }
  .markdown_preview :global(ul) {
    padding-left: 24px;
    list-style: disc;
  }
</style>
