import React from 'react';
import { Link, useRouter } from '../../router/AppRouter';

const links = [
  { to: '/courses', label: 'Courses' },
  { to: '/comparer', label: 'Comparer' },
  { to: '/profil', label: 'Profil' },
  { to: '/a-propos', label: 'À propos' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  return <div className="app-shell">
    <header className="app-header app-card">
      <Link to="/" className="logo">TrailMatch</Link>
      <nav className="pill-nav" aria-label="Navigation principale">
        {links.map((link) => <Link key={link.to} to={link.to} className={`pill-link ${pathname.startsWith(link.to) ? 'is-active' : ''}`}>{link.label}</Link>)}
      </nav>
      <Link to="/courses" className="primary-btn">Trouver ma course</Link>
    </header>
    <main className="app-card fade-in-up">{children}</main>
  </div>;
}
