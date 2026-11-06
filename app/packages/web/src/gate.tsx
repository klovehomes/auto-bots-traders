import { useState } from "react";

/**
 * Phase 9 (v17) — the public gate for the read-only showcase.
 *
 * A separate entry tree from BOTH the private dashboard (App.tsx) and
 * the showcase app (showcase.tsx): the Pages middleware serves this
 * page (gate.html) in place of the app shell whenever a visitor has
 * no session cookie. The flow is:
 *
 *   email form → POST /api/register → code form → POST /api/verify
 *   → success → reload into the showcase (the session cookie now
 *   unlocks the app shell and /snapshot.json).
 *
 * Dev mode: when the backend has no RESEND_API_KEY it returns the
 * code in a `dev_code` field (and logs it server-side); we surface it
 * in a clearly-marked dev box so the flow can be tested end-to-end
 * without email. That field cannot appear in production config.
 */

type Step = "email" | "code" | "done";

async function postJson(
  path: string,
  body: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export function GateApp() {
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
      const { ok, status, data } = await postJson("/api/register", { email });
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
      const { ok } = await postJson("/api/verify", { email, code });
      if (ok) {
        setStep("done");
        window.setTimeout(() => window.location.assign("/"), 1200);
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
        <img
          className="gate-logo"
          src="/traderbot-logo.png"
          alt="TraderBot logo"
          width={112}
          height={112}
        />
        <h1 className="gate-title">Trader Bot Landscape</h1>
        <p className="gate-tagline">The public, read-only showcase</p>

        {step === "email" && (
          <>
            <p className="gate-copy">
              Five trading bots, running on paper in public — the city,
              the leaderboard, and every trade they make. Register with
              your email and we'll send you a 6-digit activation code to
              unlock the showcase. No password, ever.
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
              Registered? We emailed you a code — enter the 6-digit
              activation code we sent to <strong>{email}</strong>. It
              expires in 10 minutes.
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
                {busy ? "Checking…" : "Unlock the showcase"}
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
            You're in — taking you to the showcase…
          </p>
        )}

        {error && <p className="gate-error">{error}</p>}

        <p className="gate-footer">
          Paper trading with simulated funds. Not investment advice.
          Your email is only used for showcase access and occasional
          TraderBot milestone letters.
        </p>
      </div>
    </main>
  );
}
