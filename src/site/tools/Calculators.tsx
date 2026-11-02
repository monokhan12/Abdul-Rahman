import { useMemo, useState, type ReactNode, type ComponentType } from 'react';
import { ANODES, ANODIC_INDEX, GALVANIC_LIMITS, K_MM_PER_Y, MM_PER_MIL } from './data';

const fmt = (n: number, d = 3) => (Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: d }) : '–');

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="tl-field">
      <span className="tl-label">{label}</span>
      {children}
      {hint && <span className="tl-hint">{hint}</span>}
    </label>
  );
}

function Num({ value, onChange, step = 'any', min }: { value: string; onChange: (v: string) => void; step?: string; min?: number }) {
  return <input className="tl-input" type="number" inputMode="decimal" step={step} min={min} value={value} onChange={(e) => onChange(e.target.value)} />;
}

/* ---------------- Galvanic corrosion ---------------- */
export function GalvanicCalculator() {
  const [a, setA] = useState(7); // 18% Cr stainless
  const [b, setB] = useState(13); // wrought aluminum
  const [env, setEnv] = useState<(typeof GALVANIC_LIMITS)[number]['id']>('harsh');
  const A = ANODIC_INDEX[a], B = ANODIC_INDEX[b];
  const limit = GALVANIC_LIMITS.find((l) => l.id === env)!;
  const diff = Math.abs(A.v - B.v);
  const ok = diff <= limit.max + 1e-9;
  const anode = A.v === B.v ? null : A.v > B.v ? A : B;

  return (
    <div className="tl-panel">
      <div className="tl-grid">
        <Field label="Metal A">
          <select className="tl-input" value={a} onChange={(e) => setA(+e.target.value)}>
            {ANODIC_INDEX.map((m, i) => <option key={m.name} value={i}>{m.name} ({m.v.toFixed(2)} V)</option>)}
          </select>
        </Field>
        <Field label="Metal B">
          <select className="tl-input" value={b} onChange={(e) => setB(+e.target.value)}>
            {ANODIC_INDEX.map((m, i) => <option key={m.name} value={i}>{m.name} ({m.v.toFixed(2)} V)</option>)}
          </select>
        </Field>
        <Field label="Environment">
          <select className="tl-input" value={env} onChange={(e) => setEnv(e.target.value as typeof env)}>
            {GALVANIC_LIMITS.map((l) => <option key={l.id} value={l.id}>{l.label} (max {l.max.toFixed(2)} V)</option>)}
          </select>
        </Field>
      </div>
      <div className={`tl-result ${ok ? 'tl-ok' : 'tl-bad'}`} role="status" aria-live="polite">
        <p className="tl-big">{ok ? 'Compatible' : 'Not recommended without isolation'}</p>
        <p>
          Anodic index difference: <strong>{diff.toFixed(2)} V</strong> (limit {limit.max.toFixed(2)} V).{' '}
          {anode ? <>The corroding metal (anode) is <strong>{anode.name}</strong>.</> : 'Same group: no galvanic driving force.'}
        </p>
      </div>
    </div>
  );
}

