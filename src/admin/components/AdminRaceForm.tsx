import React, { useState } from 'react';
import type { CreateRaceDto, CreateRaceWithGpxPayload, RaceDto, TechnicalityLevel, TerrainType, UpdateRaceDto } from '../../api/types';

const TERRAIN_OPTIONS: Array<{ value: TerrainType; label: string }> = [
  { value: 'MOUNTAIN', label: 'Montagne' },
  { value: 'FOREST', label: 'Forêt' },
  { value: 'MIXED', label: 'Mixte' },
  { value: 'ROAD', label: 'Route' },
  { value: 'DESERT', label: 'Désert' },
];

const TECHNICALITY_OPTIONS: Array<{ value: TechnicalityLevel; label: string }> = [
  { value: 'EASY', label: 'Facile' },
  { value: 'MODERATE', label: 'Modérée' },
  { value: 'HARD', label: 'Difficile' },
  { value: 'EXTREME', label: 'Extrême' },
];

interface RaceFormState {
  name: string;
  location: string;
  region: string;
  date: string;
  distanceKm: number;
  elevationGainM: number;
  terrainType: TerrainType;
  technicalityLevel: TechnicalityLevel;
  cutoffTimeMinutes: number;
  lastFinisherTimeMinutes: number;
  medianFinisherTimeMinutes: number;
  aidStationsCount: number;
  priceEur: number;
  description: string;
  tagsInput: string;
  sourceUrl: string;
  gpxFile: File | null;
}

interface AdminRaceFormProps {
  initial?: RaceDto;
  onSubmit: (v: CreateRaceWithGpxPayload | UpdateRaceDto) => Promise<void>;
  fieldErrors?: Partial<Record<keyof CreateRaceDto, string>>;
  globalError?: string;
}

const toInitialFormState = (initial?: RaceDto): RaceFormState => ({
  name: initial?.name ?? '',
  location: initial?.location ?? '',
  region: initial?.region ?? '',
  date: initial?.date ?? '',
  distanceKm: initial?.distanceKm ?? 0,
  elevationGainM: initial?.elevationGainM ?? 0,
  terrainType: initial?.terrainType ?? 'MIXED',
  technicalityLevel: initial?.technicalityLevel ?? 'MODERATE',
  cutoffTimeMinutes: initial?.cutoffTimeMinutes ?? 0,
  lastFinisherTimeMinutes: initial?.lastFinisherTimeMinutes ?? 0,
  medianFinisherTimeMinutes: initial?.medianFinisherTimeMinutes ?? 0,
  aidStationsCount: initial?.aidStationsCount ?? 0,
  priceEur: initial?.priceEur ?? 0,
  description: initial?.description ?? '',
  tagsInput: initial?.tags?.join(', ') ?? '',
  sourceUrl: initial?.sourceUrl ?? '',
  gpxFile: null,
});

const parseTags = (value: string) => value.split(',').map((tag) => tag.trim()).filter(Boolean);

const fieldErrorStyle: React.CSSProperties = {
  color: '#b91c1c',
  fontSize: '0.85rem',
  marginTop: '0.25rem',
};

const globalErrorStyle: React.CSSProperties = {
  color: '#b91c1c',
  fontWeight: 700,
  margin: 0,
};

function FieldError({ message }: { message?: string }) {
  return message ? <span style={fieldErrorStyle} role="alert">{message}</span> : null;
}

