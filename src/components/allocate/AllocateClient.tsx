"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useAppData } from "@/lib/data/AppDataProvider";
import { profileWaivesAccountingStudy } from "@/lib/data/types";
import {
  ALLOCATION_TAXONOMY,
  SUBZONE_TO_CATEGORY,
  SUBZONE_BY_ID,
  type SubZone,
} from "@/lib/rules/allocationTaxonomy";
import { toSemesterUnits, round2 } from "@/lib/eligibility/units";
import {
  classifyCourse,
  looksMismatched,
  ALLOC_CATEGORY_LABEL,
  type AllocCategory,
} from "@/lib/rules/classify";
import type { Course, CourseCategory } from "@/lib/eligibility/types";

const POOL_ID = "pool";
const SECTION_SHORT: Record<string, string> = { accounting: "Acct", business: "Bus", ethics: "Eth" };

function semUnits(c: Course): number {
  return toSemesterUnits(c.units, c.unitType);
}
function sum(list: Course[]): number {
  return round2(list.reduce((t, c) => t + semUnits(c), 0));
}
function allocCat(cat: CourseCategory): AllocCategory | undefined {
  return cat === "accounting" || cat === "business" || cat === "ethics" ? cat : undefined;
}
function mismatchWarning(course: Course, expected?: AllocCategory): string | undefined {
  if (!expected) return undefined;
  const { mismatch, guess } = looksMismatched(course.name, expected);
  if (mismatch && guess) {
    return `Looks like a ${ALLOC_CATEGORY_LABEL[guess]} course — it doesn't usually count toward ${ALLOC_CATEGORY_LABEL[expected]}.`;
  }
  return undefined;
}

/** Resolve a drop-zone id into a category/subject assignment. */
function targetFor(zone: string): { category: CourseCategory; subject?: string } | null {
  if (zone === POOL_ID) return { category: "other", subject: undefined };
  if (ALLOCATION_TAXONOMY.some((s) => s.key === zone)) return { category: zone as CourseCategory, subject: undefined };
  if (SUBZONE_TO_CATEGORY[zone]) return { category: SUBZONE_TO_CATEGORY[zone], subject: zone };
  return null;
}

interface BoardState {
  showCode: boolean;
  showSection: boolean;
  showSchool: boolean;
  selected: Set<string>;
  toggleSelect: (id: string) => void;
}
const BoardCtx = createContext<BoardState | null>(null);

function CourseChip({ course, overlay = false, warn }: { course: Course; overlay?: boolean; warn?: string }) {
  const ctx = useContext(BoardCtx);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: course.id });
  const selected = ctx?.selected.has(course.id) ?? false;
  const guess = classifyCourse(course.name).category;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      onClick={() => !overlay && ctx?.toggleSelect(course.id)}
      title={warn ?? course.name}
      className={`flex cursor-grab items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-xs shadow-sm ring-1 active:cursor-grabbing ${
        selected
          ? "bg-brand-50 ring-2 ring-brand-500"
          : warn
            ? "ring-amber-300"
            : "ring-slate-200"
      } ${isDragging && !overlay ? "opacity-30" : ""} ${overlay ? "shadow-soft ring-brand-300" : ""}`}
    >
      {selected && <span className="text-brand-600">✓</span>}
      {warn && !selected && <span className="text-amber-500">⚠</span>}
      {ctx?.showCode && course.code && (
        <span className="rounded bg-slate-100 px-1 text-[10px] font-medium text-slate-500">
          {course.code}
        </span>
      )}
      <span className="max-w-[11rem] truncate text-slate-800">{course.name}</span>
      {ctx?.showSchool && course.institution && (
        <span className="max-w-[6rem] truncate text-[10px] text-slate-400">{course.institution}</span>
      )}
      {ctx?.showSection && (
        <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500">
          {SECTION_SHORT[guess ?? ""] ?? "?"}
        </span>
      )}
      <span className="shrink-0 rounded bg-slate-100 px-1 font-medium text-slate-600">
        {round2(semUnits(course))}
      </span>
    </div>
  );
}

