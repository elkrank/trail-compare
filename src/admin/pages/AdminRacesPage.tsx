import React, { useEffect, useState } from 'react';
import { createAdminRace, deleteAdminRace, patchAdminRace, updateAdminRace } from '../../api/admin-races.service';
import { getRaces } from '../../api/races.service';
import type { CreateRaceDto, CreateRaceWithGpxPayload, RaceDto, UpdateRaceWithGpxPayload } from '../../api/types';
import { getAdminSessionState, logoutAdmin, subscribeToAdminSession } from '../../auth/session';
import { AdminRaceForm } from '../components/AdminRaceForm';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { ErrorState, InlineError, LoadingState } from '../../shared/components/AsyncStates';

type RaceFieldErrors = Partial<Record<keyof CreateRaceDto, string>>;

const VALIDATION_GLOBAL_ERROR = 'Veuillez corriger les champs indiqués.';
const RACE_FIELD_NAMES = new Set<keyof CreateRaceDto>([
  'name',
  'location',
  'region',
  'date',
  'distanceKm',
  'elevationGainM',
  'terrainType',
  'technicalityLevel',
  'cutoffTimeMinutes',
  'lastFinisherTimeMinutes',
  'medianFinisherTimeMinutes',
  'aidStationsCount',
  'priceEur',
  'description',
  'tags',
  'sourceUrl',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFieldErrorMessage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toFieldErrorMessage).filter(Boolean).join(' ');
  }

  if (isRecord(value)) {
    if (typeof value.message === 'string') {
      return value.message;
    }

    if (typeof value.defaultMessage === 'string') {
      return value.defaultMessage;
    }
  }

  return undefined;
}

function collectFieldErrors(details: unknown): RaceFieldErrors {
  const fieldErrors: RaceFieldErrors = {};

  if (!isRecord(details)) {
    return fieldErrors;
  }

  for (const [key, value] of Object.entries(details)) {
    if (!RACE_FIELD_NAMES.has(key as keyof CreateRaceDto)) {
      continue;
    }

    const message = toFieldErrorMessage(value);
    if (message) {
      fieldErrors[key as keyof CreateRaceDto] = message;
    }
  }

  return fieldErrors;
}

function extractValidationFieldErrors(error: AppApiError): RaceFieldErrors | null {
  if (error.status !== 400 || !isRecord(error.details)) {
    return null;
  }

  const fieldErrors = isRecord(error.details.details)
    ? collectFieldErrors(error.details.details)
    : collectFieldErrors(error.details);

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

export function AdminRacesPage() {
  const [races, setRaces] = useState<RaceDto[]>([]);
  const [editing, setEditing] = useState<RaceDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);
  const [actionError, setActionError] = useState<AppApiError | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<RaceFieldErrors>({});
  const [editFieldErrors, setEditFieldErrors] = useState<RaceFieldErrors>({});
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAdminSessionState().isAuthenticated);

  const handleLogout = () => {
    logoutAdmin();
  };

  const load = async () => {
    if (!getAdminSessionState().isAuthenticated) {
      logoutAdmin();
      return;
    }

    setLoading(true);
    setError(null);
    try { const data = await getRaces({ page: 0, size: 100 }); setRaces(data.items); } catch (err: unknown) { setError(normalizeApiError(err)); } finally { setLoading(false); }
  };
  useEffect(() => {
    const unsubscribe = subscribeToAdminSession((state) => {
      setIsAuthenticated(state.isAuthenticated);
      if (!state.isAuthenticated) {
        logoutAdmin();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return <div className="fade-in-up"><div className="admin-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}><h1>Admin races</h1><button type="button" onClick={handleLogout}>Déconnexion</button></div>
    {actionError ? <InlineError error={actionError} /> : null}
    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={load} showAdminRelogin={error.code === 'UNAUTHORIZED'} /> : null}
    {!error ? <AdminRaceForm fieldErrors={createFieldErrors} globalError={Object.keys(createFieldErrors).length > 0 ? VALIDATION_GLOBAL_ERROR : undefined} onSubmit={async (v) => { try { setActionError(null); setCreateFieldErrors({}); await createAdminRace(v as CreateRaceWithGpxPayload); await load(); } catch (err: unknown) { const normalizedError = normalizeApiError(err); const fieldErrors = extractValidationFieldErrors(normalizedError); if (fieldErrors) { setCreateFieldErrors(fieldErrors); } else { setActionError(normalizedError); } } }} /> : null}
    {!error ? <ul className="admin-list">{races.map((race) => <li className="admin-item" key={race.id}><div><strong>{race.name}</strong><div className="muted">{race.location} • {race.date} • {race.distanceKm} km</div></div>
      <div className="admin-actions"><button onClick={async () => { try { setActionError(null); await patchAdminRace(race.id, { isCancelled: !race.isCancelled }); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }}>{race.isCancelled ? 'Réactiver' : 'Annuler'}</button>
      <button onClick={() => { setEditFieldErrors({}); setEditing(race); }}>Edit</button>
      <button onClick={async () => { try { setActionError(null); await deleteAdminRace(race.id); await load(); } catch (err: unknown) { setActionError(normalizeApiError(err)); } }}>Delete</button></div>
    </li>)}</ul> : null}
    {editing && !error ? <AdminRaceForm initial={editing} fieldErrors={editFieldErrors} globalError={Object.keys(editFieldErrors).length > 0 ? VALIDATION_GLOBAL_ERROR : undefined} onSubmit={async (v) => { try { setActionError(null); setEditFieldErrors({}); await updateAdminRace(editing.id, v as UpdateRaceWithGpxPayload); setEditing(null); await load(); } catch (err: unknown) { const normalizedError = normalizeApiError(err); const fieldErrors = extractValidationFieldErrors(normalizedError); if (fieldErrors) { setEditFieldErrors(fieldErrors); } else { setActionError(normalizedError); } } }} /> : null}
  </div>;
}
