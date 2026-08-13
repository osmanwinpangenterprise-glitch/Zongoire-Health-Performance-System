import React from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Syringe,
  Calendar,
  Activity,
  Award,
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
  LineChart,
  Line,
} from 'recharts';
import { FacilityMonthlyData, CalculatedFacilityMetrics, Facility } from '../types';

interface EpiModuleProps {
  monthlyData: FacilityMonthlyData[];
  metrics: CalculatedFacilityMetrics[];
  facilities: Facility[];
  periodLabel: string;
}

export const EpiModule: React.FC<EpiModuleProps> = ({
  monthlyData,
  metrics,
  facilities,
  periodLabel,
}) => {
  // Aggregate EPI Antigen totals for the period
  const totals = monthlyData.reduce(
    (acc, curr) => {
      const e = curr.epi;
      acc.bcg += e.bcg;
      acc.opv0 += e.opv0;
      acc.opv1 += e.opv1;
      acc.opv2 += e.opv2;
      acc.opv3 += e.opv3;
      acc.penta1 += e.penta1;
      acc.penta2 += e.penta2;
      acc.penta3 += e.penta3;
      acc.pcv1 += e.pcv1;
      acc.pcv2 += e.pcv2;
      acc.pcv3 += e.pcv3;
      acc.rota1 += e.rota1;
      acc.rota2 += e.rota2 || 0;
      acc.ipv += e.ipv || 0;
      acc.ipv2 += e.ipv2 || 0;
      acc.mr1 += e.mr1 || 0;
      acc.mr2 += e.mr2 || 0;
      acc.yellowFever += e.yellowFever || 0;
      acc.menA += e.menA || 0;
      acc.malaria1 += e.malaria1 || 0;
      acc.malaria2 += e.malaria2 || 0;
      acc.malaria3 += e.malaria3 || 0;
      acc.malaria4 += e.malaria4 || 0;
      acc.hpv1 += e.hpv1 || 0;
      acc.hpv2 += e.hpv2 || 0;
      acc.fic += e.fullyImmunizedChild || 0;
      acc.outreachDone += e.outreachSessionsDone;
      acc.outreachPlanned += e.outreachSessionsPlanned;
      acc.staticDone += e.staticSessionsDone;
      acc.staticPlanned += e.staticSessionsPlanned;
      return acc;
    },
    {
      bcg: 0,
      opv0: 0,
      opv1: 0,
      opv2: 0,
      opv3: 0,
      penta1: 0,
      penta2: 0,
      penta3: 0,
      pcv1: 0,
      pcv2: 0,
      pcv3: 0,
      rota1: 0,
      rota2: 0,
      ipv: 0,
      ipv2: 0,
      mr1: 0,
      mr2: 0,
      yellowFever: 0,
      menA: 0,
      malaria1: 0,
      malaria2: 0,
      malaria3: 0,
      malaria4: 0,
      hpv1: 0,
      hpv2: 0,
      fic: 0,
      outreachDone: 0,
      outreachPlanned: 0,
      staticDone: 0,
      staticPlanned: 0,
    }
  );

  // Immunization Cascade Chart Data
  const cascadeChartData = [
    { antigen: 'BCG (Birth)', doses: totals.bcg },
    { antigen: 'Penta1 (6wks)', doses: totals.penta1 },
    { antigen: 'Penta3 (14wks)', doses: totals.penta3 },
    { antigen: 'MR1 (9mos)', doses: totals.mr1 },
    { antigen: 'MR2 (18mos)', doses: totals.mr2 },
    { antigen: 'Fully Immunized (FIC)', doses: totals.fic },
  ];

  // Facility EPI Comparison Data
  const facilityEpiChartData = metrics.map((m) => ({
    facility: m.facilityName.replace(' Zongoire', '').replace(' CHPS', ' CHPS').replace(' Health Centre', ' HC'),
    'Penta1 Coverage': m.penta1CoverageRate,
    'Penta3 Coverage': m.penta3CoverageRate,
    'MR1 Coverage': m.mr1CoverageRate,
    'FIC Rate': m.ficRate,
    'Dropout Rate': m.pentaDropoutRate,
  }));

  // Overall Sub-district Penta Dropout Rate
  const overallPentaDropout =
    totals.penta1 > 0 ? Number((((totals.penta1 - totals.penta3) / totals.penta1) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Syringe className="w-3.5 h-3.5" />
            <span>EXPANDED PROGRAMME ON IMMUNIZATION (EPI) ANALYTICS</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Antigen Performance, Dropouts & Session Monitoring
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Automated analysis of child immunization antigens, Penta1 to Penta3 dropout rates, MR1 coverage, and session completeness.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-green-950/80 p-2.5 rounded border border-green-700/60">
          <div>
            <span className="text-green-300 font-bold block text-[10px] uppercase">
              Sub-District Dropout
            </span>
            <span
              className={`text-base font-extrabold ${
                overallPentaDropout <= 10 ? 'text-[#FFD700]' : 'text-red-400'
              }`}
            >
              {overallPentaDropout}%
            </span>
          </div>
          <div className="h-6 w-px bg-green-700" />
          <div>
            <span className="text-green-300 font-bold block text-[10px] uppercase">
              GHS Target
            </span>
            <span className="text-xs font-bold text-white">&lt; 10.0%</span>
          </div>
        </div>
      </div>

      {/* EPI KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penta1 Doses</span>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {totals.penta1} doses
          </div>
          <p className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mt-0.5">First contact baseline</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penta3 Doses</span>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {totals.penta3} doses
          </div>
          <p className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mt-0.5">Completed 3-dose series</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">MR1 Coverage</span>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {totals.mr1} doses
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">At 9 months of age</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#FFD700]">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fully Immunized Children</span>
          <div className="text-xl font-bold text-[#006633] dark:text-emerald-400 mt-0.5">
            {totals.fic} children
          </div>
          <p className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mt-0.5">All routine antigens</p>
        </div>
      </div>

      {/* Immunization Cascade Chart & Session Completeness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cascade Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <Syringe className="w-3.5 h-3.5 text-[#006633]" />
              <span>Antigen Dropout & Retention Cascade ({periodLabel})</span>
            </h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cascadeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="antigen" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="doses" fill="#006633" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sessions Monitoring Box */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Immunization Session Monitoring</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {/* Outreach Sessions */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold text-slate-800 dark:text-white mb-1 text-xs">
                <span>Outreach Sessions</span>
                <span className="text-[#006633] dark:text-emerald-400">
                  {totals.outreachDone} / {totals.outreachPlanned} ({Math.round((totals.outreachDone / (totals.outreachPlanned || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#006633] h-full transition-all"
                  style={{ width: `${Math.min(100, (totals.outreachDone / (totals.outreachPlanned || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Static Sessions */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold text-slate-800 dark:text-white mb-1 text-xs">
                <span>Fixed Static Sessions</span>
                <span className="text-sky-700 dark:text-sky-400">
                  {totals.staticDone} / {totals.staticPlanned} ({Math.round((totals.staticDone / (totals.staticPlanned || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-600 h-full transition-all"
                  style={{ width: `${Math.min(100, (totals.staticDone / (totals.staticPlanned || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded text-[11px] text-amber-800 dark:text-amber-300">
            <strong>M&E Note:</strong> Community outreach sessions held across CHPS zones with support from Community Health Volunteers.
          </div>
        </div>
      </div>

      {/* Facility EPI Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Layers className="w-3.5 h-3.5 text-[#006633]" />
          <span>Facility EPI Immunization Performance Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Facility</th>
                <th className="py-2 px-3 text-center">Data Source</th>
                <th className="py-2 px-3 text-center">Penta1 Cov</th>
                <th className="py-2 px-3 text-center">Penta3 Cov</th>
                <th className="py-2 px-3 text-center">RTS,S Mal3 '26</th>
                <th className="py-2 px-3 text-center">HPV1 '26</th>
                <th className="py-2 px-3 text-center">Penta Dropout</th>
                <th className="py-2 px-3 text-center">MR1 Cov</th>
                <th className="py-2 px-3 text-center">FIC Rate</th>
                <th className="py-2 px-3 text-center">Outreach Sessions</th>
                <th className="py-2 px-3 text-center">EPI Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.map((m) => {
                const facDataList = monthlyData.filter((d) => d.facilityId === m.facilityId);
                const facData = facDataList[0];
                const isActual = facDataList.some((d) => d.isSample === false || d.dataSource === 'actual');
                return (
                  <tr key={m.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      {m.facilityName}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isActual ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          ACTUAL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          SAMPLE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.penta1CoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#006633] dark:text-emerald-400">
                      {m.penta3CoverageRate}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {m.malaria3CoverageRate || 0}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20">
                      {m.hpv1CoverageRate || 0}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={m.pentaDropoutRate <= 10 ? 'text-green-600' : 'text-red-600'}>
                        {m.pentaDropoutRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.mr1CoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.ficRate}%</td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-600 dark:text-slate-400">
                      {facData?.epi.outreachSessionsDone} / {facData?.epi.outreachSessionsPlanned}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                      {m.epiScore}%
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
