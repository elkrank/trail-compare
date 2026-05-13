import React, { useState } from 'react';
import { adminLogin } from '../../api/admin-auth.service';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { setAccessToken, setRefreshToken, setTokenType } from '../../auth/token-storage';
import { useRouter } from '../../router/AppRouter';
import { InlineError } from '../../shared/components/AsyncStates';

const EMPTY_FIELDS_MESSAGE = 'Veuillez remplir tous les champs.';
const LOGIN_ERROR_MESSAGES: Record<number, string> = {
  400: EMPTY_FIELDS_MESSAGE,
  401: 'Identifiants invalides.',
  429: 'Trop de tentatives de connexion. Réessayez dans une minute.',
};
const FALLBACK_LOGIN_ERROR_MESSAGE = 'Impossible de se connecter pour le moment. Réessayez plus tard.';

function buildLoginError(error: AppApiError): AppApiError {
  const userMessage = error.status ? LOGIN_ERROR_MESSAGES[error.status] : undefined;

  return new AppApiError({
    code: error.code,
    status: error.status,
    userMessage: userMessage ?? FALLBACK_LOGIN_ERROR_MESSAGE,
    technicalMessage: error.technicalMessage,
    details: error.details,
  });
}

export function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AppApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError(new AppApiError({
        code: 'BAD_REQUEST',
        status: 400,
        userMessage: EMPTY_FIELDS_MESSAGE,
        technicalMessage: 'Username and password are required.',
      }));
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminLogin({ username: username.trim(), password });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setTokenType(res.tokenType);
      navigate('/admin/races');
    } catch (err: unknown) {
      setError(buildLoginError(normalizeApiError(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return <form className="fade-in-up" style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }} onSubmit={handleSubmit}>
    <h1>Connexion administrateur</h1>
    <p className="muted">Connectez-vous pour gérer le catalogue des courses.</p>
    <label htmlFor="username">Nom d’utilisateur</label>
    <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" disabled={isLoading} />
    <label htmlFor="password">Mot de passe</label>
    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" disabled={isLoading} />
    <button type="submit" disabled={isLoading}>{isLoading ? 'Connexion...' : 'Se connecter'}</button>
    {error ? <InlineError error={error} /> : null}
  </form>;
}
