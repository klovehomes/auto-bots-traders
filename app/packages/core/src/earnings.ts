/**
 * Earnings calendar (Phase 3 — Vega's earnings guard).
 *
 * Alpaca has no earnings calendar, so Vega's "no new entries within 5
 * days of earnings" rule reads the public Nasdaq earnings calendar.
 * The runner depends on the narrow `EarningsCalendarLike` surface so
 * tests can substitute a fake, exactly like the broker client.
 *
 * Fail-closed contract: `getEarningsWindow` returns null when the
 * calendar cannot be read. Callers must treat null as "earnings dates
 * unknown" and block new entries — never as "no earnings scheduled".
 */

export interface EarningsCalendarLike {
  /**
   * Earnings dates for every reporter from `fromDate` (YYYY-MM-DD)
   * through `fromDate + days` calendar days, inclusive. Returns a map
   * of symbol → earnings date (YYYY-MM-DD), or null when the source
   * is unavailable.
   */
  getEarningsWindow(
    fromDate: string,
    days: number,
  ): Promise<Map<string, string> | null>;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Nasdaq public earnings calendar, one request per date. */
export function createNasdaqEarningsCalendar(): EarningsCalendarLike {
  return {
    async getEarningsWindow(fromDate, days) {
      const out = new Map<string, string>();
      for (let i = 0; i <= days; i++) {
        const date = addDays(fromDate, i);
        try {
          const res = await fetch(
            `https://api.nasdaq.com/api/calendar/earnings?date=${date}`,
            {
              headers: {
                // The public endpoint rejects non-browser agents.
                "user-agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
                accept: "application/json, text/plain, */*",
              },
              signal: AbortSignal.timeout(10_000),
            },
          );
          if (!res.ok) {
            console.warn(
              `[earnings] Nasdaq calendar for ${date}: HTTP ${res.status} — treating the calendar as unavailable`,
            );
            return null;
          }
          const body = (await res.json()) as {
            data?: { rows?: { symbol?: string }[] } | null;
          };
          for (const row of body.data?.rows ?? []) {
            const symbol = row.symbol?.trim().toUpperCase();
            if (symbol && !out.has(symbol)) out.set(symbol, date);
          }
        } catch (err) {
          console.warn(
            `[earnings] Nasdaq calendar for ${date} failed — treating the calendar as unavailable:`,
            err instanceof Error ? err.message : err,
          );
          return null;
        }
      }
      return out;
    },
  };
}
