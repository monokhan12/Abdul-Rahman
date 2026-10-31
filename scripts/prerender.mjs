// Post-build step: gives every public route real HTML (title, description, canonical,
// JSON-LD and readable content) so search engines and AI answer engines can index it
// without running JavaScript. Run after `vite build`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const content = JSON.parse(readFileSync(join(root, 'src/site/content.json'), 'utf8'));
// The custom domain is the canonical home for every page, whatever host the build runs for.
const SITE_URL = content.site.url.replace(/\/$/, '');
const posts = JSON.parse(readFileSync(join(root, 'src/content/posts.json'), 'utf8'));
const aliases = { 'materials-informatics-accelerating-alloy-design': 'alloy-optimization-ml', 'direct-recycling-nmc-cathode-materials': 'direct-cathode-recycling' };
// GitHub Pages serves /x as /x/ (a redirect), so canonical page URLs end in a slash.
const abs = (p) => `${SITE_URL}${p === '/' || /\.[a-z]+$/.test(p) || p.endsWith('/') ? p : `${p}/`}`;
// Path prefix the site is served under (e.g. "/abdul-rahman" on GitHub Pages), for in-page links.
const BASE = (process.env.BASE_PATH ?? '/').replace(/\/$/, '');
const link = (p) => { const [path, hash] = p.split('#'); const slashed = path === '/' || path === '' || /\.[a-z]+$/.test(path) || path.endsWith('/') ? path : `${path}/`; return `${BASE}${slashed}${hash ? `#${hash}` : ''}`; };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = (v) => (v.short === v.name ? v.name : `${v.name} (${v.short})`);

// Keep in step with src/data.ts and personSchema() in src/site/seo.ts.
const PERSON_ID = `${SITE_URL}/#person`;
const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Abdul Rahman',
  url: abs('/'),
  jobTitle: ['AI-Driven Materials Engineer', 'Research Engineer & Senior Instructor', 'Entrepreneur'],
  description:
    'AI-driven materials engineer and entrepreneur based in Lahore, Pakistan, who consults remotely for companies in the United States on metallurgical failure analysis, materials characterization and materials informatics, and founder of Connected 2 Future (C2F), EduCon and Jobs4DAE.',
  email: 'mailto:abdulrahmana18@pm.me',
  address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressRegion: 'Punjab', addressCountry: 'PK' },
  worksFor: [
    { '@type': 'Organization', name: 'Pakistan Council of Scientific and Industrial Research (PCSIR)' },
    ...content.ventures.map((v) => ({ '@id': `${abs(`/ventures/${v.slug}`)}#org` })),
  ],
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Engineering and Technology (UET), Lahore' },
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', name: 'Master of Science in Metallurgical and Materials Engineering' },
    { '@type': 'EducationalOccupationalCredential', name: 'Bachelor of Science in Metallurgical and Materials Engineering' },
  ],
  knowsAbout: [
    'Physical Metallurgy', 'Extractive Metallurgy', 'Materials Informatics', 'Machine Learning for Materials',
    'CALPHAD Modeling', 'SEM/EDS Analysis', 'X-ray Diffraction (XRD)', 'X-ray Fluorescence (XRF)',
    'Corrosion and Protective Coatings', 'Lithium-ion Battery Recycling', 'AI Automation', 'Technical Education',
  ],
  sameAs: ['https://github.com/ARahmankhn', 'https://linkedin.com/in/arahmankhn'],
};
const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: abs('/'),
  name: 'Abdul Rahman',
  publisher: { '@id': PERSON_ID },
  inLanguage: 'en-US',
};
const org = (v) => {
  const page = abs(`/ventures/${v.slug}`);
  return {
    '@type': 'Organization',
    '@id': `${page}#org`,
    name: v.name,
    ...(v.short !== v.name ? { alternateName: v.short } : {}),
    url: v.url || page,
    description: v.answer,
    founder: { '@id': PERSON_ID },
    ...(v.since ? { foundingDate: v.since } : {}),
    knowsAbout: v.offers,
  };
};
const service = {
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#consulting`,
  name: 'Abdul Rahman Materials Engineering Consulting',
  url: abs('/'),
  description: content.site.defaultDescription,
  provider: { '@id': PERSON_ID },
  founder: { '@id': PERSON_ID },
  areaServed: [{ '@type': 'Country', name: 'United States' }, { '@type': 'Place', name: 'Worldwide' }],
  availableLanguage: 'English',
  address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Consulting services',
    itemListElement: content.services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.body, areaServed: 'United States' },
    })),
  },
};
const faq = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
const crumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
});
const ld = (graph) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

