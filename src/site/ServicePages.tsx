import { Link, Navigate, useParams } from 'react-router-dom';
import { BatteryCharging, Binary, Check, Microscope, Search, ShieldCheck } from 'lucide-react';
import SiteLayout from './SiteLayout';
import { FaqList } from './Home';
import content from './content.json';
import posts from '../content/posts.json';
import {
  breadcrumbSchema,
  faqSchema,
  personSchema,
  serviceSchema,
  serviceSchemaFor,
  services,
} from './seo';

const icons: Record<string, typeof Search> = {
  'failure-analysis': Search,
  'sem-xrd': Microscope,
  'materials-informatics': Binary,
  'battery-minerals': BatteryCharging,
  'corrosion-coatings': ShieldCheck,
};

export function ServicesIndex() {
  return (
    <SiteLayout
      seo={{
        title: content.servicesIndex.seoTitle,
        description: content.servicesIndex.description,
        path: '/services',
        graph: [
          personSchema(),
          serviceSchema(),
          ...services.map(serviceSchemaFor),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
        ],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Services</li>
          </ol>
          <h1 className="ar-display" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.25rem)' }}>
            Materials engineering consulting
          </h1>
          <p className="ar-lead" style={{ marginTop: '1.25rem' }}>
            Abdul Rahman consults remotely for engineering, manufacturing and R&amp;D teams in the United States and
            worldwide. Every engagement starts with a free 30-minute call and a written proposal.
          </p>
        </div>
      </section>
      <section className="ar-section">
        <div className="ar-wrap">
          <ul className="ar-pillars">
            {services.map((sv) => {
              const Icon = icons[sv.id] ?? Search;
              return (
                <li key={sv.slug} className="ar-pillar">
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <h2 className="ar-h3">
                      <Link to={`/services/${sv.slug}`} style={{ textDecoration: 'none' }}>{sv.title}</Link>
                    </h2>
                    <p>{sv.body}</p>
                    <p style={{ marginTop: '0.5rem' }}>
                      <Link to={`/services/${sv.slug}`} className="ar-textlink">About {sv.short.toLowerCase()} consulting</Link>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <BookingBand />
    </SiteLayout>
  );
}

function BookingBand() {
  return (
    <section className="ar-section ar-section--alt" aria-labelledby="book-title">
      <div className="ar-wrap ar-cta">
        <div>
          <h2 id="book-title" className="ar-h2">Start with a free 30-minute call</h2>
          <p className="ar-body" style={{ marginTop: '0.9rem' }}>
            Describe the part, the data or the question. You get a written proposal with scope, timeline and price.
          </p>
        </div>
        <div className="ar-cta__actions">
          <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
        </div>
      </div>
    </section>
  );
}

export function ServicePage() {
  const { slug } = useParams();
  const sv = services.find((s) => s.slug === slug);
  if (!sv) return <Navigate to="/services" replace />;

  const path = `/services/${sv.slug}`;
  const Icon = icons[sv.id] ?? Search;
  const related = sv.related
    .map((r) => posts.find((p) => p.slug === r))
    .filter((p): p is (typeof posts)[number] => Boolean(p));
  const others = services.filter((s) => s.slug !== sv.slug);

  return (
    <SiteLayout
      seo={{
        title: sv.seoTitle,
        description: sv.description,
        path,
        graph: [
          personSchema(),
          serviceSchemaFor(sv),
          faqSchema(sv.faq),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: sv.title, path },
          ]),
        ],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li aria-current="page">{sv.short}</li>
          </ol>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Icon size={34} aria-hidden="true" style={{ color: 'var(--ar-research)', flexShrink: 0, marginTop: '0.6rem' }} />
            <h1 className="ar-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.9rem)' }}>{sv.title}</h1>
          </div>
          <p className="ar-lead" style={{ marginTop: '1.25rem' }}>{sv.answer}</p>
          <div className="ar-hero__actions">
            <Link to="/contact" className="ar-btn ar-btn--primary">Book a free consultation</Link>
            <a href="#faq" className="ar-btn ar-btn--ghost">Common questions</a>
          </div>
        </div>
      </section>

      <section className="ar-section ar-section--alt" aria-labelledby="includes-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="includes-title" className="ar-h2">What's included</h2>
          </div>
          <ul className="ar-offers">
            {sv.includes.map((x) => (
              <li key={x}><Check size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} /> {x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ar-section" aria-labelledby="bestfor-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="bestfor-title" className="ar-h2">Who it's for</h2>
          </div>
          <ul className="ar-offers">
            {sv.bestFor.map((x) => (
              <li key={x}><Check size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} /> {x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ar-section ar-section--alt" aria-labelledby="process-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="process-title" className="ar-h2">How it works</h2>
            <p className="ar-body" style={{ marginTop: '1rem' }}>Remote by default, for clients in the United States and worldwide.</p>
          </div>
          <ol className="ar-timeline">
            {sv.process.map((st) => (
              <li key={st.name}>
                <h3 className="ar-h3">{st.name}</h3>
                <p className="ar-timeline__note">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="ar-section" aria-labelledby="sfaq-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="sfaq-title" className="ar-h2">Questions about {sv.short.toLowerCase()}</h2>
          </div>
          <FaqList items={sv.faq} id={`${sv.id}-faq`} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="ar-section ar-section--alt" aria-labelledby="reading-title">
          <div className="ar-wrap">
            <div className="ar-section__head">
              <h2 id="reading-title" className="ar-h2">Further reading</h2>
            </div>
            <ul className="ar-rows">
              {related.map((p) => (
                <li key={p.slug} className="ar-row">
                  <h3 className="ar-h3"><Link to={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>{p.title}</Link></h3>
                  <p>{p.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="ar-section" aria-labelledby="other-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="other-title" className="ar-h2">Other services</h2>
          </div>
          <ul className="fl-ventures" style={{ gap: '0.6rem' }}>
            {others.map((o) => (
              <li key={o.slug}><Link to={`/services/${o.slug}`} className="ar-textlink">{o.title}</Link></li>
            ))}
          </ul>
        </div>
      </section>

      <BookingBand />
    </SiteLayout>
  );
}
