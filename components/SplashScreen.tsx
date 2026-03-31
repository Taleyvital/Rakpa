"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-12">
        <div className="relative w-48 h-48 animate-pulse">
          <Image
            src="/splash-logo.png"
            alt="Rakpa"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/60 text-sm font-light">
          Développé par <span className="font-medium text-white/80">Vital Oura</span>
        </p>
        <p className="text-white/40 text-xs mt-1">Webey Agency</p>
      </div>
    </div>
  );
}
