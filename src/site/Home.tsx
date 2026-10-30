import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Binary,
  Cpu,
  Flame,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Microscope,
  Plus,
  Recycle,
} from 'lucide-react';
import { additional, education, experience, interests, personalInfo, projects, publications, skills } from '../data';
import BlogSection from '../components/BlogSection';
import SiteLayout from './SiteLayout';
import ElementTile from './ElementTile';
import { faqSchema, homeFaq, personSchema, ventureLabel, ventures, ventureSchema } from './seo';
import content from './content.json';

const pillarIcons = [Flame, Cpu, Microscope, Recycle];

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
        graph: [personSchema(), ...ventures.map(ventureSchema), faqSchema(homeFaq)],
      }}
    >
      {/* Hero: answers "who is this" in the first sentence for search snippets and answer engines */}
      <section className="ar-hero" aria-labelledby="hero-title">
        <div className="ar-wrap ar-hero__grid">
          <div>
            <h1 id="hero-title" className="ar-display">{personalInfo.name}</h1>
            <p className="ar-hero__role">AI-driven materials engineer and entrepreneur in Lahore, Pakistan</p>
            <p className="ar-lead ar-hero__summary">
              I combine physical metallurgy with machine learning and CALPHAD modeling to design better alloys,
              coatings and recycling routes. I research and teach at PCSIR, and I founded{' '}
              {ventures.map((v, i) => (
                <span key={v.slug}>
                  <Link className="ar-textlink" to={`/ventures/${v.slug}`}>{ventureLabel(v)}</Link>
                  {i < ventures.length - 2 ? ', ' : i === ventures.length - 2 ? ' and ' : ''}
                </span>
              ))}
              .
            </p>
            <div className="ar-hero__actions">
              <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
              <a href="#research" className="ar-btn ar-btn--ghost">See my research</a>
            </div>
            <ul className="ar-hero__facts">
              <li><MapPin size={16} aria-hidden="true" /> {personalInfo.location}</li>
              <li><Mail size={16} aria-hidden="true" /> <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a></li>
              <li><Linkedin size={16} aria-hidden="true" /> <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="me noopener">LinkedIn</a></li>
              <li><Github size={16} aria-hidden="true" /> <a href={`https://${personalInfo.github}`} target="_blank" rel="me noopener">GitHub</a></li>
            </ul>
          </div>
          <div className="ar-hero__tilewrap">
            <ElementTile
              className="ar-hero__tile"
              symbol="Ar"
              topLeft="18"
              topRight="39.948"
              name="Abdul Rahman"
              meta="Materials engineer, founder"
            />
          </div>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="ar-section" aria-labelledby="research-title">
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
      <section id="skills" className="ar-section ar-section--alt" aria-labelledby="skills-title">
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
      <section id="experience" className="ar-section" aria-labelledby="experience-title">
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
      <section id="projects" className="ar-section ar-section--alt" aria-labelledby="projects-title">
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
      <section id="publications" className="ar-section" aria-labelledby="publications-title">
        <div className="ar-wrap">
          <div className="ar-section__head">
            <h2 id="publications-title" className="ar-h2">Publications and conference work</h2>
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
      <section id="ventures" className="ar-section ar-section--alt" aria-labelledby="ventures-title">
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

      <BlogSection />

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
