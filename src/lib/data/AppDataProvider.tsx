"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { Course } from "../eligibility/types";
import type { Expense } from "../costs/types";
import { AppData, DEFAULT_APP_DATA, Profile, STORAGE_KEY } from "./types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

export type SyncStatus = "local" | "syncing" | "synced" | "error";

export interface AuthResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface AppDataContextValue {
  hydrated: boolean;
  profile: Profile;
  courses: Course[];
  expenses: Expense[];
  setProfile: (patch: Partial<Profile>) => void;
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, patch: Partial<Omit<Course, "id">>) => void;
  deleteCourse: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addExpenses: (expenses: Omit<Expense, "id">[]) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void;
  deleteExpense: (id: string) => void;
  clearAll: () => void;

  // --- Cloud sync (optional) ---
  cloudEnabled: boolean;
  user: User | null;
  syncStatus: SyncStatus;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** Merge stored/cloud data with defaults so missing fields never break the app. */
function normalize(parsed: Partial<AppData> | null | undefined): AppData {
  const rawProfile = (parsed?.profile ?? {}) as Record<string, unknown>;
  // Migrate legacy `hasBachelorsDegree` boolean → `degreeLevel`.
  const degreeLevel =
    (rawProfile.degreeLevel as Profile["degreeLevel"]) ??
    (rawProfile.hasBachelorsDegree ? "bachelors" : "none");
  const profile: Profile = { ...DEFAULT_APP_DATA.profile, ...rawProfile, degreeLevel };
  delete (profile as unknown as Record<string, unknown>).hasBachelorsDegree;
  return {
    profile,
    courses: Array.isArray(parsed?.courses) ? parsed!.courses! : [],
    expenses: Array.isArray(parsed?.expenses) ? parsed!.expenses! : [],
  };
}

// Per-identity localStorage keys so accounts never share a local cache.
const ANON_KEY = `${STORAGE_KEY}.anon`;
const userKey = (id: string) => `${STORAGE_KEY}.u.${id}`;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy-mode errors
  }
}
function loadLocal(key: string): AppData | null {
  const raw = safeGet(key);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Refs to coordinate cloud loading vs. saving.
  const applyingCloudRef = useRef(false);
  const readyToSaveRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Mark hydrated on mount; the identity effect below loads the right data.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // 2) Track auth session (only when Supabase is configured).
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    sb.auth.getSession().then(({ data: s }) => {
      setUser(s.session?.user ?? null);
      if (!s.session) setSyncStatus("local");
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setSyncStatus("local");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 3) Load the data for the CURRENT identity (anonymous or a specific user).
  //    Each identity has its own localStorage cache + cloud row — they never mix.
  useEffect(() => {
    if (!hydrated) return;
    readyToSaveRef.current = false;
    let cancelled = false;

    (async () => {
      if (!user) {
        // Anonymous: load the anonymous cache (migrating the legacy shared key once).
        let local = loadLocal(ANON_KEY);
        if (!local) {
          const legacy = loadLocal(STORAGE_KEY);
          if (legacy) {
            local = legacy;
            safeSet(ANON_KEY, JSON.stringify(legacy));
          }
        }
        applyingCloudRef.current = true;
        setData(local ?? DEFAULT_APP_DATA);
        setSyncStatus("local");
        readyToSaveRef.current = true;
        return;
      }

      // Logged in: the cloud row for THIS user is the source of truth.
      const sb = supabase;
      if (!sb) return;
      setSyncStatus("syncing");
      const { data: row, error } = await sb
        .from("user_data")
        .select("data")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setSyncStatus("error");
        return;
      }

      if (row && row.data) {
        applyingCloudRef.current = true;
        setData(normalize(row.data as Partial<AppData>));
        setSyncStatus("synced");
      } else {
        // Brand-new account: seed ONLY from this user's own local cache (usually
        // empty) — never from another identity's data. Then create the cloud row.
        const own = loadLocal(userKey(user.id)) ?? DEFAULT_APP_DATA;
        applyingCloudRef.current = true;
        setData(own);
        await sb.from("user_data").upsert({
          user_id: user.id,
          data: own,
          updated_at: new Date().toISOString(),
        });
        setSyncStatus("synced");
      }
      readyToSaveRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  // 4) Mirror to the CURRENT identity's localStorage key (offline cache).
  useEffect(() => {
    if (!hydrated) return;
    safeSet(user ? userKey(user.id) : ANON_KEY, JSON.stringify(data));
  }, [data, hydrated, user]);

  // 5) When logged in, debounce-save changes to the cloud.
  useEffect(() => {
    const sb = supabase;
    if (!sb || !user || !hydrated) return;
    // Skip the state change caused by adopting cloud data, and the initial load.
    if (applyingCloudRef.current) {
      applyingCloudRef.current = false;
      return;
    }
    if (!readyToSaveRef.current) return;

    setSyncStatus("syncing");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await sb.from("user_data").upsert({
        user_id: user.id,
        data: dataRef.current,
        updated_at: new Date().toISOString(),
      });
      setSyncStatus(error ? "error" : "synced");
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, user, hydrated]);

  // --- Mutations ---
  const setProfile = useCallback((patch: Partial<Profile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  }, []);

  const addCourse = useCallback((course: Omit<Course, "id">) => {
    setData((d) => ({ ...d, courses: [...d.courses, { ...course, id: newId() }] }));
  }, []);

  const updateCourse = useCallback(
    (id: string, patch: Partial<Omit<Course, "id">>) => {
      setData((d) => ({
        ...d,
        courses: d.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },
    [],
  );

  const deleteCourse = useCallback((id: string) => {
    setData((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id) }));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    setData((d) => ({ ...d, expenses: [...d.expenses, { ...expense, id: newId() }] }));
  }, []);

  const addExpenses = useCallback((expenses: Omit<Expense, "id">[]) => {
    setData((d) => ({
      ...d,
      expenses: [...d.expenses, ...expenses.map((e) => ({ ...e, id: newId() }))],
    }));
  }, []);

  const updateExpense = useCallback(
    (id: string, patch: Partial<Omit<Expense, "id">>) => {
      setData((d) => ({
        ...d,
        expenses: d.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [],
  );

  const deleteExpense = useCallback((id: string) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  }, []);

  const clearAll = useCallback(() => setData(DEFAULT_APP_DATA), []);

  // --- Auth ---
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = supabase;
    if (!sb) return { error: "Cloud sync is not configured." };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = supabase;
    if (!sb) return { error: "Cloud sync is not configured." };
    const { data: res, error } = await sb.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null, needsConfirmation: !res.session };
  }, []);

  const signOut = useCallback(async () => {
    const sb = supabase;
    if (sb) await sb.auth.signOut();
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      hydrated,
      profile: data.profile,
      courses: data.courses,
      expenses: data.expenses,
      setProfile,
      addCourse,
      updateCourse,
      deleteCourse,
      addExpense,
      addExpenses,
      updateExpense,
      deleteExpense,
      clearAll,
      cloudEnabled: isSupabaseConfigured,
      user,
      syncStatus,
      signIn,
      signUp,
      signOut,
    }),
    [
      hydrated,
      data,
      setProfile,
      addCourse,
      updateCourse,
      deleteCourse,
      addExpense,
      addExpenses,
      updateExpense,
      deleteExpense,
      clearAll,
      user,
      syncStatus,
      signIn,
      signUp,
      signOut,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an <AppDataProvider>.");
  }
  return ctx;
}
