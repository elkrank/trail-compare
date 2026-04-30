export function formatDate(date) { return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" }).format(new Date(date)); }
export function formatDuration(totalMinutes) { const h = Math.floor(totalMinutes / 60); const m = totalMinutes % 60; return `${h}h${String(m).padStart(2, "0")}`; }
export function formatPace(totalMinutes, distanceKm) { const pace = totalMinutes / distanceKm; const min = Math.floor(pace); const sec = Math.round((pace - min) * 60); return sec === 60 ? `${min + 1}’00/km` : `${min}’${String(sec).padStart(2, "0")}/km`; }
