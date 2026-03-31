"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBottomNav = pathname !== "/rec";

  return (
    <div className="min-h-full flex flex-col">
      <div className={showBottomNav ? "flex flex-col flex-1 pb-32" : "flex flex-col flex-1"}>
        {children}
      </div>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
