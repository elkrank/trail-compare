import React from 'react';
import { AppApiError } from '../../api/errors';
import { Link } from '../../router/AppRouter';

export function LoadingState({ message = 'Chargement en cours...' }: { message?: string }) {
  return <div className="state-card fade-in-up"><p>{message}</p><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>;
}

export function EmptyState({ message = 'Aucune donnée disponible.' }: { message?: string }) {
  return <div className="state-card fade-in-up"><p style={{ fontSize: '1.6rem', margin: 0 }}>🧭</p><p className="muted">{message}</p></div>;
}

export function InlineError({ error, onRetry }: { error: AppApiError; onRetry?: () => void }) {
  return <div className="state-card state-error fade-in-up"><p>{error.userMessage}</p>{onRetry ? <button onClick={onRetry}>Réessayer</button> : null}</div>;
}

export function ErrorState({ error, onRetry, showBackToList, showAdminRelogin }: {
  error: AppApiError; onRetry?: () => void; showBackToList?: boolean; showAdminRelogin?: boolean;
}) {
  return <div className="state-card state-error fade-in-up"><p>{error.userMessage}</p>
    {onRetry ? <button onClick={onRetry}>Réessayer</button> : null}
    {showBackToList ? <p><Link className="cta-link" to="/races">Retour à la liste</Link></p> : null}
    {showAdminRelogin ? <p><Link className="cta-link" to="/admin/login">Se reconnecter (admin)</Link></p> : null}
  </div>;
}
