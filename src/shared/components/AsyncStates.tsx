import React from 'react';
import { AppApiError } from '../../api/errors';
import { Link } from '../../router/AppRouter';

export function LoadingState({ message = 'Chargement en cours...' }: { message?: string }) {
  return <p>{message}</p>;
}

export function EmptyState({ message = 'Aucune donnée disponible.' }: { message?: string }) {
  return <p>{message}</p>;
}

export function InlineError({ error, onRetry }: { error: AppApiError; onRetry?: () => void }) {
  return (
    <div>
      <p>{error.userMessage}</p>
      {onRetry ? <button onClick={onRetry}>Réessayer</button> : null}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  showBackToList,
  showAdminRelogin,
}: {
  error: AppApiError;
  onRetry?: () => void;
  showBackToList?: boolean;
  showAdminRelogin?: boolean;
}) {
  return (
    <div>
      <p>{error.userMessage}</p>
      {onRetry ? <button onClick={onRetry}>Réessayer</button> : null}
      {showBackToList ? <p><Link to="/races">Retour à la liste</Link></p> : null}
      {showAdminRelogin ? <p><Link to="/admin/login">Se reconnecter (admin)</Link></p> : null}
    </div>
  );
}
