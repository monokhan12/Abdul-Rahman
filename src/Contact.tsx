import { Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { personalInfo } from './data';
import GoogleMeetScheduler from './components/GoogleMeetScheduler';
import SiteLayout from './site/SiteLayout';
import { breadcrumbSchema, personSchema } from './site/seo';

export default function Contact() {
  return (
    <SiteLayout
      seo={{
        title: 'Book a Materials Engineering Consultation | Abdul Rahman',
        description:
          'Book a free 30-minute video call with Abdul Rahman about failure analysis, SEM/EDS and XRD interpretation, materials informatics or an AI automation project.',
        path: '/contact',
        graph: [
          personSchema(),
          { '@type': 'ContactPage', name: 'Contact Abdul Rahman', about: { '@id': (personSchema() as { '@id': string })['@id'] } },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ],
      }}
    >
      <section className="ar-hero">
        <div className="ar-wrap ar-split">
          <div>
            <h1 className="ar-display" style={{ fontSize: 'clamp(2.2rem, 3.6vw, 3.5rem)' }}>Book a consultation</h1>
            <p className="ar-lead" style={{ marginTop: '1.25rem' }}>
              A free 30-minute video call about failure analysis, SEM/EDS and XRD interpretation, materials informatics,
              or an AI automation project with C2F. I work remotely with teams in the United States and worldwide.
            </p>
            <ul className="ar-offers" style={{ marginTop: '2rem' }}>
              <li>
                <Mail size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} />
                <a href={`mailto:${personalInfo.email}`} className="ar-textlink">{personalInfo.email}</a>
              </li>
              <li>
                <Linkedin size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} />
                <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="me noopener" className="ar-textlink">LinkedIn</a>
              </li>
              <li>
                <Github size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} />
                <a href={`https://${personalInfo.github}`} target="_blank" rel="me noopener" className="ar-textlink">GitHub</a>
              </li>
              <li>
                <MapPin size={18} aria-hidden="true" style={{ color: 'var(--ar-research)' }} />
                <span>Based in {personalInfo.location}, working remotely with US clients</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="ar-h3" style={{ fontSize: '1.4rem' }}>Pick a time</h2>
            <p className="ar-body" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              Connect your Google account to book a 30-minute call. You'll get a Google Meet link straight away.
            </p>
            <div className="ar-scheduler">
              <GoogleMeetScheduler />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
