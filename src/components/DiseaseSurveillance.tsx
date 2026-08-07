import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bug,
  HeartPulse,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FacilityMonthlyData } from '../types';

interface DiseaseSurveillanceProps {
  monthlyData: FacilityMonthlyData[];
  periodLabel: string;
}

export const DiseaseSurveillance: React.FC<DiseaseSurveillanceProps> = ({
  monthlyData,
  periodLabel,
}) => {
  // Aggregate total disease cases across sub-district for the selected period
  const diseaseTotals = monthlyData.reduce(
    (acc, curr) => {
      const d = curr.diseaseSurveillance;
      acc.malaria += d.malariaCases;
      acc.diarrhoea += d.diarrhoeaCases;
      acc.pneumonia += d.pneumoniaCases;
      acc.urti += d.urtiCases;
      acc.typhoid += d.typhoidCases;
      acc.anaemia += d.anaemiaCases;
      acc.hypertension += d.hypertensionCases;
      acc.tb += d.tbCases;
      acc.measles += d.measlesCases;
      acc.cholera += d.choleraCases;
      acc.meningitis += d.meningitisCases;
      return acc;
    },
    {
      malaria: 0,
      diarrhoea: 0,
      pneumonia: 0,
      urti: 0,
      typhoid: 0,
      anaemia: 0,
      hypertension: 0,
      tb: 0,
      measles: 0,
      cholera: 0,
      meningitis: 0,
    }
  );

  // List of diseases ranked automatically by morbidity burden
  const rankedDiseases = [
    { name: 'Malaria (OPD Confirmed)', key: 'malaria', cases: diseaseTotals.malaria, color: '#dc2626' },
    { name: 'Upper Respiratory Infection (URTI)', key: 'urti', cases: diseaseTotals.urti, color: '#d97706' },
    { name: 'Diarrhoea Cases', key: 'diarrhoea', cases: diseaseTotals.diarrhoea, color: '#2563eb' },
    { name: 'Pneumonia', key: 'pneumonia', cases: diseaseTotals.pneumonia, color: '#059669' },
    { name: 'Hypertension', key: 'hypertension', cases: diseaseTotals.hypertension, color: '#7c3aed' },
    { name: 'Anaemia', key: 'anaemia', cases: diseaseTotals.anaemia, color: '#db2777' },
    { name: 'Typhoid Fever', key: 'typhoid', cases: diseaseTotals.typhoid, color: '#ea580c' },
    { name: 'Tuberculosis (TB)', key: 'tb', cases: diseaseTotals.tb, color: '#4b5563' },
    { name: 'Measles (Suspected)', key: 'measles', cases: diseaseTotals.measles, color: '#ef4444' },
    { name: 'Cholera', key: 'cholera', cases: diseaseTotals.cholera, color: '#06b6d4' },
    { name: 'Meningitis', key: 'meningitis', cases: diseaseTotals.meningitis, color: '#8b5cf6' },
  ].sort((a, b) => b.cases - a.cases);

  const top3Diseases = rankedDiseases.slice(0, 3);
  const totalOpdCases = rankedDiseases.reduce((sum, d) => sum + d.cases, 0);

  // Facility Disease Burden Comparison Data
  const facilityBurdenData = monthlyData.map((d) => ({
    facility: d.facilityName.replace(' Zongoire', '').replace(' CHPS', ' CHPS').replace(' Health Centre', ' HC'),
    Malaria: d.diseaseSurveillance.malariaCases,
    Diarrhoea: d.diseaseSurveillance.diarrhoeaCases,
    URTI: d.diseaseSurveillance.urtiCases,
    Pneumonia: d.diseaseSurveillance.pneumoniaCases,
  }));

  const PIE_COLORS = ['#dc2626', '#d97706', '#2563eb', '#059669', '#7c3aed', '#db2777', '#ea580c', '#4b5563'];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DISEASE SURVEILLANCE & EPIDEMIC PREPAREDNESS</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Priority Disease Morbidity Ranking & Outbreak Tracking
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Automated ranking of top causes of OPD morbidity in Zongoire Sub-District. Tracks malaria, diarrhoea, respiratory infections, and epidemic-prone diseases.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-green-950/80 text-white p-2.5 rounded border border-green-700/60">
          <Bug className="w-4 h-4 text-[#FFD700]" />
          <div>
            <span className="font-bold block text-xs">Top Burden: {top3Diseases[0]?.name}</span>
            <span className="text-[10px] font-medium text-green-200">{top3Diseases[0]?.cases} cases ({Math.round(((top3Diseases[0]?.cases || 0) / (totalOpdCases || 1)) * 100)}% of total OPD morbidity)</span>
          </div>
        </div>
      </div>

      {/* Top 3 Morbidity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {top3Diseases.map((disease, idx) => (
          <div
            key={disease.key}
            className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                # Rank {idx + 1}
              </span>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                {disease.name}
              </h3>
              <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
                {disease.cases} <span className="text-xs font-normal text-slate-500">cases</span>
              </div>
            </div>
            <div
              className="w-9 h-9 rounded flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: disease.color }}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts: Horizontal Ranking + Disease Breakdown by Facility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Disease Ranking Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#006633]" />
            <span>Top Disease Burden Ranking ({periodLabel})</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={rankedDiseases.slice(0, 7)} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="cases" fill="#dc2626" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Morbidity Distribution Across Facilities */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Facility Comparison by Top OPD Morbidities</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityBurdenData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="facility" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                <Bar dataKey="Malaria" fill="#dc2626" radius={[2, 2, 0, 0]} />
                <Bar dataKey="URTI" fill="#d97706" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Diarrhoea" fill="#2563eb" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Pneumonia" fill="#059669" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Disease Burden Table */}
      <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>Priority Disease Surveillance Case Register & Burden Analysis</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Morbidity Rank</th>
                <th className="py-2 px-3">Disease Condition</th>
                <th className="py-2 px-3 text-right">Sub-District Cases</th>
                <th className="py-2 px-3 text-right">% OPD Share</th>
                <th className="py-2 px-3 text-center">Alert Status</th>
                <th className="py-2 px-3">Public Health Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankedDiseases.map((d, index) => {
                const sharePercent = totalOpdCases > 0 ? ((d.cases / totalOpdCases) * 100).toFixed(1) : '0.0';
                let alertBadge = 'Normal';
                let alertColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

                if (d.key === 'malaria' && d.cases > 150) {
                  alertBadge = 'High Burden';
                  alertColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
                } else if (d.key === 'diarrhoea' && d.cases > 30) {
                  alertBadge = 'Watchlist';
                  alertColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                }

                return (
                  <tr key={d.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      #{index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      {d.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-white">
                      {d.cases}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                      {sharePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${alertColor}`}>
                        {alertBadge}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {d.key === 'malaria'
                        ? 'Promote LLIN bednet usage & rapid diagnostic testing (mRDT).'
                        : d.key === 'diarrhoea'
                        ? 'Distribute ORS/Zinc & monitor community drinking water sources.'
                        : 'Routine OPD management and standard case logging.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
