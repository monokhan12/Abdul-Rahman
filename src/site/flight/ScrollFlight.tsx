import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { personalInfo } from '../../data';
import { ventureLabel, ventures } from '../seo';
import { mountScrollFlight, type FlightApi } from './scrollFlight';

const scenes = ['Who I am', 'Metallurgy', 'Atoms to data', 'Machine learning', 'Ventures'];

/**
 * Homepage hero: a scroll-driven camera dive (see scrollFlight.ts).
 * All copy is real DOM, so it is indexed and readable without the canvas.
 */
export default function ScrollFlight() {
  const rootRef = useRef<HTMLElement>(null);
  const api = useRef<FlightApi | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    api.current = mountScrollFlight(rootRef.current, {
      ventures: ventures.map((v) => ({ symbol: v.symbol, short: v.short })),
    });
    return () => api.current?.destroy();
  }, []);

  return (
    <section className="fl" ref={rootRef} aria-label="Introduction">
      <div className="fl-track" data-fl-track>
        <div className="fl-stage" data-fl-stage>
          <canvas aria-hidden="true" />
          <a href="#research" className="fl-skip">Skip intro</a>

          <div className="fl-panel" data-fl-panel>
            <div className="fl-panel__card">
              <h1 className="ar-display">{personalInfo.name}</h1>
              <p className="ar-hero__role">AI-driven materials engineer and founder</p>
              <p className="fl-panel__more">
                I use machine learning and metallurgy to design better alloys, coatings and battery materials, and I
                consult remotely for companies across the United States.
              </p>
              <div className="ar-hero__actions">
                <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
                <a href="#services" className="ar-btn ar-btn--ghost">See services</a>
              </div>
            </div>
          </div>

          <div className="fl-panel" data-fl-panel>
            <div className="fl-panel__card">
              <h2>Metallurgical failure analysis you can see</h2>
              <p>
                SEM/EDS, XRD with Rietveld refinement and XRF on more than 50 industrial projects. I find out why parts
                crack, corrode or wear, and how to stop it happening again.
              </p>
            </div>
          </div>

          <div className="fl-panel" data-fl-panel>
            <div className="fl-panel__card">
              <h2>Materials informatics, from atoms to data</h2>
              <p>
                CALPHAD thermodynamics, Pymatgen and graph neural networks turn composition and processing data into
                predictions your lab can test.
              </p>
            </div>
          </div>

          <div className="fl-panel" data-fl-panel>
            <div className="fl-panel__card">
              <h2>Machine learning for materials R&amp;D</h2>
              <p>
                Bayesian optimization and agentic AI cut the number of experiments it takes to find the right coating,
                alloy or battery-recycling route.
              </p>
            </div>
          </div>

          <div className="fl-panel" data-fl-panel>
            <div className="fl-panel__card">
              <h2>Founder of C2F, EduCon and Jobs4DAE</h2>
              <ul className="fl-ventures">
                {ventures.map((v) => (
                  <li key={v.slug}>
                    <Link to={`/ventures/${v.slug}`}>{ventureLabel(v)}</Link> <span>{v.tagline}</span>
                  </li>
                ))}
              </ul>
              <div className="ar-hero__actions">
                <Link to="/contact" className="ar-btn ar-btn--primary">Book a consultation</Link>
              </div>
            </div>
          </div>

          <ol className="fl-rail" aria-label="Scenes">
            {scenes.map((label, i) => (
              <li key={label}>
                <button type="button" data-fl-rail onClick={() => api.current?.goTo(i)}>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <p className="fl-hint" data-fl-hint aria-hidden="true">Scroll to dive in</p>
        </div>
      </div>
    </section>
  );
}
