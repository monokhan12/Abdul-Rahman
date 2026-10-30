import { Link } from 'react-router-dom';
import { personalInfo } from '../data';
import { ventureLabel, ventures } from './seo';

export default function SiteFooter() {
  return (
    <footer className="ar-footer">
      <div className="ar-wrap">
        <div className="ar-footer__grid">
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{personalInfo.name}</p>
            <p className="ar-small" style={{ marginTop: '0.4rem', maxWidth: '32ch' }}>
              AI-driven materials engineer and entrepreneur in Lahore, Pakistan.
            </p>
          </div>
          <div>
            <h2>Portfolio</h2>
            <ul>
              <li><Link to="/#research">Research</Link></li>
              <li><Link to="/#experience">Experience</Link></li>
              <li><Link to="/#publications">Publications</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h2>Entrepreneur</h2>
            <ul>
              {ventures.map((v) => (
                <li key={v.slug}>
                  <Link to={`/ventures/${v.slug}`}>{ventureLabel(v)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              <li><Link to="/contact">Book a consultation</Link></li>
              <li><a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a></li>
              <li><a href={`https://${personalInfo.linkedin}`} rel="me noopener" target="_blank">LinkedIn</a></li>
              <li><a href={`https://${personalInfo.github}`} rel="me noopener" target="_blank">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="ar-footer__base">
          <span>© {new Date().getFullYear()} Abdul Rahman</span>
          <span>
            <a href="/llms.txt">llms.txt</a> <span aria-hidden="true">/</span> <a href="/sitemap.xml">Sitemap</a>{' '}
            <span aria-hidden="true">/</span> <Link to="/admin/login">Admin</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
