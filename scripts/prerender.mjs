// Post-build step: gives every public route real HTML (title, description, canonical,
// JSON-LD and readable content) so search engines and AI answer engines can index it
// without running JavaScript. Run after `vite build`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const content = JSON.parse(readFileSync(join(root, 'src/site/content.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL || content.site.url).replace(/\/$/, '');
const abs = (p) => `${SITE_URL}${p}`;
// Path prefix the site is served under (e.g. "/abdul-rahman" on GitHub Pages), for in-page links.
const BASE = (process.env.BASE_PATH ?? new URL(SITE_URL).pathname).replace(/\/$/, '');
const link = (p) => `${BASE}${p}`;

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
    'AI-driven materials engineer and entrepreneur in Lahore, Pakistan, working across physical metallurgy, materials informatics and materials characterization, and founder of Connected 2 Future (C2F), EduCon and Jobs4DAE.',
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
  inLanguage: 'en',
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
        <nav aria-label="Main"><a href="${link('/')}">Home</a> | <a href="${link('/ventures')}">Entrepreneur</a> (${content.ventures
          .map((v) => `<a href="${link(`/ventures/${v.slug}`)}">${esc(v.short)}</a>`)
          .join(', ')}) | <a href="${link('/blog')}">Blog</a> | <a href="${link('/contact')}">Book a consultation</a></nav></header>`;
const faqHtml = (items) => items.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join('\n');

const template = readFileSync(join(dist, 'index.html'), 'utf8');

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
  graph: [person, website, ...content.ventures.map(org), faq(content.faq)],
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
        'Companies founded by Abdul Rahman, entrepreneur in Lahore: Connected 2 Future (C2F) for AI automation and web development, EduCon for education guidance, and Jobs4DAE for DAE jobs in Pakistan.',
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

// Fill the site URL into the copied public text files (sitemap, robots, llms)
for (const name of readdirSync(dist)) {
  const file = join(dist, name);
  if (statSync(file).isFile() && /\.(xml|txt)$/.test(name)) {
    writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__SITE_URL__', SITE_URL));
  }
}

console.log(`Prerendered ${content.ventures.length + 2} routes for ${SITE_URL}`);
