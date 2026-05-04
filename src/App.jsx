import React from 'react';
import { RouterProvider, Route } from './router/AppRouter';
import { RacesListPage } from './races/pages/RacesListPage';
import { RaceDetailPage } from './races/pages/RaceDetailPage';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminRacesPage } from './admin/pages/AdminRacesPage';
import { HomePage } from './pages/HomePage';
import { ComparatorPage } from './pages/ComparatorPage';
import { RunnerProfilePage } from './pages/RunnerProfilePage';
import { AboutPage } from './pages/AboutPage';
import { AppLayout } from './shared/components/AppLayout';

export default function App() {
  return <RouterProvider><AppLayout>
    <Route path="/">{() => <HomePage />}</Route>
    <Route path="/courses">{() => <RacesListPage />}</Route>
    <Route path="/courses/:id">{({ id }) => <RaceDetailPage id={id} />}</Route>
    <Route path="/comparer">{() => <ComparatorPage />}</Route>
    <Route path="/profil">{() => <RunnerProfilePage />}</Route>
    <Route path="/a-propos">{() => <AboutPage />}</Route>
    <Route path="/admin/login">{() => <AdminLoginPage />}</Route>
    <Route path="/admin/races">{() => <AdminRacesPage />}</Route>
  </AppLayout></RouterProvider>;
}
