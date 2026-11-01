import { useEffect, useState } from "react";
import type { BotConfig } from "@fleet/shared/types";

/**
 * Bot avatars: defaults, the picker library, and per-bot choices.
 *
 * - DEFAULT_AVATARS maps each built-in bot's codename to its approved
 *   portrait (served from `packages/web/public/avatars/`). Per Keith's
 *   direction (2026-11-01), the DEFAULTS for Snapback and Vega are
 *   swapped: Snapback defaults to the Vega portrait file and Vega to
 *   the Snapback portrait file. The files themselves keep their names,
 *   and the picker library still lists each portrait under its own bot.
 * - AVATAR_LIBRARY is every avatar the picker offers: the five portraits
 *   plus the "Robot set" in `public/avatars/library/` (Keith's Astro-style
 *   grid crops + generated companions). See AVATARS.md at the app root.
 * - A user's pick is stored per bot in localStorage under
 *   `fleet-avatar-<codename>` (the library entry id) and broadcast with
 *   the AVATAR_CHOICE_EVENT window event so the leaderboard, trade
 *   stream, decision modal, and landscape all update live.
 *
 * Bots with no mapped/loading art — future outsider submissions, or any
 * bot whose image fails to load — fall back to the colored letter disc.
 */
export const DEFAULT_AVATARS: Record<string, string> = {
  wesley: "/avatars/wesley.webp",
  trendia: "/avatars/trendia.webp",
  // Keith's direction (2026-11-01): Snapback and Vega wear each other's
  // portraits as their defaults. Files are NOT renamed — only this
  // per-bot default resolution is swapped.
  snapback: "/avatars/vega.webp",
  vega: "/avatars/snapback.webp",
  polycrypt9000: "/avatars/polycrypt9000.webp",
};

/** Portrait URL for a codename, or null when the bot has no default art. */
export function avatarUrlForCodename(
  codename: string | undefined | null,
): string | null {
  if (!codename) return null;
  return DEFAULT_AVATARS[codename.toLowerCase()] ?? null;
}

/** Portrait URL for a bot config, or null when the bot has no default art. */
export function avatarUrlForBot(bot: BotConfig | undefined | null): string | null {
  return avatarUrlForCodename(bot?.codename);
}

// ---------------------------------------------------------------------------
// Avatar library (picker choices)
// ---------------------------------------------------------------------------

export type AvatarGroup = "Portraits" | "Robot set";

export interface AvatarChoice {
  id: string;
  label: string;
  src: string;
  group: AvatarGroup;
}

// Library portraits follow the FILES on purpose: each entry serves the
// portrait file named after its own bot, independent of DEFAULT_AVATARS
// (which Keith had swapped for Snapback/Vega — see above).
const portrait = (file: string, label: string): AvatarChoice => ({
  id: `portrait-${file}`,
  label,
  src: `/avatars/${file}.webp`,
  group: "Portraits",
});

const astro = (file: string, label: string): AvatarChoice => ({
  id: file,
  label,
  src: `/avatars/library/${file}.webp`,
  group: "Robot set",
});

export const AVATAR_LIBRARY: AvatarChoice[] = [
  portrait("wesley", "Portrait — Wesley"),
  portrait("trendia", "Portrait — Trendia"),
  portrait("snapback", "Portrait — Snapback"),
  portrait("vega", "Portrait — Vega"),
  portrait("polycrypt9000", "Portrait — PolyCrypt9000"),
  astro("astro-1", "Astro · Spiky Hair"),
  astro("astro-2", "Astro · Classic"),
  astro("astro-3", "Astro · Navy Antenna"),
  astro("astro-4", "Astro · Royal"),
  astro("astro-5", "Astro · Beanie Mic"),
  astro("astro-6", "Astro · Lombax"),
  astro("astro-7", "Astro · Astronaut"),
  astro("astro-8", "Astro · Racer"),
  astro("astro-9", "Astro · Hooded"),
  astro("astro-trendia", "Astro · Headset"),
  astro("astro-snapback", "Astro · Backwards Cap"),
  astro("astro-vega", "Astro · Star Shades"),
  astro("astro-wesley", "Astro · Bow Tie"),
  astro("astro-polycrypt", "Astro · Gold Antenna"),
  astro("astro-eth", "Astro · Ethereum"),
];

export const AVATAR_BY_ID: ReadonlyMap<string, AvatarChoice> = new Map(
  AVATAR_LIBRARY.map((entry) => [entry.id, entry]),
);

// ---------------------------------------------------------------------------
// Per-bot choices (localStorage)
// ---------------------------------------------------------------------------

/** Window event broadcast whenever a bot's avatar choice changes. */
export const AVATAR_CHOICE_EVENT = "fleet-avatar-choice";

const choiceKey = (codename: string): string =>
  `fleet-avatar-${codename.toLowerCase()}`;

/** The stored picker choice for a bot, or null for "use the default". */
export function getAvatarChoiceId(
  codename: string | undefined | null,
): string | null {
  if (!codename) return null;
  try {
    const value = window.localStorage.getItem(choiceKey(codename));
    return value && AVATAR_BY_ID.has(value) ? value : null;
  } catch {
    return null;
  }
}

