import { TEMPLATE_HEADERS, TEMPLATE_ROWS } from "./format";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\r\n");
}

/** Download the import template as a .csv file (no library needed). */
export function downloadCsvTemplate() {
  const csv = toCsv(TEMPLATE_HEADERS, TEMPLATE_ROWS);
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "pathtocpa-coursework-template.csv");
}

/** Download the import template as a real .xlsx file (uses SheetJS, loaded on demand). */
export async function downloadXlsxTemplate() {
  const XLSX = await import("xlsx");
  const data = [TEMPLATE_HEADERS, ...TEMPLATE_ROWS];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Coursework");
  XLSX.writeFile(book, "pathtocpa-coursework-template.xlsx");
}
