"use client";

import { clsx } from "clsx";
import type { CrimeCategory } from "../data/mockData";

export interface LayerVisibility {
  crimes: boolean;
  heatmap: boolean;
  resources: boolean;
  hotspots: boolean;
  barrios: boolean;
  zonas: boolean;
  comisarias: boolean;
}

interface LayerControlsProps {
  layers: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
  categoryColors: Record<CrimeCategory, string>;
}

const layerLabels: Record<keyof LayerVisibility, string> = {
  crimes: "Delitos por categoría",
  heatmap: "Densidad delictiva",
  resources: "Recursos policiales",
  hotspots: "Puntos críticos históricos",
  barrios: "Límites barriales",
  zonas: "Zonas policiales",
  comisarias: "Comisarías"
};

export function LayerControls({
  layers,
  onToggle,
  categoryColors
}: LayerControlsProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sistema de capas
        </h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-200">
          {(Object.keys(layerLabels) as (keyof LayerVisibility)[]).map((layerKey) => (
            <label
              key={layerKey}
              className={clsx(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-2 transition",
                layers[layerKey]
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
              )}
            >
              <span>{layerLabels[layerKey]}</span>
              <input
                type="checkbox"
                checked={layers[layerKey]}
                onChange={() => onToggle(layerKey)}
                className="h-4 w-4 accent-emerald-400"
              />
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Leyenda de delitos
        </h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-200">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default LayerControls;
