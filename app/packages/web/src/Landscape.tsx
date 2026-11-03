import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BotConfig } from "@fleet/shared/types";
import { START_EQUITY, fmtMoney, momentumAt, type BotStats } from "./fleetState.js";
import {
  AVATAR_CHOICE_EVENT,
  getAvatarChoiceId,
  resolveAvatarUrl,
} from "./avatars.js";

/** A visual effect request pushed by the App's WebSocket handler. */
export interface EffectEvent {
  bot: string;
  kind: "win" | "loss" | "open";
  ts: number;
}

interface LandscapeProps {
  bots: BotConfig[];
  statsRef: { current: Map<string, BotStats> };
  effectsRef: { current: EffectEvent[] };
  /** Bot NAMES whose kill switch is engaged (API-owned control state,
   *  mirrored by the App). Read every frame; a halted bot's building
   *  goes dark — HALTED plate, red-banded screen, red ground pool. */
  haltedRef?: { current: Set<string> };
  onUnavailable: () => void;
  /** Inspect dialog: called when the building under inspection changes
   *  (hover on desktop, tap on touch; `pinned` = opened by tap/click). */
  onInspect?: (botName: string | null, pinned: boolean) => void;
  /** Name-plate anchor for the open inspect dialog, in viewport CSS
   *  pixels — rewritten every frame while a dialog is open (the camera
   *  drifts, so the App re-reads it on its own rAF to track the plate). */
  inspectAnchorRef?: { current: InspectAnchor | null };
  /** Imperative handle the App's dialog uses to cooperate with the
   *  hover state machine (hold open while the pointer is over the
   *  dialog, release on leave, dismiss from the ✕ button). */
  inspectControlRef?: { current: InspectControl | null };
}

/** Where the App should pin the inspect dialog: a bot's name-plate
 *  center in viewport coordinates. */
