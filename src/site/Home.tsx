import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from '../lib/SiteLink';
import {
  ArrowUpRight,
  Binary,
  Cpu,
  Flame,
  Microscope,
  Plus,
  Recycle,
  Search,
  BatteryCharging,
  ShieldCheck,
} from 'lucide-react';
import { additional, education, experience, interests, personalInfo, projects, publications, skills } from '../data';
import posts from '../content/posts.json';
import SiteLayout from './SiteLayout';
import ElementTile from './ElementTile';
import ScrollFlight from './flight/ScrollFlight';
import { faqSchema, homeFaq, personSchema, serviceSchema, ventureLabel, ventures, ventureSchema } from './seo';
import content from './content.json';

const pillarIcons = [Flame, Cpu, Microscope, Recycle];
const serviceIcons = [Search, Microscope, Binary, BatteryCharging, ShieldCheck];

const toolkit = [
  { title: 'Materials informatics & AI', icon: Binary, items: skills.informatics },
  { title: 'Characterization', icon: Microscope, items: skills.characterization },
  { title: 'Simulation & software', icon: Cpu, items: skills.software },
];

const splitList = (s: string) =>
  s
    .replace(/\.$/, '')
    .split(/,(?![^(]*\))/)
    .map((x) => x.trim())
    .filter(Boolean);

function pubParts(details: string) {
  const i = details.indexOf(':');
  if (i === -1) return { status: 'Submitted', venue: details.replace(/^Submitted to\s*/i, '') };
  return { status: details.slice(0, i).trim(), venue: details.slice(i + 1).trim() };
}

