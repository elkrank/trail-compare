import React from 'react';

export function RacePagination({ page, total, pageSize, onPageChange }: { page: number; total: number; pageSize: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="flex gap-2 mt-4">
    <button disabled={page <= 0} onClick={() => onPageChange(page - 1)}>Prev</button>
    <span>Page {page + 1}/{totalPages}</span>
    <button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
  </div>;
}
