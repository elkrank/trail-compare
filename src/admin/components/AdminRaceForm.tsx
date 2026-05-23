import React, { useEffect, useState } from 'react';
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
  onCancel?: () => void;
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

function FieldError({ message }: { message?: string }) {
  return message ? <span className="admin-field-error" role="alert">{message}</span> : null;
}

function FormField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return <label className={['admin-form-field', className].filter(Boolean).join(' ')}>
    <span className="admin-form-label">{label}</span>
    {children}
    <FieldError message={error} />
  </label>;
}

function FormSection({
  title,
  columns = 'compact',
  children,
}: {
  title: string;
  columns?: 'compact' | 'wide' | 'single';
  children: React.ReactNode;
}) {
  return <section className="admin-form-section">
    <h4>{title}</h4>
    <div className={`admin-form-grid admin-form-grid--${columns}`}>
      {children}
    </div>
  </section>;
}

export function AdminRaceForm({ initial, onSubmit, fieldErrors = {}, globalError, onCancel }: AdminRaceFormProps) {
  const [form, setForm] = useState<RaceFormState>(() => toInitialFormState(initial));

  useEffect(() => {
    setForm(toInitialFormState(initial));
  }, [initial?.id]);

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

  return <form onSubmit={handleSubmit} className="admin-race-form">
    <div className="admin-form-heading">
      <h3>{initial ? 'Modifier la course' : 'Créer une course'}</h3>
      {globalError ? <p className="admin-global-error" role="alert">{globalError}</p> : null}
    </div>

    <FormSection title="Identité">
      <FormField label="Nom" error={fieldErrors.name}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de la course" required />
      </FormField>
      <FormField label="Lieu" error={fieldErrors.location}>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ville ou lieu" required />
      </FormField>
      <FormField label="Région" error={fieldErrors.region}>
        <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Région" required />
      </FormField>
      <FormField label="Date" error={fieldErrors.date}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
      </FormField>
    </FormSection>

    <FormSection title="Parcours">
      <FormField label="Distance (km)" error={fieldErrors.distanceKm}>
        <input type="number" min="0" step="0.1" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Dénivelé positif (m)" error={fieldErrors.elevationGainM}>
        <input type="number" min="0" value={form.elevationGainM} onChange={(e) => setForm({ ...form, elevationGainM: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Terrain" error={fieldErrors.terrainType}>
        <select value={form.terrainType} onChange={(e) => setForm({ ...form, terrainType: e.target.value as TerrainType })} required>
          {TERRAIN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </FormField>
      <FormField label="Technicité" error={fieldErrors.technicalityLevel}>
        <select value={form.technicalityLevel} onChange={(e) => setForm({ ...form, technicalityLevel: e.target.value as TechnicalityLevel })} required>
          {TECHNICALITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </FormField>
    </FormSection>

    <FormSection title="Temps et logistique" columns="wide">
      <FormField label="Temps limite (minutes)" error={fieldErrors.cutoffTimeMinutes}>
        <input type="number" min="0" value={form.cutoffTimeMinutes} onChange={(e) => setForm({ ...form, cutoffTimeMinutes: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Temps dernier finisher (minutes)" error={fieldErrors.lastFinisherTimeMinutes}>
        <input type="number" min="0" value={form.lastFinisherTimeMinutes} onChange={(e) => setForm({ ...form, lastFinisherTimeMinutes: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Temps médian finisher (minutes)" error={fieldErrors.medianFinisherTimeMinutes}>
        <input type="number" min="0" value={form.medianFinisherTimeMinutes} onChange={(e) => setForm({ ...form, medianFinisherTimeMinutes: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Ravitaillements" error={fieldErrors.aidStationsCount}>
        <input type="number" min="0" value={form.aidStationsCount} onChange={(e) => setForm({ ...form, aidStationsCount: Number(e.target.value) })} required />
      </FormField>
      <FormField label="Prix (€)" error={fieldErrors.priceEur}>
        <input type="number" min="0" step="0.01" value={form.priceEur} onChange={(e) => setForm({ ...form, priceEur: Number(e.target.value) })} required />
      </FormField>
    </FormSection>

    <FormSection title="Contenu" columns="wide">
      <FormField label="Description" error={fieldErrors.description} className="admin-form-field--full">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de la course" required rows={4} />
      </FormField>
      <FormField label="Tags" error={fieldErrors.tags}>
        <input value={form.tagsInput} onChange={(e) => setForm({ ...form, tagsInput: e.target.value })} placeholder="Ultra, Technique, Nocturne" required />
      </FormField>
      <FormField label="URL source (optionnel)" error={fieldErrors.sourceUrl}>
        <input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." />
      </FormField>
    </FormSection>

    {!initial ? <FormSection title="Fichier GPX" columns="single">
      <FormField label="Fichier GPX (optionnel)">
        <input type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={(e) => setForm({ ...form, gpxFile: e.target.files?.[0] ?? null })} />
      </FormField>
    </FormSection> : null}

    <div className="admin-form-actions">
      {onCancel ? <button type="button" className="secondary-btn" onClick={onCancel}>Annuler</button> : null}
      <button type="submit" className="primary-btn">{initial ? 'Enregistrer les modifications' : 'Créer la course'}</button>
    </div>
  </form>;
}
