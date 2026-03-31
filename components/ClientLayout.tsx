"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";
import AppShell from "./AppShell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AppShell>{children}</AppShell>
    </>
  );
}
