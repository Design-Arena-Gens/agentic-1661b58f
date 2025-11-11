"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  crimeRecords,
  policeResources,
  policeStations,
  criticalHotspots,
  trelewBoundaries,
  type CaseStatus,
  type CrimeCategory
} from "./data/mockData";
import { FiltersPanel, type FilterState } from "./components/FiltersPanel";
import { LayerControls, type LayerVisibility } from "./components/LayerControls";

const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false
});

const initialFilters: FilterState = {
  from: null,
  to: null,
  categories: [],
  neighborhoods: [],
  zones: [],
  statuses: []
};

const initialLayers: LayerVisibility = {
  crimes: true,
  heatmap: true,
  resources: true,
  hotspots: true,
  barrios: true,
  zonas: false,
  comisarias: true
};

const categoryColors: Record<CrimeCategory, string> = {
  hurto: "#38bdf8",
  robo: "#f97316",
  violencia: "#f43f5e",
  vandalismo: "#a855f7",
  narcoticos: "#22c55e",
  fraude: "#facc15"
};

export default function Page() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [layers, setLayers] = useState<LayerVisibility>(initialLayers);

  const neighborhoodOptions = useMemo(
    () =>
      Array.from(new Set(crimeRecords.map((crime) => crime.neighborhood))).sort(),
    []
  );

  const zoneOptions = useMemo(
    () => Array.from(new Set(crimeRecords.map((crime) => crime.policeZone))).sort(),
    []
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(crimeRecords.map((crime) => crime.status))).sort(),
    []
  ) as CaseStatus[];

  const categoryOptions = useMemo(
    () => Array.from(new Set(crimeRecords.map((crime) => crime.category))).sort(),
    []
  ) as CrimeCategory[];

  const filteredCrimes = useMemo(() => {
    const fromTime = filters.from ? new Date(filters.from).getTime() : null;
    const toTime = filters.to ? new Date(filters.to).getTime() : null;

    return crimeRecords.filter((crime) => {
      const crimeTime = new Date(crime.occurredAt).getTime();

      if (fromTime && crimeTime < fromTime) {
        return false;
      }

      if (toTime && crimeTime > toTime) {
        return false;
      }

      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(crime.category)
      ) {
        return false;
      }

      if (
        filters.neighborhoods.length > 0 &&
        !filters.neighborhoods.includes(crime.neighborhood)
      ) {
        return false;
      }

      if (filters.zones.length > 0 && !filters.zones.includes(crime.policeZone)) {
        return false;
      }

      if (filters.statuses.length > 0 && !filters.statuses.includes(crime.status)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const summary = useMemo(() => {
    const total = filteredCrimes.length;
    const byStatus = filteredCrimes.reduce<Record<CaseStatus, number>>(
      (acc, crime) => {
        acc[crime.status] = (acc[crime.status] ?? 0) + 1;
        return acc;
      },
      {
        abierto: 0,
        investigacion: 0,
        cerrado: 0
      }
    );

    const byCategory = filteredCrimes.reduce<Record<CrimeCategory, number>>(
      (acc, crime) => {
        acc[crime.category] = (acc[crime.category] ?? 0) + 1;
        return acc;
      },
      {
        hurto: 0,
        robo: 0,
        violencia: 0,
        vandalismo: 0,
        narcoticos: 0,
        fraude: 0
      }
    );

    return { total, byStatus, byCategory };
  }, [filteredCrimes]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Observatorio Criminalístico Trelew
        </p>
        <h1 className="text-2xl font-semibold text-slate-100 md:text-3xl">
          Módulo de mapeo criminalístico 2D
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Visualiza incidentes, recursos policiales y puntos críticos con capas
          inteligentes y filtros geoespaciales en tiempo real.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Incidentes filtrados
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {summary.total}
          </p>
          <p className="text-xs text-slate-500">
            Delitos coincidentes con los criterios actuales.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Estados
          </p>
          <div className="mt-2 space-y-1 text-sm text-slate-200">
            <p>
              Abiertos: <span className="text-emerald-300">{summary.byStatus.abierto}</span>
            </p>
            <p>
              Investigación: <span className="text-sky-300">{summary.byStatus.investigacion}</span>
            </p>
            <p>
              Cerrados: <span className="text-rose-300">{summary.byStatus.cerrado}</span>
            </p>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Categorías destacadas
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {Object.entries(summary.byCategory)
              .filter(([, count]) => count > 0)
              .slice(0, 4)
              .map(([category, count]) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-slate-300"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: categoryColors[category as CrimeCategory] }}
                  />
                  <span className="capitalize">{category}</span>
                  <strong>{count}</strong>
                </span>
              ))}
            {Object.values(summary.byCategory).every((count) => count === 0) && (
              <span className="text-slate-500">
                Ajusta los filtros para ver la distribución por categoría.
              </span>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialFilters)}
          categoryOptions={categoryOptions}
          neighborhoodOptions={neighborhoodOptions}
          zoneOptions={zoneOptions}
          statusOptions={statusOptions}
        />
        <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <LayerControls
            layers={layers}
            onToggle={(layer) =>
              setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
            }
            categoryColors={categoryColors}
          />
          <div className="min-h-[600px] rounded-3xl border border-slate-900 bg-slate-900/50 p-2">
            <MapView
              crimes={filteredCrimes}
              resources={policeResources}
              stations={policeStations}
              hotspots={criticalHotspots}
              boundaries={trelewBoundaries}
              showLayers={layers}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
