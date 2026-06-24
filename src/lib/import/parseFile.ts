import type { RawRow } from "./courseImport";

/**
 * Read an uploaded CSV/XLSX file into raw rows (objects keyed by header).
 * SheetJS is imported dynamically so it only loads when a user actually imports.
 * Runs entirely in the browser — the file never leaves the device.
 */
export async function parseFile(file: File): Promise<RawRow[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  // raw:false → formatted strings; defval:"" → keep empty cells as present keys.
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: false });
}

/** Friendly check for an acceptable file extension before we try to parse. */
export function isSupportedFile(file: File): boolean {
  return /\.(csv|xlsx|xls)$/i.test(file.name);
}
