import type {
  ScanDefinition,
  ScanResultItem,
  ScanResultsResponse,
} from "@fleet/shared/types";

/**
 * Phase PM3 — Polymarket scan service (API-side; the browser never
 * talks to Gamma directly).
 *
 * The three scans are Keith's Nov 6 Polymarket-chat scans, same band
 * methodology throughout: a market counts ONCE when it has a buyable
 * outcome priced 82–90¢ inclusive; child markets of a multi-outcome
 * event count separately (the child market is the unit bought).
 *
 * Gamma quirks that matter (both verified live, 2026-11-08):
 * - Ordering MUST be `order=volumeNum`. `order=volume` sorts the
 *   string field lexicographically and returns junk order.
 * - `outcomePrices` / `outcomes` arrive as JSON *strings*, not arrays
 *   — parse them (the very first scan attempt silently returned
 *   nothing because of exactly this).
 * - Page size is capped at 100 regardless of the requested limit.
 *
 * Tradable filter (same as the original scans): active, not closed,
 * not archived, acceptingOrders, order book enabled.
 */

const GAMMA_BASE = (
  process.env.GAMMA_API_BASE ?? "https://gamma-api.polymarket.com"
).replace(/\/+$/, "");
const PAGE_SIZE = 100;
const BAND_LO = 0.82;
const BAND_HI = 0.9;
const CACHE_MS = 5 * 60_000;
const PRICE_CACHE_MS = 60_000;
const FETCH_TIMEOUT_MS = 20_000;

export const SCAN_DEFINITIONS: ScanDefinition[] = [
  {
    id: "1",
    label: "Full Universe",
    description:
      "All active tradable markets, 82–90¢ band, top 20 by total volume. Total in-band count comes from a background full sweep.",
  },
  {
    id: "2",
    label: "Top 800",
    description:
      "Top 800 markets by total volume, 82–90¢ band, every in-band market listed.",
  },
  {
    id: "3",
    label: "Near-Term (26 days)",
    description:
      "Top 800 by volume among markets ending within the next 26 days, 82–90¢ band, top 20 listed.",
  },
  {
    id: "4",
    label: "Long Shots",
    description:
      "Buyable outcome priced under 25¢, markets ending within the next 10 days, top 50 by volume (Keith's addendum, 2026-11-08).",
  },
];

interface GammaMarket {
  id?: string;
  question?: string;
  slug?: string;
  endDate?: string | null;
  volumeNum?: number | string | null;
  volume?: number | string | null;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  acceptingOrders?: boolean;
  enableOrderBook?: boolean;
  outcomes?: unknown;
  outcomePrices?: unknown;
}

function parseStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((v) => String(v));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePrices(raw: unknown): number[] {
  return parseStringArray(raw).map((v) => Number(v));
}

function isTradable(m: GammaMarket): boolean {
  return (
    m.active === true &&
    m.closed !== true &&
    m.archived !== true &&
    m.acceptingOrders === true &&
    m.enableOrderBook === true
  );
}

interface PriceBand {
  lo: number;
  hi: number;
  /** True when the high edge is exclusive (Long Shots: strictly < 25¢). */
  hiExclusive?: boolean;
}

const FAVOURITE_BAND: PriceBand = { lo: BAND_LO, hi: BAND_HI };
/** Long Shots: the mirror image — a buyable outcome under 25¢. */
const LONGSHOT_BAND: PriceBand = { lo: 0, hi: 0.25, hiExclusive: true };

function inBand(price: number, band: PriceBand): boolean {
  if (!Number.isFinite(price) || price < band.lo) return false;
  return band.hiExclusive ? price < band.hi : price <= band.hi;
}

/** The first outcome priced inside the band, or null. */
function qualifying(
  m: GammaMarket,
  band: PriceBand = FAVOURITE_BAND,
): { outcome: string; price: number } | null {
  const outcomes = parseStringArray(m.outcomes);
  const prices = parsePrices(m.outcomePrices);
  for (let i = 0; i < prices.length; i += 1) {
    const price = prices[i]!;
    if (inBand(price, band)) {
      return { outcome: outcomes[i] ?? `Outcome ${i + 1}`, price };
    }
  }
  return null;
}

