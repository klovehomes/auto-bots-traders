# Run the Fleet Locally on Your Windows PC (WSL + Docker, Fake Data)

This package runs the whole trading-bot stack on your own PC with
**simulated data** — no broker account, no API keys, no real money. It's
for seeing the fleet alive on your screen: the five bots load from their
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

The `.env` file sets the fleet run mode (`MODE=sim` — synthetic fake
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
from a $5,000 simulated account.

## 6. Stop it

Press `Ctrl+C` in the terminal where Compose is running, then:

```bash
docker compose down
```

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

The fleet has one run-mode setting, `MODE` (in the `.env` file), and the
landscape page always badges which one you're in:

- **`sim`** — synthetic fake data, no broker, no keys. *This package
  runs in `sim`.* For learning the stack and watching the fleet move.
- **`paper`** — the Alpaca **paper** account: real market data,
  simulated money. This arrives later, once your Alpaca paper API keys
  exist and go into `.env`.
- **`connected`** — **live** accounts and real money. VPS/production
  only, and only for bots you have individually approved to go live. In
  this build, connected mode deliberately refuses to trade live — it
  exists as a guarded placeholder for the production design.

One fleet rule worth knowing: `MODE` is the ceiling for the whole fleet.
A bot's own `mode` line in its `.md` file can hold that bot *below* the
fleet mode (say, keeping one bot in `sim` while the fleet is on `paper`),
but never above it.

## What's real and what's fake — the honest version

**Real, the actual system:** the bot `.md` loader and its validation, the
decision/event schema (including the decision-id foreign key), the
engine → API → WebSocket → page pipeline, the trade-stream format with
green/red PnL, and the UI plumbing. This is the Phase 0 scaffold from
`PLAN.md`, running exactly as designed.

**Fake, stand-ins only:** the market itself. Prices are a seeded random
walk generated inside the engine; fills are imaginary; and the "activity
generators" that decide when each bot buys or sells are simple scripts
written in each bot's voice — they are **not** the real strategies. The
real signal logic (Trendia's breakout engine, Snapback's mean reversion,
Vega's and Wesley's options logic, PolyCrypt9000's two sleeves) arrives in
Phase 1 and later, along with Alpaca paper trading.

So treat this build as: *the building is real, the weather outside is
painted on.* It's for getting comfortable running the stack and seeing
your fleet move — not for judging how any bot would actually perform.
