// Reference data for the free tools. Every value here comes from a published source cited on the tool page.

/** Anodic index (V, relative to gold), per the MIL-STD-889-based table published by Engineers Edge. */
export const ANODIC_INDEX: { name: string; v: number }[] = [
  { name: 'Gold (solid and plated), gold-platinum alloy', v: 0.0 },
  { name: 'Rhodium plated on silver-plated copper', v: 0.05 },
  { name: 'Silver (solid or plated), high nickel-copper alloys', v: 0.15 },
  { name: 'Nickel (solid or plated), titanium and its alloys, Monel', v: 0.3 },
  { name: 'Copper, low brasses/bronzes, silver solder, copper-nickel and nickel-chromium alloys', v: 0.35 },
  { name: 'Brass and bronzes', v: 0.4 },
  { name: 'High brasses and bronzes', v: 0.45 },
  { name: '18% chromium stainless steels (e.g. 300 series)', v: 0.5 },
  { name: 'Chromium plated, tin plated, 12% chromium stainless steels', v: 0.6 },
  { name: 'Tin plate, tin-lead solder', v: 0.65 },
  { name: 'Lead (solid or plated), high lead alloys', v: 0.7 },
  { name: 'Aluminum, wrought 2000 series', v: 0.75 },
  { name: 'Iron (wrought, gray, malleable), plain carbon and low alloy steels', v: 0.85 },
  { name: 'Aluminum, wrought (other than 2000 series), cast silicon-type alloys', v: 0.9 },
  { name: 'Aluminum, cast (non-silicon), cadmium plated, chromate', v: 0.95 },
  { name: 'Hot-dip zinc plate, galvanized steel', v: 1.2 },
  { name: 'Zinc (wrought), zinc die-casting alloys, zinc plated', v: 1.25 },
  { name: 'Magnesium and magnesium alloys', v: 1.75 },
  { name: 'Beryllium', v: 1.85 },
];

/** Maximum anodic-index difference by environment (same source). */
export const GALVANIC_LIMITS = [
  { id: 'harsh', label: 'Harsh: outdoors, high humidity or salt', max: 0.15 },
  { id: 'normal', label: 'Normal: indoors without temperature or humidity control', max: 0.25 },
  { id: 'controlled', label: 'Controlled: temperature and humidity controlled', max: 0.5 },
] as const;

/** Characteristic X-ray wavelengths in Å (UNSW Mark Wainwright Analytical Centre, "Choice of X-ray sources"). */
export const ANODES = [
  { id: 'Cu', ka1: 1.54056, ka2: 1.54439, ka: 1.54184, kb: 1.39222 },
  { id: 'Co', ka1: 1.78897, ka2: 1.79285, ka: 1.79026, kb: 1.62079 },
  { id: 'Fe', ka1: 1.93604, ka2: 1.93998, ka: 1.93736, kb: 1.75661 },
  { id: 'Cr', ka1: 2.2897, ka2: 2.29361, ka: 2.291, kb: 2.08487 },
  { id: 'Mo', ka1: 0.7093, ka2: 0.71359, ka: 0.71073, kb: 0.63229 },
  { id: 'Ag', ka1: 0.55942, ka2: 0.56381, ka: 0.56088, kb: 0.49708 },
] as const;

/**
 * Weight-loss corrosion rate per ASTM G1: CR = K·W / (A·T·D),
 * with W in g, A in cm², T in hours, D in g/cm³ → K = 8.76×10⁴ for mm/y (3.45×10⁶ for mils/y).
 */
export const K_MM_PER_Y = 8.76e4;
export const MM_PER_MIL = 0.0254;
