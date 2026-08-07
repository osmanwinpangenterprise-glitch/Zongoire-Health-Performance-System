import { parseUploadedExcel } from './excelParser';
import { parseUploadedPdf } from './pdfParser';
import { FacilityMonthlyData } from '../types';

export interface FileBatchSummary {
  fileName: string;
  fileType: 'Excel' | 'PDF';
  recordCount: number;
  status: 'Success' | 'Partial' | 'Failed';
  errors: string[];
}

export interface MultiFileImportResult {
  data: FacilityMonthlyData[];
  fileSummaries: FileBatchSummary[];
  summary: {
    totalFiles: number;
    totalRows: number;
    successCount: number;
    errors: string[];
  };
}

/**
 * Parses multiple files (Excel .xlsx, .xls, .csv AND PDF .pdf) concurrently or sequentially
 */
export async function parseMultipleFiles(files: File[]): Promise<MultiFileImportResult> {
  const allData: FacilityMonthlyData[] = [];
  const fileSummaries: FileBatchSummary[] = [];
  const globalErrors: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isPdf = ext === 'pdf';
    const isExcel = ['xlsx', 'xls', 'csv'].includes(ext);

    if (!isPdf && !isExcel) {
      const err = `File "${file.name}" has an unsupported format. Please upload .xlsx, .xls, .csv, or .pdf files.`;
      globalErrors.push(err);
      fileSummaries.push({
        fileName: file.name,
        fileType: isPdf ? 'PDF' : 'Excel',
        recordCount: 0,
        status: 'Failed',
        errors: [err],
      });
      continue;
    }

    try {
      let result: {
        data: FacilityMonthlyData[];
        summary: { totalRows: number; successCount: number; errors: string[] };
      };

      if (isPdf) {
        result = await parseUploadedPdf(file);
      } else {
        result = await parseUploadedExcel(file);
      }

      allData.push(...result.data);
      if (result.summary.errors.length > 0) {
        globalErrors.push(...result.summary.errors);
      }

      fileSummaries.push({
        fileName: file.name,
        fileType: isPdf ? 'PDF' : 'Excel',
        recordCount: result.data.length,
        status: result.summary.errors.length > 0 && result.data.length === 0 ? 'Failed' : result.summary.errors.length > 0 ? 'Partial' : 'Success',
        errors: result.summary.errors,
      });
    } catch (err: any) {
      const errorMsg = `Error processing ${file.name}: ${err.message || err}`;
      globalErrors.push(errorMsg);
      fileSummaries.push({
        fileName: file.name,
        fileType: isPdf ? 'PDF' : 'Excel',
        recordCount: 0,
        status: 'Failed',
        errors: [errorMsg],
      });
    }
  }

  return {
    data: allData,
    fileSummaries,
    summary: {
      totalFiles: files.length,
      totalRows: allData.length,
      successCount: allData.length,
      errors: globalErrors,
    },
  };
}
