/**
 * Phase 10 (v18) verification harness — run with tsx from app/:
 *
 *     node_modules/.bin/tsx tools/test-landscape-v18.ts
 *
 * Part 1 exercises the REAL height functions imported from the shipped
 * module (packages/web/src/Landscape.tsx — no replica): Keith's
 * standing relative height cap (tallest ≤ 4× shortest, dynamic
 * ceiling) over fixture equity sets.
 *
 * Part 2 is a framing projection check: it rebuilds the scene's camera
 * math exactly as Landscape.tsx computes it (drift, FOV-per-aspect,
 * look-at target, arc layout incl. the tightened portrait arc) with
 * three's own projection, and reports worst-case NDC extents per
 * element group, before (zoom 1, pre-v18 portrait arc) and after
 * (FRAMING_ZOOM, shipped arc) the standing ~25%-closer framing rule.
 *
 * Also pins the shipped source: the render loop must actually call
 * cappedHeightsForEquities + divideScalar(FRAMING_ZOOM), and the
 * portrait arc constants must match what Part 2 models — so this
 * harness can never pass against a replica while the app does
 * something else.
 */
import { readFileSync } from "node:fs";
import * as THREE from "three";
import {
  heightForEquity,
  applyHeightCap,
  cappedHeightsForEquities,
  MAX_HEIGHT_RATIO,
  FRAMING_ZOOM,
} from "../packages/web/src/Landscape.tsx";

let checks = 0;
let failures = 0;
function check(name: string, ok: boolean, detail: string): void {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}
const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) <= eps;
const fmt = (xs: number[]): string => xs.map((x) => x.toFixed(3)).join(", ");

// ---------------------------------------------------------------------------
// Source pins: the shipped code uses the tested functions + constants.
// ---------------------------------------------------------------------------
const src = readFileSync(
  new URL("../packages/web/src/Landscape.tsx", import.meta.url),
  "utf8",
);
check(
  "source pin: render loop assigns capped heights",
  src.includes("b.targetH = cappedHeights[i]!") &&
    src.includes("cappedHeightsForEquities(displayEquities)"),
  "Landscape.tsx target block calls cappedHeightsForEquities(displayEquities)",
);
check(
  "source pin: camera applies FRAMING_ZOOM",
  src.includes("camera.position.sub(camTarget).divideScalar(FRAMING_ZOOM).add(camTarget)"),
  "Landscape.tsx animate() pulls the camera toward its target by FRAMING_ZOOM",
);
check(
  "source pin: portrait arc constants",
  src.includes("initAspect < 1 ? 0.88 : 1.7") &&
    src.includes("initAspect < 1 ? 8.5 : 11.5"),
  "Landscape.tsx portrait arc = spread 0.88 / radius 8.5 (desktop 1.7 / 11.5)",
);
check(
  "constants",
  MAX_HEIGHT_RATIO === 4 && FRAMING_ZOOM === 1.25,
  `MAX_HEIGHT_RATIO=${MAX_HEIGHT_RATIO}, FRAMING_ZOOM=${FRAMING_ZOOM}`,
);

// ---------------------------------------------------------------------------
// Part 1 — height cap fixtures
// ---------------------------------------------------------------------------
interface Fixture {
  name: string;
  equities: number[];
  expect: (raw: number[], capped: number[]) => boolean;
  describe: (raw: number[], capped: number[]) => string;
}

