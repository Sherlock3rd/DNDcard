const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  try {
    const route = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (route === "/" ? "/index.html" : route));
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some((s) => s.startsWith(".") || s === "node_modules")) {
      res.writeHead(403).end(); return;
    }
    if (!fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "Content-Type": (types[path.extname(file)] || "application/octet-stream") + "; charset=utf-8", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
}).listen(4173, "127.0.0.1", () => console.log("DNDcard preview: http://127.0.0.1:4173"));
