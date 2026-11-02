import { Link, Navigate, useParams } from 'react-router-dom';
import SiteLayout from '../SiteLayout';
import { FaqList } from '../Home';
import content from '../content.json';
import { absoluteUrl, breadcrumbSchema, faqSchema, personSchema, services } from '../seo';
import { CALCULATORS } from './Calculators';

type Tool = (typeof content.tools)[number];
const tools: Tool[] = content.tools;

function toolSchema(t: Tool) {
  const url = absoluteUrl(`/tools/${t.slug}`);
  return {
    '@type': 'WebApplication',
    '@id': `${url}#app`,
    name: t.title,
    url,
    description: t.answer,
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Any (runs in the browser)',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': `${absoluteUrl('/').replace(/\/$/, '')}/#person` },
  };
}

export function ToolsIndex() {
  return (
    <SiteLayout
      seo={{
        title: content.toolsIndex.seoTitle,
        description: content.toolsIndex.description,
        path: '/tools',
        graph: [personSchema(), ...tools.map(toolSchema), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }])],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Tools</li>
          </ol>
          <h1 className="ar-display" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.25rem)' }}>Free engineering tools</h1>
          <p className="ar-lead" style={{ marginTop: '1.25rem' }}>
            Calculators for corrosion, X-ray diffraction and automation savings. They run in your browser, need no sign-up
            and use published reference data, cited on each page.
          </p>
        </div>
      </section>
      <section className="ar-section">
        <div className="ar-wrap">
          <ul className="ar-rows">
            {tools.map((t) => (
              <li key={t.slug} className="ar-row">
                <h2 className="ar-h3"><Link to={`/tools/${t.slug}`} className="ar-textlink">{t.title}</Link></h2>
                <p>{t.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}

export function ToolPage() {
  const { slug } = useParams();
  const t = tools.find((x) => x.slug === slug);
  if (!t) return <Navigate to="/tools" replace />;
  const Calc = CALCULATORS[t.slug];
  const sv = services.find((s) => s.slug === t.service);
  const path = `/tools/${t.slug}`;

  return (
    <SiteLayout
      seo={{
        title: t.seoTitle,
        description: t.description,
        path,
        graph: [
          personSchema(),
          toolSchema(t),
          faqSchema(t.faq),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: t.title, path }]),
        ],
      }}
    >
      <section className="ar-hero" style={{ paddingBottom: '2rem' }}>
        <div className="ar-wrap">
          <ol className="ar-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tools">Tools</Link></li>
            <li aria-current="page">{t.short}</li>
          </ol>
          <h1 className="ar-display" style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.6rem)' }}>{t.title}</h1>
          <p className="ar-lead" style={{ marginTop: '1rem' }}>{t.answer}</p>
        </div>
      </section>

      <section className="ar-section" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="ar-wrap">{Calc && <Calc />}</div>
      </section>

      <section className="ar-section ar-section--alt" aria-labelledby="how-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside"><h2 id="how-title" className="ar-h2">How to use it</h2></div>
          <div>
            {t.guide.map((g) => <p key={g} className="ar-body" style={{ marginBottom: '1rem' }}>{g}</p>)}
            {sv && (
              <p className="ar-body">
                Need a specialist to look at a real part or dataset?{' '}
                <Link to={`/services/${sv.slug}`} className="ar-textlink">{sv.title}</Link>.
              </p>
            )}
            {'venture' in t && t.venture && (
              <p className="ar-body">
                Want a real quote? <Link to={`/ventures/${t.venture}`} className="ar-textlink">Connected 2 Future (C2F)</Link> prepares free proposals.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="ar-section" aria-labelledby="tfaq-title">
        <div className="ar-wrap">
          <div className="ar-section__head"><h2 id="tfaq-title" className="ar-h2">Questions</h2></div>
          <FaqList items={t.faq} id={`${t.slug}-faq`} />
          {t.sources.length > 0 && (
            <p className="ar-small" style={{ marginTop: '2rem' }}>
              Data source{t.sources.length > 1 ? 's' : ''}:{' '}
              {t.sources.map((s, i) => (
                <span key={s.url}>{i > 0 && '; '}<a href={s.url} target="_blank" rel="noopener" className="ar-textlink">{s.label}</a></span>
              ))}
              . Results are estimates for screening, not a substitute for testing.
            </p>
          )}
          <p className="ar-small" style={{ marginTop: '0.75rem' }}>
            Cite this tool: Abdul Rahman, “{t.title},” abdul-rah-man.engineer{path}/
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