const fixtures: Fixture[] = [
  {
    name: "all equal [10000×5]",
    equities: [10000, 10000, 10000, 10000, 10000],
    expect: (raw, capped) =>
      capped.every((h) => near(h, raw[0]!)) &&
      near(Math.max(...capped) / Math.min(...capped), 1),
    describe: (raw, capped) =>
      `raw [${fmt(raw)}] → capped [${fmt(capped)}], ratio exactly 1, no change`,
  },
  {
    name: "one rich [40000, 10000×4]",
    equities: [40000, 10000, 10000, 10000, 10000],
    expect: (raw, capped) =>
      capped.every((h, i) => near(h, raw[i]!)) &&
      Math.max(...capped) / Math.min(...capped) <= 4,
    describe: (raw, capped) =>
      `raw tallest ${raw[0]!.toFixed(3)} vs ceiling 4×${raw[1]!.toFixed(3)}=${(4 * raw[1]!).toFixed(3)} → cap does not bind, capped [${fmt(capped)}], ratio ${(Math.max(...capped) / Math.min(...capped)).toFixed(3)} ≤ 4`,
  },
  {
    name: "very rich [250000, 10000×4]",
    equities: [250000, 10000, 10000, 10000, 10000],
    expect: (raw, capped) =>
      capped.every((h, i) => near(h, raw[i]!)) &&
      Math.max(...capped) / Math.min(...capped) <= 4,
    describe: (raw, capped) =>
      `heightForEquity's own equity-ratio clamp (≤4) bounds raw tallest at ${raw[0]!.toFixed(3)} = ${(raw[0]! / raw[1]!).toFixed(2)}× shortest, under the 4× ceiling ${(4 * raw[1]!).toFixed(3)} → cap does not bind, capped [${fmt(capped)}]`,
  },
  {
    name: "cap engages exactly at 4× [40000, 2500×4]",
    equities: [40000, 2500, 2500, 2500, 2500],
    expect: (raw, capped) =>
      capped[0]! < raw[0]! &&
      near(capped[0]!, 4 * Math.min(...raw)) &&
      near(Math.max(...capped) / Math.min(...capped), 4),
    describe: (raw, capped) =>
      `raw tallest ${raw[0]!.toFixed(3)} → capped ${capped[0]!.toFixed(3)} = exactly 4× shortest ${Math.min(...raw).toFixed(3)}`,
  },
  {
    name: "cap engages at the formula floor [10000, 1500×4]",
    equities: [10000, 1500, 1500, 1500, 1500],
    expect: (raw, capped) =>
      capped[0]! < raw[0]! && near(capped[0]!, 4 * Math.min(...raw)),
    describe: (raw, capped) =>
      `shortest at formula floor ${Math.min(...raw).toFixed(3)} → tallest ${raw[0]!.toFixed(3)} capped to ${capped[0]!.toFixed(3)} = exactly 4×`,
  },
  {
    name: "below-cap set passes through unchanged",
    equities: [12000, 10000, 9000, 11000, 10500],
    expect: (raw, capped) => capped.every((h, i) => near(h, raw[i]!)),
    describe: (raw, capped) =>
      `raw [${fmt(raw)}] → capped identical [${fmt(capped)}] (uncapped formula untouched below the cap)`,
  },
  {
    name: "demo equities (?demoheights=1 set) through the same cap",
    equities: [5000, 9600, 15000, 20000, 7600],
    expect: (raw, capped) => capped.every((h, i) => near(h, raw[i]!)),
    describe: (raw, capped) =>
      `raw [${fmt(raw)}], ceiling ${(4 * Math.min(...raw)).toFixed(3)} → demo spread unchanged [${fmt(capped)}]`,
  },
];

for (const f of fixtures) {
  const raw = f.equities.map(heightForEquity);
  const capped = cappedHeightsForEquities(f.equities);
  check(f.name, f.expect(raw, capped), f.describe(raw, capped));
}

// Ceiling rises as the smallest building grows: same tall bot, three floors.
{
  const tall = 40000;
  const floors = [2500, 5000, 10000];
  const results = floors.map((floor) => {
    const capped = cappedHeightsForEquities([tall, floor, floor, floor, floor]);
    return { floor, smallest: heightForEquity(floor), tallest: capped[0]! };
  });
  const rising = results[0]!.tallest < results[1]!.tallest &&
    results[1]!.tallest < results[2]!.tallest;
  const exact = results.slice(0, 2).every((r) => near(r.tallest, 4 * r.smallest));
  check(
    "dynamic ceiling rises as the smallest grows",
    rising && exact,
    results
      .map(
        (r) =>
          `floor $${r.floor}: shortest ${r.smallest.toFixed(3)} → tallest after cap ${r.tallest.toFixed(3)}`,
      )
      .join("; ") + " (first two sit exactly on the 4× ceiling; the third clears it)",
  );
}

// Edge cases.
check(
  "edge cases",
  applyHeightCap([]).length === 0 &&
    near(cappedHeightsForEquities([7777])[0]!, heightForEquity(7777)),
  "empty row → empty; single building → its formula height, uncapped",
);

