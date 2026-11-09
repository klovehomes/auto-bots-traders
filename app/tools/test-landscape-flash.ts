/**
 * PM6-fix verification harness — run with tsx from app/:
 *
 *     node_modules/.bin/tsx tools/test-landscape-flash.ts
 *
 * Keith's report (2026-11-09): "the bottom of the building does not
 * always pulse with the same color as the satellite beam as it fires."
 *
 * Root cause (pre-fix Landscape.tsx): the beam / dish glow / dish ring
 * / ground pool were driven by the per-building flash fields, but the
 * base SHOCKWAVES were a second, independent color path — each shock
 * kept the color it was spawned with for its own 650–1100 ms lifetime,
 * a win spawned a CYAN shockwave (#22d3ee) under a GREEN beam, and when
 * events landed back-to-back the beam/pool moved to the new event's
 * color while the previous event's shockwave was still expanding at
 * the base in the old color.
 *
 * The fix: ONE flash record per building (flashForEvent), every pulse
 * surface derives from it (flashPulseAt in the render loop), shockwaves
 * spawn in the flash's color for exactly the flash duration, and a new
 * flash clears the building's previous shockwaves before the next
 * frame renders.
 *
 * This harness drives the REAL shipped functions (imported from
 * packages/web/src/Landscape.tsx — no replica) through a deterministic
 * back-to-back sequence — win, then a loss 400 ms later (while the win
 * flash is still live), then an open — and asserts that at every
 * sampled instant the beam color and the ground-pool color are the
 * same single pulse color, and that it is the LATEST event's color.
 * Source pins then tie those functions to the shipped render loop, so
 * the harness cannot pass against a replica while the app diverges.
 */
import { readFileSync } from "node:fs";
import * as THREE from "three";
import {
  FLASH_DURATION_MS,
  flashForEvent,
  flashPulseAt,
  type BuildingFlash,
  type EffectEvent,
} from "../packages/web/src/Landscape.tsx";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail: string): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

const GREEN_HEX = "2fe89a";
const RED_HEX = "ff4d42";
const BOT = new THREE.Color("#fbbf24"); // PolyCrypt9000 amber
const BOT_HEX = "fbbf24";

/** What the render loop does with the pulse every frame: the beam and
 *  the ground pool both copy the ONE pulse color. */
function renderedColors(flash: BuildingFlash | null, now: number) {
  const pulse = flashPulseAt(flash, now);
  if (!pulse) return null;
  const beam = new THREE.Color().copy(pulse.color);
  const pool = new THREE.Color().copy(pulse.color);
  return { beam, pool, pulse };
}

// ---------------------------------------------------------------------------
// Event → flash color mapping (win green, loss red, open bot color)
// ---------------------------------------------------------------------------
for (const [kind, hex, strength] of [
  ["win", GREEN_HEX, 0.95],
  ["loss", RED_HEX, 0.95],
  ["open", BOT_HEX, 0.45],
] as const) {
  const f = flashForEvent(kind, BOT, 5000);
  check(
    `flashForEvent(${kind})`,
    f.color.getHexString() === hex && f.strength === strength && f.startedAt === 5000,
    `color #${f.color.getHexString()}, strength ${f.strength}, startedAt ${f.startedAt}`,
  );
}

