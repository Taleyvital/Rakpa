"use client";

import dynamic from "next/dynamic";

const MapCanvasLeaflet = dynamic(() => import("./MapCanvasLeaflet"), {
  ssr: false,
});

export default function MapCanvas({
  center,
}: {
  center?: [number, number];
}) {
  return <MapCanvasLeaflet center={center} />;
}