// ---------------------------------------------------------------------------
// Part 2 — framing projection check (three's own projection math)
// ---------------------------------------------------------------------------
const PLINTH_TOP = 0.35;
const HUB_POS = new THREE.Vector3(0, 0, -12);
/** Portrait arc as shipped since v18 (compensating tweak) / pre-v18. */
const ARC_NEW = { spread: 0.88, radius: 8.5 };
const ARC_OLD_PORTRAIT = { spread: 1.05, radius: 9.5 };
const ARC_DESKTOP = { spread: 1.7, radius: 11.5 };

type GroupName = "towers" | "plates" | "plinths" | "hub";

function groupedPoints(
  aspect: number,
  heights: number[],
  arc: { spread: number; radius: number },
): Record<GroupName, THREE.Vector3[]> {
  const groups: Record<GroupName, THREE.Vector3[]> = {
    towers: [],
    plates: [],
    plinths: [],
    hub: [],
  };
  for (let i = 0; i < 5; i++) {
    const angle = (i / 4 - 0.5) * arc.spread;
    const p = new THREE.Vector3(
      Math.sin(angle) * arc.radius,
      0,
      -2.5 - (1 - Math.cos(angle)) * 7,
    );
    const h = heights[i]!;
    for (const dx of [-1.0, 1.0]) {
      groups.towers.push(new THREE.Vector3(p.x + dx, 0, p.z));
      groups.towers.push(new THREE.Vector3(p.x + dx, PLINTH_TOP + h, p.z));
      groups.plates.push(
        new THREE.Vector3(p.x + dx * 2.125, PLINTH_TOP + h + 3.0, p.z),
      );
      for (const dz of [-2.09, 2.09]) {
        groups.plinths.push(new THREE.Vector3(p.x + dx * 2.09, 0, p.z + dz));
      }
    }
    groups.towers.push(new THREE.Vector3(p.x, PLINTH_TOP + h + 1.6, p.z)); // dish top
    groups.plates.push(new THREE.Vector3(p.x, PLINTH_TOP + h + 3.0 + 0.73, p.z)); // plate top
  }
  for (const dx of [-4.9, 4.9]) {
    groups.hub.push(new THREE.Vector3(HUB_POS.x + dx, 0, HUB_POS.z));
  }
  groups.hub.push(new THREE.Vector3(HUB_POS.x, 6.6, HUB_POS.z)); // hub mast top
  return groups;
}

interface Extents {
  maxAbsX: number;
  maxY: number;
  minY: number;
}

function worstExtents(
  aspect: number,
  heights: number[],
  zoom: number,
  arc: { spread: number; radius: number },
): Record<GroupName, Extents> {
  const portrait = aspect < 1;
  const fov = aspect < 1 ? 76 : aspect < 1.5 ? 60 : 52;
  const camZ = portrait ? 13.2 : aspect < 1.5 ? 20 : 17.5;
  const target = new THREE.Vector3(0, portrait ? 2.6 : 2.1, portrait ? -3.0 : -3.4);
  const groups = groupedPoints(aspect, heights, arc);
  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 260);
  const out = {} as Record<GroupName, Extents>;
  for (const g of Object.keys(groups) as GroupName[]) {
    out[g] = { maxAbsX: 0, maxY: -Infinity, minY: Infinity };
  }
  const v = new THREE.Vector3();
  for (let t = 0; t <= 400; t += 0.5) {
    camera.position.set(
      Math.sin(t * 0.07) * (portrait ? 1.3 : 2.3),
      (portrait ? 6.3 : 9.4) + Math.sin(t * 0.11) * (portrait ? 0.35 : 0.55),
      camZ + Math.cos(t * 0.05) * (portrait ? 0.5 : 0.9),
    );
    camera.position.sub(target).divideScalar(zoom).add(target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    for (const g of Object.keys(groups) as GroupName[]) {
      for (const p of groups[g]) {
        v.copy(p).project(camera);
        out[g].maxAbsX = Math.max(out[g].maxAbsX, Math.abs(v.x));
        out[g].maxY = Math.max(out[g].maxY, v.y);
        out[g].minY = Math.min(out[g].minY, v.y);
      }
    }
  }
  return out;
}

