import { useCallback, useEffect, useRef, useState } from "react";
import { errorText, vault, type VaultStatus } from "./api";
import { BotsView } from "./BotsView";
import { KeysView } from "./KeysView";
import * as runtime from "./runtime";
import { StrategiesView } from "./StrategiesView";

type Tab = "bots" | "strategies" | "keys";

export function App() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [tab, setTab] = useState<Tab>("bots");
  const [fatal, setFatal] = useState<string | null>(null);
  const hadBotSession = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const s = await vault.status();
      setStatus(s);
      // Bots keep running while the screen is locked, but stop the moment
      // their bot session ends (they'd only collect key-access errors).
      if (hadBotSession.current && s.botSessionSecondsLeft === 0) runtime.onSessionEnded();
      hadBotSession.current = s.botSessionSecondsLeft > 0;
    } catch (e) {
      setFatal(errorText(e));
    }
  }, []);

  // Re-check every few seconds so the UI locks as soon as the Rust session expires.
  useEffect(() => {
    refresh();
    runtime.initRuntime().catch((e) => setFatal(errorText(e)));
    const t = window.setInterval(refresh, 5000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const updateStatus = (s: VaultStatus) => {
    hadBotSession.current = s.botSessionSecondsLeft > 0;
    setStatus(s);
  };

  if (fatal) {
    return (
      <main className="page center">
        <p className="error">Could not reach the vault: {fatal}</p>
        <p className="muted">This screen only works inside the Trader Vault app.</p>
      </main>
    );
  }
  if (!status) return <main className="page center muted">Loading…</main>;
  if (!status.unlocked) return <LockScreen status={status} onStatus={setStatus} />;

  const mins = Math.max(1, Math.ceil(status.secondsLeft / 60));
  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Trader Vault</h1>
          <p className="muted">Keys stay on this device. Bots trade from here, straight to the exchange.</p>
        </div>
        <div className="session">
          <span className="pill ok">Unlocked · {mins} min left</span>
          <button className="ghost" onClick={async () => setStatus(await vault.lock())}>
            Lock now
          </button>
        </div>
      </header>
      <nav className="tabs">
        <button className={tab === "bots" ? "active" : ""} onClick={() => setTab("bots")}>
          Bots
        </button>
        <button className={tab === "strategies" ? "active" : ""} onClick={() => setTab("strategies")}>
          Strategies
        </button>
        <button className={tab === "keys" ? "active" : ""} onClick={() => setTab("keys")}>
          Keys
        </button>
      </nav>
      {tab === "bots" && (
        <BotsView status={status} onStatus={updateStatus} onGoToStrategies={() => setTab("strategies")} />
      )}
      {tab === "strategies" && <StrategiesView onGoToKeys={() => setTab("keys")} />}
      {tab === "keys" && <KeysView />}
    </main>
  );
}

function LockScreen({ status, onStatus }: { status: VaultStatus; onStatus: (s: VaultStatus) => void }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const setup = !status.initialized;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (setup && pass !== confirm) {
      setError("Passphrases don't match");
      return;
    }
    setBusy(true);
    try {
      onStatus(setup ? await vault.setup(pass) : await vault.unlock(pass));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPass("");
      setConfirm("");
      setBusy(false);
    }
  }

  return (
    <main className="page center">
      <form className="card lock" onSubmit={submit}>
        <h1>Trader Vault</h1>
        <p className="muted">
          {setup
            ? "Choose a passphrase. It protects your exchange keys on this device and can't be recovered."
            : "Unlock to manage keys and run your bots."}
        </p>
        {status.botSessionSecondsLeft > 0 && (
          <p className="pill ok">Bots are still running — unlock to see them</p>
        )}
        <label>
          Passphrase
          <input type="password" autoFocus autoComplete={setup ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {setup && (
          <label>
            Confirm passphrase
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy || pass.length === 0}>
          {setup ? "Create vault" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
