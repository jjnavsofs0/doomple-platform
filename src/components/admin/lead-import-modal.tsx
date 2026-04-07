"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp, FileSpreadsheet, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = 1 | 2 | 3;

interface AnalyzeResult {
  mapping: Record<string, string>;
  columns: string[];
  preview: Record<string, string>[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  allRows: Record<string, string>[];
}

interface ImportResult {
  total: number;
  created: number;
  reopened: number;
  duplicates: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; reason: string }>;
}

const LEAD_FIELD_OPTIONS = [
  { value: "", label: "— Ignore —" },
  { value: "fullName", label: "Full Name *" },
  { value: "email", label: "Email *" },
  { value: "phone", label: "Phone" },
  { value: "companyName", label: "Company" },
  { value: "category", label: "Category" },
  { value: "priority", label: "Priority" },
  { value: "budgetRange", label: "Budget Range" },
  { value: "requirementsSummary", label: "Message / Requirements" },
  { value: "location", label: "Location" },
  { value: "country", label: "Country" },
  { value: "timeline", label: "Timeline" },
  { value: "source", label: "Source" },
];

export function LeadImportModal({ open, onClose, onImported }: LeadImportModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep(1);
    setSelectedFile(null);
    setAnalyzing(false);
    setAnalyzeError(null);
    setAnalyzeResult(null);
    setColumnMapping({});
    setImporting(false);
    setImportResult(null);
    setShowErrors(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    const allowedExtensions = [".csv", ".xlsx", ".xls"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setAnalyzeError("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAnalyzeError("File size exceeds 5MB limit.");
      return;
    }
    setAnalyzeError(null);
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "analyze");

      const res = await fetch("/api/leads/import?action=analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      setAnalyzeResult(data);
      setColumnMapping(data.mapping ?? {});
      setStep(2);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!analyzeResult) return;
    setImporting(true);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          rows: analyzeResult.allRows,
          mapping: columnMapping,
          defaultSource: "CSV_IMPORT",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Import failed. Please try again.");
      }

      setImportResult(data);
      setStep(3);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10">
              <FileSpreadsheet className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {step === 1 && "Import Leads"}
                {step === 2 && "Review Column Mapping"}
                {step === 3 && "Import Complete"}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1 && "Upload a CSV or Excel file. AI will auto-map your columns to lead fields."}
                {step === 2 && "AI has mapped your columns. Review and adjust before importing."}
                {step === 3 && "Your leads have been processed."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-6 pt-4">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-teal-500" : "bg-slate-700"
              )}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* ── STEP 1: Upload ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                  isDragging
                    ? "border-teal-500 bg-teal-500/5"
                    : selectedFile
                      ? "border-teal-600/60 bg-teal-500/5"
                      : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-400">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">
                      Drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports .csv, .xlsx, .xls · Max 5 MB
                    </p>
                  </div>
                )}
              </div>

              {analyzeError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{analyzeError}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzing}
                  className="bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50"
                >
                  {analyzing ? "Analyzing…" : "Analyze File"}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review Mapping ── */}
          {step === 2 && analyzeResult && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-xl border border-slate-700">
                <div className="grid grid-cols-3 gap-0 border-b border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                  <span>Your Column</span>
                  <span>Maps To</span>
                  <span>Sample Value</span>
                </div>
                <div className="max-h-72 divide-y divide-slate-800 overflow-y-auto">
                  {analyzeResult.columns.map((col) => {
                    const sampleValue = analyzeResult.preview[0]?.[col] ?? "";
                    return (
                      <div
                        key={col}
                        className="grid grid-cols-3 items-center gap-3 px-4 py-2.5"
                      >
                        <span className="truncate text-sm text-slate-300" title={col}>
                          {col}
                        </span>
                        <select
                          value={columnMapping[col] ?? ""}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [col]: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {LEAD_FIELD_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <span
                          className="truncate text-xs text-slate-500"
                          title={sampleValue}
                        >
                          {sampleValue
                            ? sampleValue.length > 28
                              ? sampleValue.slice(0, 28) + "…"
                              : sampleValue
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {analyzeError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{analyzeError}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                    setAnalyzeError(null);
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-50"
                >
                  {importing
                    ? "Importing…"
                    : `Import ${analyzeResult.totalRows} lead${analyzeResult.totalRows !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Summary ── */}
          {step === 3 && importResult && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Created
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {importResult.created}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">New leads added</p>
                </div>
                <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    Reopened
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {importResult.reopened}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Dormant leads reactivated</p>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                    Duplicates
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {importResult.duplicates}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Notes added to existing leads</p>
                </div>
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                    Failed
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {importResult.failed}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Rows that errored</p>
                </div>
              </div>

              {importResult.failed > 0 && importResult.errors.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5">
                  <button
                    type="button"
                    onClick={() => setShowErrors((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                  >
                    <span>Show error details ({importResult.errors.length})</span>
                    {showErrors ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showErrors && (
                    <div className="max-h-40 divide-y divide-red-500/10 overflow-y-auto border-t border-red-500/20 px-4 pb-3">
                      {importResult.errors.map((err) => (
                        <div key={err.row} className="py-2">
                          <span className="text-xs font-medium text-slate-400">Row {err.row}: </span>
                          <span className="text-xs text-slate-500">{err.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={resetState}
                  className="border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                >
                  Import Another
                </Button>
                <Button
                  onClick={() => {
                    onImported();
                    handleClose();
                  }}
                  className="bg-teal-600 text-white hover:bg-teal-500"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
