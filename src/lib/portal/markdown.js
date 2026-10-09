const escape_html = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export function render_markdown(text = "") {
  const inline = (line) =>
    escape_html(line)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const lines = text.split("\n");
  let list = false;
  let html = "";
  for (const line of lines) {
    const bullet = /^-\s+(.+)$/.exec(line);
    if (bullet) {
      if (!list) html += "<ul>";
      list = true;
      html += `<li>${inline(bullet[1])}</li>`;
    } else {
      if (list) html += "</ul>";
      list = false;
      if (line.startsWith("## ")) html += `<h3>${inline(line.slice(3))}</h3>`;
      else if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
  }
  return html + (list ? "</ul>" : "");
}
