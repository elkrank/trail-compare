import React from 'react';
import { RouterProvider, Route, Link, useRouter } from './router/AppRouter';
import { RacesListPage } from './races/pages/RacesListPage';
import { RaceDetailPage } from './races/pages/RaceDetailPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminRacesPage } from './admin/pages/AdminRacesPage';
import { HomePage } from './pages/HomePage';
import { ComparatorPage } from './pages/ComparatorPage';
import { RunnerProfilePage } from './pages/RunnerProfilePage';
import { AboutPage } from './pages/AboutPage';

function AppNavigation() {
  const { pathname } = useRouter();
  return <nav className="app-card pill-nav fade-in-up" aria-label="Navigation principale">
    <Link to="/" className={`pill-link ${pathname === '/' ? 'is-active' : ''}`}>Home</Link>
    <Link to="/courses" className={`pill-link ${pathname.startsWith('/courses') ? 'is-active' : ''}`}>Courses</Link>
    <Link to="/comparer" className={`pill-link ${pathname === '/comparer' ? 'is-active' : ''}`}>Comparateur</Link>
    <Link to="/profil" className={`pill-link ${pathname === '/profil' ? 'is-active' : ''}`}>Profil</Link>
    <Link to="/a-propos" className={`pill-link ${pathname === '/a-propos' ? 'is-active' : ''}`}>À propos</Link>
    <Link to="/admin/login" className={`pill-link ${pathname.startsWith('/admin') ? 'is-active' : ''}`}>Admin</Link>
  </nav>;
}

export default function App() {
  return <RouterProvider><div className="app-shell"><AppNavigation /><main className="app-card fade-in-up">
    <Route path="/">{() => <HomePage />}</Route>
    <Route path="/courses">{() => <RacesListPage />}</Route>
    <Route path="/courses/:id">{({ id }) => <RaceDetailPage id={id} />}</Route>
    <Route path="/comparer">{() => <ComparatorPage />}</Route>
    <Route path="/profil">{() => <RunnerProfilePage />}</Route>
    <Route path="/a-propos">{() => <AboutPage />}</Route>
    <Route path="/admin/login">{() => <AdminLoginPage />}</Route>
    <Route path="/admin/races">{() => <AdminRacesPage />}</Route>
  </main></div></RouterProvider>;
}
