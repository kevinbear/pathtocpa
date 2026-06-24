"use client";

import { useAppData } from "@/lib/data/AppDataProvider";
import type { DegreeLevel, MastersField } from "@/lib/data/types";

const selectClass =
  "rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

/**
 * Degree level + (if a master's) field. A master's in accounting, taxation, or
 * laws in taxation waives the Accounting Study requirement per the CBA flyer.
 */
export default function DegreeFields() {
  const { profile, setProfile } = useAppData();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Highest degree
        <select
          className={selectClass}
          value={profile.degreeLevel}
          onChange={(e) =>
            setProfile({ degreeLevel: e.target.value as DegreeLevel })
          }
        >
          <option value="none">None yet</option>
          <option value="bachelors">Bachelor&apos;s</option>
          <option value="masters">Master&apos;s</option>
        </select>
      </label>

      {profile.degreeLevel === "masters" && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          Master&apos;s field
          <select
            className={selectClass}
            value={profile.mastersField ?? "other"}
            onChange={(e) =>
              setProfile({ mastersField: e.target.value as MastersField })
            }
          >
            <option value="accounting">Accounting</option>
            <option value="taxation">Taxation</option>
            <option value="laws_in_taxation">Laws in Taxation</option>
            <option value="other">Other field</option>
          </select>
        </label>
      )}
    </div>
  );
}