// ---------------------------------------------------------------------------
// Back-to-back sequence: win @1000, loss @1400 (win still live), open @1900
// ---------------------------------------------------------------------------
const events: { at: number; kind: EffectEvent["kind"]; hex: string }[] = [
  { at: 1000, kind: "win", hex: GREEN_HEX },
  { at: 1400, kind: "loss", hex: RED_HEX },
  { at: 1900, kind: "open", hex: BOT_HEX },
];
let current: BuildingFlash | null = null;
for (const ev of events) {
  // handleEffect: the new event's flash replaces the old one atomically.
  current = flashForEvent(ev.kind, BOT, ev.at);
  for (const offset of [0, 100, 500, 999]) {
    const now = ev.at + offset;
    const r = renderedColors(current, now);
    check(
      `${ev.kind} @+${offset}ms: beam == pool == #${ev.hex}`,
      r !== null &&
        r.beam.getHexString() === ev.hex &&
        r.pool.getHexString() === ev.hex &&
        r.beam.equals(r.pool),
      r
        ? `beam #${r.beam.getHexString()}, pool #${r.pool.getHexString()}, intensity ${r.pulse.intensity.toFixed(3)}`
        : "pulse missing",
    );
  }
  // Decay shape: intensity falls linearly from the event's strength.
  const mid = renderedColors(current, ev.at + 500);
  check(
    `${ev.kind} decay: half-life intensity`,
    mid !== null && Math.abs(mid.pulse.intensity - current.strength * 0.5) < 1e-9,
    `intensity at +500ms = ${mid?.pulse.intensity}`,
  );
  // Expiry: nothing renders at exactly startedAt + FLASH_DURATION_MS.
  check(
    `${ev.kind} expiry at +${FLASH_DURATION_MS}ms`,
    renderedColors(current, ev.at + FLASH_DURATION_MS) === null,
    "flashPulseAt returns null at the duration boundary",
  );
}

// The regression Keith saw: 100 ms after the loss replaced the win,
// the visible pulse must be the LOSS color everywhere — the win's
// green must not linger at the base.
{
  let flash = flashForEvent("win", BOT, 1000);
  flash = flashForEvent("loss", BOT, 1400); // replacement, as in handleEffect
  const r = renderedColors(flash, 1500);
  check(
    "back-to-back: no stale win color after replacement",
    r !== null && r.beam.getHexString() === RED_HEX && r.pool.getHexString() === RED_HEX,
    `at +100ms after replacement beam #${r?.beam.getHexString()}, pool #${r?.pool.getHexString()}`,
  );
}

// ---------------------------------------------------------------------------
// Source pins: the shipped code actually routes through these functions
// ---------------------------------------------------------------------------
const src = readFileSync(
  new URL("../packages/web/src/Landscape.tsx", import.meta.url),
  "utf8",
);
check(
  "source pin: one flash record per building",
  src.includes("flash: BuildingFlash | null") &&
    !src.includes("flashColor") &&
    !src.includes("flashT0") &&
    !src.includes("flashStrength"),
  "BuildingObj carries a single `flash` record; the old scattered fields are gone",
);
check(
  "source pin: handleEffect sets the flash once and clears old shockwaves",
  src.includes("const flash = flashForEvent(effect.kind, b.baseColor, performance.now());") &&
    src.includes("b.flash = flash;") &&
    src.includes("clearShocksFor(b.bot.name);"),
  "handleEffect creates the flash via flashForEvent, assigns it, and clears previous shockwaves in the same step",
);
check(
  "source pin: beam, dish, and pool all copy the ONE pulse color",
  src.includes("const pulse = flashPulseAt(b.flash, now);") &&
    src.includes("b.beamMat.color.copy(pulse.color);") &&
    src.includes("b.dishGlow.material.color.copy(pulse.color);") &&
    src.includes("b.dishRing.material.color.copy(pulse.color);") &&
    src.includes("b.groundGlow.material.color.copy(pulse.color);"),
  "render loop derives beam/dish-glow/dish-ring/ground-pool colors from flashPulseAt(b.flash)",
);
check(
  "source pin: no independent pulse colors left at the base",
  !src.includes("spawnShock(b.pos, CYAN") &&
    !src.includes('"#3ff5c8"') &&
    src.includes("spawnShock(b.bot.name, b.pos, flash.color,") &&
    src.includes("spawnBurst(b.pos, topY, flash.color, true)") &&
    src.includes("spawnBurst(b.pos, topY, flash.color, false)"),
  "shockwaves/bursts spawn in flash.color; the old CYAN win shockwave and the off-palette #3ff5c8 burst color are gone (the remaining #ff6a55 in the file is the HALTED name-plate text, not a pulse)",
);

console.log(`\n${checks - failures}/${checks} checks pass`);
if (failures > 0) process.exit(1);
