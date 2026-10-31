import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import SiteLayout from './SiteLayout';
import ElementTile from './ElementTile';
import { FaqList } from './Home';
import {
  breadcrumbSchema,
  faqSchema,
  personSchema,
  ventureLabel,
  ventures,
  ventureSchema,
} from './seo';

export function VenturesIndex() {
  return (
    <SiteLayout
      seo={{
        title: 'Ventures by Abdul Rahman | C2F, EduCon and Jobs4DAE',
        description:
          'Companies founded by Abdul Rahman: Connected 2 Future (C2F) for AI automation, EduCon for education guidance, and Jobs4DAE for DAE jobs in Pakistan.',
        path: '/ventures',
        graph: [
          personSchema(),
          ...ventures.map(ventureSchema),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Ventures', path: '/ventures' },
          ]),
        ],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Ventures</li>
          </ol>
          <h1 className="ar-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>Ventures</h1>
          <p className="ar-lead" style={{ marginTop: '1.25rem' }}>
            Abdul Rahman is the founder of three ventures: Connected 2 Future (C2F), EduCon and Jobs4DAE. Each one
            puts engineering and AI to work for a different audience.
          </p>
        </div>
      </section>
      <section className="ar-section">
        <div className="ar-wrap ar-ventures">
          {ventures.map((v) => (
            <Link key={v.slug} to={`/ventures/${v.slug}`} className="ar-venture-card">
              <ElementTile symbol={v.symbol} variant="venture" size="sm" topLeft={v.role} topRight={v.since} name={ventureLabel(v)} />
              <h2 className="ar-h3" style={{ marginTop: '1rem' }}>{ventureLabel(v)}</h2>
              <p style={{ marginTop: '0.4rem' }}>{v.tagline}</p>
              <span className="ar-venture-card__go">About {v.short}</span>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

export function VenturePage() {
  const { slug } = useParams();
  const v = ventures.find((x) => x.slug === slug);
  if (!v) return <Navigate to="/ventures" replace />;

  const label = ventureLabel(v);
  const others = ventures.filter((x) => x.slug !== v.slug);
  const path = `/ventures/${v.slug}`;

  return (
    <SiteLayout
      seo={{
        title: v.title,
        description: v.description,
        path,
        graph: [
          personSchema(),
          ventureSchema(v),
          faqSchema(v.faq),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Ventures', path: '/ventures' },
            { name: label, path },
          ]),
        ],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/ventures">Ventures</Link></li>
            <li aria-current="page">{v.short}</li>
          </ol>
          <div className="ar-hero__grid">
            <div>
              <h1 className="ar-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.75rem)' }}>{label}</h1>
              <p className="ar-tagrole">
                {v.role}
                {v.since ? ` since ${v.since}` : ''}: Abdul Rahman
              </p>
              <p className="ar-lead" style={{ marginTop: '1rem' }}>{v.answer}</p>
              <div className="ar-hero__actions">
                {v.url ? (
                  <a href={v.url} target="_blank" rel="noopener" className="ar-btn ar-btn--primary">
                    Visit {v.short} <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                ) : null}
                <Link to="/contact" className={`ar-btn ${v.url ? 'ar-btn--ghost' : 'ar-btn--primary'}`}>
                  Talk to Abdul about {v.short}
                </Link>
              </div>
            </div>
            <div className="ar-hero__tilewrap" style={{ width: 'min(100%, 18rem)' }}>
              <ElementTile symbol={v.symbol} variant="venture" topLeft={v.role} topRight={v.since} name={v.short} />
            </div>
          </div>
        </div>
      </section>

      <section className="ar-section ar-section--alt" aria-labelledby="offers-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="offers-title" className="ar-h2">What {v.short} offers</h2>
          </div>
          <ul className="ar-offers">
            {v.offers.map((o) => (
              <li key={o}><Check size={18} aria-hidden="true" /> {o}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ar-section" aria-labelledby="vfaq-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="vfaq-title" className="ar-h2">About {v.short}</h2>
          </div>
          <FaqList items={v.faq} id={`${v.slug}-faq`} />
        </div>
      </section>

      <section className="ar-section ar-section--alt" aria-labelledby="more-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="more-title" className="ar-h2">Other ventures</h2>
          </div>
          <div className="ar-ventures" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 18rem))' }}>
            {others.map((o) => (
              <Link key={o.slug} to={`/ventures/${o.slug}`} className="ar-venture-card">
                <ElementTile symbol={o.symbol} variant="venture" size="sm" topLeft={o.role} topRight={o.since} name={ventureLabel(o)} />
                <p>{o.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