function toResult(
  m: GammaMarket,
  band: PriceBand = FAVOURITE_BAND,
): ScanResultItem | null {
  const q = qualifying(m, band);
  if (!q || !m.id || !m.question) return null;
  const volumeRaw = m.volumeNum ?? m.volume ?? 0;
  const volume = typeof volumeRaw === "number" ? volumeRaw : Number(volumeRaw);
  return {
    marketId: String(m.id),
    question: m.question,
    outcome: q.outcome,
    price: q.price,
    volume: Number.isFinite(volume) ? volume : 0,
    endDate: m.endDate ?? null,
    slug: m.slug ?? "",
  };
}

async function gammaFetch(path: string): Promise<unknown> {
  // One retry on transient statuses (429 / 5xx): Gamma occasionally
  // rate-limits bursts and answers 200-with-empty-pages or 5xx; a single
  // retry keeps a hiccup from poisoning the 5-minute results cache.
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(`${GAMMA_BASE}${path}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new Error(
          `Gamma API HTTP ${res.status} for ${path.split("?")[0]}`,
        );
      }
      return (await res.json()) as unknown;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const transient =
        /HTTP (429|5\d\d)/.test(lastError.message) ||
        lastError.name === "TimeoutError";
      if (!transient || attempt === 1) throw lastError;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw lastError ?? new Error("Gamma fetch failed");
}

async function fetchMarketsPage(
  extra: Record<string, string>,
  offset: number,
): Promise<GammaMarket[]> {
  const params = new URLSearchParams({
    active: "true",
    closed: "false",
    order: "volumeNum",
    ascending: "false",
    limit: String(PAGE_SIZE),
    offset: String(offset),
    ...extra,
  });
  const data = await gammaFetch(`/markets?${params.toString()}`);
  return Array.isArray(data) ? (data as GammaMarket[]) : [];
}

/**
 * Collect up to `max` tradable markets in volume-descending order.
 * Pages are fetched in parallel batches of 4 (offsets are stable
 * enough within one sweep) and stitched back in offset order.
 */
async function collectTradable(
  extra: Record<string, string>,
  max: number,
): Promise<GammaMarket[]> {
  const out: GammaMarket[] = [];
  let offset = 0;
  while (out.length < max) {
    const offsets = [0, 1, 2, 3].map((i) => offset + i * PAGE_SIZE);
    const pages = await Promise.all(
      offsets.map((o) => fetchMarketsPage(extra, o)),
    );
    let exhausted = false;
    for (const page of pages) {
      if (page.length < PAGE_SIZE) exhausted = true;
      for (const m of page) {
        if (isTradable(m)) out.push(m);
        if (out.length >= max) break;
      }
      if (out.length >= max) break;
    }
    offset += PAGE_SIZE * offsets.length;
    if (exhausted) break;
  }
  return out;
}

/** Collect the first `max` in-band results in volume order. */
async function collectInBandTop(
  extra: Record<string, string>,
  max: number,
): Promise<ScanResultItem[]> {
  const out: ScanResultItem[] = [];
  let offset = 0;
  while (out.length < max) {
    const offsets = [0, 1, 2, 3].map((i) => offset + i * PAGE_SIZE);
    const pages = await Promise.all(
      offsets.map((o) => fetchMarketsPage(extra, o)),
    );
    let exhausted = false;
    for (const page of pages) {
      if (page.length < PAGE_SIZE) exhausted = true;
      for (const m of page) {
        if (!isTradable(m)) continue;
        const r = toResult(m);
        if (r) out.push(r);
        if (out.length >= max) break;
      }
      if (out.length >= max) break;
    }
    offset += PAGE_SIZE * offsets.length;
    if (exhausted) break;
  }
  return out;
}

interface CacheEntry {
  payload: ScanResultsResponse;
  expiresAt: number;
}

export class ScanService {
  private cache = new Map<string, CacheEntry>();
  /** Scan 1's full-universe in-band count, once the sweep finishes. */
  private fullUniverseCount: number | null = null;
  private fullCountRunning = false;
  private priceCache = new Map<
    string,
    { price: number | null; expiresAt: number }
  >();

  definitions(): ScanDefinition[] {
    return SCAN_DEFINITIONS;
  }

  labelFor(scanId: string): string | null {
    return SCAN_DEFINITIONS.find((d) => d.id === scanId)?.label ?? null;
  }

  async getResults(scanId: string): Promise<ScanResultsResponse | null> {
    const def = SCAN_DEFINITIONS.find((d) => d.id === scanId);
    if (!def) return null;
    const cached = this.cache.get(scanId);
    if (cached && cached.expiresAt > Date.now()) {
      // Late-arriving full-universe count patches the cached payload.
      if (scanId === "1" && cached.payload.count === null) {
        cached.payload.count = this.fullUniverseCount;
      }
      return cached.payload;
    }

    let payload: ScanResultsResponse;
    if (scanId === "2") {
      const markets = await collectTradable({}, 800);
      const results = markets
        .map((m) => toResult(m))
        .filter((r): r is ScanResultItem => r !== null);
      payload = {
        scanId,
        label: def.label,
        fetchedAt: new Date().toISOString(),
        count: results.length,
        results,
      };
    } else if (scanId === "3") {
      const now = new Date();
      const max = new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000);
      const extra = {
        end_date_min: now.toISOString(),
        end_date_max: max.toISOString(),
      };
      const markets = await collectTradable(extra, 800);
      const inBand = markets
        .map((m) => toResult(m))
        .filter((r): r is ScanResultItem => r !== null);
      payload = {
        scanId,
        label: def.label,
        fetchedAt: new Date().toISOString(),
        count: inBand.length,
        results: inBand.slice(0, 20),
      };
    } else if (scanId === "4") {
      // Long Shots (Keith's addendum): same flipped form as Scan 3 —
      // end-date window first, volume desc — but a 10-day window, the
      // under-25¢ band, and a TOP 50 display (not 20).
      const now = new Date();
      const max = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const extra = {
        end_date_min: now.toISOString(),
        end_date_max: max.toISOString(),
      };
      const markets = await collectTradable(extra, 800);
      const inBand = markets
        .map((m) => toResult(m, LONGSHOT_BAND))
        .filter((r): r is ScanResultItem => r !== null);
      payload = {
        scanId,
        label: def.label,
        fetchedAt: new Date().toISOString(),
        count: inBand.length,
        results: inBand.slice(0, 50),
      };
    } else {
      // Scan 1: top 20 by volume comes back fast from volume-ordered
      // paging; the total in-band count needs the full sweep, which
      // runs in the background and patches the cache when it lands.
      const results = await collectInBandTop({}, 20);
      if (this.fullUniverseCount === null) this.startFullCount();
      payload = {
        scanId,
        label: def.label,
        fetchedAt: new Date().toISOString(),
        count: this.fullUniverseCount,
        results,
      };
    }

    // An empty result set is not a plausible steady state for any of
    // these scans (recent runs: 53 / 180 / 604 in-band) — it means
    // Gamma answered a burst with empty pages. Fail the request
    // instead of caching the empty payload for 5 minutes.
    if (payload.results.length === 0) {
      throw new Error(
        `scan ${scanId} collected no qualifying markets — transient Gamma response, not cached`,
      );
    }

    this.cache.set(scanId, { payload, expiresAt: Date.now() + CACHE_MS });
    return payload;
  }

  /** Background sweep: count in-band markets across the WHOLE active
   *  universe (deduped by market id — paging over a live set can
   *  revisit a market). Never awaited by a request.
   *
   *  Gamma rejects deep offsets with HTTP 422 (a result-window cap,
   *  observed around offset ~5,000–10,000), so the sweep pages
   *  end-date ranges instead of one global list: when a range hits
   *  the cap it splits in half by time and pages each half (dedupe
   *  makes the overlap harmless). */
  private startFullCount(): void {
    if (this.fullCountRunning) return;
    this.fullCountRunning = true;
    void (async () => {
      try {
        const seen = new Set<string>();
        let count = 0;
        let cappedRanges = 0;
        const DAY = 24 * 60 * 60 * 1000;
        const now = Date.now();

        const sweepRange = async (
          minMs: number,
          maxMs: number,
          depth: number,
        ): Promise<void> => {
          const extra = {
            end_date_min: new Date(minMs).toISOString(),
            end_date_max: new Date(maxMs).toISOString(),
          };
          let offset = 0;
          for (;;) {
            // Pages fetched in parallel batches — sequential paging
            // of ~235k markets took >30 min; batches finish in a
            // few minutes. Dedupe by id makes batch overlap harmless.
            const offsets = [0, 1, 2, 3, 4, 5].map(
              (i) => offset + i * PAGE_SIZE,
            );
            let pages: GammaMarket[][];
            try {
              pages = await Promise.all(
                offsets.map((o) => fetchMarketsPage(extra, o)),
              );
            } catch (err) {
              const msg = err instanceof Error ? err.message : "";
              if (/HTTP 422/.test(msg) && depth < 10) {
                const mid = Math.floor((minMs + maxMs) / 2);
                if (mid <= minMs || mid >= maxMs) {
                  cappedRanges += 1;
                  return;
                }
                await sweepRange(minMs, mid, depth + 1);
                await sweepRange(mid, maxMs, depth + 1);
                return;
              }
              throw err;
            }
            let exhausted = false;
            for (const page of pages) {
              if (page.length < PAGE_SIZE) exhausted = true;
              for (const m of page) {
                if (!m.id || seen.has(m.id)) continue;
                seen.add(m.id);
                if (isTradable(m) && qualifying(m)) count += 1;
              }
            }
            offset += PAGE_SIZE * offsets.length;
            if (exhausted) break;
          }
        };

        // Active markets with end dates in the past (not yet closed)
        // plus everything ending in the next five years.
        await sweepRange(now - 5 * 365 * DAY, now, 0);
        await sweepRange(now, now + 5 * 365 * DAY, 0);

        this.fullUniverseCount = count;
        const cached = this.cache.get("1");
        if (cached) cached.payload.count = count;
        console.log(
          `[scans] full-universe sweep complete: ${count} in-band of ${seen.size} tradable markets` +
            (cappedRanges > 0
              ? ` (${cappedRanges} dense ranges hit the Gamma window cap — count may be slightly low)`
              : ""),
        );
      } catch (err) {
        console.error(
          "[scans] full-universe count sweep failed:",
          err instanceof Error ? err.message : err,
        );
      } finally {
        this.fullCountRunning = false;
      }
    })();
  }

  /** Price a market for booking a user selection: prefer the cached
   *  scan results (the exact price the user saw), else Gamma by id. */
  async resolveSelection(
    scanId: string,
    marketId: string,
    outcome: string,
  ): Promise<{ question: string; outcome: string; price: number } | null> {
    for (const entry of this.cache.values()) {
      const hit = entry.payload.results.find((r) => r.marketId === marketId);
      if (hit) {
        return { question: hit.question, outcome: hit.outcome, price: hit.price };
      }
    }
    const market = await this.fetchMarketById(marketId);
    if (!market) return null;
    const outcomes = parseStringArray(market.outcomes);
    const prices = parsePrices(market.outcomePrices);
    const idx = outcomes.findIndex(
      (o) => o.toLowerCase() === outcome.toLowerCase(),
    );
    if (idx < 0 || prices[idx] === undefined || !market.question) return null;
    return { question: market.question, outcome: outcomes[idx]!, price: prices[idx]! };
  }

  /** Current price of one outcome, re-fetched from Gamma by market id
   *  (60 s cache). Null when Gamma can't price it right now. */
  async currentPrice(
    marketId: string,
    outcome: string,
  ): Promise<number | null> {
    const key = `${marketId}|${outcome.toLowerCase()}`;
    const cached = this.priceCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.price;
    let price: number | null = null;
    try {
      const market = await this.fetchMarketById(marketId);
      if (market) {
        const outcomes = parseStringArray(market.outcomes);
        const prices = parsePrices(market.outcomePrices);
        const idx = outcomes.findIndex(
          (o) => o.toLowerCase() === outcome.toLowerCase(),
        );
        if (idx >= 0 && prices[idx] !== undefined && Number.isFinite(prices[idx])) {
          price = prices[idx]!;
        }
      }
    } catch {
      price = null;
    }
    this.priceCache.set(key, { price, expiresAt: Date.now() + PRICE_CACHE_MS });
    return price;
  }

  private async fetchMarketById(marketId: string): Promise<GammaMarket | null> {
    const data = await gammaFetch(
      `/markets/${encodeURIComponent(marketId)}`,
    ).catch(() => null);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return data as GammaMarket;
  }
}
