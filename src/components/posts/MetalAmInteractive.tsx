/**
 * Interactive widgets for the "Metal additive manufacturing" article.
 * Each widget is placed in the article body with a `[[interactive:metal-am/<id>]]` line in posts.json;
 * the same data file feeds the static HTML that scripts/prerender.mjs writes for crawlers.
 */
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import data from '../../content/interactive/metal-additive-manufacturing.json';

type Palette = { research: string; venture: string; ink: string; ink2: string; ink3: string; line: string; surface: string; raised: string };

/** Site colour tokens, re-read whenever the light/dark theme changes (SVG charts can't use CSS vars directly everywhere). */
function usePalette(): Palette {
  const read = (): Palette => {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string, fb: string) => s.getPropertyValue(n).trim() || fb;
    return {
      research: v('--ar-research', '#5cc2b0'),
      venture: v('--ar-venture', '#d08a55'),
      ink: v('--ar-ink', '#e6e9ec'),
      ink2: v('--ar-ink-2', '#a3adb8'),
      ink3: v('--ar-ink-3', '#8b96a2'),
      line: v('--ar-line', '#2c3542'),
      surface: v('--ar-surface', '#1a2029'),
      raised: v('--ar-raised', '#212834'),
    };
  };
  const [p, setP] = useState<Palette>(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setP(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => obs.disconnect();
  }, []);
  return p;
}

/** Four distinguishable series colours built from the two brand accents plus neutrals. */
const series = (p: Palette) => [p.venture, p.research, p.ink3, p.ink2];

