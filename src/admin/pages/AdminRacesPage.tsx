import React, { useEffect, useState } from 'react';
import { createAdminRace, deleteAdminRace, patchAdminRace, updateAdminRace } from '../../api/admin-races.service';
import { getRaces } from '../../api/races.service';
import type { RaceDto, UpdateRaceDto } from '../../api/types';
import { AdminRaceForm } from '../components/AdminRaceForm';

export function AdminRacesPage() {
  const [races, setRaces] = useState<RaceDto[]>([]);
  const [editing, setEditing] = useState<RaceDto | null>(null);

  const load = async () => {
    const data = await getRaces({ page: 0, size: 100 });
    setRaces(data.items);
  };
  useEffect(() => { load(); }, []);

  return <div><h1>Admin races</h1>
    <AdminRaceForm onSubmit={async (v) => { await createAdminRace(v as any); await load(); }} />
    <ul>{races.map((race) => <li key={race.id}>{race.name}
      <button onClick={async () => { await patchAdminRace(race.id, { isCancelled: !race.isCancelled }); await load(); }}>Patch</button>
      <button onClick={() => setEditing(race)}>Edit</button>
      <button onClick={async () => { await deleteAdminRace(race.id); await load(); }}>Delete</button>
    </li>)}</ul>
    {editing ? <AdminRaceForm initial={editing} onSubmit={async (v) => { await updateAdminRace(editing.id, v as UpdateRaceDto); setEditing(null); await load(); }} /> : null}
  </div>;
}
