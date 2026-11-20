import { useCallback, useEffect, useRef, useState } from "react";
import { fmtMoney } from "./fleetState.js";

/**
 * Schwab setup wizard (v37).
 *
 * Eight steps that take Keith from "no Schwab developer app" to bots
 * assigned to the Schwab LIVE venue. All state that matters lives on
 * the API side (keys file + token store + venue assignments), so this
 * component is a thin, resumable front end: on mount it fetches
 * GET /schwab/status, starts at the API's `derivedStep`, and re-fetches
 * after every successful mutation. Closing and reopening the wizard
 * therefore resumes right where things left off.
 *
 * Schwab is a live-money venue — there is no Schwab paper mode — and
 * the copy in here says so wherever it matters (notably step 7).
 */

export interface SchwabKeyStatus {
  configured: boolean;
  last4: string | null;
  state: "no-key" | "not-authorized" | "authorized" | "expired";
  refreshDaysLeft: number | null;
  live: true;
}

export interface SchwabVerified {
  at: string;
  accountMasked: string;
  equity: number;
  cash: number;
  positionCount: number;
}

export interface SchwabBotRow {
  codename: string;
  name: string;
  broker: string;
  mode: string;
  schwabEligible: boolean;
  ineligibleReason: string | null;
}

export interface SchwabStatusResponse {
  schwab: SchwabKeyStatus;
  verified: SchwabVerified | null;
  derivedStep: number;
  callbackUrl: string;
  bots: SchwabBotRow[];
}

interface VenueDraft {
  venue: "alpaca" | "schwab";
  goLive: boolean;
}

const STEP_TITLES = [
  "Account check",
  "Developer portal",
  "Approval wait",
  "App credentials",
  "Connect (OAuth)",
  "Verify",
  "Test sequence",
  "Assign + go live",
] as const;

const CALLBACK_URL = "https://127.0.0.1:8182";

function clampStep(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(8, Math.max(1, Math.trunc(n)));
}

/** One-line, defensive summary of an unknown-shaped API payload. */
function summarize(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const rec = value as Record<string, unknown>;
    const pick = (key: string): string | null =>
      typeof rec[key] === "string" || typeof rec[key] === "number"
        ? String(rec[key])
        : null;
    const parts = [
      pick("status"),
      pick("orderId") ?? pick("id"),
      pick("symbol"),
    ].filter((p): p is string => p !== null);
    if (parts.length > 0) return parts.join(" · ");
    try {
      const json = JSON.stringify(value);
      return json.length > 180 ? `${json.slice(0, 180)}…` : json;
    } catch {
      return "ok";
    }
  }
  return String(value);
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (): void => {
    const done = (): void => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(done);
    } else {
      done();
    }
  };
  return (
    <label className="copy-field">
      <span className="copy-field-label">{label}</span>
      <span className="copy-field-row">
        <input
          className="copy-field-input"
          type="text"
          value={value}
          readOnly
          aria-label={label}
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="btn small" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
    </label>
  );
}

