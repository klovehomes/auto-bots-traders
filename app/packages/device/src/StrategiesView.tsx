import { useEffect, useMemo, useState } from "react";
import { errorText, selections, vault, type CredentialMeta, type Provider, type StrategySelection } from "./api";
import { CATALOG, clampToCap, defaultSelection, missingKeys, normalizeUniverse, type StrategyDef } from "./catalog";

const PROVIDER_NAME: Record<Provider, string> = {
  alpaca: "Alpaca",
  kalshi: "Kalshi",
  polymarket: "Polymarket",
  other: "Other",
};

export function StrategiesView({ onGoToKeys }: { onGoToKeys: () => void }) {
  const [sel, setSel] = useState<Record<string, StrategySelection>>({});
  const [creds, setCreds] = useState<CredentialMeta[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [stored, keys] = await Promise.all([selections.load(), vault.list()]);
        const byCode: Record<string, StrategySelection> = {};
        for (const def of CATALOG) {
          const s = stored.find((x) => x.codename === def.codename);
          byCode[def.codename] = s ? { ...defaultSelection(def), ...s } : defaultSelection(def);
        }
        setSel(byCode);
        setCreds(keys);
      } catch (e) {
        setError(errorText(e));
      }
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set(CATALOG.map((d) => d.category))), []);

  function update(code: string, patch: Partial<StrategySelection>) {
    setSel((s) => ({ ...s, [code]: { ...s[code], ...patch } }));
    setSaved(false);
  }

  async function save() {
    setError(null);
    try {
      // Re-apply caps on save so a hand-edited value can't slip past the Risk Gate limits.
      const items = CATALOG.map((def) => {
        const s = sel[def.codename];
        return {
          ...s,
          maxPositionPct: clampToCap(s.maxPositionPct, def.caps.maxPositionPct),
          maxDailyLossPct: clampToCap(s.maxDailyLossPct, def.caps.maxDailyLossPct),
          enabled: s.enabled && missingKeys(def, s).length === 0,
        };
      });
      await selections.save(items);
      setSel(Object.fromEntries(items.map((i) => [i.codename, i])));
      setSaved(true);
    } catch (e) {
      setError(errorText(e));
    }
  }

  if (Object.keys(sel).length === 0) return <p className="muted">{error ?? "Loading strategies…"}</p>;
  const enabledCount = Object.values(sel).filter((s) => s.enabled).length;

  return (
    <section>
      <div className="section-head">
        <h2>Strategy library</h2>
        <div className="row">
          <span className="muted">{enabledCount} selected · paper mode</span>
          <button className="primary" disabled={saved} onClick={save}>
            {saved ? "Saved" : "Save selection"}
          </button>
        </div>
      </div>
      <p className="muted small">
        Pick the strategies this device should run. You can tighten each strategy's risk limits but never loosen them.
        Live trading stays locked in this build.
      </p>
      {error && <p className="error">{error}</p>}
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="cat">{cat}</h3>
          <div className="grid">
            {CATALOG.filter((d) => d.category === cat).map((def) => (
              <StrategyCard
                key={def.codename}
                def={def}
                sel={sel[def.codename]}
                creds={creds}
                expanded={open === def.codename}
                onToggleOpen={() => setOpen(open === def.codename ? null : def.codename)}
                onChange={(p) => update(def.codename, p)}
                onGoToKeys={onGoToKeys}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function StrategyCard(props: {
  def: StrategyDef;
  sel: StrategySelection;
  creds: CredentialMeta[];
  expanded: boolean;
  onToggleOpen: () => void;
  onChange: (p: Partial<StrategySelection>) => void;
  onGoToKeys: () => void;
}) {
  const { def, sel, creds, expanded, onChange } = props;
  const missing = missingKeys(def, sel);
  const [universeText, setUniverseText] = useState(sel.universe.join(", "));
  const providers = [...def.requires, ...def.optional];

  return (
    <article className={`card strategy ${sel.enabled ? "on" : ""}`} style={{ borderLeftColor: def.color }}>
      <div className="row">
        <div>
          <strong>{def.name}</strong>
          <div className="muted small">{def.strategy.replaceAll("_", " ")} · {def.timeframe ?? "—"}</div>
        </div>
        <label className="switch" title={missing.length ? `Needs ${missing.map((p) => PROVIDER_NAME[p]).join(" + ")} keys` : ""}>
          <input
            type="checkbox"
            checked={sel.enabled}
            disabled={missing.length > 0}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          <span>{sel.enabled ? "On" : "Off"}</span>
        </label>
      </div>
      <p className="small">{def.summary}</p>

      {providers.map((p) => {
        const options = creds.filter((c) => c.provider === p && c.env === "paper");
        return (
          <label key={p} className="small">
            {PROVIDER_NAME[p]} key{def.optional.includes(p) && <span className="muted"> (optional)</span>}
            {options.length ? (
              <select
                value={sel.credentials[p] ?? ""}
                onChange={(e) =>
                  onChange({
                    credentials: { ...sel.credentials, [p]: e.target.value || undefined },
                    ...(e.target.value || !def.requires.includes(p) ? {} : { enabled: false }),
                  })
                }
              >
                <option value="">— choose —</option>
                {options.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {c.keyIdTail ? ` (••••${c.keyIdTail})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <button type="button" className="link" onClick={props.onGoToKeys}>
                Add a {PROVIDER_NAME[p]} paper key →
              </button>
            )}
          </label>
        );
      })}

      <button type="button" className="link" onClick={props.onToggleOpen}>
        {expanded ? "Hide settings" : "Settings & rules"}
      </button>
      {expanded && (
        <div className="details">
          {def.universe.length > 0 ? (
            <label className="small">
              Symbols {def.universeNote && <span className="muted">({def.universeNote})</span>}
              <textarea
                rows={3}
                value={universeText}
                onChange={(e) => setUniverseText(e.target.value)}
                onBlur={() => {
                  const u = normalizeUniverse(universeText);
                  setUniverseText(u.join(", "));
                  onChange({ universe: u });
                }}
              />
            </label>
          ) : (
            <p className="muted small">Universe: {def.universeNote}</p>
          )}
          <div className="row">
            <CapInput label="Max position %" cap={def.caps.maxPositionPct} value={sel.maxPositionPct} onChange={(v) => onChange({ maxPositionPct: v })} />
            <CapInput label="Max daily loss %" cap={def.caps.maxDailyLossPct} value={sel.maxDailyLossPct} onChange={(v) => onChange({ maxDailyLossPct: v })} />
          </div>
          <dl className="rules">
            {Object.entries(def.rules).map(([k, v]) => (
              <div key={k}>
                <dt>{k.replaceAll("_", " ")}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
            {def.schedule && (
              <div>
                <dt>schedule</dt>
                <dd>{def.schedule}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </article>
  );
}

function CapInput(props: { label: string; cap: number | null; value: number | null; onChange: (v: number | null) => void }) {
  if (props.cap === null) return null;
  return (
    <label className="small grow">
      {props.label} <span className="muted">(max {props.cap})</span>
      <input
        type="number"
        min={0.1}
        max={props.cap}
        step={0.1}
        value={props.value ?? props.cap}
        onChange={(e) => props.onChange(clampToCap(Number(e.target.value), props.cap))}
      />
    </label>
  );
}
