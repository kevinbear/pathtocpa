import type { Course } from "../eligibility/types";

export interface Profile {
  hasBachelorsDegree: boolean;
  /** Optional ISO date the student is aiming to be licensed by. */
  targetLicenseDate?: string;
}

export interface AppData {
  profile: Profile;
  courses: Course[];
}

export const DEFAULT_APP_DATA: AppData = {
  profile: { hasBachelorsDegree: false },
  courses: [],
};

/** Storage key namespace — bump the version suffix on breaking shape changes. */
export const STORAGE_KEY = "pathtocpa.appdata.v1";