const seoBlock = ({ title, description, path }) => `<!--SEO:START-->
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${abs(path)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${abs(path)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <!--SEO:END-->`;

const navHtml = `<header><p><strong><a href="${link('/')}">Abdul Rahman</a></strong>, AI-driven materials engineer and entrepreneur</p>
        <nav aria-label="Main"><a href="${link('/')}">Home</a> | <a href="${link('/services')}">Services</a> | <a href="${link('/ventures')}">Entrepreneur</a> (${content.ventures
          .map((v) => `<a href="${link(`/ventures/${v.slug}`)}">${esc(v.short)}</a>`)
          .join(', ')}) | <a href="${link('/blog')}">Blog</a> | <a href="${link('/contact')}">Book a consultation</a></nav></header>`;
const faqHtml = (items) => items.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join('\n');

const servicesHtml = `<h2 id="services">Materials engineering consulting for US companies</h2>
<p>Abdul Rahman works remotely with engineering, manufacturing and R&amp;D teams in the United States and worldwide.</p>
${content.services.map((s) => `<h3>${esc(s.title)}</h3>\n<p>${esc(s.body)}</p>`).join('\n')}`;
const homeFaqHtml = `<h2 id="faq">Questions people ask</h2>\n${faqHtml(content.faq)}`;

const template = readFileSync(join(dist, 'index.html'), 'utf8')
  .replace('<!--SSR:SERVICES-->', servicesHtml)
  .replace('<!--SSR:FAQ-->', homeFaqHtml);

function render(html, { seo, graph, body }) {
  let out = html;
  if (seo) out = out.replace(/<!--SEO:START-->[\s\S]*?<!--SEO:END-->/, seoBlock(seo));
  out = out.replace(/(<script type="application\/ld\+json" id="ld-home">)[\s\S]*?(<\/script>)/, `$1${ld(graph)}$2`);
  if (body) out = out.replace(/<!--SSR:START-->[\s\S]*?<!--SSR:END-->/, `<!--SSR:START--><div class="prerender">${navHtml}<main>${body}</main></div><!--SSR:END-->`);
  return out.replaceAll('__SITE_URL__', SITE_URL);
}

function write(route, html) {
  const file = route === '/' ? join(dist, 'index.html') : join(dist, route, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Home
const homeHtml = render(template, {
  seo: { title: content.site.defaultTitle, description: content.site.defaultDescription, path: '/' },
  graph: [person, website, service, ...content.ventures.map(org), faq(content.faq)],
});
write('/', homeHtml);

// SPA fallback for routes without their own HTML (blog posts, contact, admin).
// Drop the home canonical so those pages are not folded into the homepage.
writeFileSync(
  join(dist, '404.html'),
  homeHtml.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, ''),
);

// Ventures index
write(
  '/ventures',
  render(template, {
    seo: {
      title: 'Ventures by Abdul Rahman | C2F, EduCon and Jobs4DAE',
      description:
        'Companies founded by Abdul Rahman: Connected 2 Future (C2F) for AI automation, EduCon for education guidance, and Jobs4DAE for DAE jobs in Pakistan.',
      path: '/ventures',
    },
    graph: [person, ...content.ventures.map(org), crumbs([{ name: 'Home', path: '/' }, { name: 'Ventures', path: '/ventures' }])],
    body: `<h1>Ventures</h1>
<p>Abdul Rahman is the founder of three ventures: Connected 2 Future (C2F), EduCon and Jobs4DAE.</p>
<ul>${content.ventures
      .map((v) => `<li><a href="${link(`/ventures/${v.slug}`)}"><strong>${esc(label(v))}</strong></a>: ${esc(v.tagline)}</li>`)
      .join('')}</ul>`,
  }),
);

// One page per venture
for (const v of content.ventures) {
  const path = `/ventures/${v.slug}`;
  write(
    path,
    render(template, {
      seo: { title: v.title, description: v.description, path },
      graph: [
        person,
        org(v),
        faq(v.faq),
        crumbs([
          { name: 'Home', path: '/' },
          { name: 'Ventures', path: '/ventures' },
          { name: label(v), path },
        ]),
      ],
      body: `<h1>${esc(label(v))}</h1>
<p>${esc(v.role)}${v.since ? ` since ${esc(v.since)}` : ''}: Abdul Rahman</p>
<p>${esc(v.answer)}</p>
<h2>What ${esc(v.short)} offers</h2>
<ul>${v.offers.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
<h2>About ${esc(v.short)}</h2>
${faqHtml(v.faq)}
${v.url ? `<p><a href="${esc(v.url)}">Visit ${esc(v.short)}</a></p>` : ''}
<p><a href="${link('/contact')}">Talk to Abdul Rahman about ${esc(v.short)}</a></p>`,
    }),
  );
}

// ---------- Services ----------
const serviceLd = (sv) => {
  const url = abs(`/services/${sv.slug}`);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: sv.title,
    serviceType: sv.title,
    description: sv.answer,
    url,
    provider: { '@id': PERSON_ID },
    areaServed: [{ '@type': 'Country', name: 'United States' }, { '@type': 'Place', name: 'Worldwide' }],
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: abs('/contact'), name: 'Remote video consultation' },
  };
};
const postBySlug = (slug) => posts.find((p) => p.slug === slug);

