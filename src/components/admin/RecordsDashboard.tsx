"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import {
  ADMIN_RECORDS_LIMIT,
  adminRecordsToCsv,
  loadAdminRecords,
  persistAdminRecords,
  type AdminRecord,
  type LocalRecordStatus,
} from "@/lib/admin-local-store";

const statuses: { value: LocalRecordStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "arquivado", label: "Arquivado" },
];

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function newId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RecordsDashboard() {
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRecords(loadAdminRecords());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function save(next: AdminRecord[]) {
    if (!persistAdminRecords(next)) {
      setNotice("Não foi possível salvar. O armazenamento do navegador pode estar cheio ou bloqueado.");
      return false;
    }
    setRecords(next);
    setNotice("Alteração salva neste navegador.");
    return true;
  }

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim().slice(0, 120);
    const category = String(form.get("category") ?? "").trim().slice(0, 80);
    const notes = String(form.get("notes") ?? "").trim().slice(0, 1000);
    if (!label || !category) return;
    if (records.length >= ADMIN_RECORDS_LIMIT) {
      setNotice(`O limite local de ${ADMIN_RECORDS_LIMIT} registros foi atingido. Exporte e remova itens para continuar.`);
      return;
    }
    const now = new Date().toISOString();
    if (save([{ id: newId(), createdAt: now, updatedAt: now, label, category, status: "novo", notes }, ...records])) {
      event.currentTarget.reset();
    }
  }

  function updateStatus(id: string, status: LocalRecordStatus) {
    save(records.map((record) => record.id === id ? { ...record, status, updatedAt: new Date().toISOString() } : record));
  }

  function removeRecord(id: string) {
    if (!window.confirm("Excluir este registro deste navegador?")) return;
    save(records.filter((record) => record.id !== id));
  }

  function exportCsv() {
    downloadFile(`registros-admin-${new Date().toISOString().slice(0, 10)}.csv`, adminRecordsToCsv(records), "text/csv;charset=utf-8");
  }

  function exportJson() {
    downloadFile(`registros-admin-${new Date().toISOString().slice(0, 10)}.json`, `${JSON.stringify(records, null, 2)}\n`, "application/json;charset=utf-8");
  }

  const visibleRecords = useMemo(() => records.filter((record) => {
    const statusMatches = filter === "todos" || record.status === filter;
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const searchMatches = !term || `${record.label} ${record.category} ${record.notes}`.toLocaleLowerCase("pt-BR").includes(term);
    return statusMatches && searchMatches;
  }), [records, filter, search]);

  const completed = records.filter((record) => record.status === "concluido").length;
  const active = records.filter((record) => record.status === "andamento").length;

  return (
    <>
      <AdminNavigation />
      <section className="page-wrap py-8 sm:py-12">
        <p className="eyebrow">Área administrativa · dados locais</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Registros</h1><p className="mt-2 text-sm text-[var(--muted)]">Lista guardada somente neste navegador autenticado.</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={exportCsv} disabled={!ready || records.length === 0} className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-50">Exportar CSV</button>
            <button type="button" onClick={exportJson} disabled={!ready || records.length === 0} className="rounded-full bg-[var(--forest)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Exportar JSON</button>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-[#ead7a8] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#755514]">
          <strong>Limite importante:</strong> os registros não são enviados a um servidor, não sincronizam entre dispositivos e podem ser apagados se os dados do navegador forem limpos. Respostas de visitantes em outros aparelhos não aparecem aqui. Não insira CPF, dados bancários, senhas ou informações sensíveis.
        </div>
        {notice && <p role="status" className="mt-3 text-sm text-[var(--muted)]">{notice}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="card-border rounded-2xl bg-white p-4"><p className="text-xs font-bold uppercase text-[var(--muted)]">Registros neste navegador</p><p className="mt-2 text-2xl font-extrabold">{ready ? records.length : "…"}</p></div>
          <div className="card-border rounded-2xl bg-white p-4"><p className="text-xs font-bold uppercase text-[var(--muted)]">Em andamento</p><p className="mt-2 text-2xl font-extrabold">{ready ? active : "…"}</p></div>
          <div className="card-border rounded-2xl bg-white p-4"><p className="text-xs font-bold uppercase text-[var(--muted)]">Concluídos</p><p className="mt-2 text-2xl font-extrabold">{ready ? completed : "…"}</p></div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
          <form onSubmit={addRecord} className="card-border h-fit rounded-2xl bg-white p-5">
            <h2 className="text-lg font-extrabold">Adicionar registro local</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Use apenas um identificador não pessoal, como “Caso 01”.</p>
            <label htmlFor="label" className="mt-4 block text-sm font-bold">Identificador</label>
            <input id="label" name="label" maxLength={120} required placeholder="Ex.: Caso 01" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />
            <label htmlFor="category" className="mt-4 block text-sm font-bold">Categoria</label>
            <input id="category" name="category" maxLength={80} required placeholder="Ex.: acompanhamento" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />
            <label htmlFor="notes" className="mt-4 block text-sm font-bold">Observação não sensível (opcional)</label>
            <textarea id="notes" name="notes" maxLength={1000} rows={3} placeholder="Não informe dados pessoais." className="mt-2 w-full rounded-xl border border-[var(--line)] p-3 text-sm" />
            <button type="submit" disabled={!ready} className="mt-4 min-h-11 w-full rounded-full bg-[var(--forest)] px-4 text-sm font-extrabold text-white disabled:opacity-50">Salvar neste navegador</button>
          </form>

          <section className="card-border min-w-0 rounded-2xl bg-white p-5" aria-label="Lista local">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Lista</h2>
              <label className="sr-only" htmlFor="filter">Filtrar por status</label>
              <select id="filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-10 rounded-xl border border-[var(--line)] px-3 text-sm">
                <option value="todos">Todos os status</option>
                {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </div>
            <label htmlFor="search" className="sr-only">Buscar na lista</label>
            <input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar identificador, categoria ou observação" className="mt-3 min-h-10 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />
            {!ready ? <p className="py-8 text-center text-sm text-[var(--muted)]">Carregando dados deste navegador…</p> : visibleRecords.length === 0 ? <p className="py-8 text-center text-sm text-[var(--muted)]">{records.length ? "Nenhum registro corresponde ao filtro." : "Ainda não há registros locais."}</p> : (
              <ul className="mt-4 divide-y divide-[var(--line)]">
                {visibleRecords.map((record) => (
                  <li key={record.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-bold">{record.label}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{record.category} · criado {new Date(record.createdAt).toLocaleString("pt-BR")}</p>
                      {record.notes && <p className="mt-2 break-words text-sm leading-5">{record.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`status-${record.id}`}>Status de {record.label}</label>
                      <select id={`status-${record.id}`} value={record.status} onChange={(event) => updateStatus(record.id, event.target.value as LocalRecordStatus)} className="min-h-9 rounded-lg border border-[var(--line)] px-2 text-xs">
                        {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                      </select>
                      <button type="button" onClick={() => removeRecord(record.id)} aria-label={`Excluir ${record.label}`} className="min-h-9 rounded-lg px-3 text-xs font-bold text-[#8b3a2c] hover:bg-[#fff0ee]">Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
