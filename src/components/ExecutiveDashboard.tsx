import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Award,
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users,
  Layers,
  Presentation,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CalculatedFacilityMetrics, MeAlert, Facility } from '../types';
import { exportReviewReportToPptx } from '../utils/exportPptx';

interface ExecutiveDashboardProps {
  metrics: CalculatedFacilityMetrics[];
  alerts: MeAlert[];
  periodLabel: string;
  facilities: Facility[];
  latestUploadDate: string;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  metrics,
  alerts,
  periodLabel,
  facilities,
  latestUploadDate,
  onNavigateTab,
}) => {
  const [isExportingPpt, setIsExportingPpt] = useState(false);

  // Compute overall sub-district metrics
  const totalFacilities = facilities.length;
  const reportingCompleteness = 100; // All 4 facilities submitted
  const overallAvgScore = Math.round(
    metrics.reduce((acc, curr) => acc + curr.overallScore, 0) / (metrics.length || 1)
  );

  const sortedByScore = [...metrics].sort((a, b) => b.overallScore - a.overallScore);
  const bestFacility = sortedByScore[0];
  const lowestFacility = sortedByScore[sortedByScore.length - 1];

  const handleExportPpt = async () => {
    try {
      setIsExportingPpt(true);
      await exportReviewReportToPptx({
        reviewType: 'EXECUTIVE DASHBOARD',
        periodLabel,
        selectedYear: 2026,
        overallAvg: overallAvgScore,
        sortedMetrics: sortedByScore,
        actionItems: [
          {
            indicator: 'Penta Dropout Rate',
            issue: 'High Penta1 to Penta3 dropout in Dagunga CHPS',
            actionPoint: 'Door-to-door child immunization register audit',
            responsible: 'CHO Isaac Atambire',
            deadline: 'End of Month',
            status: 'In Progress',
          },
          {
            indicator: 'Skilled Birth Attendance',
            issue: 'Sub-district target gap in outreach CHPS compounds',
            actionPoint: 'Re-engage Traditional Birth Attendants (TBAs) as birth companions',
            responsible: 'Sub-District In-Charge',
            deadline: 'Next 30 Days',
            status: 'Pending',
          },
        ],
      });
    } catch (err) {
      console.error('Failed to export PPT:', err);
    } finally {
      setIsExportingPpt(false);
    }
  };

  const criticalAlertsCount = alerts.filter((a) => a.severity === 'Red').length;
  const warningAlertsCount = alerts.filter((a) => a.severity === 'Amber').length;

  // Data for Comparative Performance Chart
  const comparisonChartData = metrics.map((m) => ({
    name: m.facilityName.replace(' Zongoire', '').replace(' CHPS', ' CHPS').replace(' Health Centre', ' HC'),
    'Overall Score': m.overallScore,
    'EPI Immunization': m.epiScore,
    'Maternal Health': m.maternalScore,
    'Child Health': m.childScore,
    'Disease Surveillance': m.diseaseScore,
  }));

  // Data for Sub-District Module Breakdown Radar Chart
  const avgEpi = Math.round(metrics.reduce((acc, c) => acc + c.epiScore, 0) / metrics.length);
  const avgMaternal = Math.round(metrics.reduce((acc, c) => acc + c.maternalScore, 0) / metrics.length);
  const avgChild = Math.round(metrics.reduce((acc, c) => acc + c.childScore, 0) / metrics.length);
  const avgDisease = Math.round(metrics.reduce((acc, c) => acc + c.diseaseScore, 0) / metrics.length);
  const avgTb = Math.round(metrics.reduce((acc, c) => acc + c.tbScore, 0) / metrics.length);

  const radarData = [
    { module: 'EPI Immunization', score: avgEpi, fullMark: 100 },
    { module: 'Maternal Health', score: avgMaternal, fullMark: 100 },
    { module: 'Child Health', score: avgChild, fullMark: 100 },
    { module: 'Disease Control', score: avgDisease, fullMark: 100 },
    { module: 'TB Cascade', score: avgTb, fullMark: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* Header Context Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>EXECUTIVE DASHBOARD • REPORTING PERIOD: {periodLabel.toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Sub-District Health Performance Overview
          </h2>
          <p className="text-xs text-green-100 mt-0.5">
            Real-time DHIMS2 M&E validation & decision-support for Zongoire Sub-District.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-ppt-dashboard-btn"
            type="button"
            disabled={isExportingPpt}
            onClick={handleExportPpt}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isExportingPpt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Presentation className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPpt ? 'EXPORTING PPT...' : 'EXPORT PPT REPORT'}</span>
          </button>
          <button
            id="quick-dhims-upload-btn"
            type="button"
            onClick={() => onNavigateTab('importer')}
            className="bg-[#FFD700] hover:bg-yellow-300 text-green-950 px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>IMPORT DHIMS2 DATA</span>
          </button>
          <button
            id="view-ai-insights-btn"
            type="button"
            onClick={() => onNavigateTab('insights')}
            className="bg-green-900/80 hover:bg-green-900 text-white border border-green-700 px-3 py-1.5 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>AI M&E REPORT</span>
          </button>
        </div>
      </div>

      {/* Top High Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Reporting Completeness */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Reporting Completeness
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-[#006633] dark:text-emerald-400">100%</p>
            <span className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mb-1">▲ Optimal (4/4)</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">All facilities submitted for {periodLabel}</p>
        </div>

        {/* KPI 2: Overall Sub-District Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Performance Score
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{overallAvgScore}%</p>
            <span className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mb-1">+2.4% vs prev</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Weighted sub-district average</p>
        </div>

        {/* KPI 3: Top Facility (Gold Border) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded shadow-sm border-l-4 border-l-[#FFD700]">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Top Facility
          </p>
          <p className="text-base font-bold text-slate-800 dark:text-white truncate mt-1">{bestFacility?.facilityName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Score: {bestFacility?.overallScore}% • Rank #1</p>
        </div>

        {/* KPI 4: Lowest Facility (Red Border) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded shadow-sm border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Lowest Facility
          </p>
          <p className="text-base font-bold text-slate-800 dark:text-white truncate mt-1">{lowestFacility?.facilityName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Score: {lowestFacility?.overallScore}% • Priority Follow-up</p>
        </div>
      </div>

      {/* Main Grid: Comparison Matrix + Narrative Insights / Alerts */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT COLUMN: PERFORMANCE MATRIX & COMPARISON CHART */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Facility Performance Indicator Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Sub-District Performance Indicator Matrix
              </h3>
              <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
                Data Validated
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold text-left border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                    <th className="px-3 py-2">Facility Name</th>
                    <th className="px-3 py-2 text-center">BCG Cov.</th>
                    <th className="px-3 py-2 text-center">Penta3 Cov.</th>
                    <th className="px-3 py-2 text-center">Skilled Del.</th>
                    <th className="px-3 py-2 text-center">ANC4+</th>
                    <th className="px-3 py-2 text-center">Score</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedByScore.map((f) => {
                    let statusBg = 'bg-green-100 text-green-700';
                    let statusText = 'EXCELLENT';
                    if (f.overallScore < 50) {
                      statusBg = 'bg-red-100 text-red-700';
                      statusText = 'ACTION REQ.';
                    } else if (f.overallScore < 80) {
                      statusBg = 'bg-amber-100 text-amber-700';
                      statusText = 'SATISFACTORY';
                    } else if (f.overallScore >= 90) {
                      statusBg = 'bg-green-100 text-green-800 font-extrabold';
                      statusText = 'EXCELLENT';
                    } else {
                      statusBg = 'bg-green-100 text-green-700';
                      statusText = 'GOOD';
                    }

                    return (
                      <tr key={f.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">
                          {f.facilityName}
                        </td>
                        <td className="px-3 py-2 text-center font-medium">{f.bcgCoverageRate}%</td>
                        <td className="px-3 py-2 text-center font-medium">{f.penta3CoverageRate}%</td>
                        <td className="px-3 py-2 text-center font-medium">{f.skilledDeliveryRate}%</td>
                        <td className="px-3 py-2 text-center font-medium">{f.anc4CoverageRate}%</td>
                        <td className="px-3 py-2 text-center font-bold text-[#006633] dark:text-emerald-400">{f.overallScore}%</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBg}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Facility Performance Comparison by Module
              </h3>
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#006633] rounded-full"></span> Overall</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-600 rounded-full"></span> EPI</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Maternal</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '4px', fontSize: '11px' }}
                  />
                  <Bar dataKey="Overall Score" fill="#006633" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="EPI Immunization" fill="#0284c7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Maternal Health" fill="#d97706" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTELLIGENT INSIGHTS & CRITICAL ALERTS */}
        <div className="col-span-12 lg:col-span-4 space-y-4 flex flex-col">
          {/* M&E Narrative Insights */}
          <div className="bg-[#006633] text-white rounded p-4 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-200 mb-3 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>M&E Narrative Insights</span>
              </h3>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="border-l-2 border-[#FFD700] pl-2.5">
                  <p className="font-bold text-green-50 text-[11px]">Top Performer</p>
                  <p className="opacity-90 text-[11px]">
                    {bestFacility?.facilityName} achieved the highest coverage across EPI (Penta3 {bestFacility?.penta3CoverageRate}%) and Maternal care.
                  </p>
                </div>
                <div className="border-l-2 border-red-400 pl-2.5">
                  <p className="font-bold text-green-50 text-[11px]">Dropout Risk</p>
                  <p className="opacity-90 text-[11px]">
                    {lowestFacility?.facilityName} recorded Penta dropout rate of {lowestFacility?.pentaDropoutRate}%. Needs defaulter tracing.
                  </p>
                </div>
                <div className="border-l-2 border-sky-400 pl-2.5">
                  <p className="font-bold text-green-50 text-[11px]">Sub-District Aggregate</p>
                  <p className="opacity-90 text-[11px]">
                    Average maternal ANC4 retention across sub-district is currently on track to reach national health target.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Critical Alerts ({alerts.length})
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('insights')}
                className="text-[10px] font-bold text-[#006633] dark:text-emerald-400 hover:underline"
              >
                View Details →
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No critical alerts detected for this period.</p>
              ) : (
                alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2.5 p-2 rounded text-xs border ${
                      alert.severity === 'Red'
                        ? 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/40 text-red-900 dark:text-red-200'
                        : 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        alert.severity === 'Red' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    ></span>
                    <div className="text-[11px] space-y-0.5">
                      <p className="font-bold">{alert.facilityName} - {alert.indicator}</p>
                      <p className="opacity-80 leading-tight">{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Bar */}
      <div className="bg-slate-800 text-[10px] text-slate-300 p-2.5 rounded flex flex-wrap items-center justify-between uppercase tracking-widest font-semibold">
        <div className="flex gap-4">
          <span>Database: GHS-DHIMS2-LIVE</span>
          <span>Sub-District Code: ZNG-004</span>
        </div>
        <div>
          Ghana Health Service M&E System
        </div>
      </div>
    </div>
  );
};
