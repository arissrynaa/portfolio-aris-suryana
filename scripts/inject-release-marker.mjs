#!/usr/bin/env node
// Post-build step: inject the LightVela release marker script into every
// exported HTML file as the FIRST <script> in <head>, before other JS.
// Platform replaces the placeholder "__LIGHTVELA_RELEASE_ID__" at deploy time.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const MARKER = '<script>globalThis.__LIGHTVELA_RELEASE_ID__="__LIGHTVELA_RELEASE_ID__";</script>';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".html")) yield p;
  }
}

let count = 0;
for (const file of walk(OUT)) {
  let html = readFileSync(file, "utf8");
  if (html.includes("__LIGHTVELA_RELEASE_ID__")) continue; // already injected
  if (html.includes("<head>")) {
    html = html.replace("<head>", "<head>" + MARKER);
  } else if (html.includes("<head ")) {
    html = html.replace(/<head([^>]*)>/, (m) => m + MARKER);
  } else {
    html = MARKER + html;
  }
  writeFileSync(file, html);
  count++;
}
console.log(`Injected release marker into ${count} HTML file(s).`);
