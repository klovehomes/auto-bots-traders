#!/usr/bin/env node
/**
 * Phase 9 (v17) — package the public showcase for Cloudflare Pages.
 *
 * Assembles the deployable site root:
 *   <stage>/index.html         (showcase app shell; renamed from
 *                               the build's index-showcase.html)
 *   <stage>/gate.html          (the email-gate page)
 *   <stage>/assets/…           (built JS/CSS)
 *   <stage>/snapshot.json      (sample snapshot until a real one is
 *                               published over it)
 *   <stage>/functions/         (the gate: _middleware + api/* + _lib,
 *                               copied from packages/web/showcase-functions)
 *   <stage>/wrangler.toml      (Pages project + D1 binding placeholder)
 *   <stage>/showcase-db/schema.sql  (apply once with wrangler d1 execute)
 * and zips it to ~/workspace/your_files/traderbots-showcase-v17.zip.
 *
 * Deploy (recommended): unzip anywhere, then
 *   wrangler pages deploy <that folder> --project-name traderbots-showcase
 * The Pages dashboard's zip/direct upload has limited support for
 * Functions projects — wrangler is the reliable route (see
 * PHASE9-DELIVERY.md).
 *
 * Usage: node tools/package-showcase.mjs [--skip-build]
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(toolsDir, "..");
const webDir = join(appDir, "packages", "web");
const stageDir = join(homedir(), "workspace", "trading-bots", "showcase-site");
const zipPath = join(
  homedir(),
  "workspace",
  "your_files",
  "traderbots-showcase-v17.zip",
);

if (!process.argv.includes("--skip-build")) {
  console.log("Building the showcase flavor…");
  const r = spawnSync("npm", ["run", "build:showcase"], {
    cwd: webDir,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error("Showcase build failed — nothing packaged.");
    process.exit(1);
  }
}

const distDir = join(webDir, "dist");
if (!existsSync(join(distDir, "index-showcase.html"))) {
  console.error(`No showcase build found at ${distDir} — run the build first.`);
  process.exit(1);
}

rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });

cpSync(distDir, stageDir, { recursive: true });
renameSync(
  join(stageDir, "index-showcase.html"),
  join(stageDir, "index.html"),
);
// The middleware serves the gate as /gate.html.
renameSync(join(stageDir, "index-gate.html"), join(stageDir, "gate.html"));
cpSync(join(webDir, "showcase-functions"), join(stageDir, "functions"), {
  recursive: true,
});
cpSync(join(webDir, "wrangler.toml"), join(stageDir, "wrangler.toml"));
cpSync(join(webDir, "showcase-db"), join(stageDir, "showcase-db"), {
  recursive: true,
});

rmSync(zipPath, { force: true });
const zip = spawnSync(
  "python3",
  [
    "-c",
    [
      "import os, sys, zipfile",
      "stage, out = sys.argv[1], sys.argv[2]",
      "names = []",
      "with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:",
      "    for root, _dirs, files in os.walk(stage):",
      "        for f in sorted(files):",
      "            p = os.path.join(root, f)",
      "            arc = os.path.relpath(p, stage)",
      "            z.write(p, arc)",
      "            names.append(arc)",
      "print('\\n'.join(sorted(names)))",
    ].join("\n"),
    stageDir,
    zipPath,
  ],
  { encoding: "utf8" },
);
if (zip.status !== 0) {
  console.error("Zip failed:", zip.stderr);
  process.exit(1);
}
console.log(`\nStaged site: ${stageDir}`);
console.log(`Zip written: ${zipPath}\nContents:`);
console.log(zip.stdout);
