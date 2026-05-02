import React, { useEffect, useState } from 'react';
import { createAdminRace, deleteAdminRace, patchAdminRace, updateAdminRace } from '../../api/admin-races.service';
import { getRaces } from '../../api/races.service';
import type { RaceDto, UpdateRaceDto } from '../../api/types';
import { AdminRaceForm } from '../components/AdminRaceForm';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { ErrorState, InlineError, LoadingState } from '../../shared/components/AsyncStates';

export function AdminRacesPage() {
  const [races, setRaces] = useState<RaceDto[]>([]);
  const [editing, setEditing] = useState<RaceDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);
  const [actionError, setActionError] = useState<AppApiError | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRaces({ page: 0, size: 100 });
      setRaces(data.items);
    } catch (err: unknown) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  return <div><h1>Admin races</h1>
    {actionError ? <InlineError error={actionError} /> : null}
    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={load} showAdminRelogin={error.code === 'UNAUTHORIZED'} /> : null}
    {!error ? <AdminRaceForm onSubmit={async (v) => { try { setActionError(null); await createAdminRace(v as any); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }} /> : null}
    {!error ? <ul>{races.map((race) => <li key={race.id}>{race.name}
      <button onClick={async () => { try { setActionError(null); await patchAdminRace(race.id, { isCancelled: !race.isCancelled }); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }}>Patch</button>
      <button onClick={() => setEditing(race)}>Edit</button>
      <button onClick={async () => { try { setActionError(null); await deleteAdminRace(race.id); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }}>Delete</button>
    </li>)}</ul> : null}
    {editing && !error ? <AdminRaceForm initial={editing} onSubmit={async (v) => { try { setActionError(null); await updateAdminRace(editing.id, v as UpdateRaceDto); setEditing(null); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }} /> : null}
  </div>;
}
