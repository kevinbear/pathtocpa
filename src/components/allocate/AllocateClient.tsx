"use client";

import { useMemo, useState } from "react";
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
  type DragStartEvent,
} from "@dnd-kit/core";
import { useAppData } from "@/lib/data/AppDataProvider";
import {
  ALLOCATION_TAXONOMY,
  SUBZONE_TO_CATEGORY,
  type SubZone,
} from "@/lib/rules/allocationTaxonomy";
import { toSemesterUnits, round2 } from "@/lib/eligibility/units";
import { classifyCourse, ALLOC_CATEGORY_LABEL, type AllocCategory } from "@/lib/rules/classify";
import type { Course, CourseCategory } from "@/lib/eligibility/types";

const POOL_ID = "pool";

function semUnits(c: Course): number {
  return toSemesterUnits(c.units, c.unitType);
}
function sum(list: Course[]): number {
  return round2(list.reduce((t, c) => t + semUnits(c), 0));
}

/** Only accounting/business/ethics have a clear "type" we validate against. */
function allocCat(cat: CourseCategory): AllocCategory | undefined {
  return cat === "accounting" || cat === "business" || cat === "ethics" ? cat : undefined;
}

/** A soft "looks like X, not Y" warning if a course's guessed type ≠ the zone's. */
function mismatchWarning(course: Course, expected?: AllocCategory): string | undefined {
  if (!expected) return undefined;
  const guess = classifyCourse(course.name).category;
  if (guess && guess !== expected) {
    return `Looks like a ${ALLOC_CATEGORY_LABEL[guess]} course, not ${ALLOC_CATEGORY_LABEL[expected]}.`;
  }
  return undefined;
}

function CourseChip({
  course,
  overlay = false,
  warn,
}: {
  course: Course;
  overlay?: boolean;
  warn?: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: course.id });
  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      title={warn ?? course.name}
      className={`flex cursor-grab items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-xs shadow-sm ring-1 active:cursor-grabbing ${
        warn ? "ring-amber-300" : "ring-slate-200"
      } ${isDragging && !overlay ? "opacity-30" : ""} ${overlay ? "shadow-soft ring-brand-300" : ""}`}
    >
      {warn && <span className="text-amber-500">⚠</span>}
      <span className="max-w-[11rem] truncate text-slate-800">{course.name}</span>
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
  className = "",
  children,
}: {
  id: string;
  courses: Course[];
  expectedCategory?: AllocCategory;
  className?: string;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-2 transition-colors ${
        isOver ? "border-brand-400 bg-brand-50" : "border-slate-200"
      } ${className}`}
    >
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

/** The unused pool, grouped into "likely type" subsections. One drop target. */
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

export default function AllocateClient() {
  const { hydrated, courses, updateCourse } = useAppData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeCourse = courses.find((c) => c.id === activeId) ?? null;

  // Pool = unallocated courses (category "other"), grouped by likely type.
  const pool = useMemo(() => courses.filter((c) => c.category === "other"), [courses]);
  const poolGroups = useMemo(() => {
    const groups: Record<string, Course[]> = { accounting: [], business: [], ethics: [], other: [] };
    for (const c of pool) {
      const cat = classifyCourse(c.name).category ?? "other";
      groups[cat].push(c);
    }
    return groups;
  }, [pool]);

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const over = e.over?.id;
    if (!over) return;
    const courseId = String(e.active.id);
    const zone = String(over);
    const course = courses.find((c) => c.id === courseId);

    let targetCat: CourseCategory | null = null;
    if (zone === POOL_ID) {
      updateCourse(courseId, { category: "other", subject: undefined });
      setWarning(null);
      return;
    } else if (ALLOCATION_TAXONOMY.some((s) => s.key === zone)) {
      targetCat = zone as CourseCategory;
      updateCourse(courseId, { category: targetCat, subject: undefined });
    } else if (SUBZONE_TO_CATEGORY[zone]) {
      targetCat = SUBZONE_TO_CATEGORY[zone];
      updateCourse(courseId, { category: targetCat, subject: zone });
    }

    // Soft "type doesn't match" hint (placement still goes through).
    const warn = course && targetCat ? mismatchWarning(course, allocCat(targetCat)) : undefined;
    setWarning(
      warn && course ? `“${course.name}”: ${warn.replace(/\.$/, "")} — placed anyway; drag it back if that's wrong.` : null,
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6">
        <Link href="/eligibility/breakdown" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to breakdown
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Allocate Courses</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Drag each course into the requirement and sub-area it counts toward. Everything in the
          <span className="font-medium"> Unused pool</span> counts only toward your 150-unit total
          until you place it. Your eligibility updates live as you drag.
        </p>
      </div>

      {!hydrated ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleStart} onDragEnd={handleEnd}>
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
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Unused pool
              </h2>
              <span className="text-xs text-slate-400">{pool.length} course(s) · {sum(pool)} units</span>
            </div>
            <PoolZone groups={poolGroups} total={pool.length} />
          </div>

          {/* Requirement sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {ALLOCATION_TAXONOMY.map((section) => {
              const inSection = courses.filter((c) => c.category === section.key);
              const total = sum(inSection);
              const met = total + 1e-6 >= section.requiredUnits;
              const generalCourses = inSection.filter(
                (c) => !c.subject || !section.subzones.some((z) => z.id === c.subject),
              );
              return (
                <div key={section.key} className="card">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                    <span className={`pill ${met ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"}`}>
                      {total} / {section.requiredUnits}
                      {met && " ✓"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {section.subzones.map((zone) => {
                      const zoneCourses = courses.filter((c) => c.subject === zone.id);
                      return (
                        <DropZone
                          key={zone.id}
                          id={zone.id}
                          courses={zoneCourses}
                          expectedCategory={allocCat(SUBZONE_TO_CATEGORY[zone.id])}
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

                    {/* Courses in this section not yet sorted into a sub-area */}
                    <DropZone
                      id={section.key}
                      courses={generalCourses}
                      expectedCategory={allocCat(section.key)}
                      className="bg-slate-50/40"
                    >
                      <p className="mb-1.5 text-xs font-medium text-slate-500">
                        In {section.title} (unsorted)
                      </p>
                    </DropZone>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>{activeCourse ? <CourseChip course={activeCourse} overlay /> : null}</DragOverlay>
        </DndContext>
      )}

      <p className="mt-8 text-xs text-slate-400">
        Sub-area caps (e.g. ≤14 business, ≤3 each) are shown for guidance; the eligibility verdict
        currently counts by top-level requirement. This is a planning aid, not official advice.
      </p>
    </main>
  );
}
