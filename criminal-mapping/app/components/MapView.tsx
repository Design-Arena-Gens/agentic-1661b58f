"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  GeoJSON,
  LayerGroup,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import L from "leaflet";
import type { HeatLatLngTuple } from "leaflet";
import type { FeatureCollection } from "geojson";
import type {
  CriticalHotspot,
  CrimeCategory,
  CrimeRecord,
  PoliceResource,
  PolygonFeature
} from "../data/mockData";
import "leaflet.heat";

const categoryColors: Record<CrimeCategory, string> = {
  hurto: "#38bdf8",
  robo: "#f97316",
  violencia: "#f43f5e",
  vandalismo: "#a855f7",
  narcoticos: "#22c55e",
  fraude: "#facc15"
};

const hotspotColors = {
  alta: "#ef4444",
  media: "#facc15"
} as const;

const resourcePalette: Record<string, string> = {
  patrulla: "#0ea5e9",
  camara: "#ec4899",
  dron: "#10b981",
  comisaria: "#eab308"
};

const heatmapWeights: Record<CrimeCategory, number> = {
  hurto: 0.6,
  robo: 1,
  violencia: 0.9,
  vandalismo: 0.5,
  narcoticos: 0.8,
  fraude: 0.4
};

interface MapViewProps {
  crimes: CrimeRecord[];
  resources: PoliceResource[];
  stations: PoliceResource[];
  hotspots: CriticalHotspot[];
  boundaries: PolygonFeature[];
  showLayers: {
    crimes: boolean;
    heatmap: boolean;
    resources: boolean;
    hotspots: boolean;
    barrios: boolean;
    zonas: boolean;
    comisarias: boolean;
  };
}

const buildFeatureCollection = (
  features: PolygonFeature[]
): FeatureCollection => ({
  type: "FeatureCollection",
  features
});

const buildResourceIcon = (color: string, label: string) =>
  L.divIcon({
    html: `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${color};color:#0f172a;font-size:14px;font-weight:700;border:2px solid rgba(15,23,42,0.8);box-shadow:0 0 8px rgba(15,23,42,0.4)">${label}</span>`,
    className: "resource-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

const HeatLayer = ({ points }: { points: HeatLatLngTuple[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    const heat = (L as unknown as { heatLayer: (...args: unknown[]) => unknown }).heatLayer(
      points,
      {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        gradient: {
          0.2: "#22d3ee",
          0.4: "#38bdf8",
          0.6: "#fb923c",
          0.8: "#f97316",
          1: "#ef4444"
        }
      }
    );

    const layer = heat as L.Layer;
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
};

export function MapView({
  crimes,
  resources,
  stations,
  hotspots,
  boundaries,
  showLayers
}: MapViewProps) {
  const barrioCollection = useMemo(
    () =>
      buildFeatureCollection(
        boundaries.filter((feature) => feature.properties.type === "barrio")
      ),
    [boundaries]
  );

  const zonaCollection = useMemo(
    () =>
      buildFeatureCollection(
        boundaries.filter((feature) => feature.properties.type === "zona_policial")
      ),
    [boundaries]
  );

  const heatmapPoints = useMemo<HeatLatLngTuple[]>(
    () =>
      crimes.map(
        (crime) =>
          [
            crime.coordinates[0],
            crime.coordinates[1],
            heatmapWeights[crime.category] ?? 0.5
          ] as HeatLatLngTuple
      ),
    [crimes]
  );

  const resourceIcons = useMemo(
    () => ({
      patrulla: buildResourceIcon(resourcePalette.patrulla, "P"),
      camara: buildResourceIcon(resourcePalette.camara, "C"),
      dron: buildResourceIcon(resourcePalette.dron, "D"),
      comisaria: buildResourceIcon(resourcePalette.comisaria, "Co")
    }),
    []
  );

  return (
    <MapContainer
      center={[-43.257, -65.305]}
      zoom={13}
      className="h-full w-full rounded-xl border border-slate-800 shadow-lg"
      minZoom={11}
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showLayers.barrios && (
        <GeoJSON
          key="barrios"
          data={barrioCollection}
          style={() => ({
            color: "#38bdf8",
            weight: 2,
            fillColor: "rgba(56, 189, 248, 0.18)",
            fillOpacity: 0.4
          })}
        />
      )}

      {showLayers.zonas && (
        <GeoJSON
          key="zonas"
          data={zonaCollection}
          style={() => ({
            color: "#f97316",
            weight: 2,
            dashArray: "6 4",
            fillColor: "rgba(249, 115, 22, 0.12)",
            fillOpacity: 0.2
          })}
        />
      )}

      {showLayers.crimes && (
        <LayerGroup>
          {crimes.map((crime) => (
            <CircleMarker
              key={crime.id}
              center={crime.coordinates}
              pathOptions={{
                color: categoryColors[crime.category],
                fillColor: categoryColors[crime.category],
                fillOpacity: 0.85,
                weight: 1.5
              }}
              radius={10}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-sky-300">{crime.title}</p>
                  <p className="text-slate-200">{crime.description}</p>
                  <p>
                    <span className="font-semibold text-slate-400">Categoría:</span>{" "}
                    {crime.category}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Barrio:</span>{" "}
                    {crime.neighborhood}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Zona policial:</span>{" "}
                    {crime.policeZone}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Estado:</span>{" "}
                    {crime.status}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Fecha:</span>{" "}
                    {new Date(crime.occurredAt).toLocaleString("es-AR")}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}

      {showLayers.heatmap && heatmapPoints.length > 0 && (
        <HeatLayer points={heatmapPoints} />
      )}

      {showLayers.resources && (
        <LayerGroup>
          {resources.map((resource) => (
            <Marker
              key={resource.id}
              position={resource.coordinates}
              icon={resourceIcons[resource.resourceType]}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-sky-300">{resource.name}</p>
                  <p>
                    <span className="font-semibold text-slate-400">Tipo:</span>{" "}
                    {resource.resourceType}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Cobertura:</span>{" "}
                    {resource.coverage}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Estado:</span>{" "}
                    {resource.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {showLayers.comisarias && (
        <LayerGroup>
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={station.coordinates}
              icon={resourceIcons.comisaria}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-amber-300">{station.name}</p>
                  <p>
                    <span className="font-semibold text-slate-400">Cobertura:</span>{" "}
                    {station.coverage}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      )}

      {showLayers.hotspots && (
        <LayerGroup>
          {hotspots.map((spot) => (
            <CircleMarker
              key={spot.id}
              center={spot.coordinates}
              radius={14}
              pathOptions={{
                color: hotspotColors[spot.intensity],
                fillColor: hotspotColors[spot.intensity],
                fillOpacity: 0.35,
                dashArray: "6 6",
                weight: 3
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-rose-300">{spot.name}</p>
                  <p>{spot.description}</p>
                  <p>
                    <span className="font-semibold text-slate-400">Intensidad:</span>{" "}
                    {spot.intensity}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-400">Último incidente:</span>{" "}
                    {new Date(spot.lastIncident).toLocaleString("es-AR")}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      )}
    </MapContainer>
  );
}

export default MapView;
