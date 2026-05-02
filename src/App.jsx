import React from 'react';
import { RouterProvider, Route, Link, useRouter } from './router/AppRouter';
import { RacesListPage } from './races/pages/RacesListPage';
import { RaceDetailPage } from './races/pages/RaceDetailPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminRacesPage } from './admin/pages/AdminRacesPage';

function AppNavigation() {
  const { pathname } = useRouter();
  return (
    <nav className="app-card pill-nav fade-in-up" aria-label="Navigation principale">
      <Link to="/" className={`pill-link ${pathname === '/' ? 'is-active' : ''}`}>Courses</Link>
      <Link to="/admin/login" className={`pill-link ${pathname.startsWith('/admin') ? 'is-active' : ''}`}>Admin</Link>
    </nav>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <div className="app-shell">
        <AppNavigation />
        <main className="app-card fade-in-up">
          <Route path="/">{() => <RacesListPage />}</Route>
          <Route path="/races/:id">{({ id }) => <RaceDetailPage id={id} />}</Route>
          <Route path="/admin/login">{() => <AdminLoginPage />}</Route>
          <Route path="/admin/races">{() => <AdminRacesPage />}</Route>
        </main>
      </div>
    </RouterProvider>
  );
}
