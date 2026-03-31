"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const items: NavItem[] = [
  { href: "/", label: "Explore", icon: "map" },
  { href: "/routes", label: "Routes", icon: "directions_transit" },
  { href: "/traffic", label: "Traffic", icon: "traffic" },
  { href: "/profile", label: "Profil", icon: "person" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2);

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-white/90 dark:bg-black/90 backdrop-blur-2xl h-20 px-8 w-full shadow-[0_-12px_32px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center h-full">
        {leftItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex flex-col items-center justify-center text-black dark:text-white scale-110 transition-all duration-300 ease-in-out"
                  : "flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out"
              }
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}

        <Link
          href="/rec"
          aria-label="Enregistrer un trajet"
          className="flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center -mt-8">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'wght' 400" }}
            >
              add
            </span>
          </div>
        </Link>

        {rightItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex flex-col items-center justify-center text-black dark:text-white scale-110 transition-all duration-300 ease-in-out"
                  : "flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out"
              }
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
