import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { applyTheme, getInitialTheme } from '../components/ThemeToggle';
import { ventureLabel, ventures } from './seo';
import ElementTile from './ElementTile';

const sectionLinks = [
  { label: 'Research', to: '/#research' },
  { label: 'Experience', to: '/#experience' },
  { label: 'Publications', to: '/#publications' },
];

function ThemeButton() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getInitialTheme());

  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<{ theme: 'dark' | 'light' }>).detail?.theme;
      if (next) setTheme(next);
    };
    window.addEventListener('theme-change', onChange);
    return () => window.removeEventListener('theme-change', onChange);
  }, []);

  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="ar-iconbtn"
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function EntrepreneurMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Hover opens on pointer devices; a short delay stops the panel closing while the cursor crosses the gap.
  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      className="ar-menu"
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === 'mouse' && openNow()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ar-nav__trigger"
        aria-expanded={open}
        aria-controls="entrepreneur-menu"
        onClick={() => setOpen((o) => !o)}
      >
        Entrepreneur <ChevronDown size={15} />
      </button>
      {open && (
        <div className="ar-menu__panel" id="entrepreneur-menu">
          {ventures.map((v) => (
            <Link key={v.slug} to={`/ventures/${v.slug}`} className="ar-menu__item">
              <ElementTile symbol={v.symbol} variant="venture" size="xs" />
              <span>
                <span className="ar-menu__name">
                  {ventureLabel(v)}
                </span>
                <span className="ar-menu__desc">{v.tagline}</span>
              </span>
            </Link>
          ))}
          <Link to="/ventures" className="ar-menu__all">
            All ventures
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();

  useEffect(() => setDrawer(false), [location.pathname, location.hash]);

  return (
    <header className="ar-header">
      <div className="ar-wrap">
        <div className="ar-header__row">
          <Link to="/" className="ar-brand" aria-label="Abdul Rahman, home">
            <span className="ar-brand__tile" aria-hidden="true">Ar</span>
            <span>Abdul Rahman</span>
          </Link>

          <nav className="ar-nav" aria-label="Main">
            {sectionLinks.map((l) => (
              <Link key={l.to} to={l.to} className="ar-nav__link">
                {l.label}
              </Link>
            ))}
            <EntrepreneurMenu />
            <Link
              to="/blog"
              className="ar-nav__link"
              aria-current={location.pathname.startsWith('/blog') ? 'page' : undefined}
            >
              Blog
            </Link>
          </nav>

          <div className="ar-header__actions">
            <ThemeButton />
            <Link to="/contact" className="ar-btn ar-btn--primary ar-header__cta">
              Book a consultation
            </Link>
            <button
              type="button"
              className="ar-iconbtn ar-header__burger"
              aria-expanded={drawer}
              aria-controls="mobile-nav"
              aria-label={drawer ? 'Close menu' : 'Open menu'}
              onClick={() => setDrawer((d) => !d)}
            >
              {drawer ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {drawer && (
          <nav className="ar-drawer" id="mobile-nav" aria-label="Mobile">
            {sectionLinks.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
            <Link to="/blog">Blog</Link>
            <div className="ar-drawer__group">Entrepreneur</div>
            {ventures.map((v) => (
              <Link key={v.slug} to={`/ventures/${v.slug}`} className="ar-drawer__venture">
                <ElementTile symbol={v.symbol} variant="venture" size="xs" />
                <span>{ventureLabel(v)}</span>
              </Link>
            ))}
            <Link to="/ventures">All ventures</Link>
            <Link to="/contact" className="ar-btn ar-btn--primary">
              Book a consultation
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
