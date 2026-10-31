/* ============================================================================
   Scroll flight — a code-rendered take on the scroll-world technique
   (.claude/skills/scroll-world). Scroll drives a camera that dives continuously,
   with no cuts, through five nested scenes:

     0  the "Ar" element tile
     1  → the metal's grain structure (as seen under an SEM)
     2  → one grain's atomic lattice, whose bonds become a graph
     3  → a neural network built from that graph
     4  → the ventures, inside the network's output node

   Like the skill's scrub engine, scroll only drives time: progress is smoothed
   with rAF, each scene's copy is pinned while the camera dwells there, and a
   route rail lets people jump. Instead of AI video clips, every frame is drawn
   on a canvas, so seams are exact by construction and nothing heavy loads.
   Framework-agnostic: mount it on any element that has the expected markup.
   ========================================================================== */

type Vec = [number, number];
type Theme = {
  bg: string; surface: string; line: string; ink: string; ink2: string; ink3: string;
  research: string; venture: string;
};
export type FlightOptions = {
  /** Venture tiles drawn in the last scene. */
  ventures: { symbol: string; short: string }[];
};
export type FlightApi = { goTo: (index: number) => void; destroy: () => void };

const F = 16;                                  // zoom factor between nested scenes
const BANDS = [1, 1, 1, 1, 0.75];              // scroll length per scene, in viewport heights
const BAND_TOTAL = BANDS.reduce((a, b) => a + b, 0);
const LAST = BANDS.length - 1;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
const dive = (u: number) => Math.pow(clamp(u), 2.3);   // dwell first, then dive

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return `rgb(${x.map((c, i) => Math.round(c + (y[i] - c) * t)).join(',')})`;
}

/* ---------- Scene geometry (built once, deterministic) ---------- */