export interface InspectAnchor {
  name: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface InspectControl {
  /** Pointer entered the dialog: cancel any pending hover close. */
  holdOpen: () => void;
  /** Pointer left the dialog: resume normal hover close behavior. */
  releaseHold: () => void;
  /** Dialog dismissed from the App (✕ / Escape): close and suppress
   *  hover re-opening until the pointer leaves that building. */
  dismiss: () => void;
}

const GREEN = new THREE.Color("#2fe89a");
const RED = new THREE.Color("#ff4d42");
const CYAN = new THREE.Color("#22d3ee");
/** Kill-switch scene treatment: dimmed facade + dark red ground pool. */
const FACADE_FULL = new THREE.Color(0xffffff);
const FACADE_DIM = new THREE.Color(0x484854);
const HALT_POOL = new THREE.Color("#8c1d18");
const DOME_BLUE_DARK = new THREE.Color("#14489f");
const DOME_BLUE_BRIGHT = new THREE.Color("#57b6ff");

const HUB_POS = new THREE.Vector3(0, 0, -12);
const PLINTH_TOP = 0.35;
const BASE_TOWER_H = 3.9; // tower height when equity == START_EQUITY

/**
 * Building height encodes balance:
 *
 *     h = BASE_TOWER_H × (equity / START_EQUITY) ^ 0.75
 *
 * The 0.75 power compresses the spread — a bot with 2× another bot's
 * balance stands 2^0.75 ≈ 1.68× taller instead of a full 2× — so rich
 * bots loom without dwarfing the city. The equity ratio is clamped to
 * [0.15, 4] so heights stay sane whatever the stream does.
 */
function heightForEquity(equity: number): number {
  const ratio = Math.min(4, Math.max(0.15, equity / START_EQUITY));
  return BASE_TOWER_H * Math.pow(ratio, 0.75);
}

/**
 * DEMO-ONLY height spread, enabled with ?demoheights=1. Sim equities
 * hover within a few dollars of $10,000, so real height differences are
 * invisible; this fixed spread (display only — heights + name plates)
 * exists purely for screenshots and demos. Real data is never touched.
 */
const DEMO_EQUITIES: Record<string, number> = {
  polycrypt9000: 5000,
  snapback: 9600,
  trendia: 15000,
  vega: 20000,
  wesley: 7600,
};

function fitFont(
  g: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  basePx: number,
  weight: string,
): void {
  let px = basePx;
  g.font = `${weight} ${px}px ui-sans-serif, system-ui, sans-serif`;
  while (g.measureText(text).width > maxWidth && px > 10) {
    px -= 2;
    g.font = `${weight} ${px}px ui-sans-serif, system-ui, sans-serif`;
  }
}

/** Deterministic pseudo-random generator so textures/city are stable. */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Stable per-codename hash — seeds each tower's irregular crown shape. */
function codenameHash(codename: string): number {
  let h = 2166136261;
  for (let i = 0; i < codename.length; i++) {
    h ^= codename.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Dusk sky: deep indigo up top, a magenta haze band at the horizon. */
function skyTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#150f33");
  grad.addColorStop(0.42, "#2b1e5e");
  grad.addColorStop(0.68, "#50307a");
  grad.addColorStop(0.82, "#2c1a52");
  grad.addColorStop(1, "#120c2a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const WINDOW_LIT = ["#9fd8ff", "#ffd9a0", "#7ef0d4", "#c4b5fd", "#f0abfc"];

/**
 * Dark tower facade with a sparse grid of lit windows — shared by the
 * trader buildings and the backdrop skyline. A few floors are fully
 * dark: this is a dystopia, not a resort.
 */
function facadeTexture(seed: number): THREE.CanvasTexture {
  const rand = seededRandom(seed);
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#181c2a");
  grad.addColorStop(1, "#0e1119");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = "rgba(255,255,255,0.035)";
  for (let x = 0; x <= 256; x += 64) g.fillRect(x, 0, 1, 512);
  const cols = 9;
  const rows = 26;
  const cellW = (256 - 28) / cols;
  const cellH = (512 - 28) / rows;
  const deadRows = new Set<number>();
  while (deadRows.size < 3) deadRows.add(Math.floor(rand() * rows));
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = 14 + col * cellW + (cellW - 15) / 2;
      const y = 14 + r * cellH + (cellH - 9) / 2;
      if (!deadRows.has(r) && rand() < 0.17) {
        g.globalAlpha = 0.45 + rand() * 0.55;
        g.fillStyle = WINDOW_LIT[Math.floor(rand() * WINDOW_LIT.length)]!;
        g.fillRect(x, y, 15, 9);
        g.globalAlpha = 1;
      } else {
        g.fillStyle = rand() < 0.5 ? "#0a0d15" : "#11151f";
        g.fillRect(x, y, 15, 9);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------------------
// Pixelated avatar screens
// ---------------------------------------------------------------------------

const SCREEN_LOW = 28; // avatar is crunched to 28×28, then upscaled blocky
const SCREEN_PX = 256;

/** Draw the letter-disc fallback into the low-res buffer. */
function drawLowLetter(g: CanvasRenderingContext2D, bot: BotConfig): void {
  g.fillStyle = "#05070c";
  g.fillRect(0, 0, SCREEN_LOW, SCREEN_LOW);
  g.beginPath();
  g.arc(14, 14, 13, 0, Math.PI * 2);
  g.fillStyle = bot.viz.color;
  g.fill();
  g.fillStyle = "#0b0f16";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "700 15px ui-sans-serif, system-ui, sans-serif";
  g.fillText(bot.name.charAt(0), 14, 15);
}

/**
 * Render the avatar into the screen's display canvas at chunky
 * resolution: source → 28×28 buffer → nearest-neighbour upscale, with a
 * dark bezel, scanlines, and a glass glare so it reads as a building's
 * LED billboard rather than a pasted image.
 */
function paintScreen(
  display: HTMLCanvasElement,
  bot: BotConfig,
  img: HTMLImageElement | null,
  halted = false,
): void {
  const low = document.createElement("canvas");
  low.width = SCREEN_LOW;
  low.height = SCREEN_LOW;
  const lg = low.getContext("2d")!;
  if (img) {
    lg.drawImage(img, 0, 0, SCREEN_LOW, SCREEN_LOW);
  } else {
    drawLowLetter(lg, bot);
  }
  const g = display.getContext("2d")!;
  g.fillStyle = "#04060b";
  g.fillRect(0, 0, SCREEN_PX, SCREEN_PX);
  const grad = g.createLinearGradient(0, 12, 0, SCREEN_PX - 12);
  grad.addColorStop(0, "#0a1424");
  grad.addColorStop(1, "#05080f");
  g.fillStyle = grad;
  g.fillRect(12, 12, SCREEN_PX - 24, SCREEN_PX - 24);
  g.imageSmoothingEnabled = false;
  g.drawImage(low, 0, 0, SCREEN_LOW, SCREEN_LOW, 14, 14, SCREEN_PX - 28, SCREEN_PX - 28);
  g.fillStyle = "rgba(0,0,0,0.10)";
  for (let y = 14; y < SCREEN_PX - 14; y += 4) g.fillRect(14, y, SCREEN_PX - 28, 1);
  if (halted) {
    // Kill switch engaged: the trader's screen goes dark under a red
    // HALTED band — readable even at billboard distance.
    g.fillStyle = "rgba(8,2,4,0.52)";
    g.fillRect(14, 14, SCREEN_PX - 28, SCREEN_PX - 28);
    g.fillStyle = "rgba(198,26,32,0.92)";
    g.fillRect(14, SCREEN_PX / 2 - 26, SCREEN_PX - 28, 52);
    g.fillStyle = "#ffffff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "800 34px ui-sans-serif, system-ui, sans-serif";
    g.fillText("HALTED", SCREEN_PX / 2, SCREEN_PX / 2 + 1);
  }
  g.beginPath();
  g.moveTo(14, 14);
  g.lineTo(150, 14);
  g.lineTo(60, 120);
  g.lineTo(14, 90);
  g.closePath();
  g.fillStyle = "rgba(255,255,255,0.05)";
  g.fill();
  g.strokeStyle = "rgba(130,190,255,0.28)";
  g.lineWidth = 2;
  g.strokeRect(13, 13, SCREEN_PX - 26, SCREEN_PX - 26);
}

// ---------------------------------------------------------------------------
// Name plates
// ---------------------------------------------------------------------------

interface LabelObj {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  lastText: string;
}

function makeLabel(bot: BotConfig): LabelObj {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 176;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(4.25, 1.46, 1);
  const obj: LabelObj = { sprite, canvas, texture, lastText: "" };
  drawLabel(obj, bot, "", "");
  return obj;
}

function drawLabel(
  obj: LabelObj,
  bot: BotConfig,
  line2: string,
  line3: string,
  line3Color = "#8b98a9",
): void {
  const key = `${line2}|${line3}|${line3Color}`;
  if (key === obj.lastText) return;
  obj.lastText = key;
  const g = obj.canvas.getContext("2d")!;
  g.clearRect(0, 0, 512, 176);
  g.beginPath();
  g.roundRect(6, 6, 500, 164, 22);
  g.fillStyle = "rgba(5,10,20,0.62)";
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.16)";
  g.lineWidth = 2;
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#e6edf3";
  fitFont(g, bot.name, 460, 52, "700");
  g.fillText(bot.name, 256, 44);
  g.fillStyle = "#e6edf3";
  fitFont(g, line2 || " ", 460, 44, "700");
  g.fillText(line2 || " ", 256, 100);
  g.fillStyle = line3Color;
  fitFont(g, line3 || " ", 460, 30, "500");
  g.fillText(line3 || " ", 256, 146);
  obj.texture.needsUpdate = true;
}

interface CrownItem {
  mesh: THREE.Mesh;
  /** Base height as a fraction of the tower's full height h. */
  yFrac: number;
  /** Segment height as a fraction of h; 0 = fixed-height ledge (no scaling). */
  hFrac: number;
}

interface BuildingObj {
  bot: BotConfig;
  pos: THREE.Vector3;
  baseColor: THREE.Color;
  ringMat: THREE.MeshBasicMaterial;
  facadeMat: THREE.MeshStandardMaterial;
  tower: THREE.Mesh;
  edges: THREE.Mesh[];
  /** Fraction of h that is main shaft; the crown stacks above it. */
  shaftFrac: number;
  crown: CrownItem[];
  topGroup: THREE.Group;
  /** Satellite-dish event emitter: sky beam, dish glow, expanding ring. */
  beamMat: THREE.MeshBasicMaterial;
  dishGlow: THREE.Sprite;
  dishRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  groundGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  screenGroup: THREE.Group;
  screenCanvas: HTMLCanvasElement;
  screenTex: THREE.CanvasTexture;
  applyScreen: () => void;
  /** Kill-switch visual state: flipped by the render loop when the
   *  App's halted set changes; applyScreen reads it to paint the
   *  HALTED band, and the loop drives the dark/red scene treatment. */
  visual: { halted: boolean };
  conduitCurve: THREE.QuadraticBezierCurve3;
  flowSprites: THREE.Sprite[];
  label: LabelObj;
  /** Animated tower height (above the plinth) and its target. */
  currentH: number;
  targetH: number;
  phase: number;
  flashColor: THREE.Color | null;
  flashT0: number;
  flashStrength: number;
  nodes: Map<string, NodeObj>;
}

interface NodeObj {
  group: THREE.Group;
  sphere: THREE.Mesh;
  line: THREE.Line;
  lineGeo: THREE.BufferGeometry;
  angleOffset: number;
}

interface Shock {
  mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  t0: number;
  dur: number;
  maxScale: number;
}

interface Burst {
  points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  velocities: Float32Array;
  t0: number;
  life: number;
}

interface Flare {
  sprite: THREE.Sprite;
  mat: THREE.SpriteMaterial;
  t0: number;
  dur: number;
}

interface Vehicle {
  group: THREE.Group;
  speed: number;
  offset: number;
  y: number;
  z: number;
  dir: number;
}

/**
 * The landscape as a dystopian trading city: one tower per bot around a
 * central control station, built after Keith's guide image (purple-blue
 * dusk haze, angular towers, neon, flyers overhead). Each tower's height
 * encodes its bot's balance (0.75 power — see heightForEquity), a
 * satellite dish on its stepped, irregular crown fires green/red pulses
 * into the sky on closes (synchronized with the glow pool on the ground
 * beneath it), a pixelated screen on its face shows the bot's chosen
 * avatar, and a glowing conduit runs from its plinth to the station.
 * The city's ONLY dome crowns the central control station and pulses
 * blue with team activity (Keith's correction, 2026-11-01).
 *
 * Portrait/phone viewports frame noticeably closer by default so the
 * city fills the narrow card. Buildings are inspectable: hover
 * (desktop) or tap (touch) raycasts against each tower and reports to
 * the App, which overlays the bot's holdings + today's trades dialog
 * pinned under the building's name plate.
 */
export function Landscape({
  bots,
  statsRef,
  effectsRef,
  haltedRef,
  onUnavailable,
  onInspect,
  inspectAnchorRef,
  inspectControlRef,
}: LandscapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;
  const onInspectRef = useRef(onInspect);
  onInspectRef.current = onInspect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || bots.length === 0 || initRef.current) return;
    initRef.current = true;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      unavailableRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const demoHeights =
      new URLSearchParams(window.location.search).get("demoheights") === "1";

    const scene = new THREE.Scene();
    scene.background = skyTexture();
    scene.fog = new THREE.FogExp2(0x2a2058, 0.0145);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 260);
    camera.position.set(0, 9.4, 17.5);

    scene.add(new THREE.AmbientLight(0x8d9cc0, 0.65));
    const dirLight = new THREE.DirectionalLight(0xdde4ff, 1.0);
    dirLight.position.set(6, 14, 8);
    scene.add(dirLight);
    const duskLight = new THREE.PointLight(0xb45cff, 60, 90, 1.8);
    duskLight.position.set(-24, 10, -6);
    scene.add(duskLight);

    const glowTex = glowTexture();
    const sharedFacade = facadeTexture(777);

    // --- Ground: dark disc + purple street grid ---
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({ color: "#0a0819", roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);
    const grid = new THREE.GridHelper(110, 110, 0x4a3590, 0x20164a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.34;
    grid.position.y = 0.01;
    scene.add(grid);

    // --- Stars (dim, through the haze) ---
    {
      const n = 260;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 70 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const y = 16 + Math.random() * 50;
        pos[i * 3] = Math.cos(theta) * r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(theta) * r - 20;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const stars = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color: 0x9fb4e8, size: 0.4, fog: false, transparent: true, opacity: 0.55 }),
      );
      scene.add(stars);
    }

    // --- Backdrop skyline: instanced dark towers in the haze ---
    {
      const rand = seededRandom(4242);
      const count = 120;
      const geo = new THREE.BoxGeometry(1, 1, 1);
      geo.translate(0, 0.5, 0);
      const mat = new THREE.MeshStandardMaterial({ map: sharedFacade, roughness: 0.95, metalness: 0.05 });
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      const dummy = new THREE.Object3D();
      const tint = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2;
        const radius = 27 + rand() * 26;
        const h = 5 + Math.pow(rand(), 1.6) * 19;
        const w = 2.6 + rand() * 3.2;
        dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 8);
        dummy.scale.set(w, h, w);
        dummy.rotation.y = rand() * Math.PI;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        tint.setHSL(0.74, 0.32, 0.42 + rand() * 0.3);
        mesh.setColorAt(i, tint);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
    }

    // --- Central control station: wide command structure + THE dome ---
    // The city's only dome lives here (Keith's correction, 2026-11-01):
    // a dark gray metal dome over the station, its base band and glow
    // pulsing blue — steady, with brightness tracking team activity.
    // All conduits land on this station.
    const hubGroup = new THREE.Group();
    hubGroup.position.copy(HUB_POS);
    scene.add(hubGroup);
    const hubBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.9, 0.45, 40),
      new THREE.MeshStandardMaterial({ color: "#0d1424", roughness: 0.5, metalness: 0.45 }),
    );
    hubBase.position.y = 0.225;
    hubGroup.add(hubBase);
    const hubTrimMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 });
    const hubTrim = new THREE.Mesh(new THREE.TorusGeometry(4.55, 0.05, 8, 56), hubTrimMat);
    hubTrim.rotation.x = Math.PI / 2;
    hubTrim.position.y = 0.46;
    hubGroup.add(hubTrim);
    const hubTier1Mat = new THREE.MeshStandardMaterial({
      map: sharedFacade.clone(),
      roughness: 0.8,
      metalness: 0.2,
    });
    hubTier1Mat.map!.repeat.set(2.2, 1.1);
    const hubTier1 = new THREE.Mesh(new THREE.BoxGeometry(4.7, 1.7, 4.7), hubTier1Mat);
    hubTier1.position.y = 0.45 + 0.85;
    hubGroup.add(hubTier1);
    const hubTier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 3.0, 1.05, 32),
      new THREE.MeshStandardMaterial({ color: "#131a2c", roughness: 0.55, metalness: 0.5 }),
    );
    hubTier2.position.y = 2.15 + 0.525;
    hubGroup.add(hubTier2);
    const hubDomeMat = new THREE.MeshStandardMaterial({
      color: "#22262f",
      metalness: 0.9,
      roughness: 0.32,
      emissive: new THREE.Color("#1d4ed8"),
      emissiveIntensity: 0.1,
    });
    const hubDome = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      hubDomeMat,
    );
    hubDome.position.y = 3.2;
    hubGroup.add(hubDome);
    const hubDomeBandMat = new THREE.MeshBasicMaterial({ color: DOME_BLUE_BRIGHT.clone() });
    const hubDomeBand = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 10, 48), hubDomeBandMat);
    hubDomeBand.rotation.x = Math.PI / 2;
    hubDomeBand.position.y = 3.26;
    hubGroup.add(hubDomeBand);
    const hubDomeGlowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: DOME_BLUE_BRIGHT.clone(),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const hubDomeGlow = new THREE.Sprite(hubDomeGlowMat);
    hubDomeGlow.scale.set(7.6, 7.6, 1);
    hubDomeGlow.position.y = 4.1;
    hubGroup.add(hubDomeGlow);
    const hubMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: "#05070c", roughness: 0.4, metalness: 0.6 }),
    );
    hubMast.position.y = 3.2 + 2.2 + 0.5;
    hubGroup.add(hubMast);
    const hubBeaconMat = new THREE.MeshBasicMaterial({ color: CYAN });
    const hubBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), hubBeaconMat);
    hubBeacon.position.y = 3.2 + 2.2 + 1.08;
    hubGroup.add(hubBeacon);
    const hubLight = new THREE.PointLight(0x3d8bff, 30, 52, 1.6);
    hubLight.position.set(HUB_POS.x, 5.2, HUB_POS.z);
    scene.add(hubLight);

    // --- Flying vehicles drifting over the city ---
    const vehicles: Vehicle[] = [];
    {
      const specs = [
        { y: 12.5, z: -20, speed: 1.5, dir: 1, color: "#22d3ee", offset: -30 },
        { y: 15.5, z: -27, speed: 1.05, dir: -1, color: "#f0abfc", offset: 18 },
        { y: 10.5, z: -15, speed: 2.0, dir: 1, color: "#ffd9a0", offset: 42 },
      ];
      for (const spec of specs) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.17, 1.15, 4, 10),
          new THREE.MeshStandardMaterial({ color: "#0b0e1d", roughness: 0.3, metalness: 0.75 }),
        );
        body.rotation.z = Math.PI / 2;
        group.add(body);
        const trailMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: new THREE.Color(spec.color),
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const trail = new THREE.Sprite(trailMat);
        trail.scale.set(3.4, 0.65, 1);
        trail.position.x = -1.5;
        group.add(trail);
        if (spec.dir < 0) group.rotation.y = Math.PI;
        group.position.set(spec.offset, spec.y, spec.z);
        scene.add(group);
        vehicles.push({ group, speed: spec.speed, offset: spec.offset, y: spec.y, z: spec.z, dir: spec.dir });
      }
    }

    // --- Trader buildings, one per bot, in a shallow arc facing the hub ---
    const buildings: BuildingObj[] = [];
    const buildingByName = new Map<string, BuildingObj>();
    /** Raycast targets for building inspection (see the inspect block). */
    const hitTargets: THREE.Object3D[] = [];
    const n = bots.length;
    // Portrait screens get a tighter arc so the city fills the narrow frame.
    const initAspect = container.clientWidth / Math.max(1, container.clientHeight);
    const arcSpread = initAspect < 1 ? 1.05 : 1.7;
    const arcRadius = initAspect < 1 ? 9.5 : 11.5;
    const pipeMat = new THREE.MeshStandardMaterial({ color: "#131824", roughness: 0.45, metalness: 0.65 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: "#05070c", roughness: 0.4, metalness: 0.6 });
    // Satellite dishes: dark metal; the only life is a faint cool rim
    // glint at idle — they light up only when firing a pulse.
    const dishMat = new THREE.MeshStandardMaterial({
      color: "#272c38",
      metalness: 0.85,
      roughness: 0.38,
      side: THREE.DoubleSide,
    });

    bots.forEach((bot, i) => {
      const frac = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5 .. 0.5
      const angle = frac * arcSpread;
      const pos = new THREE.Vector3(
        Math.sin(angle) * arcRadius,
        0,
        -2.5 - (1 - Math.cos(angle)) * 7,
      );
      const baseColor = new THREE.Color(bot.viz.color);
      const group = new THREE.Group();
      group.position.copy(pos);
      scene.add(group);

      // Plinth + neon trim + momentum ring (the old pad's ring, kept).
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, PLINTH_TOP, 4.0),
        new THREE.MeshStandardMaterial({ color: "#0d1424", roughness: 0.5, metalness: 0.4 }),
      );
      plinth.position.y = PLINTH_TOP / 2;
      group.add(plinth);
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(4.18, 0.05, 4.18),
        new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.5 }),
      );
      trim.position.y = PLINTH_TOP - 0.03;
      group.add(trim);
      const ringMat = new THREE.MeshBasicMaterial({
        color: baseColor.clone(),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(2.35, 2.8, 48), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);
      // Ground glow pool directly under the building. It idles as a faint
      // bot-color wash and fires WITH the dish's sky pulse on close
      // events — same flash state, same color, same 1 s decay (driven
      // from the same flash state in the render loop), swelling as it
      // fades.
      const groundGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: glowTex,
          color: baseColor.clone(),
          transparent: true,
          opacity: 0.07,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      groundGlow.rotation.x = -Math.PI / 2;
      groundGlow.position.y = 0.06;
      groundGlow.userData.noHit = true; // effect plane, not inspect surface
      groundGlow.scale.set(5.6, 5.6, 1);
      group.add(groundGlow);

      // Tower: a slim shaft (unit-height box, pivot at its base, so
      // scale.y is height) plus a stepped, irregular crown stacked on
      // top of it — slimmer setbacks with per-bot offsets, so no two
      // silhouettes match. The crown layout is seeded by codename.
      const facadeMat = new THREE.MeshStandardMaterial({
        map: facadeTexture(1000 + i * 131),
        roughness: 0.85,
        metalness: 0.15,
      });
      const SHAFT_W = 1.7;
      const towerGeo = new THREE.BoxGeometry(SHAFT_W, 1, SHAFT_W);
      towerGeo.translate(0, 0.5, 0);
      const tower = new THREE.Mesh(towerGeo, facadeMat);
      tower.position.y = PLINTH_TOP;
      group.add(tower);
      // Neon edge strips up the shaft corners (guide-image glow lines).
      const edges: THREE.Mesh[] = [];
      const edgeGeo = new THREE.BoxGeometry(0.055, 1, 0.055);
      edgeGeo.translate(0, 0.5, 0);
      const half = SHAFT_W / 2;
      for (const [ex, ez] of [[-half, -half], [half, -half], [-half, half], [half, half]] as const) {
        const edge = new THREE.Mesh(
          edgeGeo,
          new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.4 }),
        );
        edge.position.set(ex, PLINTH_TOP, ez);
        group.add(edge);
        edges.push(edge);
      }
      // Crown: 2–3 stepped segments above the shaft, each narrower and
      // offset, with a thin ledge slab at each step; the last segment
      // sometimes gets a small jagged fin. Segments/ledges are placed
      // per frame from height fractions (see CrownItem).
      const crown: CrownItem[] = [];
      const crownRand = seededRandom(codenameHash(bot.codename) + 97);
      const shaftFrac = 0.7 + Math.floor(crownRand() * 3) * 0.04; // 0.70–0.78
      const segCount = crownRand() < 0.5 ? 2 : 3;
      const proportions =
        segCount === 2 ? [0.58, 0.42] : [0.44, 0.33, 0.23];
      let segY = shaftFrac;
      let segW = 1.38;
      proportions.forEach((prop, s) => {
        const hFrac = (1 - shaftFrac) * prop;
        const ledge = new THREE.Mesh(
          new THREE.BoxGeometry(segW + 0.18, 0.07, segW + 0.14),
          darkMetal,
        );
        ledge.position.set(0, PLINTH_TOP + BASE_TOWER_H * segY, 0);
        group.add(ledge);
        crown.push({ mesh: ledge, yFrac: segY, hFrac: 0 });
        const segGeo = new THREE.BoxGeometry(segW, 1, segW * (0.88 + crownRand() * 0.16));
        segGeo.translate(0, 0.5, 0);
        const seg = new THREE.Mesh(segGeo, facadeMat);
        seg.position.set(
          (crownRand() - 0.5) * 0.44,
          PLINTH_TOP + BASE_TOWER_H * segY,
          (crownRand() - 0.5) * 0.36,
        );
        if (s > 0 && crownRand() < 0.6) seg.rotation.y = (crownRand() - 0.5) * 0.4;
        group.add(seg);
        crown.push({ mesh: seg, yFrac: segY, hFrac });
        if (s === proportions.length - 1 && crownRand() < 0.55) {
          // Jagged fin beside the dish: a thin slab poking past the top.
          const fin = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1, segW * 0.55),
            darkMetal,
          );
          fin.geometry.translate(0, 0.5, 0);
          fin.position.set(segW * 0.32, PLINTH_TOP + BASE_TOWER_H * segY, -segW * 0.18);
          group.add(fin);
          crown.push({ mesh: fin, yFrac: segY + hFrac * 0.55, hFrac: hFrac * 0.75 });
        }
        segY += hFrac;
        segW = Math.max(0.58, segW - 0.3 - crownRand() * 0.12);
      });

      // Pixelated avatar screen on the shaft's front (+z) face.
      // `visual.halted` is the kill-switch flag for this building; the
      // render loop flips it and re-runs applyScreen on change.
      const visual = { halted: false };
      const screenGroup = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.58, 1.58, 0.1), darkMetal);
      screenGroup.add(frame);
      const screenCanvas = document.createElement("canvas");
      screenCanvas.width = SCREEN_PX;
      screenCanvas.height = SCREEN_PX;
      paintScreen(screenCanvas, bot, null);
      const screenTex = new THREE.CanvasTexture(screenCanvas);
      screenTex.colorSpace = THREE.SRGBColorSpace;
      screenTex.anisotropy = 4;
      const screenPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.42, 1.42),
        new THREE.MeshBasicMaterial({ map: screenTex }),
      );
      screenPlane.position.z = 0.06;
      screenGroup.add(screenPlane);
      const screenGlowMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: baseColor,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const screenGlow = new THREE.Sprite(screenGlowMat);
      screenGlow.scale.set(3.1, 3.1, 1);
      screenGlow.position.z = -0.15;
      screenGroup.add(screenGlow);
      screenGroup.position.set(0, PLINTH_TOP + BASE_TOWER_H * 0.7 * 0.55, 0.88);
      group.add(screenGroup);
      // Repaint the screen from the bot's current avatar — picker choice
      // when saved, else the default portrait, else the pixel letter.
      // A halted building's screen is repainted dark with the red
      // HALTED band (paintScreen's halted pass).
      const applyScreen = (): void => {
        const url = resolveAvatarUrl(bot.codename, getAvatarChoiceId(bot.codename));
        if (!url) {
          paintScreen(screenCanvas, bot, null, visual.halted);
          screenTex.needsUpdate = true;
          return;
        }
        const img = new Image();
        img.onload = () => {
          paintScreen(screenCanvas, bot, img, visual.halted);
          screenTex.needsUpdate = true;
        };
        img.src = url;
      };
      applyScreen();

      // Satellite dish on the crown: the building's event emitter. A
      // parabolic dish on a short mount, tilted up toward the sky. On
      // a close it fires a colored pulse UP — a bright beam column, an
      // expanding ring at the dish, a glow burst — driven by the same
      // flash state as the ground pool below (see the render loop).
      // Idle it is dark metal with a faint cool rim glint; no beam.
      const topGroup = new THREE.Group();
      topGroup.position.y = PLINTH_TOP + BASE_TOWER_H;
      group.add(topGroup);
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.5, 10), darkMetal);
      mount.position.y = 0.25;
      topGroup.add(mount);
      const dishTilt = new THREE.Group();
      dishTilt.position.y = 0.52;
      dishTilt.rotation.x = -0.5; // tip the bowl skyward, open to the viewer
      topGroup.add(dishTilt);
      const dishProfile: THREE.Vector2[] = [];
      for (let k = 0; k <= 10; k++) {
        const r = (k / 10) * 1.02;
        dishProfile.push(new THREE.Vector2(r, 0.4 * r * r));
      }
      const dish = new THREE.Mesh(new THREE.LatheGeometry(dishProfile, 30), dishMat);
      dishTilt.add(dish);
      const dishRimMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#7dd3fc"),
        transparent: true,
        opacity: 0.28,
      });
      const dishRim = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.022, 8, 40), dishRimMat);
      dishRim.rotation.x = Math.PI / 2;
      dishRim.position.y = 0.4;
      dishTilt.add(dishRim);
      const feedArm = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.85, 6), darkMetal);
      feedArm.position.y = 0.42;
      dishTilt.add(feedArm);
      const feed = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), darkMetal);
      feed.position.y = 0.85;
      dishTilt.add(feed);
      // Sky beam: a tall additive column, invisible until a flash fires.
      const beamMat = new THREE.MeshBasicMaterial({
        color: GREEN.clone(),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const beamGeo = new THREE.CylinderGeometry(0.13, 0.3, 17, 12, 1, true);
      beamGeo.translate(0, 8.5, 0);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.userData.noHit = true; // effect column, not inspect surface
      beam.position.y = 0.62;
      beam.renderOrder = 5;
      topGroup.add(beam);
      const dishGlowMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: GREEN.clone(),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const dishGlow = new THREE.Sprite(dishGlowMat);
      dishGlow.scale.set(2.6, 2.6, 1);
      dishGlow.position.y = 0.72;
      topGroup.add(dishGlow);
      const dishRingMat = new THREE.MeshBasicMaterial({
        color: GREEN.clone(),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const dishRing = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.0, 40), dishRingMat);
      dishRing.userData.noHit = true; // effect ring, not inspect surface
      dishRing.rotation.x = -Math.PI / 2;
      dishRing.position.y = 0.66;
      topGroup.add(dishRing);

      // Conduit to the hub: dark pipe + bot-color glow wire + flow pulses.
      const toHub = HUB_POS.clone().sub(pos).setY(0).normalize();
      const start = pos.clone().addScaledVector(toHub, 1.8);
      start.y = 0.14;
      const end = HUB_POS.clone().addScaledVector(toHub, -4.55);
      end.y = 0.14;
      const mid = start.clone().lerp(end, 0.5);
      mid.y = 0.34;
      const conduitCurve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pipe = new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 24, 0.085, 7), pipeMat);
      scene.add(pipe);
      const wireCurve = new THREE.QuadraticBezierCurve3(
        start.clone().add(new THREE.Vector3(0, 0.13, 0)),
        mid.clone().add(new THREE.Vector3(0, 0.13, 0)),
        end.clone().add(new THREE.Vector3(0, 0.13, 0)),
      );
      const wire = new THREE.Mesh(
        new THREE.TubeGeometry(wireCurve, 24, 0.05, 6),
        new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.9 }),
      );
      scene.add(wire);
      const flowSprites: THREE.Sprite[] = [];
      for (let k = 0; k < 3; k++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: baseColor,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        s.scale.set(1.15, 1.15, 1);
        scene.add(s);
        flowSprites.push(s);
      }

      const label = makeLabel(bot);
      label.sprite.position.set(pos.x, PLINTH_TOP + BASE_TOWER_H + 3.0, pos.z);
      scene.add(label.sprite);

      // Raycast targets for the inspect dialog: every solid mesh of the
      // building (plinth, tower, crown, screen, dish — effect meshes opt
      // out via userData.noHit) plus its name plate.
      group.traverse((o) => {
        if (o instanceof THREE.Mesh && !o.userData.noHit) {
          o.userData.botName = bot.name;
          hitTargets.push(o);
        }
      });
      label.sprite.userData.botName = bot.name;
      hitTargets.push(label.sprite);

      const obj: BuildingObj = {
        bot,
        pos,
        baseColor,
        ringMat,
        facadeMat,
        tower,
        edges,
        shaftFrac,
        crown,
        topGroup,
        beamMat,
        dishGlow,
        dishRing,
        groundGlow,
        screenGroup,
        screenCanvas,
        screenTex,
        applyScreen,
        visual,
        conduitCurve: wireCurve,
        flowSprites,
        label,
        currentH: BASE_TOWER_H,
        targetH: BASE_TOWER_H,
        phase: Math.random() * Math.PI * 2,
        flashColor: null,
        flashT0: 0,
        flashStrength: 0,
        nodes: new Map(),
      };
      buildings.push(obj);
      buildingByName.set(bot.name, obj);
    });

    // Avatar-picker changes repaint the screens live.
    const onAvatarChoice = (): void => {
      buildings.forEach((b) => b.applyScreen());
    };
    window.addEventListener(AVATAR_CHOICE_EVENT, onAvatarChoice);

    // --- Building inspect (Keith, 2026-11-01) ---
    // Hovering a building (desktop) or tapping it (touch) opens that
    // bot's inspect dialog in the App — a DOM overlay with its current
    // holdings and today's trades. The scene only detects intent:
    // raycasts per frame against each building's meshes + name plate,
    // applies a 250 ms hover-intent delay before opening and a 375 ms
    // close grace after the pointer leaves, reports changes through
    // onInspect, publishes the name-plate anchor for the dialog to
    // track, and exposes hold/release/dismiss so the dialog (which the
    // pointer can move into) cooperates with the close logic.
    const OPEN_DELAY_MS = 250;
    const CLOSE_GRACE_MS = 375;
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const cvs = renderer.domElement;
    let lastClientX = 0;
    let lastClientY = 0;
    let pointerOver = false;
    let pointerIsMouse = true;
    let candidateBot: string | null = null;
    let candidateSince = 0;
    let activeBot: string | null = null;
    let activePinned = false;
    let closeAt = 0;
    let dialogHeld = false;
    let suppressBot: string | null = null;
    let cursorWanted = "";

    function pickAt(clientX: number, clientY: number): string | null {
      const rect = cvs.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointerNdc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      const name = hits.length ? hits[0]!.object.userData.botName : null;
      return typeof name === "string" ? name : null;
    }

    function setActive(name: string | null, pinned: boolean): void {
      activeBot = name;
      activePinned = pinned;
      candidateBot = null;
      closeAt = 0;
      if (!name && inspectAnchorRef) inspectAnchorRef.current = null;
      onInspectRef.current?.(name, pinned);
    }

    const onPointerMove = (e: PointerEvent): void => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      pointerIsMouse = e.pointerType === "mouse";
      pointerOver = true;
    };
    const onPointerDown = (e: PointerEvent): void => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      pointerIsMouse = e.pointerType === "mouse";
      pointerOver = true;
    };
    const onPointerLeave = (): void => {
      pointerOver = false;
    };
    const onCanvasClick = (e: MouseEvent): void => {
      const name = pickAt(e.clientX, e.clientY);
      if (name) {
        if (activeBot === name && activePinned) {
          // Tapping the open building again toggles it shut.
          suppressBot = name;
          setActive(null, false);
        } else {
          setActive(name, true);
        }
      } else if (activePinned) {
        // Tap/click on empty space dismisses a pinned dialog.
        setActive(null, false);
      }
    };
    cvs.addEventListener("pointermove", onPointerMove);
    cvs.addEventListener("pointerdown", onPointerDown);
    cvs.addEventListener("pointerleave", onPointerLeave);
    cvs.addEventListener("click", onCanvasClick);

    if (inspectControlRef) {
      inspectControlRef.current = {
        holdOpen: () => {
          dialogHeld = true;
          closeAt = 0;
        },
        releaseHold: () => {
          dialogHeld = false;
        },
        dismiss: () => {
          if (activeBot) {
            suppressBot = activeBot;
            setActive(null, false);
          }
        },
      };
    }

    function updateInspect(now: number): void {
      const pick =
        pointerOver && pointerIsMouse ? pickAt(lastClientX, lastClientY) : null;
      // Pointer cursor affordance over buildings (desktop).
      const want = pick ? "pointer" : "";
      if (want !== cursorWanted) {
        cursorWanted = want;
        cvs.style.cursor = want;
      }
      // A dismissal suppresses hover re-opening until the pointer has
      // left that building (any different pick clears the suppression).
      if (suppressBot && pick !== suppressBot) suppressBot = null;

      if (activeBot) {
        if (!activePinned) {
          if (dialogHeld || pick === activeBot) {
            closeAt = 0;
            candidateBot = null;
          } else if (pick && pick !== suppressBot) {
            // Hovering a different building: switch after hover intent.
            if (candidateBot !== pick) {
              candidateBot = pick;
              candidateSince = now;
            } else if (now - candidateSince >= OPEN_DELAY_MS) {
              setActive(pick, false);
            }
            closeAt = 0;
          } else {
            candidateBot = null;
            if (closeAt === 0) closeAt = now + CLOSE_GRACE_MS;
            else if (now >= closeAt) setActive(null, false);
          }
        }
      } else if (pick && pick !== suppressBot) {
        if (candidateBot !== pick) {
          candidateBot = pick;
          candidateSince = now;
        } else if (now - candidateSince >= OPEN_DELAY_MS) {
          setActive(pick, false);
        }
      } else {
        candidateBot = null;
      }

      // Publish the dialog anchor: the building's name-plate center in
      // viewport pixels, refreshed per frame since the camera drifts.
      if (activeBot && inspectAnchorRef) {
        const b = buildingByName.get(activeBot);
        if (b) {
          camera.updateMatrixWorld();
          const v = b.label.sprite.position.clone().project(camera);
          const rect = cvs.getBoundingClientRect();
          inspectAnchorRef.current = {
            name: activeBot,
            x: rect.left + (v.x * 0.5 + 0.5) * rect.width,
            y: rect.top + (-v.y * 0.5 + 0.5) * rect.height,
            visible: v.z < 1,
          };
        }
      }
    }

    // --- Live effects pools ---
    const shocks: Shock[] = [];
    const bursts: Burst[] = [];
    const flares: Flare[] = [];

    function spawnShock(pos: THREE.Vector3, color: THREE.Color, maxScale: number, dur: number): void {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 48), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(pos.x, 0.12, pos.z);
      scene.add(mesh);
      shocks.push({ mesh, t0: performance.now(), dur, maxScale });
    }

    function spawnBurst(pos: THREE.Vector3, y: number, color: THREE.Color, rising: boolean): void {
      const count = 60;
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = pos.z;
        const a = Math.random() * Math.PI * 2;
        const spread = Math.random() * 1.4;
        velocities[i * 3] = Math.cos(a) * spread;
        velocities[i * 3 + 1] = rising ? 2.2 + Math.random() * 2.6 : -(1.2 + Math.random() * 2.4);
        velocities[i * 3 + 2] = Math.sin(a) * spread;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: 0.16,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      bursts.push({ points, velocities, t0: performance.now(), life: 1500 });
    }

    function spawnFlare(pos: THREE.Vector3, y: number): void {
      const mat = new THREE.SpriteMaterial({
        map: glowTex,
        color: RED,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(pos.x, y, pos.z);
      sprite.scale.set(1, 1, 1);
      scene.add(sprite);
      flares.push({ sprite, mat, t0: performance.now(), dur: 550 });
    }

    function handleEffect(effect: EffectEvent): void {
      const b = buildingByName.get(effect.bot);
      if (!b) return;
      const topY = PLINTH_TOP + b.currentH + 1.1;
      if (effect.kind === "win") {
        spawnShock(b.pos, GREEN, 5.6, 1100);
        spawnShock(b.pos, CYAN, 3.8, 850);
        spawnBurst(b.pos, topY, new THREE.Color("#3ff5c8"), true);
        b.flashColor = GREEN.clone();
        b.flashStrength = 0.95;
        b.flashT0 = performance.now();
      } else if (effect.kind === "loss") {
        spawnFlare(b.pos, topY);
        spawnShock(b.pos, RED, 2.8, 800);
        spawnBurst(b.pos, topY, new THREE.Color("#ff6a55"), false);
        b.flashColor = RED.clone();
        b.flashStrength = 0.95;
        b.flashT0 = performance.now();
      } else {
        spawnShock(b.pos, b.baseColor, 2.0, 650);
        b.flashColor = b.baseColor.clone();
        b.flashStrength = 0.45;
        b.flashT0 = performance.now();
      }
    }

    function makeNode(b: BuildingObj, key: string, symbol: string): NodeObj {
      const group = new THREE.Group();
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 14, 14),
        new THREE.MeshBasicMaterial({ color: b.baseColor }),
      );
      group.add(sphere);
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 72;
      const g = canvas.getContext("2d")!;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "rgba(5,10,20,0.6)";
      g.beginPath();
      g.roundRect(28, 8, 200, 56, 14);
      g.fill();
      g.fillStyle = "#e6edf3";
      fitFont(g, symbol, 185, 30, "600");
      g.fillText(symbol, 128, 38);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
      );
      labelSprite.scale.set(1.7, 0.48, 1);
      labelSprite.position.y = 0.46;
      group.add(labelSprite);
      scene.add(group);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: b.baseColor, transparent: true, opacity: 0.55 }),
      );
      scene.add(line);
      return { group, sphere, line, lineGeo, angleOffset: (key.length * 1.37) % (Math.PI * 2) };
    }

    // --- Sizing ---
    let viewAspect = 1;
    function resize(): void {
      const w = container!.clientWidth || 1;
      const h = container!.clientHeight || 1;
      renderer.setSize(w, h);
      viewAspect = w / h;
      camera.aspect = viewAspect;
      // Portrait screens get a wider FOV so the whole city stays in frame.
      camera.fov = viewAspect < 1 ? 76 : viewAspect < 1.5 ? 60 : 52;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // --- Render loop ---
    let raf = 0;
    const clock = new THREE.Clock();
    let lastLabelCheck = 0;

    function animate(): void {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.elapsedTime;
      const now = performance.now();
      const nowMs = Date.now();

      // Idle camera drift. Portrait/phone viewports frame much closer
      // by default (Keith, 2026-11-01): lower, nearer, and aimed at the
      // towers so the city fills the narrow card instead of bunching at
      // the top over a field of empty ground. Desktop framing is the
      // original wide shot, unchanged.
      const portrait = viewAspect < 1;
      const camZ = portrait ? 13.2 : viewAspect < 1.5 ? 20 : 17.5;
      camera.position.x = Math.sin(t * 0.07) * (portrait ? 1.3 : 2.3);
      camera.position.y =
        (portrait ? 6.3 : 9.4) + Math.sin(t * 0.11) * (portrait ? 0.35 : 0.55);
      camera.position.z = camZ + Math.cos(t * 0.05) * (portrait ? 0.5 : 0.9);
      camera.lookAt(0, portrait ? 2.6 : 2.1, portrait ? -3.0 : -3.4);

      // Building-inspect hover/tap state machine (mouse intent, close
      // grace, dialog anchor) — resolved before the frame renders.
      updateInspect(now);

      // Drain queued effects.
      while (effectsRef.current.length > 0) {
        const effect = effectsRef.current.shift()!;
        handleEffect(effect);
      }

      // Hub activity: brightness tracks events seen in the last ~10 s.
      let recentEvents = 0;
      for (const stats of statsRef.current.values()) {
        for (const close of stats.recentCloses) {
          if (nowMs - close.ts < 10_000) recentEvents += 1;
        }
      }
      const activity = 0.45 + Math.min(1.3, recentEvents * 0.22) + Math.sin(t * 2.2) * 0.06;
      // The control station's dome breathes blue: a steady pulse whose
      // brightness tracks how much closing action the team just made.
      const domePulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      hubDomeBandMat.color
        .copy(DOME_BLUE_DARK)
        .lerp(DOME_BLUE_BRIGHT, 0.25 + domePulse * 0.35 + Math.min(0.4, activity * 0.22));
      hubDomeGlowMat.opacity = 0.2 + domePulse * 0.12 + Math.min(0.45, activity * 0.3);
      hubDomeMat.emissiveIntensity = 0.06 + Math.min(0.3, activity * 0.16);
      hubLight.intensity = 14 + activity * 24;
      hubTrimMat.opacity = 0.35 + Math.min(0.55, activity * 0.3);

      // Flying vehicles: slow crossings, wrapping at the haze line.
      for (const v of vehicles) {
        const span = 110;
        let x = (v.offset + t * v.speed * v.dir) % span;
        if (x > span / 2) x -= span;
        if (x < -span / 2) x += span;
        v.group.position.set(x, v.y + Math.sin(t * 0.6 + v.offset) * 0.35, v.z);
      }

      for (const b of buildings) {
        // Height easing toward the balance-implied target. The shaft
        // takes shaftFrac of h; crown segments stack above it from
        // their height fractions, so the whole stepped silhouette
        // grows/shrinks as one.
        b.currentH += (b.targetH - b.currentH) * Math.min(1, dt * 1.6);
        const h = b.currentH;
        const shaftH = h * b.shaftFrac;
        b.tower.scale.y = shaftH;
        for (const e of b.edges) e.scale.y = shaftH;
        for (const item of b.crown) {
          item.mesh.position.y = PLINTH_TOP + h * item.yFrac;
          if (item.hFrac > 0) item.mesh.scale.y = h * item.hFrac;
        }
        b.topGroup.position.y = PLINTH_TOP + h;
        b.screenGroup.position.y = PLINTH_TOP + shaftH * 0.55;
        b.label.sprite.position.y = PLINTH_TOP + h + 3.0;
        const repeatY = Math.max(1, Math.round(shaftH / 2.4));
        if (b.facadeMat.map && b.facadeMat.map.repeat.y !== repeatY) {
          b.facadeMat.map.repeat.y = repeatY;
        }

        // Kill-switch state for this building (API-owned, mirrored by
        // the App into haltedRef). A halted building goes dark: facade
        // dims, ring holds steady red, ground pool turns dim red, the
        // dish stays inert, and the screen repaints with its HALTED
        // band. Flipping is edge-triggered so the screen repaint and
        // label change land exactly once per transition.
        const halted = haltedRef?.current.has(b.bot.name) ?? false;
        if (b.visual.halted !== halted) {
          b.visual.halted = halted;
          b.applyScreen();
          if (halted) b.flashColor = null;
        }
        b.facadeMat.color.lerp(halted ? FACADE_DIM : FACADE_FULL, 0.07);

        // Plinth ring tint: green↔red with realized-PnL momentum —
        // overridden to a steady red while the bot is halted.
        const stats = statsRef.current.get(b.bot.name);
        const norm = stats ? momentumAt(stats, nowMs) : 0;
        const target = halted ? RED.clone() : b.baseColor.clone();
        if (!halted) {
          if (norm > 0) target.lerp(GREEN, norm * 0.9);
          else if (norm < 0) target.lerp(RED, -norm * 0.9);
        }
        b.ringMat.color.lerp(target, 0.06);
        const targetRingOpacity = halted ? 0.9 : 0.5 + Math.abs(norm) * 0.45;
        b.ringMat.opacity += (targetRingOpacity - b.ringMat.opacity) * 0.08;

        // Dish sky pulse + ground glow pool: on a close event BOTH fire
        // from the same flash state (same color, same strength, same
        // 1 s decay) — beam, expanding ring, and glow at the dish up
        // top; light pool on the ground beneath. Idle: no beam at all.
        let flashK = 0;
        let flashProgress = 0;
        if (b.flashColor) {
          const age = now - b.flashT0;
          const dur = 1000;
          if (age < dur) {
            flashProgress = age / dur;
            flashK = (1 - flashProgress) * b.flashStrength;
          } else {
            b.flashColor = null;
          }
        }
        if (b.flashColor && flashK > 0 && !halted) {
          b.beamMat.color.copy(b.flashColor);
          b.beamMat.opacity = flashK * 0.8;
          b.dishGlow.material.color.copy(b.flashColor);
          b.dishGlow.material.opacity = flashK * 0.95;
          const glowScale = 2.6 + flashProgress * 1.9;
          b.dishGlow.scale.set(glowScale, glowScale, 1);
          b.dishRing.material.color.copy(b.flashColor);
          b.dishRing.material.opacity = flashK * 0.65;
          const ringScale = 0.7 + flashProgress * 2.6;
          b.dishRing.scale.set(ringScale, ringScale, 1);
          b.groundGlow.material.color.copy(b.flashColor);
          b.groundGlow.material.opacity = 0.1 + flashK * 0.55;
          const swell = 5.6 + flashProgress * 2.2;
          b.groundGlow.scale.set(swell, swell, 1);
        } else {
          // Idle — or halted, in which case the dish is inert and the
          // ground pool holds a dim red instead of the bot-color wash.
          b.beamMat.opacity = 0;
          b.dishGlow.material.opacity = 0;
          b.dishRing.material.opacity = 0;
          if (halted) {
            b.groundGlow.material.color.lerp(HALT_POOL, 0.08);
            b.groundGlow.material.opacity +=
              (0.17 - b.groundGlow.material.opacity) * 0.08;
          } else {
            b.groundGlow.material.color.lerp(b.baseColor, 0.08);
            b.groundGlow.material.opacity += (0.07 - b.groundGlow.material.opacity) * 0.08;
          }
          b.groundGlow.scale.set(5.6, 5.6, 1);
        }

        // Conduit traffic: pulses flow along the wire toward the hub.
        for (let k = 0; k < b.flowSprites.length; k++) {
          const u = (t * 0.16 + k / b.flowSprites.length + b.phase) % 1;
          const p = b.conduitCurve.getPoint(u);
          b.flowSprites[k]!.position.copy(p);
          const s = 0.9 + Math.sin(u * Math.PI) * 0.55;
          b.flowSprites[k]!.scale.set(s, s, 1);
        }

        // Open-position nodes orbit at mid-tower, tethered to the roof.
        const desired = new Map<string, string>();
        if (stats) {
          for (const p of stats.openPositions) desired.set(p.key, p.symbol);
        }
        for (const key of [...b.nodes.keys()]) {
          if (!desired.has(key)) {
            const node = b.nodes.get(key)!;
            scene.remove(node.group);
            scene.remove(node.line);
            node.lineGeo.dispose();
            b.nodes.delete(key);
          }
        }
        for (const [key, symbol] of desired) {
          if (!b.nodes.has(key)) b.nodes.set(key, makeNode(b, key, symbol));
        }
        let idx = 0;
        for (const node of b.nodes.values()) {
          const a = t * 0.55 + node.angleOffset + idx * 1.1;
          const nx = b.pos.x + Math.cos(a) * 3.0;
          const nz = b.pos.z + Math.sin(a) * 3.0;
          const ny = PLINTH_TOP + h * 0.55 + Math.sin(t * 1.4 + node.angleOffset) * 0.25;
          node.group.position.set(nx, ny, nz);
          const attr = node.lineGeo.getAttribute("position") as THREE.BufferAttribute;
          attr.setXYZ(0, b.pos.x, PLINTH_TOP + h * 0.85, b.pos.z);
          attr.setXYZ(1, nx, ny, nz);
          attr.needsUpdate = true;
          idx += 1;
        }
      }

      // Name plates + height targets (throttled).
      if (now - lastLabelCheck > 250) {
        lastLabelCheck = now;
        for (const b of buildings) {
          const stats = statsRef.current.get(b.bot.name);
          const realEquity = stats ? stats.equity : START_EQUITY;
          // ?demoheights=1 overrides display equity only (see DEMO_EQUITIES).
          const equity = demoHeights
            ? (DEMO_EQUITIES[b.bot.codename.toLowerCase()] ?? realEquity)
            : realEquity;
          b.targetH = heightForEquity(equity);
          const openCount = stats ? stats.openPositions.length : 0;
          const realized = demoHeights
            ? equity - START_EQUITY
            : stats
              ? stats.realized
              : 0;
          const plateHalted = haltedRef?.current.has(b.bot.name) ?? false;
          drawLabel(
            b.label,
            b.bot,
            fmtMoney(equity),
            plateHalted
              ? "⛔ HALTED — trading stopped"
              : `${openCount} open · ${fmtMoney(realized, true)} realized`,
            plateHalted ? "#ff6a55" : "#8b98a9",
          );
        }
      }

      // Shocks.
      for (let i = shocks.length - 1; i >= 0; i--) {
        const s = shocks[i]!;
        const p = (now - s.t0) / s.dur;
        if (p >= 1) {
          scene.remove(s.mesh);
          s.mesh.geometry.dispose();
          s.mesh.material.dispose();
          shocks.splice(i, 1);
        } else {
          const scale = 0.4 + p * s.maxScale;
          s.mesh.scale.set(scale, scale, 1);
          s.mesh.material.opacity = 0.9 * (1 - p);
        }
      }
      // Particle bursts.
      for (let i = bursts.length - 1; i >= 0; i--) {
        const burst = bursts[i]!;
        const age = now - burst.t0;
        if (age >= burst.life) {
          scene.remove(burst.points);
          burst.points.geometry.dispose();
          burst.points.material.dispose();
          bursts.splice(i, 1);
        } else {
          const attr = burst.points.geometry.getAttribute("position") as THREE.BufferAttribute;
          const arr = attr.array as Float32Array;
          for (let j = 0; j < arr.length; j += 3) {
            arr[j] = arr[j]! + burst.velocities[j]! * dt;
            arr[j + 1] = arr[j + 1]! + burst.velocities[j + 1]! * dt;
            arr[j + 2] = arr[j + 2]! + burst.velocities[j + 2]! * dt;
          }
          attr.needsUpdate = true;
          burst.points.material.opacity = 1 - age / burst.life;
        }
      }
      // Flares.
      for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i]!;
        const p = (now - f.t0) / f.dur;
        if (p >= 1) {
          scene.remove(f.sprite);
          f.mat.dispose();
          flares.splice(i, 1);
        } else {
          const scale = 1 + p * 4.2;
          f.sprite.scale.set(scale, scale, 1);
          f.mat.opacity = 0.95 * (1 - p);
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener(AVATAR_CHOICE_EVENT, onAvatarChoice);
      cvs.removeEventListener("pointermove", onPointerMove);
      cvs.removeEventListener("pointerdown", onPointerDown);
      cvs.removeEventListener("pointerleave", onPointerLeave);
      cvs.removeEventListener("click", onCanvasClick);
      if (inspectControlRef) inspectControlRef.current = null;
      if (inspectAnchorRef) inspectAnchorRef.current = null;
      onInspectRef.current?.(null, false);
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          const mat = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
          const map = (mat as THREE.MeshBasicMaterial)?.map;
          if (map) map.dispose();
        }
        if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      (scene.background as THREE.Texture | null)?.dispose?.();
      glowTex.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bots]);

  return <div ref={containerRef} className="landscape-canvas" aria-label="Bot landscape" />;
}
