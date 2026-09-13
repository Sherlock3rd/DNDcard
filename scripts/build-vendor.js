const fs = require("node:fs");
const esbuild = require("esbuild");
fs.mkdirSync("assets/vendor", { recursive: true });
esbuild.buildSync({
  stdin: { contents: 'export { createClient } from "@supabase/supabase-js";', resolveDir: process.cwd() },
  outfile: "assets/vendor/supabase.js", bundle: true, minify: true,
  format: "iife", globalName: "DND_SUPABASE", platform: "browser", target: "es2020",
  legalComments: "eof"
});
fs.copyFileSync("node_modules/@supabase/supabase-js/LICENSE", "assets/vendor/supabase-LICENSE.txt");