export function FaqList({ items, id = 'faq' }: { items: { q: string; a: string }[]; id?: string }) {
  return (
    <ul className="ar-faq">
      {items.map((f, i) => (
        <li key={f.q}>
          <details open={i === 0}>
            <summary id={`${id}-${i}`}>
              <h3 className="ar-h3" style={{ fontSize: 'inherit' }}>{f.q}</h3>
              <Plus size={18} aria-hidden="true" />
            </summary>
            <p className="ar-faq__answer">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

const researcherLinks = [
  { label: 'Download CV (PDF)', href: personalInfo.cv },
  { label: 'Google Scholar', href: personalInfo.googleScholar },
  { label: 'ORCID', href: personalInfo.orcid },
  { label: 'ResearchGate', href: personalInfo.researchGate },
].filter((l) => l.href);

const latestPosts = [...posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 3);

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [hash]);

  return (
    <SiteLayout
      seo={{
        title: content.site.defaultTitle,
        description: content.site.defaultDescription,
        path: '/',
        graph: [personSchema(), serviceSchema(), ...ventures.map(ventureSchema), faqSchema(homeFaq)],
      }}
    >
      <ScrollFlight />

      {/* Services: one heading per US search intent */}
      <section id="services" className="ar-section" aria-labelledby="services-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="services-title" className="ar-h2">Materials engineering consulting for US companies</h2>
            <p className="ar-body" style={{ marginTop: '1rem' }}>
              I work remotely with engineering, manufacturing and R&amp;D teams in the United States and worldwide.
              Every engagement starts with a 30-minute call and a written proposal.
            </p>
            <div className="ar-hero__actions">
              <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
            </div>
          </div>
          <ul className="ar-pillars">
            {content.services.map((sv, idx) => {
              const Icon = serviceIcons[idx] ?? Microscope;
              return (
                <li key={sv.id} id={sv.id} className="ar-pillar">
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <h3 className="ar-h3">
                      <Link to={`/services/${sv.slug}`} style={{ textDecoration: 'none' }}>{sv.title}</Link>
                    </h3>
                    <p>{sv.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="ar-section ar-section--alt" aria-labelledby="research-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="research-title" className="ar-h2">Research in metallurgy and materials informatics</h2>
            <p className="ar-body" style={{ marginTop: '1rem' }}>
              Classical characterization meets machine learning and thermodynamic modeling, applied to
              Pakistan's minerals, protective coatings and battery materials.
            </p>
          </div>
          <ul className="ar-pillars">
            {interests.map((item, idx) => {
              const Icon = pillarIcons[idx] ?? Flame;
              return (
                <li key={item.title} className="ar-pillar">
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <h3 className="ar-h3">{item.title}</h3>
                    <p>{item.details}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Toolkit */}
      <section id="skills" className="ar-section" aria-labelledby="skills-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="skills-title" className="ar-h2">Toolkit: SEM/EDS, XRD, Python and CALPHAD</h2>
            <p className="ar-body">The instruments and software I use for characterization, modeling and failure analysis.</p>
          </div>
          <div className="ar-toolkit">
            {toolkit.map(({ title, icon: Icon, items }) => (
              <div key={title}>
                <h3 className="ar-h3"><Icon size={20} aria-hidden="true" /> {title}</h3>
                <ul>
                  {splitList(items).map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & education timeline */}
      <section id="experience" className="ar-section ar-section--alt" aria-labelledby="experience-title">
        <div className="ar-wrap ar-split">
          <div className="ar-split__aside">
            <h2 id="experience-title" className="ar-h2">Experience and education</h2>
            <p className="ar-body" style={{ marginTop: '1rem' }}>
              Industrial testing, process metallurgy and technical training, built on two degrees from UET Lahore.
            </p>
          </div>
          <ol className="ar-timeline">
            {experience.map((exp) => (
              <li key={exp.role + exp.company}>
                <h3 className="ar-h3">{exp.role}</h3>
                <p className="ar-timeline__org">{exp.company}</p>
                <ul>
                  {exp.details.map((d) => {
                    const [lead, ...rest] = d.split(': ');
                    return (
                      <li key={d}>
                        {rest.length ? <><strong style={{ color: 'var(--ar-ink)' }}>{lead}.</strong> {rest.join(': ')}</> : d}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            {education.map((edu) => (
              <li key={edu.degree} id={edu.degree.startsWith('Master') ? 'education' : undefined}>
                <p className="ar-timeline__kind">Education</p>
                <h3 className="ar-h3">{edu.degree}</h3>
                <p className="ar-timeline__org">{edu.institution}</p>
                <p className="ar-timeline__note">{edu.details}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="ar-section" aria-labelledby="projects-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="projects-title" className="ar-h2">Projects</h2>
            <p className="ar-body">AI assistants, prediction models and tools for materials work.</p>
          </div>
          <ul className="ar-rows">
            {projects.map((p) => (
              <li key={p.title} className="ar-row">
                <h3 className="ar-h3">
                  {p.link ? (
                    <a href={`https://${p.link}`} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
                      {p.title} <ArrowUpRight size={16} aria-label="(opens in a new tab)" style={{ verticalAlign: '-2px' }} />
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <div>
                  <p>{p.description}</p>
                  <p className="ar-row__tags">{p.tags.join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Publications */}
      <section id="publications" className="ar-section ar-section--alt" aria-labelledby="publications-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="publications-title" className="ar-h2">Publications and conference work</h2>
            {researcherLinks.length > 0 && (
              <div className="ar-profiles">
                {researcherLinks.map((l) => (
                  <a key={l.label} href={l.href} className="ar-btn ar-btn--ghost" target="_blank" rel="me noopener">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <ul className="ar-rows">
            {publications.map((pub) => {
              const { status, venue } = pubParts(pub.details);
              return (
                <li key={pub.title} className="ar-row">
                  <div>
                    <span className="ar-status">{status}</span>
                    <p className="ar-small">{venue}</p>
                  </div>
                  <h3 className="ar-h3" style={{ fontWeight: 600 }}>{pub.title.replace(/\.$/, '')}</h3>
                </li>
              );
            })}
          </ul>
          <div className="ar-aside-note">
            <p><strong>Memberships</strong>{additional.memberships}</p>
            <p><strong>Community</strong>{additional.leadership}</p>
          </div>
        </div>
      </section>

      {/* Ventures */}
      <section id="ventures" className="ar-section" aria-labelledby="ventures-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="ventures-title" className="ar-h2">Ventures I founded</h2>
            <p className="ar-body">
              Outside the lab I build companies for businesses, students and diploma engineers.
            </p>
          </div>
          <div className="ar-ventures">
            {ventures.map((v) => (
              <Link key={v.slug} to={`/ventures/${v.slug}`} className="ar-venture-card">
                <ElementTile
                  symbol={v.symbol}
                  variant="venture"
                  size="sm"
                  topLeft={v.role}
                  topRight={v.since}
                  name={ventureLabel(v)}
                />
                <p>{v.tagline}</p>
                <span className="ar-venture-card__go">About {v.short}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest articles: static, so the homepage links to every recent post without loading Firestore */}
      <section id="blog" className="ar-section ar-section--alt" aria-labelledby="blog-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="blog-title" className="ar-h2">Latest articles</h2>
            <p className="ar-body">Notes on failure analysis, characterization, corrosion, battery recycling and materials informatics.</p>
          </div>
          <ul className="ar-posts">
            {latestPosts.map((p) => (
              <li key={p.slug}>
                <Link to={`/blog/${p.slug}`} className="ar-post">
                  <span className="ar-small">{p.category} · {p.date}</span>
                  <h3 className="ar-h3">{p.title}</h3>
                  <p>{p.summary.length > 160 ? `${p.summary.slice(0, 157).replace(/\s\S*$/, '')}…` : p.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '1.5rem' }}>
            <Link to="/blog" className="ar-textlink">All articles</Link>
          </p>
        </div>
      </section>

      {/* FAQ: written as direct answers for AEO, mirrored in FAQPage JSON-LD */}
      <section id="faq" className="ar-section" aria-labelledby="faq-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="faq-title" className="ar-h2">Questions people ask</h2>
          </div>
          <FaqList items={homeFaq} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="ar-section ar-section--alt" aria-labelledby="contact-title">
        <div className="ar-wrap ar-cta">
          <div>
            <h2 id="contact-title" className="ar-h2">Work with me</h2>
            <p className="ar-body" style={{ marginTop: '0.9rem' }}>
              Failure analysis, SEM/EDS and XRD characterization, materials informatics workflows and mineral
              processing. Book a 30-minute discovery call or email me directly.
            </p>
          </div>
          <div className="ar-cta__actions">
            <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
            <a href={`mailto:${personalInfo.email}`} className="ar-btn ar-btn--ghost">Email me</a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
