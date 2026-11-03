# Run the Trader Bots Locally on Your Windows PC (WSL + Docker, Fake Data)

This package runs the whole trading-bot stack on your own PC with
**simulated data** — no broker account, no API keys, no real money. It's
for seeing the trader bots alive on your screen: the five bots load from their
real `.md` files, fake trades flow through the real event pipeline, and
the landscape page shows them landing.

## 1. Install WSL2 (Windows Subsystem for Linux)

1. Open **PowerShell as Administrator** (right-click the Start button →
   Terminal (Admin), or search "PowerShell" → Run as administrator).
2. Run:

   ```
   wsl --install
   ```

3. Restart the PC when it asks. After the restart, an Ubuntu window opens
   and asks you to pick a Linux username and password — remember the
   password, you'll type it for `sudo` commands.

## 2. Install Docker Desktop

1. Download Docker Desktop for Windows from docker.com and install it.
2. Open Docker Desktop → **Settings → General** → make sure
   **"Use the WSL 2 based engine"** is checked.
3. **Settings → Resources → WSL Integration** → turn on your Ubuntu
   distro.
4. Leave Docker Desktop running (the whale icon in the system tray).
   Docker only works while it's open.

## 3. Unzip this package inside WSL (not on the Windows drive)

Open your **Ubuntu** terminal (Start → Ubuntu) and run:

```bash
cd ~
unzip /mnt/c/Users/<YourWindowsUsername>/Downloads/trading-bots-local-v1.zip
cd ~/trading-bots/app
```

(Adjust the path if you downloaded the zip somewhere else — Windows
drives appear under `/mnt/c/…` inside WSL.)

Keep the folder inside the Linux filesystem like this. Running it from
`/mnt/c/…` directly is slow and file permissions can misbehave; inside
`~` everything just works.

## 4. Start the stack

```bash
cp .env.example .env
docker compose up --build
```

The `.env` file sets the team run mode (`MODE=sim` — synthetic fake
data; see "The three modes" below for what sim / paper / connected
mean). The first build downloads
base images and installs dependencies, so give it a few minutes. When
it's up you'll see log lines from three services: `api`, `engine`, `web`.

## 5. Open the landscape

In your Windows browser: **http://localhost:4173**

What you should see:

- A **yellow "SIMULATED DATA" badge** at the top — that's the page
  confirming it's in fake-data mode.
- **Five bot discs** in a row: Trendia (cyan, visor shades), Snapback
  (violet, backwards cap), Vega (pink, star shades), Wesley (green, bow
  tie), PolyCrypt9000 (gold, robot antenna) — loaded from the real bot
  files in the `bots/` folder.
- **"WebSocket: connected"** and a **Live events** list that starts
  filling within a few seconds: bots opening and closing positions every
  few seconds, in each bot's own trading language ("20-day high breakout;
  RSI(14) 67…", "CSP 7 DTE, delta 0.25…", "market 61% vs model 74% — 13pt
  edge"). Closes show a green profit or red loss. Every event carries an
  incrementing decision id — the same decision-log schema the real system
  will use.

Leave it running a while and the feed keeps churning; each bot is working
from a $10,000 simulated account.

## 6. Stop it

Press `Ctrl+C` in the terminal where Compose is running, then:

```bash
docker compose down
```

## 6b. The kill switch

Every bot — and the whole team — can be stopped from the dashboard:

- **Per bot:** hover/tap a bot's building to open its dialog, then
  **⛔ Kill** (stops trading, positions stay open) or
  **⛔ Kill + liquidate** (stops trading and closes all its open
  positions at market; asks for confirmation first). A halted bot shows
  **▶ Resume** in the same dialog.
- **Whole team:** the **Kill switch** bar under the totals has **Kill all**,
  **Kill + liquidate all** (confirmation required), and **Resume all**
  whenever anything is halted.
- **The arm switch:** the kill buttons start out **locked**. Flip
  the **arm switch** in the Kill switch bar to make them live —
  they work for exactly one kill action, then lock again, so a
  liquidation can't be fat-fingered. (**Resume** always works —
  it's the recovery button.)
- **Halts persist.** Kill state is owned by the API and stored in a
  JSON state file (`CONTROL_STATE_PATH`; in Docker it lives on the
  `fleet-data` volume at `/data/control-state.json`), so a halted bot
  stays halted across restarts until you resume it. Every kill,
  liquidate, and resume lands in the trade stream as a system row and
  in the audit log (`GET /control`).

In `sim` mode liquidation is real: the engine force-closes the bot's
(simulated) positions and reports anything it couldn't close. In
`paper`/`connected` modes the state records the same way; there is no
live order flow to halt yet in this build. Full details:
`CONTROL-DELIVERY.md` in the package root.

## 7. Troubleshooting

- **Watch the engine's decisions:** in a second Ubuntu terminal,
  `cd ~/trading-bots/app && docker compose logs -f engine` — every fake
  trade is logged with its trigger text. `docker compose logs -f api`
  shows the API side.
- **"docker: command not found"** — Docker Desktop isn't running, or the
  WSL Integration toggle (step 2.3) is off.
- **Port already in use** — something else on your PC is using 8080 or
  4173. Stop that program, or ask me and I'll change the ports in the
  package.
- **Changed a bot `.md` file?** Restart so the loader re-reads it:
  `docker compose restart engine api`.
- **Start fresh:** `docker compose down` then `docker compose up --build`
  again. The simulation is seeded, so you'll see a similar (not
  identical-timed) run each time.

## The three modes

The team has one run-mode setting, `MODE` (in the `.env` file), and the
landscape page always badges which one you're in:

- **`sim`** — synthetic fake data, no broker, no keys. *This package
  runs in `sim`.* For learning the stack and watching the team move.
- **`paper`** — the Alpaca **paper** account: real market data,
  simulated money. Since v10 (Phase 1), Trendia trades this account for
  real — her .md rules on live daily bars, Risk Gate first, entries at
  the next market open. The other four bots stay on the simulator until
  their strategy plugins arrive in Phase 3. Needs your Alpaca paper API
  keys in `.env` (see below); without keys the engine says so loudly and
  falls back to the simulator rather than pretending.
- **`connected`** — **live** accounts and real money. VPS/production
  only, and only for bots you have individually approved to go live. In
  this build, connected mode deliberately refuses to trade live — it
  exists as a guarded placeholder for the production design.

One team rule worth knowing: `MODE` is the ceiling for the whole team.
A bot's own `mode` line in its `.md` file can hold that bot *below* the
team mode (say, keeping one bot in `sim` while the team is on `paper`),
but never above it.

## What's real and what's fake — the honest version

**Real, the actual system:** the bot `.md` loader and its validation, the
decision/event schema (including the decision-id foreign key), the
engine → API → WebSocket → page pipeline, the trade-stream format with
green/red PnL, and the UI plumbing. This is the Phase 0 scaffold from
`PLAN.md`, running exactly as designed.

**Partly real since v10:** Trendia. In `paper` mode her strategy is the
real thing — Alpaca daily bars, her actual rules from `trendia.md`, the
Risk Gate enforcing her risk block before every order, full decision
records on the stream, and real (paper) orders you can cross-check in
the Alpaca dashboard. The other four bots still run stand-in activity
generators on the seeded random walk; their real signal logic
(Snapback's mean reversion, Vega's and Wesley's options logic,
PolyCrypt9000's two sleeves) arrives in Phase 3.

So treat this build as: *the building is real, Trendia's weather is now
real too — the rest of the team's is still painted on.*
