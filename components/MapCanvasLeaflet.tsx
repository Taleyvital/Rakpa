"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function UserMarker({ position }: { position: [number, number] }) {
  const map = useMap();

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:28px;height:28px;">
            <div style="
              position:absolute;
              inset:0;
              border-radius:50%;
              background:rgba(66,133,244,0.25);
              animation:user-location-pulse 2s ease-out infinite;
            "></div>
            <div style="
              position:absolute;
              top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:14px;height:14px;
              border-radius:50%;
              background:#4285f4;
              border:2.5px solid white;
              box-shadow:0 2px 8px rgba(66,133,244,0.6);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
  }, [position, map]);

  return <Marker position={position} icon={icon} />;
}

export default function MapCanvasLeaflet({
  center,
  userPosition,
}: {
  center?: [number, number];
  userPosition?: [number, number];
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
      {center && !userPosition ? <Recenter center={center} /> : null}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {userPosition ? <UserMarker position={userPosition} /> : null}
    </MapContainer>
  );
}
