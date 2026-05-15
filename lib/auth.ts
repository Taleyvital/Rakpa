import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type { User };

export async function signUp(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user ?? null, error: error?.message ?? null };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user ?? null, error: error?.message ?? null };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
