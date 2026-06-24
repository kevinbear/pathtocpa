"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Course } from "../eligibility/types";
import { AppData, DEFAULT_APP_DATA, Profile, STORAGE_KEY } from "./types";

interface AppDataContextValue {
  /** True once localStorage has been read on the client (avoids flashing stale data). */
  hydrated: boolean;
  profile: Profile;
  courses: Course[];
  setProfile: (patch: Partial<Profile>) => void;
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, patch: Partial<Omit<Course, "id">>) => void;
  deleteCourse: (id: string) => void;
  clearAll: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        setData({
          profile: { ...DEFAULT_APP_DATA.profile, ...parsed.profile },
          courses: Array.isArray(parsed.courses) ? parsed.courses : [],
        });
      }
    } catch {
      // Corrupt or unavailable storage — fall back to defaults.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after the initial load.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [data, hydrated]);

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

  const clearAll = useCallback(() => setData(DEFAULT_APP_DATA), []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      hydrated,
      profile: data.profile,
      courses: data.courses,
      setProfile,
      addCourse,
      updateCourse,
      deleteCourse,
      clearAll,
    }),
    [hydrated, data, setProfile, addCourse, updateCourse, deleteCourse, clearAll],
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