export function AdminRaceForm({ initial, onSubmit, fieldErrors = {}, globalError }: AdminRaceFormProps) {
  const [form, setForm] = useState<RaceFormState>(() => toInitialFormState(initial));

  const buildPayload = (): CreateRaceWithGpxPayload => {
    const payload: CreateRaceWithGpxPayload = {
      name: form.name,
      location: form.location,
      region: form.region,
      date: form.date as CreateRaceDto['date'],
      distanceKm: Number(form.distanceKm),
      elevationGainM: Number(form.elevationGainM),
      terrainType: form.terrainType,
      technicalityLevel: form.technicalityLevel,
      cutoffTimeMinutes: Number(form.cutoffTimeMinutes),
      lastFinisherTimeMinutes: Number(form.lastFinisherTimeMinutes),
      medianFinisherTimeMinutes: Number(form.medianFinisherTimeMinutes),
      aidStationsCount: Number(form.aidStationsCount),
      priceEur: Number(form.priceEur),
      description: form.description,
      tags: parseTags(form.tagsInput),
    };

    const sourceUrl = form.sourceUrl.trim();
    if (sourceUrl) {
      payload.sourceUrl = sourceUrl;
    }

    if (!initial && form.gpxFile) {
      payload.gpxFile = form.gpxFile;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await onSubmit(buildPayload());
  };

  return <form onSubmit={handleSubmit} className="state-card fade-in-up" style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
    <h3 style={{ marginBottom: 0 }}>{initial ? 'Modifier la course' : 'Créer une course'}</h3>
    {globalError ? <p style={globalErrorStyle} role="alert">{globalError}</p> : null}
    <label>Nom<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de la course" required /><FieldError message={fieldErrors.name} /></label>
    <label>Lieu<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ville ou lieu" required /><FieldError message={fieldErrors.location} /></label>
    <label>Région<input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Région" required /><FieldError message={fieldErrors.region} /></label>
    <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /><FieldError message={fieldErrors.date} /></label>
    <label>Distance (km)<input type="number" min="0" step="0.1" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })} required /><FieldError message={fieldErrors.distanceKm} /></label>
    <label>Dénivelé positif (m)<input type="number" min="0" value={form.elevationGainM} onChange={(e) => setForm({ ...form, elevationGainM: Number(e.target.value) })} required /><FieldError message={fieldErrors.elevationGainM} /></label>
    <label>Terrain<select value={form.terrainType} onChange={(e) => setForm({ ...form, terrainType: e.target.value as TerrainType })} required>
      {TERRAIN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select><FieldError message={fieldErrors.terrainType} /></label>
    <label>Technicité<select value={form.technicalityLevel} onChange={(e) => setForm({ ...form, technicalityLevel: e.target.value as TechnicalityLevel })} required>
      {TECHNICALITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select><FieldError message={fieldErrors.technicalityLevel} /></label>
    <label>Temps limite (minutes)<input type="number" min="0" value={form.cutoffTimeMinutes} onChange={(e) => setForm({ ...form, cutoffTimeMinutes: Number(e.target.value) })} required /><FieldError message={fieldErrors.cutoffTimeMinutes} /></label>
    <label>Temps dernier finisher (minutes)<input type="number" min="0" value={form.lastFinisherTimeMinutes} onChange={(e) => setForm({ ...form, lastFinisherTimeMinutes: Number(e.target.value) })} required /><FieldError message={fieldErrors.lastFinisherTimeMinutes} /></label>
    <label>Temps médian finisher (minutes)<input type="number" min="0" value={form.medianFinisherTimeMinutes} onChange={(e) => setForm({ ...form, medianFinisherTimeMinutes: Number(e.target.value) })} required /><FieldError message={fieldErrors.medianFinisherTimeMinutes} /></label>
    <label>Nombre de ravitaillements<input type="number" min="0" value={form.aidStationsCount} onChange={(e) => setForm({ ...form, aidStationsCount: Number(e.target.value) })} required /><FieldError message={fieldErrors.aidStationsCount} /></label>
    <label>Prix (€)<input type="number" min="0" step="0.01" value={form.priceEur} onChange={(e) => setForm({ ...form, priceEur: Number(e.target.value) })} required /><FieldError message={fieldErrors.priceEur} /></label>
    <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de la course" required /><FieldError message={fieldErrors.description} /></label>
    <label>Tags<input value={form.tagsInput} onChange={(e) => setForm({ ...form, tagsInput: e.target.value })} placeholder="Ultra, Technique, Nocturne" required /><FieldError message={fieldErrors.tags} /></label>
    <label>URL source (optionnel)<input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." /><FieldError message={fieldErrors.sourceUrl} /></label>
    {!initial ? <label>Fichier GPX (optionnel)<input type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={(e) => setForm({ ...form, gpxFile: e.target.files?.[0] ?? null })} /></label> : null}
    <button type="submit">Enregistrer</button>
  </form>;
}
