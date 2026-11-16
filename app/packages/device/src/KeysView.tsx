import { useEffect, useState } from "react";
import { errorText, vault, type CredentialMeta, type Env, type Provider, type TestResult } from "./api";

interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
  optional?: boolean;
  secret?: boolean;
}

const PROVIDERS: Record<Exclude<Provider, "other">, { name: string; fields: FieldDef[]; help: string }> = {
  alpaca: {
    name: "Alpaca",
    help: "Paper keys come from the Paper dashboard's API Keys panel; live keys from the live account.",
    fields: [
      { key: "key_id", label: "API Key ID" },
      { key: "secret_key", label: "Secret Key", secret: true },
    ],
  },
  kalshi: {
    name: "Kalshi",
    help: "Paper = Kalshi demo (demo.kalshi.co), a separate account from production. Paste the full .pem contents.",
    fields: [
      { key: "key_id", label: "API Key ID" },
      { key: "private_key_pem", label: "RSA private key (PEM)", multiline: true, secret: true },
    ],
  },
  polymarket: {
    name: "Polymarket",
    help: "Use a dedicated wallet with limited funds. Polymarket has no paper venue — the bot runs this sleeve in shadow mode.",
    fields: [
      { key: "private_key", label: "Wallet private key", secret: true },
      { key: "funder_address", label: "Funder / deposit wallet address", optional: true },
      { key: "api_key", label: "CLOB API key", optional: true },
      { key: "api_secret", label: "CLOB API secret", optional: true, secret: true },
      { key: "api_passphrase", label: "CLOB API passphrase", optional: true, secret: true },
    ],
  },
};

export function KeysView() {
  const [items, setItems] = useState<CredentialMeta[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, TestResult | "running">>({});

  async function load() {
    try {
      setItems(await vault.list());
    } catch (e) {
      setError(errorText(e));
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function runTest(id: string) {
    setTests((t) => ({ ...t, [id]: "running" }));
    try {
      const r = await vault.test(id);
      setTests((t) => ({ ...t, [id]: r }));
      load();
    } catch (e) {
      setTests((t) => ({ ...t, [id]: { ok: false, detail: errorText(e) } }));
    }
  }

  async function remove(c: CredentialMeta) {
    if (!window.confirm(`Delete "${c.label}" from this device? This can't be undone.`)) return;
    try {
      await vault.remove(c.id);
      load();
    } catch (e) {
      setError(errorText(e));
    }
  }

  return (
    <section>
      <div className="section-head">
        <h2>Exchange keys</h2>
        {!adding && (
          <button className="primary" onClick={() => setAdding(true)}>
            Add key
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      {adding && (
        <AddKeyForm
          onDone={() => {
            setAdding(false);
            load();
          }}
        />
      )}
      {items.length === 0 && !adding && <p className="muted">No keys yet. Add your Alpaca paper keys to get started.</p>}
      <div className="grid">
        {items.map((c) => {
          const t = tests[c.id];
          return (
            <article key={c.id} className="card">
              <div className="row">
                <strong>{c.label}</strong>
                <span className={`pill ${c.env === "live" ? "warn" : ""}`}>{c.env === "live" ? "LIVE" : "Paper"}</span>
              </div>
              <p className="muted">
                {c.provider === "other" ? "Other" : PROVIDERS[c.provider].name}
                {c.keyIdTail && <> · key ••••{c.keyIdTail}</>}
              </p>
              {t === "running" && <p className="muted">Testing…</p>}
              {t && t !== "running" && <p className={t.ok ? "ok-text" : "error"}>{t.detail}</p>}
              {!t && c.lastTestOk !== null && (
                <p className={c.lastTestOk ? "ok-text" : "error"}>Last test {c.lastTestOk ? "passed" : "failed"}</p>
              )}
              <div className="row actions">
                <button onClick={() => runTest(c.id)} disabled={t === "running"}>
                  Test connection
                </button>
                <button className="danger ghost" onClick={() => remove(c)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AddKeyForm({ onDone }: { onDone: () => void }) {
  const [provider, setProvider] = useState<Exclude<Provider, "other">>("alpaca");
  const [env, setEnv] = useState<Env>("paper");
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const spec = PROVIDERS[provider];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (env === "live" && !window.confirm("These are LIVE keys that can trade real money. Store them?")) return;
    setBusy(true);
    setError(null);
    try {
      await vault.add({ provider, env, label: label || `${spec.name} ${env}`, fields });
      setFields({}); // drop secrets from React state as soon as they're stored
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card add" onSubmit={save}>
      <div className="row">
        <label>
          Exchange
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as typeof provider);
              setFields({});
            }}
          >
            {Object.entries(PROVIDERS).map(([k, p]) => (
              <option key={k} value={k}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Account
          <select value={env} onChange={(e) => setEnv(e.target.value as Env)}>
            <option value="paper">Paper / demo</option>
            <option value="live">Live</option>
          </select>
        </label>
        <label className="grow">
          Label
          <input value={label} placeholder={`${spec.name} ${env}`} onChange={(e) => setLabel(e.target.value)} />
        </label>
      </div>
      <p className="muted small">{spec.help}</p>
      {spec.fields.map((f) => (
        <label key={f.key}>
          {f.label}
          {f.optional && <span className="muted"> (optional)</span>}
          {f.multiline ? (
            <textarea
              rows={6}
              spellCheck={false}
              autoComplete="off"
              value={fields[f.key] ?? ""}
              onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
            />
          ) : (
            <input
              type={f.secret ? "password" : "text"}
              spellCheck={false}
              autoComplete="off"
              value={fields[f.key] ?? ""}
              onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
            />
          )}
        </label>
      ))}
      {error && <p className="error">{error}</p>}
      <div className="row actions">
        <button className="primary" disabled={busy}>
          Save to this device
        </button>
        <button type="button" className="ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
