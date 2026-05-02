import React, { useState } from 'react';
import type { CreateRaceDto, RaceDto, UpdateRaceDto } from '../../api/types';

export function AdminRaceForm({ initial, onSubmit }: { initial?: RaceDto; onSubmit: (v: CreateRaceDto | UpdateRaceDto) => Promise<void> }) {
  const [form, setForm] = useState({ name: initial?.name ?? '', location: initial?.location ?? '', date: initial?.date ?? '', distanceKm: initial?.distanceKm ?? 0, elevationGainM: initial?.elevationGainM ?? 0 });
  return <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(form as any); }} className="grid gap-2">
    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="name" />
    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="location" />
    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
    <input type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })} />
    <input type="number" value={form.elevationGainM} onChange={(e) => setForm({ ...form, elevationGainM: Number(e.target.value) })} />
    <button type="submit">Enregistrer</button>
  </form>;
}
