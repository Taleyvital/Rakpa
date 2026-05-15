"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const leftItems: NavItem[] = [
  { href: "/", label: "Explore", icon: "map" },
  { href: "/routes", label: "Routes", icon: "directions_transit" },
];

const rightItems: NavItem[] = [
  { href: "/traffic", label: "Traffic", icon: "traffic" },
  { href: "/profile", label: "Profil", icon: "person" },
];

interface Props {
  onAdd?: () => void;
}

export default function BottomNav({ onAdd }: Props) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      {/* Bordure pointillée extérieure */}
      <div className="rounded-[2rem] p-[6px] border-2 border-dashed border-outline-variant">
        {/* Pill nav */}
        <nav className="flex items-center px-5 py-3 rounded-[1.6rem] bg-surface-container-lowest/90 dark:bg-surface-container/90 backdrop-blur-md shadow-lg">
          {leftItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-16 gap-0.5 transition-all duration-200"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    color: active ? "var(--foreground)" : "var(--outline)",
                    fontVariationSettings: active
                      ? "'FILL' 1, 'wght' 400"
                      : "'FILL' 0, 'wght' 200",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] tracking-wide"
                  style={{
                    color: active ? "var(--foreground)" : "var(--outline)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Bouton central */}
          <button
            type="button"
            aria-label="Ajouter un itinéraire"
            onClick={onAdd}
            className="w-14 h-14 rounded-full flex items-center justify-center mx-3 shadow-xl active:scale-90 transition-transform bg-primary"
          >
            <span
              className="material-symbols-outlined text-[28px] text-surface"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              add
            </span>
          </button>

          {rightItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-16 gap-0.5 transition-all duration-200"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    color: active ? "var(--foreground)" : "var(--outline)",
                    fontVariationSettings: active
                      ? "'FILL' 1, 'wght' 400"
                      : "'FILL' 0, 'wght' 200",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] tracking-wide"
                  style={{
                    color: active ? "var(--foreground)" : "var(--outline)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