/** Save (or, with null, clear) a bot's avatar choice and notify the UI. */
export function setAvatarChoice(
  codename: string,
  id: string | null,
): void {
  try {
    if (id) window.localStorage.setItem(choiceKey(codename), id);
    else window.localStorage.removeItem(choiceKey(codename));
  } catch {
    // Storage unavailable (private mode etc.) — the in-memory event
    // still updates this page; the pick just won't persist.
  }
  window.dispatchEvent(
    new CustomEvent(AVATAR_CHOICE_EVENT, { detail: { codename } }),
  );
}

/** React state mirroring a bot's stored choice, kept live via events. */
export function useAvatarChoiceId(
  codename: string | undefined | null,
): string | null {
  const [choice, setChoice] = useState<string | null>(() =>
    getAvatarChoiceId(codename),
  );
  useEffect(() => {
    const update = (): void => setChoice(getAvatarChoiceId(codename));
    update();
    window.addEventListener(AVATAR_CHOICE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(AVATAR_CHOICE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [codename]);
  return choice;
}

/**
 * The avatar URL a bot should render right now: the picker choice when
 * one is stored, otherwise the default portrait, otherwise null.
 */
export function resolveAvatarUrl(
  codename: string | undefined | null,
  choiceId: string | null,
): string | null {
  if (choiceId) {
    const entry = AVATAR_BY_ID.get(choiceId);
    if (entry) return entry.src;
  }
  return avatarUrlForCodename(codename);
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface BotAvatarProps {
  bot?: BotConfig | null;
  /** Display name: fallback initial and tooltip when no config is at hand. */
  name: string;
  /** When given, the avatar becomes the picker control: clicking it (or
   *  its ✎ badge) calls this. Used by the leaderboard. */
  onEdit?: () => void;
}

/**
 * Circular mini avatar: the bot's chosen/default portrait (circular-
 * cropped by CSS) when art exists and loads, otherwise the colored
 * letter disc. With `onEdit`, a pencil badge marks it as the picker
 * entry point.
 */
export function BotAvatar({ bot, name, onEdit }: BotAvatarProps) {
  const [failed, setFailed] = useState(false);
  const choiceId = useAvatarChoiceId(bot?.codename);
  const url = resolveAvatarUrl(bot?.codename, choiceId);
  useEffect(() => setFailed(false), [url]);

  const disc =
    url && !failed ? (
      <img
        className="mini-disc avatar-img"
        src={url}
        alt=""
        title={bot?.viz.avatar_accessory ?? name}
        onError={() => setFailed(true)}
      />
    ) : (
      <span
        className="mini-disc"
        style={{ backgroundColor: bot?.viz.color ?? "#8b98a9" }}
        title={bot?.viz.avatar_accessory ?? name}
      >
        {name.charAt(0)}
      </span>
    );

  if (!onEdit) return disc;
  return (
    <span className="avatar-wrap">
      <button
        type="button"
        className="avatar-main"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title={`Change ${name}'s avatar`}
        aria-label={`Change ${name}'s avatar`}
      >
        {disc}
      </button>
      <button
        type="button"
        className="avatar-edit"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        aria-label={`Change ${name}'s avatar`}
      >
        ✎
      </button>
    </span>
  );
}

interface AvatarPickerProps {
  bot: BotConfig;
  onClose: () => void;
}

/**
 * Avatar picker modal for one bot: the full library in a grid, grouped,
 * with the current avatar highlighted. Picking applies immediately
 * (every surface re-renders from the stored choice); "Reset to default"
 * clears the pick back to the bot's portrait.
 */
export function AvatarPicker({ bot, onClose }: AvatarPickerProps) {
  const choiceId = useAvatarChoiceId(bot.codename);
  const currentSrc = resolveAvatarUrl(bot.codename, choiceId);
  const groups: AvatarGroup[] = ["Portraits", "Robot set"];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal picker-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose avatar for ${bot.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Avatar for {bot.name}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {groups.map((group) => (
          <div key={group}>
            <h4 className="picker-group">{group}</h4>
            <div className="picker-grid">
              {AVATAR_LIBRARY.filter((entry) => entry.group === group).map(
                (entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`picker-item${entry.src === currentSrc ? " selected" : ""}`}
                    onClick={() => {
                      setAvatarChoice(bot.codename, entry.id);
                      onClose();
                    }}
                    title={entry.label}
                  >
                    <img src={entry.src} alt="" loading="lazy" />
                    <span>{entry.label}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
        <div className="picker-actions">
          <button
            type="button"
            className="tab small"
            onClick={() => {
              setAvatarChoice(bot.codename, null);
              onClose();
            }}
          >
            Reset to default
          </button>
        </div>
        <p className="hint">
          Saved in this browser for {bot.name} only — the leaderboard, trade
          stream, and landscape all update, and the choice survives reloads.
        </p>
      </div>
    </div>
  );
}
