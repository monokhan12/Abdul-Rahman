import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useSeo } from './seo';

type Props = {
  children: ReactNode;
  seo: { title: string; description: string; path: string; graph?: object[] };
};

export default function SiteLayout({ children, seo }: Props) {
  useSeo(seo);
  return (
    <div className="ar-page">
      <a href="#main" className="ar-skip">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
