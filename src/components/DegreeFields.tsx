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

  const meets150 = !!profile.hasMinTotalUnits;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
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

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          Total units so far
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="120"
            disabled={meets150}
            value={meets150 ? "" : profile.unitsCompleted ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              setProfile({
                unitsCompleted: v === "" ? undefined : Math.max(0, Math.round(Number(v))),
              });
            }}
            className={`${selectClass} w-24 disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            checked={meets150}
            onChange={(e) => setProfile({ hasMinTotalUnits: e.target.checked })}
          />
          I already have 150+ units
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Your total counts your <strong>whole transcript</strong> (general ed, electives, everything) —
        it&apos;s separate from the courses you list below, which only need to cover the
        accounting, business, and ethics subjects.
      </p>
    </div>
  );
}
