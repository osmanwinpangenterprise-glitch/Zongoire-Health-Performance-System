import React from 'react';
import {
  Heart,
  Baby,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Award,
  Stethoscope,
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
import { FacilityMonthlyData, CalculatedFacilityMetrics } from '../types';

interface MaternalChildModuleProps {
  monthlyData: FacilityMonthlyData[];
  metrics: CalculatedFacilityMetrics[];
  periodLabel: string;
}

export const MaternalChildModule: React.FC<MaternalChildModuleProps> = ({
  monthlyData,
  metrics,
  periodLabel,
}) => {
  // Aggregate Maternal Totals
  const maternalTotals = monthlyData.reduce(
    (acc, curr) => {
      const m = curr.maternalHealth;
      acc.anc1 += m.anc1;
      acc.anc4 += m.anc4;
      acc.anc8 += m.anc8;
      acc.skilledDeliveries += m.skilledDeliveries;
      acc.pnc += m.postnatalCare;
      acc.ipt1 += m.ipt1;
      acc.ipt2 += m.ipt2;
      acc.ipt3 += m.ipt3;
      return acc;
    },
    { anc1: 0, anc4: 0, anc8: 0, skilledDeliveries: 0, pnc: 0, ipt1: 0, ipt2: 0, ipt3: 0 }
  );

  // Aggregate Child Totals
  const childTotals = monthlyData.reduce(
    (acc, curr) => {
      const c = curr.childHealth;
      acc.growthMonitoring += c.growthMonitoringAttended;
      acc.vitaminA += c.vitaminASupplementation;
      acc.deworming += c.deworming;
      acc.malnutritionScreened += c.malnutritionScreened;
      acc.sam += c.severeAcuteMalnutrition;
      return acc;
    },
    { growthMonitoring: 0, vitaminA: 0, deworming: 0, malnutritionScreened: 0, sam: 0 }
  );

  // Aggregate TB Totals
  const tbTotals = monthlyData.reduce(
    (acc, curr) => {
      const t = curr.tb;
      acc.screened += t.screened;
      acc.presumptive += t.presumptiveCases;
      acc.samples += t.samplesCollected;
      acc.confirmed += t.confirmedCases;
      acc.treatment += t.treatmentInitiated;
      return acc;
    },
    { screened: 0, presumptive: 0, samples: 0, confirmed: 0, treatment: 0 }
  );

  // Maternal Cascade Chart Data
  const maternalCascadeData = [
    { indicator: 'ANC 1 Registration', count: maternalTotals.anc1 },
    { indicator: 'IPT 1 (Malaria)', count: maternalTotals.ipt1 },
    { indicator: 'IPT 3 (Malaria)', count: maternalTotals.ipt3 },
    { indicator: 'ANC 4 Visits', count: maternalTotals.anc4 },
    { indicator: 'Skilled Deliveries', count: maternalTotals.skilledDeliveries },
    { indicator: 'PNC (within 48h)', count: maternalTotals.pnc },
  ];

  // TB Cascade Data
  const tbCascadeData = [
    { stage: 'Screened at OPD', cases: tbTotals.screened },
    { stage: 'Presumptive Cases', cases: tbTotals.presumptive },
    { stage: 'Sputum Samples Collected', cases: tbTotals.samples },
    { stage: 'GeneXpert Confirmed TB', cases: tbTotals.confirmed },
    { stage: 'DOTS Treatment Initiated', cases: tbTotals.treatment },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span>MATERNAL, NEONATAL, CHILD HEALTH & TB CASCADE</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Reproductive, Maternal, Newborn & Child Health (RMNCH)
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Monitors ANC1-ANC8 retention, skilled birth attendance, PNC 48h coverage, IPT malaria prophylaxis, child nutrition screening, and TB diagnosis cascade.
          </p>
        </div>
      </div>

      {/* Maternal KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ANC1 Registrations</span>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {maternalTotals.anc1} women
          </div>
          <p className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mt-0.5">Early pregnancy booking</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ANC4 Visits Achieved</span>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {maternalTotals.anc4} women
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            ANC4 Retention:{' '}
            <strong className="text-slate-800 dark:text-white font-bold">
              {maternalTotals.anc1 > 0 ? Math.round((maternalTotals.anc4 / maternalTotals.anc1) * 100) : 0}%
            </strong>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Skilled Deliveries</span>
          <div className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-0.5">
            {maternalTotals.skilledDeliveries} births
          </div>
          <p className="text-[10px] text-green-600 dark:text-emerald-400 font-bold mt-0.5">Midwife & CHO assisted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">IPT3 Malaria Prophylaxis</span>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
            {maternalTotals.ipt3} mothers
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">3+ doses SP in ANC</p>
        </div>
      </div>

      {/* Maternal & Child Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Maternal Continuum of Care */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Maternal Continuum of Care Cascade ({periodLabel})</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maternalCascadeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="indicator" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="count" fill="#e11d48" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: TB Screening Cascade */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span>Tuberculosis (TB) Diagnosis & Treatment Cascade</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tbCascadeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="cases" fill="#0284c7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facility Maternal Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Baby className="w-3.5 h-3.5 text-[#006633]" />
          <span>Facility Maternal & Child Health Indicators Comparison</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Facility</th>
                <th className="py-2 px-3 text-center">ANC1 Cov</th>
                <th className="py-2 px-3 text-center">ANC4 Cov</th>
                <th className="py-2 px-3 text-center">ANC Retention</th>
                <th className="py-2 px-3 text-center">Skilled Delivery</th>
                <th className="py-2 px-3 text-center">PNC 48h</th>
                <th className="py-2 px-3 text-center">IPT3 Cov</th>
                <th className="py-2 px-3 text-center">SAM Cases</th>
                <th className="py-2 px-3 text-center">Maternal Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.map((m) => {
                const facData = monthlyData.find((d) => d.facilityId === m.facilityId);
                const samCases = facData?.childHealth.severeAcuteMalnutrition || 0;

                return (
                  <tr key={m.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      {m.facilityName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.anc1CoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#006633] dark:text-emerald-400">
                      {m.anc4CoverageRate}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.ancRetentionRate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={m.skilledDeliveryRate >= 60 ? 'text-green-600' : 'text-amber-600'}>
                        {m.skilledDeliveryRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.pncCoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.ipt3CoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={samCases > 0 ? 'text-red-600' : 'text-green-600'}>
                        {samCases}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                      {m.maternalScore}%
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