write(
  '/services',
  render(template, {
    seo: { title: content.servicesIndex.seoTitle, description: content.servicesIndex.description, path: '/services' },
    graph: [person, service, ...content.services.map(serviceLd), crumbs([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])],
    body: `<h1>Materials engineering consulting</h1>
<p>Abdul Rahman consults remotely for engineering, manufacturing and R&amp;D teams in the United States and worldwide. Every engagement starts with a free 30-minute call and a written proposal.</p>
${content.services.map((sv) => `<h2><a href="${link(`/services/${sv.slug}`)}">${esc(sv.title)}</a></h2>\n<p>${esc(sv.body)}</p>`).join('\n')}
<p><a href="${link('/contact')}">Book a consultation</a></p>`,
  }),
);

for (const sv of content.services) {
  const path = `/services/${sv.slug}`;
  const related = sv.related.map(postBySlug).filter(Boolean);
  write(
    path,
    render(template, {
      seo: { title: sv.seoTitle, description: sv.description, path },
      graph: [
        person,
        serviceLd(sv),
        faq(sv.faq),
        crumbs([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: sv.title, path },
        ]),
      ],
      body: `<h1>${esc(sv.title)}</h1>
<p>${esc(sv.answer)}</p>
<h2>What's included</h2>
<ul>${sv.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>Who it's for</h2>
<ul>${sv.bestFor.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>How it works</h2>
<ol>${sv.process.map((st) => `<li><strong>${esc(st.name)}:</strong> ${esc(st.text)}</li>`).join('')}</ol>
<h2>Questions about ${esc(sv.short.toLowerCase())}</h2>
${faqHtml(sv.faq)}
${related.length ? `<h2>Further reading</h2>\n<ul>${related.map((p) => `<li><a href="${link(`/blog/${p.slug}`)}">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}
<p><a href="${link('/contact')}">Book a free consultation</a></p>`,
    }),
  );
}

// ---------- Contact ----------
write(
  '/contact',
  render(template, {
    seo: {
      title: 'Book a Materials Engineering Consultation | Abdul Rahman',
      description:
        'Book a free 30-minute video call with Abdul Rahman about failure analysis, SEM/EDS and XRD interpretation, materials informatics or an AI automation project.',
      path: '/contact',
    },
    graph: [person, { '@type': 'ContactPage', name: 'Contact Abdul Rahman', about: { '@id': PERSON_ID } }, crumbs([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])],
    body: `<h1>Book a consultation</h1>
<p>A free 30-minute video call about failure analysis, SEM/EDS and XRD interpretation, materials informatics, or an AI automation project with C2F. Abdul Rahman works remotely with teams in the United States and worldwide.</p>
<p>Email: <a href="mailto:abdulrahmana18@pm.me">abdulrahmana18@pm.me</a></p>`,
  }),
);

// ---------- Blog ----------
// Minimal Markdown to HTML: enough for crawlers to read headings, lists, links and emphasis.
const inline = (t) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)\*(?!\s)(.+?)\*(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => `<a href="${href.startsWith('/') ? link(href) : href}">${txt}</a>`);
function md(src) {
  const out = [];
  let list = null, para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    let m;
    if (!line || /^(-{3,}|\*{3,})$/.test(line)) { flushPara(); flushList(); continue; }
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { flushPara(); flushList(); const n = Math.min(6, Math.max(2, m[1].length)); out.push(`<h${n}>${inline(m[2])}</h${n}>`); continue; }
    if ((m = line.match(/^[-*+]\s+(.*)$/)) || (m = line.match(/^\d+[.)]\s+(.*)$/))) {
      const tag = /^\d/.test(line) ? 'ol' : 'ul';
      flushPara();
      if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if (line.startsWith('|')) {
      flushPara(); flushList();
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      out.push(`<p>${line.split('|').map((c) => c.trim()).filter(Boolean).map(inline).join(' · ')}</p>`);
      continue;
    }
    if (line.startsWith('>')) { flushPara(); flushList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return out.join('\n');
}
const clip = (t, n = 155) => (t.length > n ? `${t.slice(0, n - 1).replace(/\s\S*$/, '')}…` : t);
const articleLd = (p) => {
  const url = abs(`/blog/${p.slug}`);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: p.title.slice(0, 110),
    description: p.summary,
    url,
    mainEntityOfPage: url,
    articleSection: p.category,
    datePublished: p.createdAt,
    dateModified: p.updatedAt || p.createdAt,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
};
const sortedPosts = [...posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

write(
  '/blog',
  render(template, {
    seo: {
      title: 'Metallurgy & Materials Engineering Blog | Abdul Rahman',
      description:
        'Articles by materials engineer Abdul Rahman on failure analysis, SEM/EDS and XRD, corrosion, battery recycling, critical minerals and materials informatics.',
      path: '/blog',
    },
    graph: [
      person,
      { '@type': 'Blog', '@id': `${SITE_URL}/blog#blog`, name: 'Abdul Rahman — materials engineering blog', url: abs('/blog'), author: { '@id': PERSON_ID }, blogPost: sortedPosts.map((p) => ({ '@id': `${abs(`/blog/${p.slug}`)}#article` })) },
      crumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
    ],
    body: `<h1>Materials engineering blog</h1>
<ul>${sortedPosts.map((p) => `<li><a href="${link(`/blog/${p.slug}`)}"><strong>${esc(p.title)}</strong></a> (${esc(p.date)}): ${esc(p.summary)}</li>`).join('')}</ul>`,
  }),
);

const postHtml = (p, path) =>
  render(template, {
    seo: { title: `${p.title.length > 58 ? clip(p.title, 58) : p.title} | Abdul Rahman`, description: clip(p.summary), path: `/blog/${p.slug}` },
    graph: [
      person,
      articleLd(p),
      crumbs([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: p.title, path: `/blog/${p.slug}` },
      ]),
    ],
    body: `<article><h1>${esc(p.title)}</h1>
<p>By Abdul Rahman · ${esc(p.date)} · ${esc(p.category)}</p>
<p><strong>${esc(p.summary)}</strong></p>
${md(p.content)}
</article>
<p><a href="${link('/services')}">Consulting services</a> | <a href="${link('/contact')}">Book a consultation</a></p>`,
  });
for (const p of posts) write(`/blog/${p.slug}`, postHtml(p));
// Old URLs that still get linked: same article, canonical points at the main slug.
for (const [alias, target] of Object.entries(aliases)) {
  const p = postBySlug(target);
  if (p) write(`/blog/${alias}`, postHtml(p));
}

// ---------- Sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ['/', today, '1.0'],
  ['/services', today, '0.9'],
  ...content.services.map((sv) => [`/services/${sv.slug}`, today, '0.9']),
  ['/blog', today, '0.8'],
  ...sortedPosts.map((p) => [`/blog/${p.slug}`, (p.updatedAt || p.createdAt).slice(0, 10), '0.7']),
  ['/ventures', today, '0.6'],
  ...content.ventures.map((v) => [`/ventures/${v.slug}`, today, '0.6']),
  ['/contact', today, '0.6'],
];
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(([u, d, pr]) => `  <url>\n    <loc>${abs(u)}</loc>\n    <lastmod>${d}</lastmod>\n    <priority>${pr}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
);

// Fill the site URL into the copied public text files (sitemap, robots, llms)
for (const name of readdirSync(dist)) {
  const file = join(dist, name);
  if (statSync(file).isFile() && /\.(xml|txt)$/.test(name)) {
    writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__SITE_URL__', SITE_URL));
  }
}

console.log(`Prerendered ${urls.length + Object.keys(aliases).length} routes for ${SITE_URL}`);
