"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import AjouterItineraire from "@/components/AjouterItineraire";
import AuthModal from "@/components/AuthModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const showBottomNav = pathname !== "/rec";

  const [user, setUser]               = useState<User | null>(null);
  const [showAjouter, setShowAjouter] = useState(false);
  const [showAuth, setShowAuth]       = useState(false);

  // Récupère la session au montage et écoute les changements
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function handleAddClick() {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowAjouter(true);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className={showBottomNav ? "flex flex-col flex-1 pb-32" : "flex flex-col flex-1"}>
        {children}
      </div>

      {showBottomNav && <BottomNav onAdd={handleAddClick} />}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(loggedUser) => {
            setUser(loggedUser);
            setShowAuth(false);
            setShowAjouter(true);
          }}
        />
      )}

      {showAjouter && (
        <AjouterItineraire
          userId={user?.id ?? ""}
          onClose={() => setShowAjouter(false)}
          onSuccess={(id) => {
            setShowAjouter(false);
            router.push(`/itineraires/${id}`);
          }}
        />
      )}
    </div>
  );
}
