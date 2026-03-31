"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export default function MapCanvasLeaflet({
  center,
}: {
  center?: [number, number];
}) {
  const initialCenter: [number, number] = center ?? [5.3599517, -4.0082563];

  return (
    // @ts-ignore - react-leaflet v5 type issue with center prop
    <MapContainer
      center={initialCenter}
      zoom={13}
      zoomControl={false}
      attributionControl={true}
      style={{ height: "100%", width: "100%" }}
    >
      {center ? <Recenter center={center} /> : null}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
    </MapContainer>
  );
}
