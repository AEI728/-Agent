const fs = require("fs");

let html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const js = fs.readFileSync("app.js", "utf8");

html = html
  .replace(/\s*<link rel="preconnect"[^>]*>/g, "")
  .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, "")
  .replace(/\s*<link rel="stylesheet" href="styles\.css">/, `\n<style>\n${css}\n</style>`)
  .replace(/\s*<script src="https:\/\/unpkg\.com\/lucide@0\.468\.0\/dist\/umd\/lucide\.min\.js"><\/script>/, "")
  .replace(/\s*<script src="app\.js"><\/script>/, `\n<script>\n${js}\n</script>`);

fs.writeFileSync("standalone.html", html, "utf8");
console.log(`Wrote standalone.html (${Buffer.byteLength(html, "utf8")} bytes)`);
