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
      <nav
        className="relative flex items-center px-5 py-3 rounded-[1.6rem] overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(48px) saturate(200%) brightness(1.1)",
          WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.1)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.14),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1.5px 0 rgba(255, 255, 255, 0.75),
            inset 0 -1px 0 rgba(255, 255, 255, 0.2),
            inset 1px 0 0 rgba(255, 255, 255, 0.35),
            inset -1px 0 0 rgba(255, 255, 255, 0.15)
          `,
        }}
      >
        {/* Reflet spéculaire haut */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 rounded-t-[1.6rem]"
          style={{
            height: "45%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        {leftItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative z-10 flex flex-col items-center justify-center w-16 gap-0.5 transition-all duration-200"
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

        {/* Bouton central — liquid glass aussi */}
        <button
          type="button"
          aria-label="Ajouter un itinéraire"
          onClick={onAdd}
          className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mx-3 active:scale-90 transition-transform overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.22)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.55)",
            boxShadow: `
              0 6px 20px rgba(0, 0, 0, 0.18),
              inset 0 1.5px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(255, 255, 255, 0.2)
            `,
          }}
        >
          {/* Reflet interne du bouton */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 rounded-t-full"
            style={{
              height: "50%",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <span
            className="material-symbols-outlined text-[26px] relative z-10"
            style={{
              color: "var(--foreground)",
              fontVariationSettings: "'FILL' 1, 'wght' 400",
            }}
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
              className="relative z-10 flex flex-col items-center justify-center w-16 gap-0.5 transition-all duration-200"
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
  );
}