export function SchwabWizard({
  apiBase,
  onClose,
  onChanged,
}: {
  apiBase: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<SchwabStatusResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 4 — credentials form (never pre-filled; secrets are write-only).
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [savedLast4, setSavedLast4] = useState<string | null>(null);

  // Step 5 — OAuth paste field (bare code OR the full redirect URL).
  const [pasteValue, setPasteValue] = useState("");

  // Step 6 — last verify result from the POST response (the status
  // payload's `verified` is the durable copy and takes over on refetch).
  const [verifiedLocal, setVerifiedLocal] = useState<SchwabVerified | null>(
    null,
  );

  // Step 7 — test sequence.
  const [previewLine, setPreviewLine] = useState<string | null>(null);
  const [testConfirmed, setTestConfirmed] = useState(false);
  const [testResult, setTestResult] = useState<{
    orderId: unknown;
    placedStatus: unknown;
    cancelled: unknown;
  } | null>(null);

  // Step 8 — per-bot venue drafts + the API's response note per bot.
  const [venueDrafts, setVenueDrafts] = useState<Record<string, VenueDraft>>(
    {},
  );
  const [venueNotes, setVenueNotes] = useState<Record<string, string>>({});
  const startedRef = useRef(false);

  const api = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          body !== null &&
          typeof body === "object" &&
          typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : `HTTP ${res.status}`;
        throw new Error(message);
      }
      return body as T;
    },
    [apiBase],
  );

  const refresh = useCallback(
    async (moveToDerivedStep: boolean): Promise<SchwabStatusResponse | null> => {
      try {
        const data = await api<SchwabStatusResponse>("/schwab/status");
        setStatus(data);
        setLoadError(null);
        // Seed venue drafts for bots we have not drafted yet; drafts
        // already in progress are left alone.
        setVenueDrafts((prev) => {
          const next = { ...prev };
          for (const bot of data.bots) {
            if (!next[bot.codename]) {
              next[bot.codename] = {
                venue: bot.broker === "schwab" ? "schwab" : "alpaca",
                goLive: false,
              };
            }
          }
          return next;
        });
        if (moveToDerivedStep) setStep(clampStep(data.derivedStep));
        return data;
      } catch (err: unknown) {
        setLoadError(err instanceof Error ? err.message : String(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void refresh(true);
  }, [refresh]);

  /** Run a mutating action: busy/error bookkeeping, then refresh the
   *  wizard's own status and nudge the dashboard chip via onChanged. */
  const runAction = useCallback(
    async <T,>(key: string, fn: () => Promise<T>): Promise<T | null> => {
      setBusy(key);
      setError(null);
      try {
        const result = await fn();
        await refresh(false);
        onChanged();
        return result;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      } finally {
        setBusy(null);
      }
    },
    [refresh, onChanged],
  );

  const schwab = status?.schwab ?? null;
  const verified = verifiedLocal ?? status?.verified ?? null;
  const callbackUrl = status?.callbackUrl ?? CALLBACK_URL;

  const stepDone = (n: number): boolean => {
    if (!status) return false;
    if (n === 4) return status.schwab.configured;
    if (n === 5) return status.schwab.state === "authorized";
    if (n === 6) return status.verified !== null;
    return n < clampStep(status.derivedStep);
  };

  // ---- Step actions -------------------------------------------------

  const saveCredentials = async (): Promise<void> => {
    const result = await runAction("credentials", () =>
      api<{ ok: boolean; schwab: SchwabKeyStatus }>("/schwab/credentials", {
        method: "POST",
        body: JSON.stringify({ appKey: appKey.trim(), appSecret }),
      }),
    );
    if (result) {
      setSavedLast4(result.schwab.last4);
      setAppKey("");
      setAppSecret("");
    }
  };

  const openSchwabLogin = async (): Promise<void> => {
    setBusy("auth-url");
    setError(null);
    try {
      const data = await api<{ url: string }>("/schwab/auth-url");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const exchangeCode = async (): Promise<void> => {
    const result = await runAction("exchange", () =>
      api<{ ok: boolean; schwab: SchwabKeyStatus }>("/schwab/oauth/exchange", {
        method: "POST",
        body: JSON.stringify({ code: pasteValue.trim() }),
      }),
    );
    if (result) setPasteValue("");
  };

  const runVerify = async (): Promise<void> => {
    const result = await runAction("verify", () =>
      api<{ ok: boolean; verified: SchwabVerified }>("/schwab/verify", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    if (result) setVerifiedLocal(result.verified);
  };

  const runPreview = async (): Promise<void> => {
    setPreviewLine(null);
    const result = await runAction("preview", () =>
      api<{ ok: boolean; orderBody: unknown; preview: unknown }>(
        "/schwab/test/preview",
        {
          method: "POST",
          body: JSON.stringify({ symbol: "AAPL", limitPrice: 1.0 }),
        },
      ),
    );
    if (result) {
      setPreviewLine(
        `Preview OK — 1 share of AAPL, limit $1.00: ${summarize(result.preview)}`,
      );
    }
  };

  const runPlaceCancel = async (): Promise<void> => {
    const result = await runAction("place-cancel", () =>
      api<{
        ok: boolean;
        orderId: unknown;
        placedStatus: unknown;
        cancelled: unknown;
      }>("/schwab/test/place-cancel", {
        method: "POST",
        body: JSON.stringify({ confirmLiveTest: true }),
      }),
    );
    if (result) {
      setTestResult({
        orderId: result.orderId,
        placedStatus: result.placedStatus,
        cancelled: result.cancelled,
      });
    }
  };

  const saveVenue = async (bot: SchwabBotRow): Promise<void> => {
    const draft = venueDrafts[bot.codename] ?? {
      venue: "alpaca" as const,
      goLive: false,
    };
    const result = await runAction(`venue:${bot.codename}`, () =>
      api<{
        ok: boolean;
        codename: string;
        name: string;
        broker: string;
        mode: string;
        appliesOn: string;
        note: string;
      }>("/schwab/venue", {
        method: "POST",
        body: JSON.stringify({
          codename: bot.codename,
          venue: draft.venue,
          goLive: draft.venue === "schwab" ? draft.goLive : false,
        }),
      }),
    );
    if (result) {
      setVenueNotes((prev) => ({ ...prev, [bot.codename]: result.note }));
      setVenueDrafts((prev) => ({
        ...prev,
        [bot.codename]: {
          venue: result.broker === "schwab" ? "schwab" : "alpaca",
          goLive: prev[bot.codename]?.goLive ?? false,
        },
      }));
    }
  };

  // ---- Render ---------------------------------------------------------

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal wizard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Schwab setup wizard"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>
            Schwab setup <span className="live-tag">LIVE</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <ol className="wizard-steps">
          {STEP_TITLES.map((title, idx) => {
            const n = idx + 1;
            const cls =
              n === step ? "current" : stepDone(n) ? "done" : "todo";
            return (
              <li key={title} className={`wizard-step ${cls}`}>
                <button
                  type="button"
                  className="wizard-step-btn"
                  onClick={() => setStep(n)}
                  aria-current={n === step ? "step" : undefined}
                >
                  <span className="wizard-step-num">
                    {stepDone(n) && n !== step ? "✓" : n}
                  </span>{" "}
                  {title}
                </button>
              </li>
            );
          })}
        </ol>

        {loading && <p className="confirm-text">Loading Schwab status…</p>}
        {loadError && (
          <p className="error" role="alert">
            Could not load Schwab status: {loadError}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!loading && step === 1 && (
          <div className="wizard-body">
            <h4>Step 1 — Account check</h4>
            <p className="confirm-text">
              You need a <strong>funded Schwab brokerage account</strong>{" "}
              before anything else in this wizard matters — the bots can
              only trade what is actually in the account, and Schwab is a{" "}
              <strong>live-money</strong> venue (there is no Schwab paper
              mode; see step 7).
            </p>
            <p className="confirm-text">
              If options bots will ever use Schwab, the account also needs{" "}
              <strong>options approval at the right level</strong>:
            </p>
            <ul className="wizard-list">
              <li>
                <strong>Vega</strong> buys long options — he needs options
                trading enabled for buying calls and puts.
              </li>
              <li>
                <strong>Wesley</strong> runs a wheel — he needs approval
                for <strong>covered calls</strong> and{" "}
                <strong>cash-secured puts</strong>.
              </li>
              <li>
                Trendia and Snapback trade stock only, so they need no
                options approval.
              </li>
            </ul>
            <p className="confirm-text">
              Nothing to do on this step in the app — it is a checklist.
              When the account is funded (and options-approved, if that
              applies), move on to step 2.
            </p>
          </div>
        )}

        {!loading && step === 2 && (
          <div className="wizard-body">
            <h4>Step 2 — Developer portal</h4>
            <p className="confirm-text">
              Register as an <strong>Individual Developer</strong> at{" "}
              <strong>developer.schwab.com</strong>, then request access
              to the <strong>“Trader API – Individual”</strong> product
              and create an app. When Schwab asks for the app settings,
              copy these exactly:
            </p>
            <CopyField label="Callback URL" value={callbackUrl} />
            <CopyField label="Order rate limit" value="120 / min" />
            <p className="confirm-text">
              The callback URL points back at this machine — Schwab
              redirects your browser to it after you log in (step 5
              explains the error page you will see there, which is
              expected).
            </p>
          </div>
        )}

        {!loading && step === 3 && (
          <div className="wizard-body">
            <h4>Step 3 — Approval wait</h4>
            <p className="confirm-text">
              Schwab reviews both requests by hand. As a rough guide:
            </p>
            <ul className="wizard-list">
              <li>
                <strong>Product access</strong> (“Trader API –
                Individual”) — about <strong>2 business days</strong>.
              </li>
              <li>
                <strong>App approval</strong> — a few more business days
                after that.
              </li>
              <li>
                You are done waiting when the app&apos;s status reads{" "}
                <strong>“Ready For Use”</strong> in the developer portal.
              </li>
            </ul>
            <p className="confirm-text">
              This step is <strong>explicitly non-blocking</strong>: you
              can close this wizard and come back — it will reopen right
              where you left off, because your progress is read from the
              system state, not stored in the wizard.
            </p>
          </div>
        )}

        {!loading && step === 4 && (
          <div className="wizard-body">
            <h4>Step 4 — App credentials</h4>
            <p className="confirm-text">
              Paste the <strong>App Key</strong> and{" "}
              <strong>App Secret</strong> from your approved app in the
              Schwab developer portal.
            </p>
            <p className="confirm-text">
              Credentials are stored{" "}
              <strong>only in the local keys file on this machine</strong>{" "}
              and are never sent anywhere else — the app shows at most the
              App Key&apos;s last 4 characters.
            </p>
            {schwab?.configured && (
              <p className="confirm-text">
                Current App Key:{" "}
                <strong>
                  {schwab.last4 ? `…${schwab.last4}` : "saved"}
                </strong>{" "}
                (saving again replaces it.)
              </p>
            )}
            {savedLast4 && (
              <p className="added-note">
                Saved — App Key ends in {savedLast4}.
              </p>
            )}
            <label className="wizard-field">
              <span>App Key</span>
              <input
                className="wizard-input"
                type="password"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="wizard-field">
              <span>App Secret</span>
              <input
                className="wizard-input"
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                autoComplete="off"
              />
            </label>
            <div className="submit-row">
              <button
                type="button"
                className="btn primary"
                onClick={() => void saveCredentials()}
                disabled={
                  busy !== null || appKey.trim() === "" || appSecret === ""
                }
              >
                {busy === "credentials" ? "Saving…" : "Save credentials"}
              </button>
            </div>
          </div>
        )}

        {!loading && step === 5 && (
          <div className="wizard-body">
            <h4>Step 5 — Connect (OAuth)</h4>
            {schwab?.state === "expired" && (
              <div className="warning-box">
                <strong>Your Schwab login has expired.</strong> This step
                is the re-login home: run the same login flow again to
                refresh it.
              </div>
            )}
            <p className="confirm-text">
              Click below to open Schwab&apos;s own login in a new tab and
              sign in there. This app never sees your Schwab password.
            </p>
            <div className="submit-row">
              <button
                type="button"
                className="btn primary"
                onClick={() => void openSchwabLogin()}
                disabled={busy !== null}
              >
                {busy === "auth-url" ? "Opening…" : "Open Schwab login"}
              </button>
            </div>
            <p className="confirm-text">
              After logging in, Schwab redirects your browser to{" "}
              <strong>{callbackUrl}</strong> — which will show a{" "}
              <strong>browser error page. That is expected</strong>:
              nothing is listening there to catch the redirect. Copy the{" "}
              <strong>FULL address-bar URL</strong> from that error page
              and paste it here (pasting just the bare code works too).
            </p>
            <label className="wizard-field">
              <span>Redirect URL (or code) from the address bar</span>
              <input
                className="wizard-input"
                type="text"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder={`${CALLBACK_URL}?code=…`}
                autoComplete="off"
              />
            </label>
            <div className="submit-row">
              <button
                type="button"
                className="btn primary"
                onClick={() => void exchangeCode()}
                disabled={busy !== null || pasteValue.trim() === ""}
              >
                {busy === "exchange" ? "Connecting…" : "Connect"}
              </button>
              {schwab?.state === "authorized" && (
                <span className="added-note">
                  ✓ Authorized
                  {schwab.refreshDaysLeft !== null
                    ? ` — refresh ${schwab.refreshDaysLeft}d left`
                    : ""}
                </span>
              )}
            </div>
            <p className="hint">
              Schwab refresh tokens last 7 days — when the chip in the
              header reads “expired — re-login needed”, come back to this
              step.
            </p>
          </div>
        )}

        {!loading && step === 6 && (
          <div className="wizard-body">
            <h4>Step 6 — Verify</h4>
            <p className="confirm-text">
              Run a <strong>read-only check</strong>: the app asks Schwab
              for your account summary and places no orders. A successful
              verify lights up the Schwab chip in the keys readout on the
              dashboard.
            </p>
            <div className="submit-row">
              <button
                type="button"
                className="btn primary"
                onClick={() => void runVerify()}
                disabled={busy !== null}
              >
                {busy === "verify" ? "Checking…" : "Run read-only check"}
              </button>
            </div>
            {verified ? (
              <dl className="decision-grid">
                <dt>Account</dt>
                <dd>{verified.accountMasked}</dd>
                <dt>Equity</dt>
                <dd>
                  {typeof verified.equity === "number"
                    ? fmtMoney(verified.equity)
                    : String(verified.equity)}
                </dd>
                <dt>Cash</dt>
                <dd>
                  {typeof verified.cash === "number"
                    ? fmtMoney(verified.cash)
                    : String(verified.cash)}
                </dd>
                <dt>Positions</dt>
                <dd>{verified.positionCount}</dd>
                <dt>Verified at</dt>
                <dd>
                  {verified.at
                    ? new Date(verified.at).toLocaleString("en-US")
                    : "—"}
                </dd>
              </dl>
            ) : (
              <p className="hint">Not verified yet in this status.</p>
            )}
          </div>
        )}

        {!loading && step === 7 && (
          <div className="wizard-body">
            <h4>Step 7 — Test sequence</h4>
            <div className="warning-box" role="alert">
              <strong>Schwab has NO paper mode.</strong> The first real
              order is live money. The test below is designed so the order
              cannot fill — a $1.00 limit on AAPL is far below market —
              and it is cancelled immediately, but it is still a real
              order on a real account.
            </div>
            <p className="confirm-text">
              First, run an <strong>order preview</strong> (no order is
              placed): 1 share of AAPL, limit $1.00.
            </p>
            <div className="submit-row">
              <button
                type="button"
                className="btn"
                onClick={() => void runPreview()}
                disabled={busy !== null}
              >
                {busy === "preview" ? "Previewing…" : "Run order preview"}
              </button>
              {previewLine && <span className="added-note">{previewLine}</span>}
            </div>
            <label className="wizard-confirm">
              <input
                type="checkbox"
                checked={testConfirmed}
                onChange={(e) => setTestConfirmed(e.target.checked)}
              />{" "}
              I understand this places a real 1-share limit order at $1.00
              (it cannot fill at that price) and cancels it immediately
            </label>
            <div className="submit-row">
              <button
                type="button"
                className="btn kill"
                onClick={() => void runPlaceCancel()}
                disabled={busy !== null || !testConfirmed}
              >
                {busy === "place-cancel"
                  ? "Placing + cancelling…"
                  : "Place + cancel test order"}
              </button>
            </div>
            {testResult && (
              <p className="confirm-text">
                Test order <strong>{summarize(testResult.orderId)}</strong>{" "}
                — placed status:{" "}
                <strong>{summarize(testResult.placedStatus)}</strong> —
                cancelled:{" "}
                <strong>
                  {testResult.cancelled === true
                    ? "yes"
                    : testResult.cancelled === false
                      ? "no"
                      : summarize(testResult.cancelled)}
                </strong>
              </p>
            )}
          </div>
        )}

        {!loading && step === 8 && (
          <div className="wizard-body">
            <h4>Step 8 — Assign + go live</h4>
            <p className="confirm-text">
              Choose each bot&apos;s venue. Alpaca is paper;{" "}
              <strong>Schwab is LIVE money</strong>. Assignments apply on
              engine restart, and the fleet MODE ceiling still applies —
              Schwab bots trade only in the CONNECTED deployment.
            </p>
            {status === null && (
              <p className="hint">Bot list unavailable — status not loaded.</p>
            )}
            {(status?.bots ?? []).map((bot) => {
              const draft = venueDrafts[bot.codename] ?? {
                venue: (bot.broker === "schwab"
                  ? "schwab"
                  : "alpaca") as VenueDraft["venue"],
                goLive: false,
              };
              const note = venueNotes[bot.codename];
              return (
                <div className="wizard-bot-row" key={bot.codename}>
                  <div className="wizard-bot-main">
                    <strong>{bot.name}</strong>
                    <span className="wizard-bot-meta">
                      {" "}
                      — currently {bot.broker} · mode {bot.mode}
                    </span>
                  </div>
                  {!bot.schwabEligible && bot.ineligibleReason && (
                    <p className="wizard-bot-reason">
                      {bot.ineligibleReason}
                    </p>
                  )}
                  <div className="wizard-bot-controls">
                    <select
                      className="mode-select"
                      value={draft.venue}
                      aria-label={`Venue for ${bot.name}`}
                      onChange={(e) =>
                        setVenueDrafts((prev) => ({
                          ...prev,
                          [bot.codename]: {
                            ...draft,
                            venue: e.target.value as VenueDraft["venue"],
                          },
                        }))
                      }
                    >
                      <option value="alpaca">Alpaca paper</option>
                      <option value="schwab" disabled={!bot.schwabEligible}>
                        Schwab LIVE
                      </option>
                    </select>
                    {draft.venue === "schwab" && bot.schwabEligible && (
                      <label className="wizard-confirm inline">
                        <input
                          type="checkbox"
                          checked={draft.goLive}
                          onChange={(e) =>
                            setVenueDrafts((prev) => ({
                              ...prev,
                              [bot.codename]: {
                                ...draft,
                                goLive: e.target.checked,
                              },
                            }))
                          }
                        />{" "}
                        Also set this bot live (mode: connected)
                      </label>
                    )}
                    <button
                      type="button"
                      className="btn small primary"
                      onClick={() => void saveVenue(bot)}
                      disabled={busy !== null}
                    >
                      {busy === `venue:${bot.codename}` ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {note && <p className="added-note">{note}</p>}
                </div>
              );
            })}
          </div>
        )}

        <div className="confirm-actions wizard-footer">
          <button
            type="button"
            className="btn"
            onClick={() => setStep((s) => clampStep(s - 1))}
            disabled={step <= 1}
          >
            Back
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setStep((s) => clampStep(s + 1))}
            disabled={step >= 8}
          >
            Next
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
