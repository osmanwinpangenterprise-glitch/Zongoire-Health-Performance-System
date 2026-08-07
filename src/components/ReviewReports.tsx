import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ListTodo,
  FileSpreadsheet,
  Presentation,
  Loader2,
} from 'lucide-react';
import { CalculatedFacilityMetrics, Facility, ReviewType, FacilityMonthlyData } from '../types';
import { exportElementToPdf, exportDataToExcel } from '../utils/exportUtils';
import { exportReviewReportToPptx } from '../utils/exportPptx';

interface ReviewReportsProps {
  metrics: CalculatedFacilityMetrics[];
  facilities: Facility[];
  monthlyData: FacilityMonthlyData[];
  selectedPeriodType: ReviewType;
  selectedYear: number;
  periodLabel: string;
}

export const ReviewReports: React.FC<ReviewReportsProps> = ({
  metrics,
  facilities,
  monthlyData,
  selectedPeriodType,
  selectedYear,
  periodLabel,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<ReviewType>(selectedPeriodType);
  const [isExportingPpt, setIsExportingPpt] = useState(false);

  const sortedMetrics = [...metrics].sort((a, b) => b.overallScore - a.overallScore);
  const overallAvg = Math.round(
    metrics.reduce((acc, curr) => acc + curr.overallScore, 0) / (metrics.length || 1)
  );

  // Sample Action Items Matrix for GHS Sub-District Health Management Team
  const actionItems = [
    {
      id: 1,
      indicator: 'Penta Dropout Rate in Dagunga CHPS',
      issue: 'High Penta1 to Penta3 dropout rate (27.3%) exceeding GHS 10% target.',
      actionPoint: 'Deploy CHO & CHVs for door-to-door child immunization register audit and defaulter tracing.',
      responsible: 'CHO Isaac Atambire & Community Health Nurses',
      deadline: 'End of Month',
      status: 'In Progress',
    },
    {
      id: 2,
      indicator: 'Skilled Birth Attendance in CHPS Zones',
      issue: 'Low skilled birth attendance at Dagunga CHPS (45%) and Apodabogo CHPS (52%).',
      actionPoint: 'Re-engage Traditional Birth Attendants (TBAs) as birth companions to incentivize facility delivery at Zongoire HC.',
      responsible: 'Sub-District In-Charge (Sr. Mary Azumah)',
      deadline: 'Next 30 Days',
      status: 'Pending',
    },
    {
      id: 3,
      indicator: 'Severe Acute Malnutrition (SAM) Cases',
      issue: '3 active SAM cases recorded in Apodabogo and Dagunga CHPS zones.',
      actionPoint: 'Supply Outpatient Therapeutic Program (OTP) Ready-to-Use Therapeutic Food (RUTF) sachets and counsel mothers.',
      responsible: 'Sub-District Nutrition Officer',
      deadline: 'Immediate',
      status: 'Active',
    },
  ];

  // Export Table Data to Excel
  const handleExportExcelReport = () => {
    const excelRows = sortedMetrics.map((m) => ({
      'Facility Name': m.facilityName,
      'Penta3 Coverage %': m.penta3CoverageRate,
      'Penta Dropout Rate %': m.pentaDropoutRate,
      'Skilled Delivery %': m.skilledDeliveryRate,
      'ANC4 Coverage %': m.anc4CoverageRate,
      'IPT3 Coverage %': m.ipt3CoverageRate,
      'EPI Score': m.epiScore,
      'Maternal Score': m.maternalScore,
      'Child Score': m.childScore,
      'Overall Score': m.overallScore,
      'Performance Level': m.performanceLevel,
    }));

    exportDataToExcel(
      excelRows,
      `Zongoire_SubDistrict_${activeReportTab.toUpperCase()}_Review_${selectedYear}.xlsx`,
      'Review_Report'
    );
  };

  // Export Report to PowerPoint Presentation (.pptx)
  const handleExportPptReport = async () => {
    try {
      setIsExportingPpt(true);
      await exportReviewReportToPptx({
        reviewType: activeReportTab,
        periodLabel,
        selectedYear,
        overallAvg,
        sortedMetrics,
        actionItems,
      });
    } catch (err) {
      console.error('Error exporting PPTX presentation:', err);
    } finally {
      setIsExportingPpt(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>MANAGEMENT REVIEW REPORT COMPILER</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Performance Review Reports (Monthly, Quarterly, Mid-Year, Annual)
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Generates standardized Ghana Health Service performance review packages for SDHMT presentation, including executive summaries, facility rankings, and action plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-review-ppt-btn"
            type="button"
            disabled={isExportingPpt}
            onClick={handleExportPptReport}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow-md border border-amber-400 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingPpt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
            ) : (
              <Presentation className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{isExportingPpt ? 'Generating PPT...' : 'Export Report (PPT)'}</span>
          </button>

          <button
            id="export-review-excel-btn"
            type="button"
            onClick={handleExportExcelReport}
            className="bg-emerald-900 hover:bg-emerald-950 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-700 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Export Report (Excel)</span>
          </button>
          <button
            id="export-review-pdf-btn"
            type="button"
            onClick={() => exportElementToPdf('formal-review-report', `Zongoire_${activeReportTab}_Report.pdf`)}
            className="bg-green-950 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-800 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-green-200" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Review Type Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-t">
        {[
          { id: 'monthly', label: 'Monthly Review' },
          { id: 'quarterly', label: 'Quarterly Review' },
          { id: 'midyear', label: 'Mid-Year Review' },
          { id: 'annual', label: 'Annual Review' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`report-type-${tab.id}`}
            type="button"
            onClick={() => setActiveReportTab(tab.id as ReviewType)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
              activeReportTab === tab.id
                ? 'bg-[#006633] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Official Report Document */}
      <div
        id="formal-review-report"
        className="bg-white dark:bg-slate-900 rounded p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#006633] pb-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[#006633] dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
              GHANA HEALTH SERVICE • BAWKU WEST DISTRICT
            </span>
            <h1 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
              ZONGOIRE SUB-DISTRICT {activeReportTab.toUpperCase()} HEALTH PERFORMANCE REVIEW
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Transforming DHIMS2 Routine Data into Evidence-Based Management Decision Support
            </p>
          </div>
          <div className="text-right">
            <span className="bg-[#006633] text-white font-bold px-2.5 py-0.5 rounded text-xs inline-block">
              {periodLabel} ({selectedYear})
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Overall Score: <strong className="text-slate-900 dark:text-white">{overallAvg}%</strong>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary Box */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006633]" />
            <span>1. Executive Summary & Overview</span>
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            This official <strong>{activeReportTab.toUpperCase()} Review Report</strong> presents the aggregated routine service delivery statistics for Zongoire Sub-District for <strong>{periodLabel}</strong>. Overall sub-district health performance achieved <strong>{overallAvg}%</strong> against GHS benchmarks. High performance was sustained in reproductive maternal health and skilled delivery attendance at Zongoire Health Centre. However, attention is required in CHPS outreach regularity and child immunization dropout tracing.
          </p>
        </div>

        {/* 2. Key Achievements Table */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
            <Building2 className="w-3.5 h-3.5 text-[#006633]" />
            <span>2. Key Achievements & Best Performers</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded border border-emerald-200 dark:border-emerald-900 space-y-0.5">
              <span className="font-bold text-[#006633] dark:text-emerald-200 block text-[10px] uppercase">
                Top Facility Score
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                {sortedMetrics[0]?.facilityName} ({sortedMetrics[0]?.overallScore}%)
              </p>
            </div>
            <div className="bg-sky-50/80 dark:bg-sky-950/40 p-2.5 rounded border border-sky-200 dark:border-sky-900 space-y-0.5">
              <span className="font-bold text-sky-900 dark:text-sky-200 block text-[10px] uppercase">
                Penta3 Coverage Baseline
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                Zongoire HC achieved {sortedMetrics[0]?.penta3CoverageRate}% Penta3 coverage.
              </p>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900 space-y-0.5">
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-[10px] uppercase">
                Reporting Completeness
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                100% of 4 facilities submitted monthly reports.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Facility League Ranking Table */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
            <Building2 className="w-3.5 h-3.5 text-[#006633]" />
            <span>3. Sub-District Facility League Table</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Facility Name</th>
                  <th className="py-2 px-3 text-center">Penta3 %</th>
                  <th className="py-2 px-3 text-center">Dropout %</th>
                  <th className="py-2 px-3 text-center">Skilled Birth %</th>
                  <th className="py-2 px-3 text-center">ANC4 %</th>
                  <th className="py-2 px-3 text-center">Overall Score</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedMetrics.map((m, idx) => (
                  <tr key={m.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold">#{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">
                      {m.facilityName}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold">{m.penta3CoverageRate}%</td>
                    <td className="py-2 px-3 text-center font-semibold">{m.pentaDropoutRate}%</td>
                    <td className="py-2 px-3 text-center font-semibold">{m.skilledDeliveryRate}%</td>
                    <td className="py-2 px-3 text-center font-semibold">{m.anc4CoverageRate}%</td>
                    <td className="py-2 px-3 text-center font-extrabold text-slate-800 dark:text-white">{m.overallScore}%</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.performanceLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Action Points Matrix */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
            <ListTodo className="w-3.5 h-3.5 text-amber-500" />
            <span>4. Action Points & Assigned Responsibilities Matrix</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">Indicator / Area</th>
                  <th className="py-2 px-3">Identified Bottleneck</th>
                  <th className="py-2 px-3">Agreed Action Point</th>
                  <th className="py-2 px-3">Responsible Officer</th>
                  <th className="py-2 px-3 text-center">Target Date</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {actionItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">
                      {item.indicator}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{item.issue}</td>
                    <td className="py-2 px-3 font-bold text-[#006633] dark:text-emerald-300">
                      {item.actionPoint}
                    </td>
                    <td className="py-2 px-3 font-medium">{item.responsible}</td>
                    <td className="py-2 px-3 text-center font-medium">{item.deadline}</td>
                    <td className="py-2 px-3 text-center font-bold">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
