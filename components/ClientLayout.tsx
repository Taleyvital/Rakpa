"use client";

import { useState } from "react";
import SplashScreen from "./SplashScreen";
import AppShell from "./AppShell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AppShell>{children}</AppShell>
    </>
  );
}
