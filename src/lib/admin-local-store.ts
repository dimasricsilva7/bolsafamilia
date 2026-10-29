export const ADMIN_RECORDS_KEY = "cadastrobf:admin-records:v1";
export const ADMIN_RECORDS_LIMIT = 3000;

export type LocalRecordStatus = "novo" | "andamento" | "concluido" | "arquivado";

export type AdminRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  label: string;
  category: string;
  status: LocalRecordStatus;
  notes: string;
};

const statuses = new Set<LocalRecordStatus>(["novo", "andamento", "concluido", "arquivado"]);

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateAdminRecords(value: unknown): AdminRecord[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, ADMIN_RECORDS_LIMIT).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" || row.id.length > 100 ||
      typeof row.createdAt !== "string" || Number.isNaN(Date.parse(row.createdAt)) ||
      typeof row.updatedAt !== "string" || Number.isNaN(Date.parse(row.updatedAt)) ||
      typeof row.status !== "string" || !statuses.has(row.status as LocalRecordStatus)
    ) return [];
    const label = cleanText(row.label, 120);
    const category = cleanText(row.category, 80);
    if (!label || !category) return [];
    return [{
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      label,
      category,
      status: row.status as LocalRecordStatus,
      notes: cleanText(row.notes, 1000),
    }];
  });
}

export function loadAdminRecords(): AdminRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_RECORDS_KEY);
    return raw ? validateAdminRecords(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function persistAdminRecords(records: AdminRecord[]) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ADMIN_RECORDS_KEY, JSON.stringify(validateAdminRecords(records)));
    return true;
  } catch {
    return false;
  }
}

function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function adminRecordsToCsv(records: AdminRecord[]) {
  const header = ["id", "criado_em", "atualizado_em", "identificador", "categoria", "status", "observacoes"];
  const rows = validateAdminRecords(records).map((record) => [
    record.id,
    record.createdAt,
    record.updatedAt,
    record.label,
    record.category,
    record.status,
    record.notes,
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\r\n")}`;
}
