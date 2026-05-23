import React, { useEffect, useState } from 'react';
import { createAdminRace, deleteAdminRace, patchAdminRace, updateAdminRace } from '../../api/admin-races.service';
import { getRaces } from '../../api/races.service';
import type { CreateRaceDto, CreateRaceWithGpxPayload, RaceDto, UpdateRaceDto } from '../../api/types';
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

const getRaceCountLabel = (count: number) => `${count} course${count > 1 ? 's' : ''}`;

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
    try {
      const data = await getRaces({ page: 0, size: 100 });
      setRaces(data.items);
    } catch (err: unknown) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
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

  return <div className="admin-races-page fade-in-up">
    <header className="admin-page-header">
      <div>
        <p className="admin-eyebrow">Administration</p>
        <h1>Courses</h1>
        <p className="muted">{getRaceCountLabel(races.length)} dans le catalogue</p>
      </div>
      <button type="button" className="secondary-btn" onClick={handleLogout}>Déconnexion</button>
    </header>

    {actionError ? <InlineError error={actionError} /> : null}
    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={load} showAdminRelogin={error.code === 'UNAUTHORIZED'} /> : null}

    {!error ? <div className={`admin-races-layout ${editing ? 'has-edit-panel' : ''}`}>
      <section className="admin-panel admin-create-panel">
        <AdminRaceForm
          fieldErrors={createFieldErrors}
          globalError={Object.keys(createFieldErrors).length > 0 ? VALIDATION_GLOBAL_ERROR : undefined}
          onSubmit={async (v) => {
            try {
              setActionError(null);
              setCreateFieldErrors({});
              await createAdminRace(v as CreateRaceWithGpxPayload);
              await load();
            } catch (err: unknown) {
              const normalizedError = normalizeApiError(err);
              const fieldErrors = extractValidationFieldErrors(normalizedError);
              if (fieldErrors) {
                setCreateFieldErrors(fieldErrors);
              } else {
                setActionError(normalizedError);
              }
            }
          }}
        />
      </section>

      <section className="admin-panel admin-list-panel" aria-labelledby="admin-list-title">
        <div className="admin-panel-heading admin-list-heading">
          <div>
            <p className="admin-eyebrow">Catalogue</p>
            <h2 id="admin-list-title">Courses enregistrées</h2>
          </div>
          <span className="admin-count-badge">{getRaceCountLabel(races.length)}</span>
        </div>

        {races.length > 0 ? <ul className="admin-race-list">
          {races.map((race) => <li className={`admin-race-item ${editing?.id === race.id ? 'is-selected' : ''}`} key={race.id}>
            <div className="admin-race-summary">
              <div>
                <strong>{race.name}</strong>
                <div className="admin-race-meta">
                  <span>{race.location}</span>
                  <span>{race.date}</span>
                  <span>{race.distanceKm} km</span>
                </div>
              </div>
              <span className={`admin-status-badge ${race.isCancelled ? 'is-cancelled' : 'is-active'}`}>
                {race.isCancelled ? 'Annulée' : 'Active'}
              </span>
            </div>
            <div className="admin-race-actions">
              <button
                type="button"
                className={race.isCancelled ? 'secondary-btn' : 'admin-warning-button'}
                onClick={async () => {
                  try {
                    setActionError(null);
                    await patchAdminRace(race.id, { isCancelled: !race.isCancelled });
                    await load();
                  } catch (err: unknown) {
                    setActionError(normalizeApiError(err));
                  }
                }}
              >
                {race.isCancelled ? 'Réactiver' : 'Annuler'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setEditFieldErrors({});
                  setEditing(race);
                }}
              >
                Modifier
              </button>
              <button
                type="button"
                className="admin-danger-button"
                onClick={async () => {
                  try {
                    setActionError(null);
                    await deleteAdminRace(race.id);
                    if (editing?.id === race.id) {
                      setEditing(null);
                    }
                    await load();
                  } catch (err: unknown) {
                    setActionError(normalizeApiError(err));
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </li>)}
        </ul> : <div className="admin-empty-state">
          <p>Aucune course enregistrée.</p>
        </div>}
      </section>

      {editing ? <aside className="admin-panel admin-edit-panel" aria-labelledby="admin-edit-title">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-eyebrow">Modification</p>
            <h2 id="admin-edit-title">{editing.name}</h2>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setEditFieldErrors({});
              setEditing(null);
            }}
          >
            Fermer
          </button>
        </div>
        <AdminRaceForm
          initial={editing}
          fieldErrors={editFieldErrors}
          globalError={Object.keys(editFieldErrors).length > 0 ? VALIDATION_GLOBAL_ERROR : undefined}
          onCancel={() => {
            setEditFieldErrors({});
            setEditing(null);
          }}
          onSubmit={async (v) => {
            try {
              setActionError(null);
              setEditFieldErrors({});
              await updateAdminRace(editing.id, v as UpdateRaceDto);
              setEditing(null);
              await load();
            } catch (err: unknown) {
              const normalizedError = normalizeApiError(err);
              const fieldErrors = extractValidationFieldErrors(normalizedError);
              if (fieldErrors) {
                setEditFieldErrors(fieldErrors);
              } else {
                setActionError(normalizedError);
              }
            }
          }}
        />
      </aside> : null}
    </div> : null}
  </div>;
}