// Polycrystal: jittered-grid Voronoi cells, kept as polygons so they stay crisp at any zoom.
function buildGrains() {
  const r = rng(18);
  const R = 3.4, step = 0.42;
  const seeds: Vec[] = [];
  for (let x = -R; x <= R + 1e-6; x += step)
    for (let y = -R; y <= R + 1e-6; y += step)
      seeds.push([x + (r() - 0.5) * step * 0.9, y + (r() - 0.5) * step * 0.9]);

  const clip = (poly: Vec[], m: Vec, n: Vec) => {
    const out: Vec[] = [];
    const side = (p: Vec) => (p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const sa = side(a), sb = side(b);
      if (sa <= 0) out.push(a);
      if (sa * sb < 0) {
        const t = sa / (sa - sb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  };

  return seeds.map((s, i) => {
    let poly: Vec[] = [[-R - 1, -R - 1], [R + 1, -R - 1], [R + 1, R + 1], [-R - 1, R + 1]];
    for (let j = 0; j < seeds.length; j++) {
      if (j === i) continue;
      const o = seeds[j];
      const dx = o[0] - s[0], dy = o[1] - s[1];
      if (dx * dx + dy * dy > step * step * 9) continue;
      poly = clip(poly, [(s[0] + o[0]) / 2, (s[1] + o[1]) / 2], [dx, dy]);
    }
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
    const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    return { poly, c: [cx, cy] as Vec, tone: r(), dots: r() < 0.3 ? Math.floor(r() * 3) + 1 : 0, dr: r() };
  });
}

function buildNetwork() {
  const r = rng(39);
  const xs = [-1.05, -0.35, 0.35, 1.05];
  const counts = [4, 6, 6, 3];
  const gap = 0.27;
  const nodes = xs.map((x, li) => Array.from({ length: counts[li] }, (_, i) => [x, (i - (counts[li] - 1) / 2) * gap] as Vec));
  const edges: { a: Vec; b: Vec; w: number; phase: number }[] = [];
  for (let l = 0; l < nodes.length - 1; l++)
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push({ a, b, w: r(), phase: r() });
  return { nodes, edges };
}

/* ---------- Engine ---------- */

export function mountScrollFlight(root: HTMLElement, opts: FlightOptions): FlightApi {
  const track = root.querySelector<HTMLElement>('[data-fl-track]')!;
  const stage = root.querySelector<HTMLElement>('[data-fl-stage]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-fl-panel]'));
  const rail = Array.from(root.querySelectorAll<HTMLElement>('[data-fl-rail]'));
  const hint = root.querySelector<HTMLElement>('[data-fl-hint]');
  const ctx = canvas.getContext('2d')!;

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const grains = buildGrains();
  const net = buildNetwork();

  // Where each scene's camera ends up: the next scene lives inside this point.
  const target = grains.reduce((best, g) => (Math.hypot(g.c[0] - 0.12, g.c[1] + 0.05) < Math.hypot(best.c[0] - 0.12, best.c[1] + 0.05) ? g : best));
  const LAT = 0.22;
  const T: Vec[] = [
    [0.36, 0.34],               // inside the tile body, below the symbol
    target.c,                   // centre of one grain
    [LAT * 0.5, LAT * 0.5],     // a body-centred atom
    net.nodes[3][1],            // the middle output neuron
  ];

  let theme: Theme;
  const readTheme = () => {
    const cs = getComputedStyle(root);
    const v = (n: string, f: string) => (cs.getPropertyValue(n).trim() || f);
    theme = {
      bg: v('--ar-bg', '#12161c'), surface: v('--ar-surface', '#1a2029'), line: v('--ar-line', '#2c3542'),
      ink: v('--ar-ink', '#e6e9ec'), ink2: v('--ar-ink-2', '#a3adb8'), ink3: v('--ar-ink-3', '#7b8692'),
      research: v('--ar-research', '#5cc2b0'), venture: v('--ar-venture', '#d08a55'),
    };
  };
  readTheme();

  let W = 0, H = 0, dpr = 1, base = 1, center: Vec = [0, 0], lastW = 0;
  const layout = () => {
    const rect = stage.getBoundingClientRect();
    // On phones, ignore height-only changes (URL bar showing/hiding) so the page never jumps.
    if (coarse && lastW && Math.abs(rect.width - lastW) < 1 && W) return;
    lastW = rect.width;
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const wide = W >= 900;
    center = wide ? [W * 0.64, H * 0.5] : [W / 2, H * 0.3];
    base = wide ? Math.min(W * 0.27, H * 0.4) : Math.min(W * 0.42, H * 0.24);
    track.style.height = `${Math.round(H * (BAND_TOTAL + 1))}px`;
    dirty = true;
  };

  /* ----- drawing helpers ----- */
  const fontStretch = (v: string) => { try { (ctx as any).fontStretch = v; } catch { /* older browsers */ } };

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** Element tile: fill, optional texture (clipped to the tile), text, then border. */
  function drawTile(cx: number, cy: number, size: number, color: string, symbol: string, tl: string, tr: string, name: string, textAlpha: number, texture?: () => void) {
    const half = size / 2;
    const r = size * 0.06;
    roundRect(cx - half, cy - half, size, size, r);
    ctx.fillStyle = theme.surface;
    ctx.fill();
    if (texture) {
      ctx.save();
      roundRect(cx - half, cy - half, size, size, r);
      ctx.clip();
      texture();
      ctx.restore();
    }
    if (textAlpha > 0.01 && size < 6000) {
      ctx.save();
      ctx.globalAlpha *= textAlpha;
      ctx.textBaseline = 'alphabetic';
      if (tl || tr) {
        ctx.fillStyle = theme.ink2;
        ctx.font = `500 ${size * 0.075}px "IBM Plex Mono", ui-monospace, monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(tl, cx - half + size * 0.08, cy - half + size * 0.15);
        ctx.textAlign = 'right';
        ctx.fillText(tr, cx + half - size * 0.08, cy - half + size * 0.15);
      }
      fontStretch('expanded');
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.font = `800 ${size * 0.42}px Archivo, system-ui, sans-serif`;
      ctx.fillText(symbol, cx, cy + size * 0.12);
      fontStretch('normal');
      if (name) {
        ctx.fillStyle = theme.ink;
        ctx.font = `600 ${size * 0.08}px Archivo, system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(name, cx - half + size * 0.08, cy + half - size * 0.09);
      }
      ctx.restore();
    }
    roundRect(cx - half, cy - half, size, size, r);
    ctx.lineWidth = Math.max(1.5, Math.min(size * 0.012, 8));
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  // Scene renderers take the screen position of their origin (o) and pixels per world unit (k).
  function drawTileScene(o: Vec, k: number, s: number, grainAlpha: number, inner: () => void) {
    const textAlpha = 1 - smooth((s - 1.5) / 2.5);
    // The grain structure is already there, faintly, in the tile's surface.
    drawTile(o[0], o[1], 1.5 * k, theme.research, 'Ar', '18', '39.948', 'Abdul Rahman', textAlpha, () => {
      ctx.globalAlpha = grainAlpha;
      inner();
    });
  }

  function drawGrains(o: Vec, k: number) {
    const pad = 4;
    const lw = Math.max(0.6, Math.min(0.012 * k, 5));
    for (const g of grains) {
      const sx = o[0] + g.c[0] * k, sy = o[1] + g.c[1] * k;
      const rad = 0.5 * k;
      if (sx + rad < -pad || sx - rad > W + pad || sy + rad < -pad || sy - rad > H + pad) continue;
      ctx.beginPath();
      g.poly.forEach((p, i) => (i ? ctx.lineTo(o[0] + p[0] * k, o[1] + p[1] * k) : ctx.moveTo(o[0] + p[0] * k, o[1] + p[1] * k)));
      ctx.closePath();
      ctx.fillStyle = mix(theme.surface, theme.ink, 0.03 + g.tone * 0.13);
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.strokeStyle = theme.bg;
      ctx.stroke();
      if (g.dots) {
        ctx.fillStyle = mix(theme.surface, theme.research, 0.55);
        for (let d = 0; d < g.dots; d++) {
          const a = g.dr * 6.28 + d * 2.1;
          ctx.beginPath();
          ctx.arc(sx + Math.cos(a) * 0.07 * k, sy + Math.sin(a) * 0.07 * k, Math.max(0.6, 0.012 * k), 0, 6.283);
          ctx.fill();
        }
      }
    }
  }

  function drawLattice(o: Vec, k: number, bonds: number) {
    const a = LAT;
    const x0 = Math.floor((-o[0]) / k / a) - 1, x1 = Math.ceil((W - o[0]) / k / a) + 1;
    const y0 = Math.floor((-o[1]) / k / a) - 1, y1 = Math.ceil((H - o[1]) / k / a) + 1;
    if ((x1 - x0) * (y1 - y0) > 9000) return;
    const r = Math.max(1.2, 0.028 * k);
    const hash = (i: number, j: number) => ((i * 73856093) ^ (j * 19349663)) >>> 0;

    if (bonds > 0.01) {
      ctx.lineWidth = Math.max(0.8, 0.008 * k);
      ctx.strokeStyle = theme.research;
      ctx.globalAlpha *= 0.4;
      ctx.beginPath();
      for (let i = x0; i <= x1; i++)
        for (let j = y0; j <= y1; j++) {
          const cx = o[0] + (i + 0.5) * a * k, cy = o[1] + (j + 0.5) * a * k;
          for (const [di, dj] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            const ex = o[0] + (i + di) * a * k, ey = o[1] + (j + dj) * a * k;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + (ex - cx) * bonds, cy + (ey - cy) * bonds);
          }
        }
      ctx.stroke();
      ctx.globalAlpha /= 0.4;
    }
    for (let i = x0; i <= x1; i++)
      for (let j = y0; j <= y1; j++) {
        for (const c of [0, 1]) {
          const x = o[0] + (i + c * 0.5) * a * k, y = o[1] + (j + c * 0.5) * a * k;
          const lit = c === 1 && hash(i, j) % 5 === 0;
          ctx.beginPath();
          ctx.arc(x, y, c ? r * 0.85 : r, 0, 6.283);
          // Corner atoms recede; body-centred atoms carry the accent and "light up" as bonds form.
          ctx.fillStyle = c === 0
            ? mix(theme.bg, theme.ink, 0.22)
            : lit ? theme.research : mix(theme.bg, theme.research, 0.35 + 0.35 * bonds);
          ctx.fill();
        }
      }
  }

  function drawNetwork(o: Vec, k: number, flow: number) {
    const P = (p: Vec): Vec => [o[0] + p[0] * k, o[1] + p[1] * k];
    ctx.lineWidth = Math.max(0.7, 0.006 * k);
    for (const e of net.edges) {
      const a = P(e.a), b = P(e.b);
      ctx.strokeStyle = theme.research;
      ctx.globalAlpha *= 0.12 + e.w * 0.38;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.globalAlpha /= 0.12 + e.w * 0.38;
      if (e.w > 0.55) {
        // Signal pulses travel with scroll, not with the clock.
        const t = (flow * 2 + e.phase) % 1;
        ctx.fillStyle = theme.research;
        ctx.beginPath();
        ctx.arc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.max(1.2, 0.012 * k), 0, 6.283);
        ctx.fill();
      }
    }
    net.nodes.forEach((layer, li) =>
      layer.forEach((n, i) => {
        const p = P(n);
        const out = li === 3 && i === 1;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 0.06 * k, 0, 6.283);
        ctx.fillStyle = out ? theme.surface : theme.bg;
        ctx.fill();
        ctx.lineWidth = Math.max(1.2, 0.01 * k);
        ctx.strokeStyle = out ? theme.venture : theme.research;
        ctx.stroke();
      }),
    );
  }

  function drawVentures(o: Vec, k: number) {
    ctx.beginPath();
    ctx.arc(o[0], o[1], 0.96 * k, 0, 6.283);
    ctx.fillStyle = theme.surface;
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, 0.01 * k);
    ctx.strokeStyle = theme.venture;
    ctx.globalAlpha *= 0.6;
    ctx.stroke();
    ctx.globalAlpha /= 0.6;
    const n = opts.ventures.length;
    const size = 0.44 * k, gap = 0.52 * k;
    opts.ventures.forEach((v, i) => {
      const x = o[0] + (i - (n - 1) / 2) * gap;
      drawTile(x, o[1], size, theme.venture, v.symbol, '', '', v.short, 1);
    });
  }

  function drawScene(i: number, o: Vec, k: number, s: number, u: number) {
    if (i === 1) drawGrains(o, k);
    else if (i === 2) drawLattice(o, k, smooth((u - 0.08) / 0.45));
    else if (i === 3) drawNetwork(o, k, u);
    else if (i === 4) drawVentures(o, k);
    else drawTileScene(o, k, s, 0, () => {});
  }

  /* ----- frame ----- */
  function render(B: number) {
    const i = Math.min(LAST, Math.floor(B));
    const u = i === LAST ? clamp((B - LAST) / BANDS[LAST]) : B - i;
    const reduce = reduceMQ.matches;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    if (i === LAST) {
      const s = reduce ? 1 : 1 + 0.06 * smooth(u);
      drawVentures(center, base * s);
      return;
    }

    const g = reduce ? 0 : dive(u);
    const s = Math.pow(F, g);
    const h = (s - 1) / (F - 1);
    const C: Vec = [T[i][0] * h, T[i][1] * h];
    const o: Vec = [center[0] - C[0] * s * base, center[1] - C[1] * s * base];
    const k = s * base;
    const nextO: Vec = [o[0] + T[i][0] * k, o[1] + T[i][1] * k];
    const nextK = k / F;
    const n = s / F;

    if (i === 0) {
      const grainAlpha = 0.16 + 0.84 * smooth((n - 0.12) / 0.6);
      drawTileScene(o, k, s, grainAlpha, () => drawGrains(nextO, nextK));
      return;
    }

    const curA = 1 - smooth((n - 0.45) / 0.4);
    const nextA = smooth((n - 0.3) / 0.45);
    if (curA > 0.01) {
      ctx.globalAlpha = curA;
      drawScene(i, o, k, s, u);
    }
    if (nextA > 0.01) {
      ctx.globalAlpha = nextA;
      drawScene(i + 1, nextO, nextK, n, 0);
    }
    ctx.globalAlpha = 1;
  }

  /* ----- copy panels, rail, hint ----- */
  function panelOpacity(idx: number, B: number) {
    if (reduceMQ.matches) return idx === Math.min(LAST, Math.floor(B + 0.4)) ? 1 : 0;
    if (idx === 0) return 1 - smooth((B - 0.42) / 0.12);
    if (idx === LAST) return smooth((B - (LAST - 0.15)) / 0.12);
    return smooth((B - (idx - 0.15)) / 0.12) * (1 - smooth((B - (idx + 0.42)) / 0.12));
  }

  function updateChrome(B: number) {
    let best = 0, bestOp = -1;
    panels.forEach((p, idx) => {
      const op = panelOpacity(idx, B);
      p.style.opacity = op.toFixed(3);
      p.style.visibility = op < 0.02 ? 'hidden' : 'visible';
      p.style.transform = reduceMQ.matches ? '' : `translateY(${((1 - op) * 10).toFixed(1)}px)`;
      if (op > bestOp) { bestOp = op; best = idx; }
    });
    rail.forEach((r, idx) => (idx === best ? r.setAttribute('aria-current', 'step') : r.removeAttribute('aria-current')));
    if (hint) hint.style.opacity = (1 - smooth(B / 0.15)).toFixed(3);
  }

  /* ----- scroll → time ----- */
  let cur = 0, goal = 0, raf = 0, dirty = true;
  const progress = () => {
    const rect = track.getBoundingClientRect();
    const span = rect.height - H;
    return span > 0 ? clamp(-rect.top / span) : 0;
  };
  const toBands = (p: number) => {
    let t = p * BAND_TOTAL;
    for (let i = 0; i < BANDS.length; i++) {
      if (t <= BANDS[i] || i === LAST) return i + (i === LAST ? t : t / BANDS[i]);
      t -= BANDS[i];
    }
    return LAST;
  };
  const fromBands = (B: number) => {
    let t = 0;
    for (let i = 0; i < Math.floor(B) && i < LAST; i++) t += BANDS[i];
    const frac = B - Math.floor(B);
    t += Math.floor(B) >= LAST ? frac : frac * BANDS[Math.floor(B)];
    return t / BAND_TOTAL;
  };

  const tick = () => {
    raf = 0;
    goal = toBands(progress());
    const lerp = reduceMQ.matches ? 1 : 0.14;
    const next = cur + (goal - cur) * lerp;
    const moving = Math.abs(goal - next) > 1e-4;
    if (moving || dirty || next !== cur) {
      cur = moving ? next : goal;
      render(cur);
      updateChrome(cur);
      dirty = false;
    }
    if (moving) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const onResize = () => { layout(); kick(); };
  const onTheme = () => { readTheme(); dirty = true; kick(); };
  // Keyboard users tabbing into a pinned panel are scrolled to that scene.
  const onFocus = (e: FocusEvent) => {
    const panel = (e.target as HTMLElement).closest('[data-fl-panel]');
    if (panel) goTo(panels.indexOf(panel as HTMLElement));
  };

  function goTo(index: number) {
    const B = index === 0 ? 0 : index === LAST ? LAST + BANDS[LAST] * 0.6 : index + 0.14;
    const rect = track.getBoundingClientRect();
    const top = window.scrollY + rect.top + fromBands(B) * (rect.height - H);
    window.scrollTo({ top, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
  }

  root.setAttribute('data-ready', '');
  layout();
  const ro = new ResizeObserver(onResize);
  ro.observe(stage);
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('theme-change', onTheme);
  root.addEventListener('focusin', onFocus);
  reduceMQ.addEventListener?.('change', onTheme);
  document.fonts?.ready.then(() => { dirty = true; kick(); });
  cur = goal = toBands(progress());
  dirty = true;
  kick();

  return {
    goTo,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeAttribute('data-ready');
      track.style.height = '';
      window.removeEventListener('scroll', kick);
      window.removeEventListener('theme-change', onTheme);
      root.removeEventListener('focusin', onFocus);
      reduceMQ.removeEventListener?.('change', onTheme);
    },
  };
}
