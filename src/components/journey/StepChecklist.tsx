"use client";

import { useAppData } from "@/lib/data/AppDataProvider";
import type { StageKey } from "@/lib/journey/computeJourney";

/**
 * Tickable "what to do" checklist for a journey step's detail page. Completion is
 * persisted per task in `profile.stepTasksDone` (ids shaped `"<stepKey>:<index>"`),
 * so it follows the user across devices when cloud sync is on.
 */
export default function StepChecklist({
  stepKey,
  items,
}: {
  stepKey: StageKey;
  items: string[];
}) {
  const { hydrated, profile, setProfile } = useAppData();
  const done = new Set(profile.stepTasksDone ?? []);
  const idOf = (i: number) => `${stepKey}:${i}`;
  const doneCount = items.filter((_, i) => done.has(idOf(i))).length;

  function toggle(i: number) {
    const id = idOf(i);
    const next = new Set(profile.stepTasksDone ?? []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setProfile({ stepTasksDone: [...next] });
  }

  const allDone = hydrated && doneCount === items.length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">
          {hydrated ? (
            allDone ? (
              <span className="text-brand-700 dark:text-brand-300">All done — nice work! 🎉</span>
            ) : (
              <>
                {doneCount} of {items.length} done
              </>
            )
          ) : (
            <>&nbsp;</>
          )}
        </span>
        {hydrated && doneCount > 0 && (
          <button
            type="button"
            onClick={() => setProfile({ stepTasksDone: clearStep(profile.stepTasksDone, stepKey) })}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => {
          const isDone = hydrated && done.has(idOf(i));
          return (
            <li key={item}>
              <label
                className={`card flex cursor-pointer items-start gap-3 transition-colors ${
                  isDone ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  checked={isDone}
                  onChange={() => toggle(i)}
                />
                <span
                  className={`pt-0.5 ${
                    isDone ? "text-slate-400 line-through" : "text-slate-700"
                  }`}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Drop every task id belonging to one step (used by the Reset button). */
function clearStep(current: string[] | undefined, stepKey: StageKey): string[] {
  return (current ?? []).filter((id) => !id.startsWith(`${stepKey}:`));
}
