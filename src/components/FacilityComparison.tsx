import React from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle2,
  Download,
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
} from 'recharts';
import { CalculatedFacilityMetrics, Facility } from '../types';
import { exportElementToPng } from '../utils/exportUtils';

interface FacilityComparisonProps {
  metrics: CalculatedFacilityMetrics[];
  facilities: Facility[];
  periodLabel: string;
}

export const FacilityComparison: React.FC<FacilityComparisonProps> = ({
  metrics,
  facilities,
  periodLabel,
}) => {
  const sortedMetrics = [...metrics].sort((a, b) => {
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    return b.overallScore - a.overallScore;
  });

  const comparisonChartData = sortedMetrics.map((m) => ({
    facility: m.facilityName.replace(' Zongoire', '').replace(' CHPS', ' CHPS').replace(' Health Centre', ' HC'),
    'Overall Performance': m.hasData ? m.overallScore : 0,
    'EPI Score': m.hasData ? m.epiScore : 0,
    'Maternal Score': m.hasData ? m.maternalScore : 0,
    'Child Score': m.hasData ? m.childScore : 0,
    'Disease Control Score': m.hasData ? m.diseaseScore : 0,
  }));

  return (
    <div className="space-y-4" id="facility-comparison-section">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SUB-DISTRICT FACILITY RANKING & BENCHMARKING MATRIX</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Facility Comparative League Table & Benchmarks
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Ranks all sub-district facilities across key health indicators to foster healthy peer comparison and direct M&E support.
          </p>
        </div>

        <button
          id="export-ranking-chart-btn"
          type="button"
          onClick={() => exportElementToPng('facility-comparison-section', 'Zongoire_Facility_Rankings.png')}
          className="bg-emerald-900 hover:bg-emerald-950 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-700 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>Export Ranking Chart (PNG)</span>
        </button>
      </div>

      {/* Top Ranked Facility Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {sortedMetrics.map((f, idx) => {
          const facInfo = facilities.find((facility) => facility.id === f.facilityId);
          const isWinner = idx === 0 && f.hasData;

          return (
            <div
              key={f.facilityId}
              className={`p-3 rounded shadow-sm border transition-all ${
                isWinner
                  ? 'bg-[#006633] text-white border-[#FFD700] ring-1 ring-[#FFD700]/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    !f.hasData
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      : isWinner
                      ? 'bg-[#FFD700] text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.hasData ? `Rank #${idx + 1}` : 'Pending Submission'}
                </span>
                {isWinner && <Award className="w-4 h-4 text-[#FFD700]" />}
              </div>

              <h3 className="text-xs font-bold truncate">{f.facilityName}</h3>
              <p className={`text-[10px] mb-2 ${isWinner ? 'text-green-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {facInfo?.type} • In-Charge: {facInfo?.inCharge}
              </p>

              <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span className={`text-[10px] font-semibold ${isWinner ? 'text-green-100' : 'text-slate-500'}`}>
                  Overall Score:
                </span>
                <span className="text-lg font-bold">{f.hasData ? `${f.overallScore}%` : '0%'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Facility Score Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <BarChart3 className="w-3.5 h-3.5 text-[#006633]" />
          <span>Facility Performance Breakdown Comparison ({periodLabel})</span>
        </h3>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="facility" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <Bar dataKey="Overall Performance" fill="#006633" radius={[2, 2, 0, 0]} />
              <Bar dataKey="EPI Score" fill="#0284c7" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Maternal Score" fill="#d97706" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Child Score" fill="#059669" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Facility League Table */}
      <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Complete Zongoire Sub-District Facility League Table</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Facility Name</th>
                <th className="py-2 px-3 text-center">EPI Score</th>
                <th className="py-2 px-3 text-center">Maternal Score</th>
                <th className="py-2 px-3 text-center">Child Score</th>
                <th className="py-2 px-3 text-center">Disease Score</th>
                <th className="py-2 px-3 text-center">TB Score</th>
                <th className="py-2 px-3 text-center">Overall Score</th>
                <th className="py-2 px-3 text-center">Performance Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedMetrics.map((f, idx) => (
                <tr key={f.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                    {f.hasData ? `#${idx + 1}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                    {f.facilityName}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-sky-700 dark:text-sky-400">
                    {f.hasData ? `${f.epiScore}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-amber-700 dark:text-amber-400">
                    {f.hasData ? `${f.maternalScore}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-[#006633] dark:text-emerald-400">
                    {f.hasData ? `${f.childScore}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    {f.hasData ? `${f.diseaseScore}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    {f.hasData ? `${f.tbScore}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white text-sm">
                    {f.hasData ? `${f.overallScore}%` : '0%'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        !f.hasData
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : f.performanceLevel === 'Green'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : f.performanceLevel === 'Amber'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {!f.hasData ? 'Pending' : `${f.performanceLevel} (${f.overallScore}%)`}
                    </span>
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