/* ---------------- XRD: Bragg + Scherrer ---------------- */
export function XrdCalculator() {
  const [anode, setAnode] = useState<string>('Cu');
  const [line, setLine] = useState<'ka1' | 'ka' | 'ka2' | 'kb'>('ka1');
  const [custom, setCustom] = useState('1.54056');
  const [twoTheta, setTwoTheta] = useState('44.67');
  const [order, setOrder] = useState('1');
  const [dIn, setDIn] = useState('2.027');
  const [fwhm, setFwhm] = useState('0.25');
  const [inst, setInst] = useState('0.05');
  const [k, setK] = useState('0.9');

  const lambda = anode === 'custom' ? parseFloat(custom) : ANODES.find((x) => x.id === anode)![line];
  const th = (parseFloat(twoTheta) / 2) * (Math.PI / 180);
  const n = parseInt(order) || 1;
  const d = (n * lambda) / (2 * Math.sin(th));
  const sinArg = (n * lambda) / (2 * parseFloat(dIn));
  const twoThetaFromD = sinArg > 0 && sinArg <= 1 ? 2 * Math.asin(sinArg) * (180 / Math.PI) : NaN;
  const bObs = parseFloat(fwhm), bInst = parseFloat(inst) || 0;
  const beta = Math.sqrt(Math.max(bObs * bObs - bInst * bInst, 0)) * (Math.PI / 180);
  const sizeNm = (parseFloat(k) * lambda) / (beta * Math.cos(th)) / 10;

  return (
    <div className="tl-panel">
      <div className="tl-grid">
        <Field label="X-ray anode">
          <select className="tl-input" value={anode} onChange={(e) => setAnode(e.target.value)}>
            {ANODES.map((x) => <option key={x.id} value={x.id}>{x.id}</option>)}
            <option value="custom">Custom wavelength</option>
          </select>
        </Field>
        {anode === 'custom' ? (
          <Field label="Wavelength λ (Å)"><Num value={custom} onChange={setCustom} /></Field>
        ) : (
          <Field label="Emission line">
            <select className="tl-input" value={line} onChange={(e) => setLine(e.target.value as typeof line)}>
              <option value="ka1">Kα1</option><option value="ka">Kα (weighted average)</option>
              <option value="ka2">Kα2</option><option value="kb">Kβ</option>
            </select>
          </Field>
        )}
        <Field label="Diffraction order n"><Num value={order} onChange={setOrder} step="1" min={1} /></Field>
      </div>
      <p className="tl-hint">λ = {fmt(lambda, 5)} Å</p>

      <h3 className="ar-h3 tl-sub">2θ → d-spacing</h3>
      <div className="tl-grid">
        <Field label="Peak position 2θ (degrees)"><Num value={twoTheta} onChange={setTwoTheta} /></Field>
        <div className="tl-result"><p className="tl-big">d = {fmt(d, 4)} Å</p></div>
      </div>

      <h3 className="ar-h3 tl-sub">d-spacing → 2θ</h3>
      <div className="tl-grid">
        <Field label="d-spacing (Å)"><Num value={dIn} onChange={setDIn} /></Field>
        <div className="tl-result"><p className="tl-big">2θ = {Number.isFinite(twoThetaFromD) ? `${fmt(twoThetaFromD, 3)}°` : 'no reflection at this λ'}</p></div>
      </div>

      <h3 className="ar-h3 tl-sub">Scherrer crystallite size (uses the 2θ above)</h3>
      <div className="tl-grid">
        <Field label="Peak FWHM (° 2θ)"><Num value={fwhm} onChange={setFwhm} /></Field>
        <Field label="Instrumental broadening (° 2θ)" hint="Measured on a standard, e.g. LaB6 or Si; 0 to ignore"><Num value={inst} onChange={setInst} /></Field>
        <Field label="Shape factor K"><Num value={k} onChange={setK} /></Field>
      </div>
      <div className="tl-result" role="status" aria-live="polite">
        <p className="tl-big">Crystallite size ≈ {beta > 0 ? `${fmt(sizeNm, 1)} nm` : 'FWHM must exceed instrumental broadening'}</p>
        <p className="tl-hint">Instrumental broadening removed in quadrature: β = √(β_obs² − β_inst²).</p>
      </div>
    </div>
  );
}

/* ---------------- Corrosion rate (ASTM G1 weight loss) ---------------- */
// Density presets as published on the cited calculator page (g/cm³); any alloy can be entered directly.
const DENSITIES = [
  { name: 'Stainless steel 304', d: 8.0 },
  { name: 'Stainless steel 316', d: 8.0 },
  { name: 'Aluminum 6061', d: 2.7 },
  { name: 'Copper', d: 8.96 },
  { name: 'Brass', d: 8.47 },
  { name: 'Titanium Grade 2', d: 4.51 },
  { name: 'Hastelloy C-276', d: 8.9 },
];