function DropZone({
  id,
  courses,
  expectedCategory,
  invalid = false,
  className = "",
  children,
}: {
  id: string;
  courses: Course[];
  expectedCategory?: AllocCategory;
  invalid?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const border = invalid
    ? "border-red-400 bg-red-50"
    : isOver
      ? "border-brand-400 bg-brand-50"
      : "border-slate-200";
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-2 transition-colors ${border} ${className}`}
    >
      {invalid && (
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-red-600">
          🚫 Can&apos;t drop here
        </p>
      )}
      {children}
      <div className="flex flex-wrap gap-1.5">
        {courses.map((c) => (
          <CourseChip key={c.id} course={c} warn={mismatchWarning(c, expectedCategory)} />
        ))}
        {courses.length === 0 && (
          <span className="px-1 py-0.5 text-[11px] text-slate-300">drop here</span>
        )}
      </div>
    </div>
  );
}

function PoolZone({ groups, total }: { groups: Record<string, Course[]>; total: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID });
  const order: [string, string][] = [
    ["accounting", "Likely Accounting"],
    ["business", "Likely Business-related"],
    ["ethics", "Likely Ethics"],
    ["other", "Unclassified"],
  ];
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[3rem] rounded-xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-brand-400 bg-brand-50" : "border-slate-200"
      }`}
    >
      {total === 0 && (
        <span className="text-[11px] text-slate-300">Drop a course here to un-assign it.</span>
      )}
      <div className="space-y-3">
        {order.map(([key, label]) =>
          groups[key].length > 0 ? (
            <div key={key}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label} ({groups[key].length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {groups[key].map((c) => (
                  <CourseChip key={c.id} course={c} />
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

function CapBadge({ zone, units }: { zone: SubZone; units: number }) {
  if (zone.cap !== undefined) {
    const over = units > zone.cap + 1e-6;
    return (
      <span className={`pill ${over ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
        {round2(units)} / max {zone.cap}
      </span>
    );
  }
  if (zone.min !== undefined) {
    const met = units + 1e-6 >= zone.min;
    return (
      <span className={`pill ${met ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"}`}>
        {round2(units)} / min {zone.min}
      </span>
    );
  }
  return <span className="pill bg-slate-100 text-slate-500">{round2(units)}</span>;
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active ? "bg-brand-100 text-brand-800" : "text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function AllocateClient() {
  const { hydrated, courses, profile, updateCourse } = useAppData();
  const accountingStudyWaived = profileWaivesAccountingStudy(profile);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCode, setShowCode] = useState(false);
  const [showSection, setShowSection] = useState(false);
  const [showSchool, setShowSchool] = useState(false);
  // Sections are collapsed by default; expand to work inside them.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const ALL_KEYS = useMemo(() => ["pool", ...ALLOCATION_TAXONOMY.map((s) => s.key)], []);
  const toggleExpand = (k: string) =>
    setExpanded((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const activeCourse = courses.find((c) => c.id === activeId) ?? null;

  const pool = useMemo(() => courses.filter((c) => c.category === "other"), [courses]);
  const poolGroups = useMemo(() => {
    const groups: Record<string, Course[]> = { accounting: [], business: [], ethics: [], other: [] };
    for (const c of pool) groups[classifyCourse(c.name).category ?? "other"].push(c);
    return groups;
  }, [pool]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Is moving these courses into `zone` allowed? Returns a reason if not. */
  function validateDrop(ids: string[], zone: string): { ok: boolean; reason?: string } {
    if (zone === POOL_ID) return { ok: true };
    const t = targetFor(zone);
    if (!t) return { ok: true };
    const moved = ids.map((id) => courses.find((c) => c.id === id)).filter(Boolean) as Course[];

    // Cap: a "no more than N" sub-area can't be overfilled.
    const sz = SUBZONE_BY_ID[zone];
    if (sz?.cap !== undefined) {
      const resultIds = new Set([
        ...courses.filter((c) => c.subject === zone).map((c) => c.id),
        ...moved.map((c) => c.id),
      ]);
      const resultUnits = sum(courses.filter((c) => resultIds.has(c.id)));
      if (resultUnits > sz.cap + 1e-6) {
        return {
          ok: false,
          reason: `“${sz.label}” allows no more than ${sz.cap} units — this would push it to ${round2(resultUnits)}.`,
        };
      }
    }

    // Type: a course whose subject clearly doesn't fit this requirement can't go here.
    const expected = allocCat(t.category);
    if (expected) {
      const bad = moved.filter((c) => looksMismatched(c.name, expected).mismatch);
      if (bad.length > 0) {
        const g = looksMismatched(bad[0].name, expected).guess;
        return {
          ok: false,
          reason:
            bad.length === 1
              ? `“${bad[0].name}” is a ${g ? ALLOC_CATEGORY_LABEL[g] : "different"} course — it doesn't count toward ${ALLOC_CATEGORY_LABEL[expected]}.`
              : `${bad.length} of these don't count toward ${ALLOC_CATEGORY_LABEL[expected]}.`,
        };
      }
    }
    return { ok: true };
  }

  /** Move courses (no validation — caller validates first). */
  function commitMove(ids: string[], zone: string) {
    const t = targetFor(zone);
    if (!t) return;
    ids.forEach((id) => updateCourse(id, t));
    setWarning(null);
  }

  function tryMove(ids: string[], zone: string): boolean {
    const v = validateDrop(ids, zone);
    if (!v.ok) {
      setWarning(v.reason ?? "That move isn't allowed.");
      return false;
    }
    commitMove(ids, zone);
    return true;
  }

  function handleDragOver(e: DragOverEvent) {
    const over = e.over ? String(e.over.id) : null;
    setOverId(over);
    if (!over) {
      setDropError(null);
      return;
    }
    const courseId = String(e.active.id);
    const ids =
      selected.has(courseId) && selected.size > 0
        ? Array.from(new Set([...selected, courseId]))
        : [courseId];
    const v = validateDrop(ids, over);
    setDropError(v.ok ? null : v.reason ?? null);
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    setOverId(null);
    setDropError(null);
    const over = e.over?.id;
    if (!over) return;
    const courseId = String(e.active.id);
    const usingSelection = selected.has(courseId) && selected.size > 0;
    const ids = usingSelection ? Array.from(new Set([...selected, courseId])) : [courseId];
    const ok = tryMove(ids, String(over));
    if (ok && usingSelection) setSelected(new Set());
  }

  const board: BoardState = {
    showCode,
    showSection,
    showSchool,
    selected,
    toggleSelect,
  };

  return (
    <BoardCtx.Provider value={board}>
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <Link href="/eligibility/breakdown" className="text-sm font-medium text-brand-700 hover:underline">
            ← Back to breakdown
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Allocate Courses</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Drag each course into the requirement and sub-area it counts toward. Click courses to
            select several, then drag any one to move them together. Everything in the
            <span className="font-medium"> Unused pool</span> counts only toward your 150-unit total
            until you place it.
          </p>
        </div>

        {!hydrated ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
            onDragOver={handleDragOver}
            onDragEnd={handleEnd}
            onDragCancel={() => {
              setActiveId(null);
              setOverId(null);
              setDropError(null);
            }}
          >
            {/* Toolbar: display toggles + selection actions */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Show on chips:</span>
              <ToggleBtn active={showCode} onClick={() => setShowCode((v) => !v)}>
                Code
              </ToggleBtn>
              <ToggleBtn active={showSection} onClick={() => setShowSection((v) => !v)}>
                Likely section
              </ToggleBtn>
              <ToggleBtn active={showSchool} onClick={() => setShowSchool((v) => !v)}>
                School
              </ToggleBtn>

              <span className="mx-1 h-5 w-px bg-slate-200" />
              <button
                onClick={() => setExpanded(new Set(ALL_KEYS))}
                className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Expand all
              </button>
              <button
                onClick={() => setExpanded(new Set())}
                className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Collapse all
              </button>

              <span className="mx-1 h-5 w-px bg-slate-200" />

              {selected.size > 0 ? (
                <>
                  <span className="text-xs font-medium text-brand-700">{selected.size} selected</span>
                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      if (tryMove(Array.from(selected), e.target.value)) setSelected(new Set());
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">Move selected to…</option>
                    <option value={POOL_ID}>Unused pool</option>
                    {ALLOCATION_TAXONOMY.map((s) => (
                      <optgroup key={s.key} label={s.title}>
                        <option value={s.key}>{s.title} (unsorted)</option>
                        {s.subzones.map((z) => (
                          <option key={z.id} value={z.id}>
                            — {z.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400">Tip: click courses to multi-select.</span>
              )}
            </div>

            {warning && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
                <span>⚠ {warning}</span>
                <button onClick={() => setWarning(null)} className="shrink-0 text-amber-500 hover:text-amber-700" aria-label="Dismiss">
                  ✕
                </button>
              </div>
            )}

            {/* Unused pool */}
            <div className="card mb-6">
              <button
                onClick={() => toggleExpand("pool")}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-600">
                  <span className="text-slate-400">{expanded.has("pool") ? "▾" : "▸"}</span>
                  Unused pool
                </h2>
                <span className="text-xs text-slate-400">
                  {pool.length} course(s) · {sum(pool)} units
                </span>
              </button>
              {expanded.has("pool") && (
                <div className="mt-3">
                  <PoolZone groups={poolGroups} total={pool.length} />
                </div>
              )}
            </div>

            {/* Requirement sections */}
            <div className="grid gap-6 lg:grid-cols-2">
              {ALLOCATION_TAXONOMY.map((section) => {
                const inSection = courses.filter((c) => c.category === section.key);
                const total = sum(inSection);
                const waived = section.key === "accountingStudy" && accountingStudyWaived;
                const met = waived || total + 1e-6 >= section.requiredUnits;
                const generalCourses = inSection.filter(
                  (c) => !c.subject || !section.subzones.some((z) => z.id === c.subject),
                );
                const isOpen = expanded.has(section.key);
                return (
                  <div key={section.key} className="card h-fit">
                    <button
                      onClick={() => toggleExpand(section.key)}
                      className="flex w-full items-start justify-between gap-2 text-left"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-slate-400">{isOpen ? "▾" : "▸"}</span>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                          <p className="text-xs text-slate-500">
                            {inSection.length} course{inSection.length === 1 ? "" : "s"} placed
                          </p>
                        </div>
                      </div>
                      <span className={`pill ${met ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"}`}>
                        {waived ? (
                          "Waived ✓"
                        ) : (
                          <>
                            {total} / {section.requiredUnits}
                            {met && " ✓"}
                          </>
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-3">
                        {waived && (
                          <p className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
                            ✅ Met automatically by your master&apos;s degree in accounting, taxation, or
                            laws in taxation — you don&apos;t need to allocate courses here.
                          </p>
                        )}

                        <div className="space-y-2">
                          {section.subzones.map((zone) => {
                        const zoneCourses = courses.filter((c) => c.subject === zone.id);
                        return (
                          <DropZone
                            key={zone.id}
                            id={zone.id}
                            courses={zoneCourses}
                            expectedCategory={allocCat(SUBZONE_TO_CATEGORY[zone.id])}
                            invalid={overId === zone.id && !!dropError}
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-700">{zone.label}</p>
                                {zone.examples && (
                                  <p className="truncate text-[11px] text-slate-400">{zone.examples}</p>
                                )}
                              </div>
                              <CapBadge zone={zone} units={sum(zoneCourses)} />
                            </div>
                          </DropZone>
                        );
                      })}

                      <DropZone
                        id={section.key}
                        courses={generalCourses}
                        expectedCategory={allocCat(section.key)}
                        invalid={overId === section.key && !!dropError}
                        className="bg-slate-50/40"
                      >
                        <p className="mb-1.5 text-xs font-medium text-slate-500">
                          In {section.title} (unsorted)
                        </p>
                          </DropZone>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeCourse ? (
                <div className={`relative ${dropError ? "rounded-lg ring-2 ring-red-400" : ""}`}>
                  {dropError && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1 text-xs text-oncolor shadow">
                      🚫
                    </span>
                  )}
                  {selected.has(activeCourse.id) && selected.size > 1 ? (
                    <div className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-oncolor shadow-soft">
                      {selected.size} courses
                    </div>
                  ) : (
                    <CourseChip course={activeCourse} overlay />
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Live reason while dragging onto a forbidden zone */}
        {activeId && dropError && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-oncolor shadow-soft">
            🚫 {dropError}
          </div>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Sub-area caps (e.g. ≤14 business, ≤3 each) are shown for guidance; the eligibility verdict
          currently counts by top-level requirement. This is a planning aid, not official advice.
        </p>
      </main>
    </BoardCtx.Provider>
  );
}
