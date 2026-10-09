import { tick } from "svelte";

export function keep_active_visible(node) {
  let destroyed = false;

  async function reveal() {
    await tick();
    if (destroyed || node.scrollWidth <= node.clientWidth) return;
    const active = node.querySelector(".active");
    if (!active) return;
    const bounds = node.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.left < bounds.left || item.right > bounds.right) {
      node.scrollLeft +=
        item.left - bounds.left - (bounds.width - item.width) / 2;
    }
  }

  const observer = new ResizeObserver(reveal);
  observer.observe(node);
  reveal();
  return {
    update: reveal,
    destroy() {
      destroyed = true;
      observer.disconnect();
    },
  };
}
