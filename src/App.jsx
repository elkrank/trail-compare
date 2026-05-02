import React from 'react';
import { RouterProvider, Route, Link } from './router/AppRouter';
import { RacesListPage } from './races/pages/RacesListPage';
import { RaceDetailPage } from './races/pages/RaceDetailPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminRacesPage } from './admin/pages/AdminRacesPage';

export default function App() {
  return (
    <RouterProvider>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Races</Link>
        <Link to="/admin/login">Admin</Link>
      </nav>
      <Route path="/">{() => <RacesListPage />}</Route>
      <Route path="/races/:id">{({ id }) => <RaceDetailPage id={id} />}</Route>
      <Route path="/admin/login">{() => <AdminLoginPage />}</Route>
      <Route path="/admin/races">{() => <AdminRacesPage />}</Route>
    </RouterProvider>
  );
}
