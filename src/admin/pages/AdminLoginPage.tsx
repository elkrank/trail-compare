import React, { useState } from 'react';
import { adminLogin } from '../../api/admin-auth.service';
import { setAccessToken, setRefreshToken } from '../../auth/token-storage';
import { useRouter } from '../../router/AppRouter';

export function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { navigate } = useRouter();

  return <form onSubmit={async (e) => { e.preventDefault(); setError(''); try { const res = await adminLogin({ username, password }); setAccessToken(res.accessToken); setRefreshToken(res.refreshToken); navigate('/admin/races'); } catch (err: any) { setError(err?.message ?? 'Login failed'); } }}>
    <h1>Admin login</h1>
    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
    <button type="submit">Se connecter</button>
    {error ? <p>{error}</p> : null}
  </form>;
}
