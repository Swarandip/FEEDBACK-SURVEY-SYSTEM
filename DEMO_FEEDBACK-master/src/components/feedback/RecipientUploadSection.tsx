import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, X, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { feedbackApi, MatchRecipientsResult } from '../../api/feedback';

export type RecipientState = {
  targetStudentIds: string[];
  matchResult: MatchRecipientsResult | null;
  fileName: string | null;
};

interface RecipientUploadSectionProps {
  targetSemesters: number[];
  value: RecipientState;
  onChange: (next: RecipientState) => void;
  disabled?: boolean;
}

const emptyState: RecipientState = {
  targetStudentIds: [],
  matchResult: null,
  fileName: null
};

export const RecipientUploadSection: React.FC<RecipientUploadSectionProps> = ({
  targetSemesters,
  value,
  onChange,
  disabled
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const semesterKey = targetSemesters.slice().sort((a, b) => a - b).join(',');

  useEffect(() => {
    const file = fileRef.current;
    if (!file || disabled) return;
    let cancelled = false;
    (async () => {
      setUploading(true);
      setError(null);
      try {
        const result = await feedbackApi.matchRecipients(file, targetSemesters);
        if (!cancelled) {
          onChange({
            targetStudentIds: result.matched.map((m) => m.id),
            matchResult: result,
            fileName: file.name
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to re-match after semester change');
        }
      } finally {
        if (!cancelled) setUploading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when semesters change
  }, [semesterKey]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    fileRef.current = file;
    setError(null);
    setUploading(true);
    try {
      const result = await feedbackApi.matchRecipients(file, targetSemesters);
      onChange({
        targetStudentIds: result.matched.map((m) => m.id),
        matchResult: result,
        fileName: file.name
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process file');
      fileRef.current = null;
      onChange(emptyState);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clearFile = () => {
    fileRef.current = null;
    setError(null);
    onChange(emptyState);
    if (inputRef.current) inputRef.current.value = '';
  };

  const { matchResult, fileName } = value;

  return (
    <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Student list (Excel or PDF)</h3>
          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
            Upload a file with student names. We match them to accounts in the database using the
            semesters you select below (one or many). Only matched students will receive this form.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Processing…' : 'Upload Excel or PDF'}
        </button>
        {fileName && (
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
          >
            <X className="h-4 w-4" />
            Remove file
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <FileSpreadsheet className="h-3.5 w-3.5" /> .xlsx, .xls, .csv
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> .pdf
        </span>
      </div>

      {targetSemesters.length === 0 && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
          Tip: Select target semester(s) below first, then upload — names are matched only within those semesters.
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {matchResult && (
        <div className="mt-4 space-y-3 rounded-md border border-gray-200 bg-white p-3 text-sm">
          <p className="font-medium text-gray-900 truncate">{fileName}</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {matchResult.matchedCount} matched in database
            </span>
            {matchResult.unmatchedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                {matchResult.unmatchedCount} not found
              </span>
            )}
            <span className="text-gray-500">{matchResult.parsedCount} names in file</span>
          </div>

          {matchResult.matched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Will receive the form:</p>
              <ul className="max-h-28 overflow-y-auto text-xs text-gray-600 space-y-0.5">
                {matchResult.matched.map((m) => (
                  <li key={m.id}>
                    {m.fullName}
                    {m.semester != null ? ` · Sem ${m.semester}` : ''}
                    {m.email ? ` · ${m.email}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {matchResult.unmatched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-800 mb-1">Not matched (check spelling / semester):</p>
              <p className="text-xs text-amber-700 line-clamp-3">
                {matchResult.unmatched.slice(0, 12).join(', ')}
                {matchResult.unmatched.length > 12 ? '…' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