function tooltipStyle(p: Palette) {
  return {
    contentStyle: { background: p.surface, border: `1px solid ${p.line}`, borderRadius: 8, color: p.ink, fontSize: 13 },
    itemStyle: { color: p.ink },
    labelStyle: { color: p.ink, fontWeight: 600 },
    cursor: { fill: p.raised },
  };
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="am-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className="am-chip" onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- 1. Market ---------------- */
function MarketWidget() {
  const p = usePalette();
  const [mode, setMode] = useState<'mix' | 'region'>('mix');
  const m = data.market[mode];
  const colors = series(p);
  return (
    <figure className="am-panel">
      <div className="am-head">
        <div>
          <figcaption className="am-title">{m.title}</figcaption>
          <p className="am-sub">{m.subtitle}</p>
        </div>
        <Segmented
          label="Market view"
          value={mode}
          onChange={(v) => setMode(v as 'mix' | 'region')}
          options={[
            { id: 'mix', label: 'Revenue mix' },
            { id: 'region', label: 'Regional share' },
          ]}
        />
      </div>
      <div className="am-chart">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'mix' ? (
            <BarChart data={m.data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={false} stroke={p.line} />
              <XAxis type="number" tick={{ fill: p.ink2, fontSize: 12 }} stroke={p.line} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: p.ink, fontSize: 12 }} stroke={p.line} />
              <Tooltip {...tooltipStyle(p)} formatter={(v: number) => [`${v} B`, 'Value']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {m.data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={m.data} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="80%" stroke={p.surface} strokeWidth={2} isAnimationActive={false}>
                {m.data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle(p)} formatter={(v: number, n: string) => [`${v}%`, n]} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 13, color: p.ink2 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="am-note"><strong>Key takeaway:</strong> {m.note}</p>
    </figure>
  );
}

/* ---------------- 2. Processes ---------------- */
function ProcessWidget() {
  const p = usePalette();
  const [family, setFamily] = useState('all');
  const [activeId, setActiveId] = useState('lpbf');
  const list = family === 'all' ? data.processes : data.processes.filter((x) => x.cat === family);
  const active = data.processes.find((x) => x.id === activeId)!;
  const rates = useMemo(() => [...data.processes].sort((a, b) => b.maxRate - a.maxRate).map((x) => ({ name: x.short, value: x.maxRate, id: x.id })), []);

  return (
    <div className="am-panel">
      <div className="am-head">
        <div>
          <p className="am-title">Compare nine industrial metal AM processes</p>
          <p className="am-sub">Filter by process family, then pick a technique to see its specs and workflow.</p>
        </div>
      </div>
      <Segmented label="Process family" value={family} onChange={setFamily} options={data.processFamilies} />

      <div className="am-split">
        <ul className="am-cards" aria-label="Processes">
          {list.map((x) => (
            <li key={x.id}>
              <button type="button" className="am-card" aria-pressed={x.id === activeId} onClick={() => setActiveId(x.id)}>
                <span className="am-kicker">{x.catLabel} · {x.tag}</span>
                <span className="am-card__name">{x.name}</span>
                <span className="am-card__meta">Rate: {x.rate.split('(')[0].trim()}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="am-detail" aria-live="polite">
          <p className="am-kicker">{active.catLabel} · {active.stepType}</p>
          <h3 className="am-detail__title">{active.name}</h3>
          <p>{active.desc}</p>
          <dl className="am-specs">
            <div><dt>Deposition rate</dt><dd>{active.rate}</dd></div>
            <div><dt>Accuracy & finish</dt><dd>{active.tol}</dd></div>
            <div><dt>Build envelope</dt><dd>{active.env}</dd></div>
            <div><dt>Feedstock</dt><dd>{active.feed}</dd></div>
          </dl>
          <p><strong className="am-good">Strengths:</strong> {active.pros}</p>
          <p><strong className="am-warn">Limitations:</strong> {active.cons}</p>
          <ol className="am-flow" aria-label="Process workflow">
            {active.flow.map((s) => <li key={s}><span>{s}</span></li>)}
          </ol>
        </div>
      </div>

      <figure className="am-subfig">
        <figcaption className="am-title">Max typical deposition rate (kg/h, log scale)</figcaption>
        <p className="am-sub">Speed versus resolution: the fastest routes give up fine detail.</p>
        <div className="am-chart am-chart--tall">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rates} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={false} stroke={p.line} />
              <XAxis type="number" scale="log" domain={[0.1, 50]} ticks={[0.2, 0.5, 1, 3, 10, 45]} allowDataOverflow tick={{ fill: p.ink2, fontSize: 12 }} stroke={p.line} />
              <YAxis type="category" dataKey="name" width={84} tick={{ fill: p.ink, fontSize: 12 }} stroke={p.line} />
              <Tooltip {...tooltipStyle(p)} formatter={(v: number) => [`${v} kg/h`, 'Max rate']} />
              <Bar dataKey="value" radius={[0, 5, 5, 0]} isAnimationActive={false} onClick={(d: { id?: string }) => d?.id && setActiveId(d.id)}>
                {rates.map((r) => <Cell key={r.id} cursor="pointer" fill={r.id === activeId ? p.venture : p.research} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}

/* ---------------- 3. VED simulator ---------------- */
function Slider({ id, label, unit, value, min, max, step, digits, onChange }: { id: string; label: string; unit: string; value: number; min: number; max: number; step: number; digits: number; onChange: (v: number) => void }) {
  return (
    <div className="am-slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{value.toFixed(digits)} {unit}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function VedWidget() {
  const [P, setP] = useState(280);
  const [v, setV] = useState(900);
  const [h, setH] = useState(0.1);
  const [t, setT] = useState(0.04);
  const ved = P / (v * h * t);
  const { low, high } = data.ved;
  const state = ved < low ? 'low' : ved <= high ? 'ok' : 'high';
  const label = { low: 'Lack-of-fusion risk', ok: 'Optimal density window', high: 'Keyhole porosity risk' }[state];
  const text = { low: data.ved.lowText, ok: data.ved.okText, high: data.ved.highText }[state];
  // Position on a 0–200 J/mm³ gauge.
  const pos = Math.min(100, (ved / 200) * 100);

  return (
    <div className="am-panel">
      <div className="am-head">
        <div>
          <p className="am-title">Melt-pool volumetric energy density (VED) simulator</p>
          <p className="am-sub">VED = P / (v × h × t), with a 50–120 J/mm³ window for refractory HEAs and superalloys.</p>
        </div>
      </div>
      <div className="am-sliders">
        <Slider id="am-p" label="Laser power (P)" unit="W" value={P} min={100} max={600} step={10} digits={0} onChange={setP} />
        <Slider id="am-v" label="Scan speed (v)" unit="mm/s" value={v} min={300} max={2000} step={50} digits={0} onChange={setV} />
        <Slider id="am-h" label="Hatch spacing (h)" unit="mm" value={h} min={0.05} max={0.2} step={0.01} digits={2} onChange={setH} />
        <Slider id="am-t" label="Layer thickness (t)" unit="mm" value={t} min={0.02} max={0.08} step={0.005} digits={3} onChange={setT} />
      </div>
      <div className={`tl-result am-ved am-ved--${state}`} role="status" aria-live="polite">
        <p className="tl-big">{ved.toFixed(1)} J/mm³ · {label}</p>
        <div className="am-gauge" aria-hidden="true">
          <span className="am-gauge__ok" style={{ left: `${(low / 200) * 100}%`, width: `${((high - low) / 200) * 100}%` }} />
          <span className="am-gauge__mark" style={{ left: `${pos}%` }} />
        </div>
        <div className="am-gauge__scale" aria-hidden="true"><span>0</span><span>50</span><span>120</span><span>200+</span></div>
        <p>{text}</p>
      </div>
    </div>
  );
}

/* ---------------- 4. Sectors ---------------- */
function SectorWidget() {
  const [id, setId] = useState('aero');
  const s = data.sectors.find((x) => x.id === id)!;
  return (
    <div className="am-panel">
      <div className="am-head">
        <div>
          <p className="am-title">Production case studies by sector</p>
          <p className="am-sub">Pick an industry to see the hardware, alloys and measured results.</p>
        </div>
      </div>
      <Segmented label="Industry sector" value={id} onChange={setId} options={data.sectors.map((x) => ({ id: x.id, label: x.label }))} />
      <div className="am-sector" aria-live="polite">
        <h3 className="am-detail__title">{s.title}</h3>
        <p><strong>Flagship hardware:</strong> {s.apps}</p>
        <p><strong>Processes & alloys:</strong> {s.alloys}</p>
        <p><strong className="am-good">Verified impact:</strong> {s.impact}</p>
        <dl className="am-stats">
          {s.stats.map(([n, l]) => (
            <div key={l}><dd>{n}</dd><dt>{l}</dt></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------------- 5. Cost ---------------- */
function CostWidget() {
  const p = usePalette();
  const [nest, setNest] = useState(false);
  const [orient, setOrient] = useState(false);
  const c = data.cost;
  const rows = [
    { name: 'Machine amortization & ops', value: nest ? Math.round(c.base.machine * c.nestingFactor) : c.base.machine },
    { name: 'Powder feedstock', value: orient ? Math.round(c.base.powder * c.orientPowderFactor) : c.base.powder },
    { name: 'Stress relief, HIP & CNC', value: orient ? Math.round(c.base.finish * c.orientFinishFactor) : c.base.finish },
    { name: 'NDT / CT inspection & scrap', value: c.base.ndt },
  ];
  const total = rows.reduce((a, r) => a + r.value, 0);
  const colors = [p.ink, p.venture, p.research, p.ink3];
  return (
    <figure className="am-panel">
      <div className="am-head">
        <div>
          <figcaption className="am-title">Cost per accepted L-PBF part</figcaption>
          <p className="am-sub">Indexed to $1,000 per part. Post-processing averages 27% (Wohlers) and ranges 10–40% (MakerVerse).</p>
        </div>
        <p className="am-total" aria-live="polite"><span>Unit cost index</span><strong>${total.toLocaleString('en-US')}</strong></p>
      </div>
      <div className="am-toggles">
        <label className="am-check"><input type="checkbox" checked={nest} onChange={(e) => setNest(e.target.checked)} /> High-density build nesting (−55% machine cost per part)</label>
        <label className="am-check"><input type="checkbox" checked={orient} onChange={(e) => setOrient(e.target.checked)} /> Strategic orientation (−30% support and finishing)</label>
      </div>
      <div className="am-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="78%" stroke={p.surface} strokeWidth={2} isAnimationActive={false}>
              {rows.map((_, i) => <Cell key={i} fill={colors[i]} />)}
            </Pie>
            <Tooltip {...tooltipStyle(p)} formatter={(v: number, n: string) => [`$${v}`, n]} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 13, color: p.ink2 }} formatter={(n: string, e: { payload?: { value?: number } }) => `${n} ($${e.payload?.value ?? ''})`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <dl className="am-rates">
        {c.rates.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </figure>
  );
}

/* ---------------- 6. Readiness gates ---------------- */
function GatesWidget() {
  const [done, setDone] = useState<boolean[]>(() => data.gates.map(() => false));
  const n = done.filter(Boolean).length;
  const verdict = n === 0 ? 'Tick the gates your candidate part has passed.' : n <= 2 ? 'Early feasibility: finish DfAM and cost modelling.' : n <= 4 ? 'Pilot ready: lock powder and parameter genealogy.' : 'Production ready: all five adoption gates verified.';
  return (
    <div className="am-panel">
      <div className="am-head">
        <div>
          <p className="am-title">5-gate adoption readiness checklist</p>
          <p className="am-sub">Check each engineering and business gate your candidate component has cleared.</p>
        </div>
        <div className="am-score" role="status" aria-live="polite">
          <span><strong>{n} / 5</strong> gates</span>
          <span className="am-bar"><span style={{ width: `${(n / 5) * 100}%` }} /></span>
          <span className="am-sub">{verdict}</span>
        </div>
      </div>
      <ul className="am-gates">
        {data.gates.map((g, i) => (
          <li key={g.name}>
            <label className="am-gate" data-on={done[i] || undefined}>
              <input type="checkbox" checked={done[i]} onChange={(e) => setDone((d) => d.map((x, j) => (j === i ? e.target.checked : x)))} />
              <span>
                <span className="am-kicker">Gate {i + 1}</span>
                <span className="am-card__name">{g.name}</span>
                <span className="am-gate__text">{g.text}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

const widgets: Record<string, ComponentType> = {
  market: MarketWidget,
  processes: ProcessWidget,
  ved: VedWidget,
  sectors: SectorWidget,
  cost: CostWidget,
  gates: GatesWidget,
};

export default function MetalAmInteractive({ id }: { id: string }) {
  const W = widgets[id];
  return W ? <div className="am-widget not-prose"><W /></div> : null;
}
