"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppData } from "@/lib/data/AppDataProvider";
import { orderedExamSlots } from "@/lib/journey/computeJourney";
import type { ExamSection } from "@/lib/data/types";

function SortableRow({
  id,
  label,
  index,
  passed,
  onToggle,
}: {
  id: ExamSection;
  label: string;
  index: number;
  passed: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 ${
        isDragging ? "border-brand-300 shadow-soft" : "border-slate-200"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${label}`}
        className="cursor-grab touch-none px-1 text-base leading-none text-slate-400 hover:text-brand-600 active:cursor-grabbing"
      >
        ⠿
      </button>
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-slate-400">
        {index + 1}
      </span>
      <label className="flex flex-1 items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          checked={passed}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className={passed ? "text-slate-400 line-through" : ""}>{label}</span>
      </label>
    </li>
  );
}

/** Drag-and-drop (and keyboard) reorderable list of the 4 exam sections. */
export default function ExamOrderList() {
  const { profile, setProfile } = useAppData();
  const ordered = orderedExamSlots(profile.examOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const keys = ordered.map((s) => s.key);
    const from = keys.indexOf(active.id as ExamSection);
    const to = keys.indexOf(over.id as ExamSection);
    if (from < 0 || to < 0) return;
    setProfile({ examOrder: arrayMove(keys, from, to) });
  }

  function toggle(section: ExamSection, checked: boolean) {
    const set = new Set(profile.examSectionsPassed);
    if (checked) set.add(section);
    else set.delete(section);
    setProfile({ examSectionsPassed: Array.from(set) });
  }

  return (
    <>
      <p className="mt-3 text-xs font-medium text-slate-500">
        Your planned order — drag the <span aria-hidden>⠿</span> handle to rearrange, and check each
        section as you pass it.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <ol className="mt-2 space-y-2">
            {ordered.map((slot, i) => (
              <SortableRow
                key={slot.key}
                id={slot.key}
                label={slot.label}
                index={i}
                passed={profile.examSectionsPassed.includes(slot.key)}
                onToggle={(checked) => toggle(slot.key, checked)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </>
  );
}
