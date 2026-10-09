<script>
  import { onDestroy as on_destroy } from "svelte";
  import Modal from "./modal.svelte";
  export let value = "";
  export let label = "Image";
  export let max_mb = 2;
  export let ratio = 1;
  let source = "";
  let zoom = 1;
  let image_element;
  let error = "";
  let input;
  function close() {
    if (source) URL.revokeObjectURL(source);
    source = "";
    if (input) input.value = "";
  }
  function select(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > max_mb * 1024 * 1024
    ) {
      error = `Choose a JPG, PNG or WebP under ${max_mb} MB.`;
      return;
    }
    close();
    source = URL.createObjectURL(file);
    zoom = 1;
    error = "";
  }
  function save() {
    if (!image_element?.naturalWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = ratio === 1 ? 400 : 1200;
    canvas.height = canvas.width / ratio;
    const width =
      Math.min(
        image_element.naturalWidth,
        image_element.naturalHeight * ratio,
      ) / zoom;
    const height = width / ratio;
    canvas
      .getContext("2d")
      .drawImage(
        image_element,
        (image_element.naturalWidth - width) / 2,
        (image_element.naturalHeight - height) / 2,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    value = canvas.toDataURL("image/jpeg", 0.88);
    close();
  }
  on_destroy(close);
</script>

<label class="field_label"
  >{label} · up to {max_mb} MB
  <input
    class="field_input"
    bind:this={input}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    on:change={select}
  />
</label>
{#if error}<p class="filter_error" role="alert">{error}</p>{/if}
{#if value}<div class="workspace_actions">
    <img
      src={value}
      alt={`${label} preview`}
      style={`width:${ratio === 1 ? 100 : 240}px;max-width:100%;aspect-ratio:${ratio};object-fit:cover;border-radius:12px`}
    /><button type="button" class="text_action" on:click={() => (value = "")}
      >Remove {label.toLowerCase()}</button
    >
  </div>{/if}
{#if source}<Modal title={`Crop ${label.toLowerCase()}`} on:close={close}>
    <div
      style={`width:100%;aspect-ratio:${ratio};overflow:hidden;max-height:380px;margin:20px auto;border-radius:12px`}
    >
      <img
        bind:this={image_element}
        src={source}
        alt="Crop preview"
        style={`width:100%;height:100%;object-fit:cover;transform:scale(${zoom})`}
      />
    </div>
    <label class="field_label"
      >Zoom<input
        type="range"
        min="1"
        max="3"
        step="0.05"
        bind:value={zoom}
      /></label
    >
    <div class="form_actions">
      <button type="button" class="button button_outline" on:click={close}
        >Cancel</button
      ><button type="button" class="button button_dark" on:click={save}
        >Use image</button
      >
    </div>
  </Modal>{/if}