const scenarios: { name: string; heights: number[] }[] = [
  { name: "today (all bots at start, h=3.900)", heights: [3.9, 3.9, 3.9, 3.9, 3.9] },
  {
    name: "capped spread [5.515, 1.379×4]",
    heights: cappedHeightsForEquities([40000, 2500, 2500, 2500, 2500]),
  },
  {
    name: "extreme (all at formula max, h=11.029)",
    heights: [11.029, 11.029, 11.029, 11.029, 11.029],
  },
];
const desktopAspects = [16 / 9, 1.33, 1.2];
const portraitAspects = [0.5, 0.46];

console.log("\nFraming projection (worst NDC over a full camera-drift cycle; |NDC| ≤ 1 = in frame):");
for (const s of scenarios) {
  for (const aspect of [...desktopAspects, ...portraitAspects]) {
    const arc = aspect < 1 ? ARC_NEW : ARC_DESKTOP;
    const before = worstExtents(aspect, s.heights, 1, aspect < 1 ? ARC_OLD_PORTRAIT : ARC_DESKTOP);
    const after = worstExtents(aspect, s.heights, FRAMING_ZOOM, arc);
    const all = (e: Record<GroupName, Extents>): Extents => ({
      maxAbsX: Math.max(...Object.values(e).map((x) => x.maxAbsX)),
      maxY: Math.max(...Object.values(e).map((x) => x.maxY)),
      minY: Math.min(...Object.values(e).map((x) => x.minY)),
    });
    const b = all(before);
    const a = all(after);
    console.log(
      `  ${s.name} @ aspect ${aspect.toFixed(2)}: ` +
        `|x| ${b.maxAbsX.toFixed(3)} → ${a.maxAbsX.toFixed(3)}, ` +
        `top ${b.maxY.toFixed(3)} → ${a.maxY.toFixed(3)}, ` +
        `bottom ${b.minY.toFixed(3)} → ${a.minY.toFixed(3)} ` +
        `(towers |x| ${before.towers.maxAbsX.toFixed(3)} → ${after.towers.maxAbsX.toFixed(3)})`,
    );
  }
}

// Desktop / landscape-tablet aspects: every element group of every
// realistic scenario must be fully in frame at the new zoom.
let desktopOk = true;
for (const s of scenarios.slice(0, 2)) {
  for (const aspect of desktopAspects) {
    const after = worstExtents(aspect, s.heights, FRAMING_ZOOM, ARC_DESKTOP);
    for (const e of Object.values(after)) {
      if (e.maxAbsX > 1 || e.maxY > 1 || e.minY < -1) desktopOk = false;
    }
  }
}
check(
  "framing: desktop aspects fully in frame at FRAMING_ZOOM",
  desktopOk,
  "towers, plates, plinths, and hub within [-1, 1] NDC at aspects 1.78/1.33/1.20 in the today + capped-spread scenarios",
);

// Portrait: the compensating arc tweak must hold the towers' worst
// extent at (or below) their pre-v18 level — the closer camera must
// not push the buildings themselves further off narrow phone screens
// than they already were. (Outer plate tips and plinth corners slip
// past the edge at drift extremes on the narrowest screens, as they
// already did pre-v18; their extents are printed above.)
let portraitOk = true;
const parity: string[] = [];
for (const s of scenarios.slice(0, 2)) {
  for (const aspect of portraitAspects) {
    const before = worstExtents(aspect, s.heights, 1, ARC_OLD_PORTRAIT);
    const after = worstExtents(aspect, s.heights, FRAMING_ZOOM, ARC_NEW);
    parity.push(
      `aspect ${aspect.toFixed(2)}: towers |x| ${before.towers.maxAbsX.toFixed(3)} → ${after.towers.maxAbsX.toFixed(3)}`,
    );
    if (after.towers.maxAbsX > before.towers.maxAbsX + 0.03) portraitOk = false;
    if (after.towers.maxY > 1 || after.towers.minY < -1) portraitOk = false;
  }
}
check(
  "framing: portrait towers held at pre-v18 extent by the arc tweak",
  portraitOk,
  parity.join("; "),
);

console.log(`\n${checks - failures}/${checks} checks pass`);
if (failures > 0) process.exit(1);
