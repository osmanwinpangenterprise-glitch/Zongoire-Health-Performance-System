import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Files,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { generateDhims2Template } from '../utils/excelParser';
import { parseMultipleFiles, MultiFileImportResult } from '../utils/fileImporter';
import { FacilityMonthlyData, AuditLog, UserRole } from '../types';

interface Dhims2ImporterProps {
  onDataUploaded: (newRecords: FacilityMonthlyData[]) => void;
  auditLogs: AuditLog[];
  userRole: UserRole;
  onRestoreBaselineData: () => void;
  onClearAllData: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Dhims2Importer: React.FC<Dhims2ImporterProps> = ({
  onDataUploaded,
  auditLogs,
  userRole,
  onRestoreBaselineData,
  onClearAllData,
  onNavigateTab,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<MultiFileImportResult | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const handleFilesChange = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadSuccessMsg(null);
    setUploadErrorMsg(null);

    try {
      const result = await parseMultipleFiles(files);
      setParsedPreview(result);
      if (result.summary.errors.length > 0 && result.data.length === 0) {
        setUploadErrorMsg(`Import failed: ${result.summary.errors.join(' | ')}`);
      }
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Error processing uploaded files.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || parsedPreview.data.length === 0) return;
    onDataUploaded(parsedPreview.data);
    const filesCount = parsedPreview.summary.totalFiles;
    setUploadSuccessMsg(
      `Successfully imported ${parsedPreview.data.length} facility records from ${filesCount} file${filesCount > 1 ? 's' : ''} (Excel/PDF) into ZSHPMS! Dashboards and indicator calculations have been updated.`
    );
    setParsedPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Upload className="w-4 h-4" />
            <span>Routine DHIMS2 Excel Data Import Module</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Upload & Validate Routine DHIMS2 Monthly Reports
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Import official DHIMS2 Excel monthly summaries for Zongoire Sub-District. The system automatically reads datasets, validates indicators, and updates dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="download-dhims-template-btn"
            type="button"
            onClick={generateDhims2Template}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download Official DHIMS2 Template</span>
          </button>

          <button
            id="clear-sample-data-btn"
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Wipe sample data to start completely fresh with clean entry"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Clear Sample Data</span>
          </button>

          <button
            id="restore-baseline-data-btn"
            type="button"
            onClick={onRestoreBaselineData}
            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Reset dataset to default 2025-2026 sub-district baseline data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Baseline</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear All Sample Data?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will wipe all 2025–2026 sample monthly facility records. You can then import your own official DHIMS2 Excel file or start entering raw data manually.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 rounded text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Tip:</strong> You can restore the original sample baseline data anytime by clicking <em>"Restore Baseline"</em>.
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                  setUploadSuccessMsg('All sample dataset records cleared! You can now upload your official DHIMS2 Excel report or start clean.');
                }}
                className="px-4 py-2 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {userRole === 'admin' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFilesChange(e.dataTransfer.files);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Files className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Drag and drop DHIMS2 Excel or PDF reports here
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Supports multiple files simultaneously (.xlsx, .xls, .csv, and .pdf) formatted per Ghana Health Service DHIMS2 guidelines.
              </p>
            </div>

            <div className="pt-2">
              <label
                htmlFor="dhims-file-upload-input"
                className="inline-flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer shadow-md transition-colors"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Select DHIMS2 Files (Excel / PDF)</span>
              </label>
              <input
                id="dhims-file-upload-input"
                type="file"
                accept=".xlsx, .xls, .csv, .pdf"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesChange(e.target.files);
                  }
                }}
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 font-semibold animate-pulse pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Parsing and validating DHIMS2 reports (Excel & PDF)...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Viewer Mode Active:</strong> You are currently logged in as a Viewer. Switch your role to <strong>Administrator</strong> in the top menu to upload new DHIMS2 reports.
          </span>
        </div>
      )}

      {/* Success Notification with Review Action Buttons */}
      {uploadSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                File(s) Reviewed & Import Confirmed!
              </p>
              <p>{uploadSuccessMsg}</p>
            </div>
          </div>

          {onNavigateTab && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mr-1">
                Review Data Now:
              </span>
              <button
                id="review-dashboard-btn"
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>Review Executive Dashboard →</span>
              </button>
              <button
                id="review-league-btn"
                type="button"
                onClick={() => onNavigateTab('comparison')}
                className="bg-white dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs transition-colors cursor-pointer"
              >
                <span>View Facility Performance League</span>
              </button>
              <button
                id="review-epi-btn"
                type="button"
                onClick={() => onNavigateTab('epi')}
                className="bg-white dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs transition-colors cursor-pointer"
              >
                <span>Review EPI Coverage</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Notification */}
      {uploadErrorMsg && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 p-4 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{uploadErrorMsg}</span>
        </div>
      )}

      {/* Parsed Preview Table & Confirmation */}
      {parsedPreview && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Multi-File Import Validation Summary</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Successfully processed <strong>{parsedPreview.summary.totalFiles} file{parsedPreview.summary.totalFiles > 1 ? 's' : ''}</strong> containing <strong>{parsedPreview.summary.totalRows} facility record{parsedPreview.summary.totalRows > 1 ? 's' : ''}</strong>. Please review before committing to system.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="cancel-import-btn"
                type="button"
                onClick={() => setParsedPreview(null)}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-import-btn"
                type="button"
                onClick={handleConfirmImport}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Confirm & Update System ({parsedPreview.data.length} Records)</span>
              </button>
            </div>
          </div>

          {/* Processed Files Breakdown Badges */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
            <h4 className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Files Processed in Batch ({parsedPreview.fileSummaries.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsedPreview.fileSummaries.map((f, fIdx) => (
                <div
                  key={fIdx}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 rounded-md flex items-center space-x-2 text-xs shadow-xs"
                >
                  {f.fileType === 'PDF' ? (
                    <FileText className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  )}
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 max-w-[180px] truncate">
                    {f.fileName}
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {f.recordCount} record{f.recordCount === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300 border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold border-b border-neutral-200 dark:border-neutral-700">
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3 text-center">Penta1 / Penta3</th>
                  <th className="py-2 px-3 text-center">ANC1 / ANC4</th>
                  <th className="py-2 px-3 text-center">Skilled Deliveries</th>
                  <th className="py-2 px-3 text-center">Malaria Cases</th>
                  <th className="py-2 px-3 text-center">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {parsedPreview.data.map((row, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">
                      {row.facilityName}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-400">
                      {row.monthLabel}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      {row.epi.penta1} / {row.epi.penta3}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      {row.maternalHealth.anc1} / {row.maternalHealth.anc4}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                      {row.maternalHealth.skilledDeliveries}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-amber-600">
                      {row.diseaseSurveillance.malariaCases}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Valid</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload History & Audit Log */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>DHIMS2 Upload History & Audit Trail</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Audit log of all uploaded DHIMS2 monthly datasets and user activities.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300 border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold border-b border-neutral-200 dark:border-neutral-700">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Uploaded File</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Uploaded By</th>
                <th className="py-2.5 px-3 text-center">Records</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-400">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{log.fileName}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                    {log.period}
                  </td>
                  <td className="py-2.5 px-3 font-medium">{log.uploadedBy}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{log.recordsProcessed}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 dark:text-neutral-400 text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
