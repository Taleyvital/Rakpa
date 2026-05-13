"use client";

import dynamic from "next/dynamic";

const MapCanvasLeaflet = dynamic(() => import("./MapCanvasLeaflet"), {
  ssr: false,
});

export default function MapCanvas({
  center,
  userPosition,
}: {
  center?: [number, number];
  userPosition?: [number, number];
}) {
  return <MapCanvasLeaflet center={center} userPosition={userPosition} />;
}
