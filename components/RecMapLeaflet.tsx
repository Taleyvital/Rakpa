"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

function FollowMarker({ position }: { position: [number, number] }) {
  const map = useMap();

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:28px;height:28px;">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:rgba(239,68,68,0.25);
              animation:user-location-pulse 2s ease-out infinite;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:14px;height:14px;border-radius:50%;
              background:#ef4444;border:2.5px solid white;
              box-shadow:0 2px 8px rgba(239,68,68,0.6);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 16), { animate: true });
  }, [position, map]);

  return <Marker position={position} icon={icon} />;
}

export default function RecMapLeaflet({
  userPosition,
  track,
}: {
  userPosition?: [number, number];
  track: [number, number][];
}) {
  const initialCenter: [number, number] = userPosition ?? [5.3599517, -4.0082563];

  return (
    // @ts-ignore
    <MapContainer
      center={initialCenter}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      {track.length > 1 && (
        <Polyline
          positions={track}
          pathOptions={{ color: "#ef4444", weight: 4, opacity: 0.9 }}
        />
      )}
      {userPosition && <FollowMarker position={userPosition} />}
    </MapContainer>
  );
}
