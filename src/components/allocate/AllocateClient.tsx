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
import type { Course, CourseCategory } from "@/lib/eligibility/types";

const POOL_ID = "pool";

function semUnits(c: Course): number {
  return toSemesterUnits(c.units, c.unitType);
}
function sum(list: Course[]): number {
  return round2(list.reduce((t, c) => t + semUnits(c), 0));
}

function CourseChip({ course, overlay = false }: { course: Course; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: course.id });
  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={`flex cursor-grab items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-xs shadow-sm ring-1 ring-slate-200 active:cursor-grabbing ${
        isDragging && !overlay ? "opacity-30" : ""
      } ${overlay ? "shadow-soft ring-brand-300" : ""}`}
    >
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
  className = "",
  children,
}: {
  id: string;
  courses: Course[];
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
          <CourseChip key={c.id} course={c} />
        ))}
        {courses.length === 0 && (
          <span className="px-1 py-0.5 text-[11px] text-slate-300">drop here</span>
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeCourse = courses.find((c) => c.id === activeId) ?? null;

  // Pool = unallocated courses (category "other").
  const pool = useMemo(() => courses.filter((c) => c.category === "other"), [courses]);

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    const over = e.over?.id;
    if (!over) return;
    const courseId = String(e.active.id);
    const zone = String(over);

    if (zone === POOL_ID) {
      updateCourse(courseId, { category: "other", subject: undefined });
    } else if (ALLOCATION_TAXONOMY.some((s) => s.key === zone)) {
      updateCourse(courseId, { category: zone as CourseCategory, subject: undefined });
    } else if (SUBZONE_TO_CATEGORY[zone]) {
      updateCourse(courseId, { category: SUBZONE_TO_CATEGORY[zone], subject: zone });
    }
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
          {/* Unused pool */}
          <div className="card mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Unused pool
              </h2>
              <span className="text-xs text-slate-400">{pool.length} course(s) · {sum(pool)} units</span>
            </div>
            <DropZone id={POOL_ID} courses={pool} className="min-h-[3rem]" />
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
                        <DropZone key={zone.id} id={zone.id} courses={zoneCourses}>
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
                    <DropZone id={section.key} courses={generalCourses} className="bg-slate-50/40">
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
