import { describe, expect, it } from "vitest";
import { adminRecordsToCsv, validateAdminRecords, type AdminRecord } from "./admin-local-store";

const record: AdminRecord = {
  id: "abc-123",
  createdAt: "2026-10-28T10:00:00.000Z",
  updatedAt: "2026-10-28T10:00:00.000Z",
  label: "Caso 01",
  category: "acompanhamento",
  status: "novo",
  notes: "Sem dados pessoais",
};

describe("admin local records", () => {
  it("validates records and rejects invalid status or missing labels", () => {
    expect(validateAdminRecords([record])).toEqual([record]);
    expect(validateAdminRecords([{ ...record, status: "paid" }, { ...record, id: "bad", label: " " }])).toEqual([]);
  });

  it("exports CSV with quoted fields and formula-injection protection", () => {
    const csv = adminRecordsToCsv([{ ...record, label: "=HYPERLINK(\"https://bad.example\")", notes: "linha 1, linha 2" }]);
    expect(csv.startsWith("\uFEFF" )).toBe(true);
    expect(csv).toContain("'=HYPERLINK(\"\"https://bad.example\"\")");
    expect(csv).toContain("\"linha 1, linha 2\"");
  });

  it("does not export invalid rows", () => {
    const csv = adminRecordsToCsv([{ ...record, status: "unexpected" } as unknown as AdminRecord]);
    expect(csv.split("\r\n")).toHaveLength(1);
  });
});
