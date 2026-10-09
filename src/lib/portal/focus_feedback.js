import { tick } from "svelte";

export function focus_feedback(node) {
  let destroyed = false;
  tick().then(() => {
    if (destroyed) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: "start" });
  });
  return {
    destroy() {
      destroyed = true;
    },
  };
}