export function CorrosionRateCalculator() {
  const [w, setW] = useState('0.25');
  const [wUnit, setWUnit] = useState<'g' | 'mg'>('g');
  const [area, setArea] = useState('20');
  const [aUnit, setAUnit] = useState<'cm2' | 'in2'>('cm2');
  const [time, setTime] = useState('720');
  const [tUnit, setTUnit] = useState<'h' | 'd'>('h');
  const [dens, setDens] = useState('8.0');

  const r = useMemo(() => {
    const W = parseFloat(w) / (wUnit === 'mg' ? 1000 : 1);
    const A = parseFloat(area) * (aUnit === 'in2' ? 6.4516 : 1);
    const T = parseFloat(time) * (tUnit === 'd' ? 24 : 1);
    const D = parseFloat(dens);
    const mmy = (K_MM_PER_Y * W) / (A * T * D);
    return { mmy, umy: mmy * 1000, mpy: mmy / MM_PER_MIL };
  }, [w, wUnit, area, aUnit, time, tUnit, dens]);

  return (
    <div className="tl-panel">
      <div className="tl-grid">
        <Field label="Mass loss W">
          <div className="tl-pair"><Num value={w} onChange={setW} />
            <select className="tl-input" value={wUnit} onChange={(e) => setWUnit(e.target.value as 'g' | 'mg')}><option value="g">g</option><option value="mg">mg</option></select></div>
        </Field>
        <Field label="Exposed area A">
          <div className="tl-pair"><Num value={area} onChange={setArea} />
            <select className="tl-input" value={aUnit} onChange={(e) => setAUnit(e.target.value as 'cm2' | 'in2')}><option value="cm2">cm²</option><option value="in2">in²</option></select></div>
        </Field>
        <Field label="Exposure time T">
          <div className="tl-pair"><Num value={time} onChange={setTime} />
            <select className="tl-input" value={tUnit} onChange={(e) => setTUnit(e.target.value as 'h' | 'd')}><option value="h">hours</option><option value="d">days</option></select></div>
        </Field>
        <Field label="Density D (g/cm³)">
          <div className="tl-pair"><Num value={dens} onChange={setDens} />
            <select className="tl-input" value="" onChange={(e) => e.target.value && setDens(e.target.value)} aria-label="Density presets">
              <option value="">Presets</option>
              {DENSITIES.map((x) => <option key={x.name} value={String(x.d)}>{x.name} ({x.d})</option>)}
            </select></div>
        </Field>
      </div>
      <div className="tl-result" role="status" aria-live="polite">
        <p className="tl-big">{fmt(r.mmy, 4)} mm/y · {fmt(r.mpy, 2)} mpy</p>
        <p>{fmt(r.umy, 1)} µm/y. Formula: CR = 8.76×10⁴ · W / (A · T · D), W in g, A in cm², T in h, D in g/cm³.</p>
      </div>
    </div>
  );
}

/* ---------------- AI automation savings (C2F) ---------------- */
export function AutomationSavingsCalculator() {
  const [hours, setHours] = useState('10');
  const [people, setPeople] = useState('2');
  const [rate, setRate] = useState('30');
  const [share, setShare] = useState('60');
  const [cost, setCost] = useState('3000');
  const weeks = 52;
  const hoursSaved = parseFloat(hours) * parseFloat(people) * (parseFloat(share) / 100) * weeks;
  const savings = hoursSaved * parseFloat(rate);
  const payback = parseFloat(cost) > 0 && savings > 0 ? parseFloat(cost) / (savings / 12) : NaN;

  return (
    <div className="tl-panel">
      <div className="tl-grid">
        <Field label="Hours per week on the task, per person"><Num value={hours} onChange={setHours} /></Field>
        <Field label="People doing it"><Num value={people} onChange={setPeople} step="1" /></Field>
        <Field label="Hourly cost per person (USD)" hint="Wage plus overheads"><Num value={rate} onChange={setRate} /></Field>
        <Field label="Share of the task automation can take over (%)"><Num value={share} onChange={setShare} /></Field>
        <Field label="Expected project cost (USD)" hint="Optional: for payback time"><Num value={cost} onChange={setCost} /></Field>
      </div>
      <div className="tl-result" role="status" aria-live="polite">
        <p className="tl-big">${fmt(savings, 0)} saved per year</p>
        <p>{fmt(hoursSaved, 0)} hours freed per year (52 weeks).{Number.isFinite(payback) ? ` Payback in about ${fmt(payback, 1)} months.` : ''}</p>
      </div>
    </div>
  );
}

export const CALCULATORS: Record<string, ComponentType> = {
  'galvanic-corrosion-calculator': GalvanicCalculator,
  'xrd-bragg-scherrer-calculator': XrdCalculator,
  'corrosion-rate-calculator': CorrosionRateCalculator,
  'ai-automation-savings-calculator': AutomationSavingsCalculator,
};
