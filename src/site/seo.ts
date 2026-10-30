import { useEffect } from 'react';
import content from './content.json';
import { personalInfo, education } from '../data';

export type Venture = (typeof content.ventures)[number];
export type QA = { q: string; a: string };

export const SITE_URL = content.site.url.replace(/\/$/, '');
export const ventures: Venture[] = content.ventures;
export const homeFaq: QA[] = content.faq;
export const ventureLabel = (v: Venture) => (v.short === v.name ? v.name : `${v.name} (${v.short})`);

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`;

const PERSON_ID = `${SITE_URL}/#person`;

/** Shared Person entity — every page links back to it so search and answer engines resolve one identity. */
export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: personalInfo.name,
    url: absoluteUrl('/'),
    jobTitle: ['AI-Driven Materials Engineer', 'Research Engineer & Senior Instructor', 'Entrepreneur'],
    description:
      'AI-driven materials engineer and entrepreneur in Lahore, Pakistan, working across physical metallurgy, materials informatics and materials characterization, and founder of Connected 2 Future (C2F), EduCon and Jobs4DAE.',
    email: `mailto:${personalInfo.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressRegion: 'Punjab', addressCountry: 'PK' },
    worksFor: [
      { '@type': 'Organization', name: 'Pakistan Council of Scientific and Industrial Research (PCSIR)' },
      ...ventures.map((v) => ({ '@id': `${absoluteUrl(`/ventures/${v.slug}`)}#org` })),
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Engineering and Technology (UET), Lahore' },
    hasCredential: education.map((e) => ({ '@type': 'EducationalOccupationalCredential', name: e.degree })),
    knowsAbout: [
      'Physical Metallurgy',
      'Extractive Metallurgy',
      'Materials Informatics',
      'Machine Learning for Materials',
      'CALPHAD Modeling',
      'SEM/EDS Analysis',
      'X-ray Diffraction (XRD)',
      'X-ray Fluorescence (XRF)',
      'Corrosion and Protective Coatings',
      'Lithium-ion Battery Recycling',
      'AI Automation',
      'Technical Education',
    ],
    sameAs: [`https://${personalInfo.github}`, `https://${personalInfo.linkedin}`],
  };
}

export function ventureSchema(v: Venture) {
  const pageUrl = absoluteUrl(`/ventures/${v.slug}`);
  return {
    '@type': 'Organization',
    '@id': `${pageUrl}#org`,
    name: v.name,
    alternateName: v.short !== v.name ? v.short : undefined,
    url: v.url || pageUrl,
    description: v.answer,
    founder: { '@id': PERSON_ID },
    ...(v.since ? { foundingDate: v.since } : {}),
    knowsAbout: v.offers,
  };
}

export function faqSchema(items: QA[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path),
    })),
  };
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/** Keeps title, description, canonical, social tags and route JSON-LD in sync for client-side navigation. */
export function useSeo(opts: { title: string; description: string; path: string; graph?: object[] }) {
  const { title, description, path, graph } = opts;
  const graphJson = graph ? JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) : '';

  useEffect(() => {
    const url = absoluteUrl(path);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    if (graphJson) {
      let script = document.getElementById('ld-route') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'ld-route';
        document.head.appendChild(script);
      }
      script.textContent = graphJson;
    }
  }, [title, description, path, graphJson]);
}
