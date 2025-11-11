"use client";

import { clsx } from "clsx";
import type {
  CaseStatus,
  CrimeCategory
} from "../data/mockData";

export interface FilterState {
  from: string | null;
  to: string | null;
  categories: CrimeCategory[];
  neighborhoods: string[];
  zones: string[];
  statuses: CaseStatus[];
}

interface FiltersPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  categoryOptions: CrimeCategory[];
  neighborhoodOptions: string[];
  zoneOptions: string[];
  statusOptions: CaseStatus[];
}

const Section = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
      {title}
    </h2>
    <div className="mt-3 space-y-2 text-sm text-slate-200">{children}</div>
  </section>
);

const ToggleChip = ({
  label,
  checked,
  onToggle
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={clsx(
      "rounded-full border px-3 py-1 text-xs font-semibold transition",
      checked
        ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-200"
        : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
    )}
  >
    {label}
  </button>
);

export function FiltersPanel({
  filters,
  onChange,
  onReset,
  categoryOptions,
  neighborhoodOptions,
  zoneOptions,
  statusOptions
}: FiltersPanelProps) {
  const toggleItem = <T extends string>(
    list: T[],
    value: T
  ): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <aside className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Filtros geoespaciales
          </h1>
          <p className="text-xs text-slate-400">
            Ajusta el mapa en tiempo real según tus necesidades operativas.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          Restablecer
        </button>
      </header>

      <Section title="Fecha y hora">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
          Desde
          <input
            type="datetime-local"
            value={filters.from ?? ""}
            onChange={(event) =>
              onChange({ ...filters, from: event.target.value || null })
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
          Hasta
          <input
            type="datetime-local"
            value={filters.to ?? ""}
            onChange={(event) =>
              onChange({ ...filters, to: event.target.value || null })
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
          />
        </label>
      </Section>

      <Section title="Tipo de delito">
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <ToggleChip
              key={category}
              label={category}
              checked={filters.categories.includes(category)}
              onToggle={() =>
                onChange({
                  ...filters,
                  categories: toggleItem(filters.categories, category)
                })
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Barrio">
        <div className="flex flex-wrap gap-2">
          {neighborhoodOptions.map((neighborhood) => (
            <ToggleChip
              key={neighborhood}
              label={neighborhood}
              checked={filters.neighborhoods.includes(neighborhood)}
              onToggle={() =>
                onChange({
                  ...filters,
                  neighborhoods: toggleItem(filters.neighborhoods, neighborhood)
                })
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Zona policial">
        <div className="flex flex-wrap gap-2">
          {zoneOptions.map((zone) => (
            <ToggleChip
              key={zone}
              label={zone}
              checked={filters.zones.includes(zone)}
              onToggle={() =>
                onChange({
                  ...filters,
                  zones: toggleItem(filters.zones, zone)
                })
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Estado de caso">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <ToggleChip
              key={status}
              label={status}
              checked={filters.statuses.includes(status)}
              onToggle={() =>
                onChange({
                  ...filters,
                  statuses: toggleItem(filters.statuses, status)
                })
              }
            />
          ))}
        </div>
      </Section>
    </aside>
  );
}

export default FiltersPanel;
