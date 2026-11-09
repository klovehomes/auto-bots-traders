import { useState } from "react";

/**
 * Phase PM7 — the email gate screen for the private dashboard.
 *
 * Rendered by the App wrapper (App.tsx) when GET /gate/status says
 * the gate is enabled and this browser has no valid session. The
 * flow mirrors the proven v17 showcase gate:
 *
 *   email form → POST /gate/register → code form → POST /gate/verify
 *   → success → the wrapper swaps in the dashboard (the pm_session
 *   cookie now rides along on every API + WebSocket call).
 *
 * Dev mode: when the API has no RESEND_API_KEY it returns the code
 * in a `dev_code` field (and logs it server-side); we surface it in
 * a clearly-marked dev box so the flow can be tested end-to-end
 * without email. That field cannot appear in production config.
 *
 * Branding is text-only (no binary assets): the gate is part of the
 * private app bundle, not the public showcase.
 */

type Step = "email" | "code" | "done";

async function postJson(
  apiBase: string,
  path: string,
  body: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The session cookie is set cross-origin (web :4173 → api
    // :8080) on verify — it only sticks with credentials included.
    credentials: "include",
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* non-JSON response — treat as a bare failure */
  }
  return { ok: res.ok, status: res.status, data };
}

export function GateScreen(props: {
  apiBase: string;
  onAuthenticated: () => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const submitEmail = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { ok, status, data } = await postJson(props.apiBase, "/gate/register", {
        email,
      });
      if (ok) {
        if (typeof data.dev_code === "string") setDevCode(data.dev_code);
        setStep("code");
      } else if (status === 429) {
        setError(
          "Too many codes requested for now — please wait a bit and try again.",
        );
      } else {
        setError("That email address doesn't look right — check it and retry.");
      }
    } catch {
      setError("Something went wrong sending your code — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { ok } = await postJson(props.apiBase, "/gate/verify", {
        email,
        code,
      });
      if (ok) {
        setStep("done");
        window.setTimeout(props.onAuthenticated, 900);
      } else {
        setError(
          "That code didn't match — check the email and try again. Codes expire after 10 minutes.",
        );
      }
    } catch {
      setError("Something went wrong checking your code — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="gate-wrap">
      <div className="gate-card">
        <div className="gate-logo-text" aria-hidden="true">
          PM
        </div>
        <h1 className="gate-title">Prediction Markets Assistant</h1>
        <p className="gate-tagline">
          Polymarket-only trader — Polymarket shadow sleeve + BTC / ETH /
          SOL breakout sleeve
        </p>

        {step === "email" && (
          <>
            <p className="gate-copy">
              This dashboard is gated. Register with your email and
              we'll send you a 6-digit activation code to unlock it.
              No password, ever.
            </p>
            <form className="gate-form" onSubmit={submitEmail}>
              <input
                className="gate-input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="gate-button" type="submit" disabled={busy}>
                {busy ? "Sending…" : "Email me my code"}
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <p className="gate-copy">
              We emailed you a code — enter the 6-digit activation code
              we sent to <strong>{email}</strong>. It expires in 10
              minutes.
            </p>
            {devCode && (
              <p className="gate-devbox">
                DEV MODE — no email was sent. Your code is{" "}
                <strong>{devCode}</strong>
              </p>
            )}
            <form className="gate-form" onSubmit={submitCode}>
              <input
                className="gate-input gate-code"
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                required
              />
              <button className="gate-button" type="submit" disabled={busy}>
                {busy ? "Checking…" : "Unlock the dashboard"}
              </button>
            </form>
            <button
              className="gate-link"
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
            >
              Use a different email
            </button>
          </>
        )}

        {step === "done" && (
          <p className="gate-copy gate-success">
            You're in — loading the dashboard…
          </p>
        )}

        {error && <p className="gate-error">{error}</p>}

        <p className="gate-footer">
          Paper trading with simulated funds. Not investment advice.
          Your email is only used for dashboard access.
        </p>
      </div>
    </main>
  );
}
