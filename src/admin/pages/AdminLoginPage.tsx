import React, { useState } from 'react';
import { adminLogin } from '../../api/admin-auth.service';
import { setAccessToken, setRefreshToken } from '../../auth/token-storage';
import { useRouter } from '../../router/AppRouter';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { InlineError } from '../../shared/components/AsyncStates';

export function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AppApiError | null>(null);
  const { navigate } = useRouter();

  return <form className="fade-in-up" style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }} onSubmit={async (e) => { e.preventDefault(); setError(null); try { const res = await adminLogin({ username, password }); setAccessToken(res.accessToken); setRefreshToken(res.refreshToken); navigate('/admin/races'); } catch (err: unknown) { const normalized = normalizeApiError(err); if (normalized.code === 'UNAUTHORIZED') { setError(new AppApiError({ ...normalized, userMessage: 'Login invalide. Vérifiez vos identifiants admin.' })); return; } setError(normalized); } }}>
    <h1>Admin login</h1>
    <p className="muted">Connectez-vous pour gérer le catalogue des courses.</p>
    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
    <button type="submit">Se connecter</button>
    {error ? <InlineError error={error} /> : null}
  </form>;
}
