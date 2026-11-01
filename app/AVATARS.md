# Bot Avatars

The web app shows an avatar for every bot: in the 3D landscape (the
pixelated screen on each bot's building), the trade stream, the
leaderboard, and the decision modal.

## Defaults

Each built-in bot has an approved default portrait (Keith's character
art, approved 2026-11-01). The app serves them from
`packages/web/public/avatars/`, mapped by bot codename in
`packages/web/src/avatars.tsx` (`DEFAULT_AVATARS`):

| Bot (codename) | Served file | Approved source portrait |
|---|---|---|
| `wesley` | `public/avatars/wesley.webp` | `~/workspace/trading-bots/avatars/wesley_avatar_v6_muse.webp` |
| `trendia` | `public/avatars/trendia.webp` | `~/workspace/trading-bots/avatars/trendia_avatar_v3.webp` |
| `snapback` | `public/avatars/snapback.webp` | `~/workspace/trading-bots/avatars/snapback_avatar_v5.webp` |
| `vega` | `public/avatars/vega.webp` | `~/workspace/trading-bots/avatars/vega_avatar_v3.webp` |
| `polycrypt9000` | `public/avatars/polycrypt9000.webp` | `~/workspace/trading-bots/avatars/polycrypt9000_avatar_v5.webp` |

**Default swap (Keith's direction, 2026-11-01):** the *defaults* for two
bots are crossed — in `DEFAULT_AVATARS`, codename `snapback` resolves to
`/avatars/vega.webp` and codename `vega` resolves to
`/avatars/snapback.webp`. The files keep their names (the Snapback file
still holds the violet bearded-man portrait, the Vega file the
pink-streaked woman), and the picker library still lists each portrait
under its own bot — only the per-bot default resolution changed. A saved
picker pick still overrides the default, as before.

**Skin-tone revisions (Keith's direction, 2026-11-01):** two portrait
files were re-toned and their contents replaced in place (same served
filenames, so the picker library entries update automatically):
`trendia.webp` now holds Trendia with warm medium-brown skin (source
`trendia_avatar_v3.webp`, superseding v2), and `snapback.webp` now holds
Snapback with deep rich brown skin (source `snapback_avatar_v5.webp`,
superseding v4). Combined with the swap above, Vega's *default* face is
now the deep-brown bearded portrait, while Snapback's default remains
the pink-streak portrait.

To replace a default, drop a new image over
`packages/web/public/avatars/<codename>.webp` and rebuild the web app —
no code change needed. A bot with no portrait (or one that fails to
load) falls back to the colored letter disc, so new/outsider bots never
break the UI.

## The picker and the avatar library

Clicking a bot's avatar (or its ✎ badge) in the **leaderboard** opens
the avatar picker for that bot. The picker offers the whole library —
20 choices in `packages/web/public/avatars/library/`, declared in
`AVATAR_LIBRARY` in `src/avatars.tsx`:

- **Portraits** (5): the default portraits above.
- **Robot set** (15): Astro Bot-style robots cropped from Keith's 3×3
  grid (`astro-1.webp` … `astro-9.webp`) plus six generated companions
  matched to the bots (`astro-trendia`, `astro-snapback`, `astro-vega`,
  `astro-wesley`, `astro-polycrypt`, `astro-eth`).

## How choices are stored

A pick is stored **per bot, in the browser's localStorage**, under the
key `fleet-avatar-<codename>` (value = the library entry id). Nothing
is sent to the API or written to the bot files. The choice applies
immediately everywhere — leaderboard, trade stream, decision modal,
and the landscape building screens — and survives reloads in that browser.
"Reset to default" in the picker clears the key and restores the
bot's portrait. Because the choice is browser-local, different
browsers/devices can show different picks for the same bot.

## Adding more avatars later

1. Drop the new image (WebP/PNG, square) into
   `packages/web/public/avatars/library/`.
2. Add one entry to `AVATAR_LIBRARY` in `src/avatars.tsx`, e.g.
   `{ id: "astro-new", label: "Astro · New", src: "/avatars/library/astro-new.webp", group: "Robot set" }`
   (the `astro()` helper covers the common shape).
3. Rebuild the web app. The new choice shows up in the picker.
