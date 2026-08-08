import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bug,
  HeartPulse,
  ListFilter,
  PieChart as PieChartIcon,
  BarChart3,
  FileText,
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
  const [filterMode, setFilterMode] = useState<'top10' | 'all'>('top10');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Aggregate total disease cases across sub-district for the selected period
  const diseaseTotals = monthlyData.reduce(
    (acc, curr) => {
      const d = curr.diseaseSurveillance;
      acc.malaria += d.malariaCases || 0;
      acc.diarrhoea += d.diarrhoeaCases || 0;
      acc.pneumonia += d.pneumoniaCases || 0;
      acc.urti += d.urtiCases || 0;
      acc.typhoid += d.typhoidCases || 0;
      acc.anaemia += d.anaemiaCases || 0;
      acc.hypertension += d.hypertensionCases || 0;
      acc.diabetes += d.diabetesCases || 0;
      acc.skinDiseases += d.skinDiseasesCases || 0;
      acc.rheumatism += d.rheumatismCases || 0;
      acc.eyeInfections += d.eyeInfectionsCases || 0;
      acc.intestinalWorms += d.intestinalWormsCases || 0;
      acc.dentalCaries += d.dentalCariesCases || 0;
      acc.snakeBites += d.snakeBitesCases || 0;
      acc.dogBites += d.dogBitesCases || 0;
      acc.hepatitisB += d.hepatitisBCases || 0;
      acc.tb += d.tbCases || 0;
      acc.measles += d.measlesCases || 0;
      acc.cholera += d.choleraCases || 0;
      acc.meningitis += d.meningitisCases || 0;
      acc.yellowFever += d.yellowFeverCases || 0;
      acc.afp += d.afpCases || 0;
      acc.schistosomiasis += d.schistosomiasisCases || 0;
      acc.pregnancyComplications += d.pregnancyComplicationsCases || 0;
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
      diabetes: 0,
      skinDiseases: 0,
      rheumatism: 0,
      eyeInfections: 0,
      intestinalWorms: 0,
      dentalCaries: 0,
      snakeBites: 0,
      dogBites: 0,
      hepatitisB: 0,
      tb: 0,
      measles: 0,
      cholera: 0,
      meningitis: 0,
      yellowFever: 0,
      afp: 0,
      schistosomiasis: 0,
      pregnancyComplications: 0,
    }
  );

  // Comprehensive list of diseases ranked automatically by morbidity burden
  const rankedDiseases = [
    { name: 'Malaria (OPD Confirmed)', key: 'malaria', category: 'Infectious', cases: diseaseTotals.malaria, color: '#dc2626', action: 'Distribute LLIN bednets, stock mRDTs & ACTs in all CHPS.' },
    { name: 'Upper Respiratory Infection (URTI)', key: 'urti', category: 'Respiratory', cases: diseaseTotals.urti, color: '#d97706', action: 'Routine OPD care; monitor seasonal surges and cold chain.' },
    { name: 'Diarrhoea Cases', key: 'diarrhoea', category: 'Waterborne', cases: diseaseTotals.diarrhoea, color: '#2563eb', action: 'Distribute ORS/Zinc tablets & conduct WASH water source testing.' },
    { name: 'Pneumonia', key: 'pneumonia', category: 'Respiratory', cases: diseaseTotals.pneumonia, color: '#059669', action: 'Ensure pediatric Amoxicillin DT availability & Pulse Oximetry.' },
    { name: 'Skin Diseases & Ulcers', key: 'skinDiseases', category: 'Dermatological', cases: diseaseTotals.skinDiseases, color: '#0284c7', action: 'Promote hygiene education & community skin screening.' },
    { name: 'Hypertension', key: 'hypertension', category: 'NCD', cases: diseaseTotals.hypertension, color: '#7c3aed', action: 'Routine BP screening during OPD visits & CHPS wellness clinics.' },
    { name: 'Intestinal Worms / Helminthiasis', key: 'intestinalWorms', category: 'NTD', cases: diseaseTotals.intestinalWorms, color: '#0d9488', action: 'Mass Albendazole/Mebendazole deworming in primary schools.' },
    { name: 'Rheumatism & Joint Pains', key: 'rheumatism', category: 'Musculoskeletal', cases: diseaseTotals.rheumatism, color: '#8b5cf6', action: 'Provide pain management & physical rehabilitation advice.' },
    { name: 'Acute Eye Infections', key: 'eyeInfections', category: 'Ophthalmic', cases: diseaseTotals.eyeInfections, color: '#3b82f6', action: 'Distribute Tetracycline eye ointment & eye hygiene education.' },
    { name: 'Anaemia', key: 'anaemia', category: 'Nutritional', cases: diseaseTotals.anaemia, color: '#db2777', action: 'Provide Iron/Folic acid supplementation & nutritional support.' },
    { name: 'Diabetes Mellitus', key: 'diabetes', category: 'NCD', cases: diseaseTotals.diabetes, color: '#9333ea', action: 'Fasting blood glucose testing & dietary counseling.' },
    { name: 'Typhoid Fever', key: 'typhoid', category: 'Waterborne', cases: diseaseTotals.typhoid, color: '#ea580c', action: 'Enforce food vendor screening & safe drinking water practices.' },
    { name: 'Pregnancy-related Complications', key: 'pregnancyComplications', category: 'Maternal', cases: diseaseTotals.pregnancyComplications, color: '#be123c', action: 'Prompt referral to Health Centre/Hospital & ANC tracking.' },
    { name: 'Dental & Oral Conditions', key: 'dentalCaries', category: 'Dental', cases: diseaseTotals.dentalCaries, color: '#64748b', action: 'Promote oral hygiene education & referral for dental care.' },
    { name: 'Schistosomiasis / Bilharzia', key: 'schistosomiasis', category: 'NTD', cases: diseaseTotals.schistosomiasis, color: '#0f766e', action: 'Targeted Praziquantel treatment & water contact education.' },
    { name: 'Viral Hepatitis B / C', key: 'hepatitisB', category: 'Infectious', cases: diseaseTotals.hepatitisB, color: '#b45309', action: 'Promote birth-dose Hep B vaccination & safe blood practices.' },
    { name: 'Snake Bites & Envenomation', key: 'snakeBites', category: 'Injury / Poisoning', cases: diseaseTotals.snakeBites, color: '#c2410c', action: 'Ensure polyvalent Anti-Snake Venom (ASV) buffer stock.' },
    { name: 'Tuberculosis (TB Confirmed)', key: 'tb', category: 'Infectious', cases: diseaseTotals.tb, color: '#4b5563', action: 'GeneXpert sputum collection & DOTS regimen initiation.' },
    { name: 'Dog Bites / Suspected Rabies', key: 'dogBites', category: 'Zoonotic', cases: diseaseTotals.dogBites, color: '#9f1239', action: 'Wound washing & immediate Post-Exposure Prophylaxis (PEP).' },
    { name: 'Measles (Suspected IDSR)', key: 'measles', category: 'Epidemic / Vaccine-Preventable', cases: diseaseTotals.measles, color: '#ef4444', action: 'Immediate blood sample collection for lab & outbreak investigation.' },
    { name: 'Acute Bacterial Meningitis', key: 'meningitis', category: 'Epidemic-Prone', cases: diseaseTotals.meningitis, color: '#8b5cf6', action: 'Lumbar puncture CSF sampling & immediate IV Ceftriaxone.' },
    { name: 'Suspected Cholera', key: 'cholera', category: 'Epidemic-Prone', cases: diseaseTotals.cholera, color: '#06b6d4', action: 'Stool sample collection, isolation ward prep & contact tracing.' },
    { name: 'Yellow Fever / Acute Jaundice', key: 'yellowFever', category: 'Epidemic-Prone', cases: diseaseTotals.yellowFever, color: '#eab308', action: 'Serology sample collection & vector control in sub-district.' },
    { name: 'Acute Flaccid Paralysis (Polio)', key: 'afp', category: 'Epidemic / Vaccine-Preventable', cases: diseaseTotals.afp, color: '#f97316', action: 'Collect 2 stool samples within 14 days for National Polio Lab.' },
  ].sort((a, b) => b.cases - a.cases);

  const top10Diseases = rankedDiseases.slice(0, 10);
  const totalOpdCases = rankedDiseases.reduce((sum, d) => sum + d.cases, 0);
  const top10TotalCases = top10Diseases.reduce((sum, d) => sum + d.cases, 0);
  const top10Percentage = totalOpdCases > 0 ? Math.round((top10TotalCases / totalOpdCases) * 100) : 0;

  // Pie chart distribution data: Top 10 individual diseases vs. Others
  const pieChartData = [
    ...top10Diseases.map((d) => ({
      name: d.name.split('(')[0].trim(),
      value: d.cases,
      color: d.color,
    })),
    {
      name: 'Other OPD Conditions',
      value: Math.max(0, totalOpdCases - top10TotalCases),
      color: '#94a3b8',
    },
  ].filter((d) => d.value > 0);

  // Facility Disease Burden Comparison Data
  const facilityBurdenData = monthlyData.map((d) => ({
    facility: d.facilityName.replace(' Zongoire', '').replace(' CHPS', ' CHPS').replace(' Health Centre', ' HC'),
    Malaria: d.diseaseSurveillance.malariaCases || 0,
    URTI: d.diseaseSurveillance.urtiCases || 0,
    Diarrhoea: d.diseaseSurveillance.diarrhoeaCases || 0,
    Pneumonia: d.diseaseSurveillance.pneumoniaCases || 0,
    Hypertension: d.diseaseSurveillance.hypertensionCases || 0,
  }));

  // Categories list for filter dropdown
  const categories = ['All', 'Infectious', 'Respiratory', 'Waterborne', 'NCD', 'NTD', 'Dermatological', 'Nutritional', 'Epidemic-Prone'];

  // Filter table data
  const displayedDiseases = rankedDiseases
    .slice(0, filterMode === 'top10' ? 10 : rankedDiseases.length)
    .filter((d) => selectedCategory === 'All' || d.category === selectedCategory);

  const PIE_COLORS = ['#dc2626', '#d97706', '#2563eb', '#059669', '#0284c7', '#7c3aed', '#0d9488', '#8b5cf6', '#3b82f6', '#db2777', '#94a3b8'];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DISEASE SURVEILLANCE & OPD MORBIDITY REPORT</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Top 10 Causes of Outpatient (OPD) Morbidity Report
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-3xl">
            Automated ranking of the Top 10 diseases driving OPD consultations in Zongoire Sub-District. Tracks malaria, URTI, diarrhoea, NCDs, NTDs, and epidemic-prone conditions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-green-950/80 text-white p-2.5 rounded border border-green-700/60">
          <Bug className="w-4 h-4 text-[#FFD700]" />
          <div>
            <span className="font-bold block text-xs">Top 10 OPD Contribution</span>
            <span className="text-[10px] font-medium text-green-200">
              {top10TotalCases} cases ({top10Percentage}% of total {totalOpdCases} OPD morbidity)
            </span>
          </div>
        </div>
      </div>

      {/* TOP 10 CAUSES OF OPD MORBIDITY - CARDS SUMMARY */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
              Sub-District OPD Morbidity
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Top 10 Causes of OPD Morbidity Summary ({periodLabel})</span>
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Top 10 Account for <strong className="text-red-600 font-bold">{top10Percentage}%</strong> of All Consultations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {top10Diseases.map((disease, idx) => {
            const share = totalOpdCases > 0 ? Math.round((disease.cases / totalOpdCases) * 100) : 0;
            const isTop3 = idx < 3;
            const rankBadgeColor =
              idx === 0
                ? 'bg-amber-500 text-white'
                : idx === 1
                ? 'bg-slate-400 text-white'
                : idx === 2
                ? 'bg-amber-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

            return (
              <div
                key={disease.key}
                className={`p-2.5 rounded border transition-all ${
                  isTop3
                    ? 'bg-slate-50/90 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${rankBadgeColor}`}>
                    Rank #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{share}% share</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1.5 truncate" title={disease.name}>
                  {disease.name}
                </h4>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-baseline justify-between">
                  <span>{disease.cases} <span className="text-[10px] font-normal text-slate-500">cases</span></span>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: disease.color }}
                  ></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts: Horizontal Top 10 Ranking + Proportion Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Top 10 Diseases Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#006633]" />
              <span>Top 10 Causes of OPD Morbidity ({periodLabel})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Cases Count</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={top10Diseases} margin={{ top: 5, right: 25, left: 25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  formatter={(val: number) => [`${val} cases (${totalOpdCases > 0 ? Math.round((val / totalOpdCases) * 100) : 0}% of OPD)`, 'Cases']}
                />
                <Bar dataKey="cases" fill="#dc2626" radius={[0, 3, 3, 0]}>
                  {top10Diseases.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top 10 Proportion Donut / Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Top 10 Morbidity Share Distribution (%)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Total: {totalOpdCases} OPD</span>
          </div>

          <div className="h-72 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  formatter={(value: number) => [`${value} cases (${totalOpdCases > 0 ? ((value / totalOpdCases) * 100).toFixed(1) : 0}%)`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facility Comparison by Top OPD Morbidities */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Activity className="w-3.5 h-3.5 text-[#006633]" />
          <span>Facility Comparison Across Leading OPD Causes (Malaria, URTI, Diarrhoea, Pneumonia, Hypertension)</span>
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
              <Bar dataKey="Hypertension" fill="#7c3aed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filterable Disease Surveillance Register & Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Disease Surveillance Case Register ({filterMode === 'top10' ? 'Top 10 Causes Report' : 'All Conditions'})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('top10')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  filterMode === 'top10'
                    ? 'bg-[#006633] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Top 10 Causes Report
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#006633] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All 24 Conditions
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center space-x-1 text-xs">
              <ListFilter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#006633]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Disease Condition</th>
                <th className="py-2 px-3 text-right">Sub-District Cases</th>
                <th className="py-2 px-3 text-right">% OPD Share</th>
                <th className="py-2 px-3 text-center">Alert Status</th>
                <th className="py-2 px-3">Public Health Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedDiseases.map((d) => {
                const globalRank = rankedDiseases.findIndex((r) => r.key === d.key) + 1;
                const sharePercent = totalOpdCases > 0 ? ((d.cases / totalOpdCases) * 100).toFixed(1) : '0.0';
                let alertBadge = 'Normal';
                let alertColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

                const isEpidemicProne = ['measles', 'cholera', 'meningitis', 'yellowFever', 'afp', 'snakeBites', 'dogBites'].includes(d.key);
                if (isEpidemicProne && d.cases > 0) {
                  alertBadge = d.key === 'snakeBites' || d.key === 'dogBites' ? 'Urgent Response' : 'IDSR Alert';
                  alertColor = 'bg-red-600 text-white animate-pulse';
                } else if (d.key === 'malaria' && d.cases > 150) {
                  alertBadge = 'High Burden';
                  alertColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
                } else if (d.key === 'diarrhoea' && d.cases > 30) {
                  alertBadge = 'Watchlist';
                  alertColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                }

                return (
                  <tr key={d.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      #{globalRank}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800 dark:text-white">{d.name}</div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{d.category}</span>
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
                      {d.action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filterMode === 'top10' && (
              <tfoot>
                <tr className="bg-slate-100/90 dark:bg-slate-800 font-bold border-t border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs">
                  <td className="py-2.5 px-3" colSpan={2}>
                    TOP 10 MORBIDITIES SUB-TOTAL
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 font-extrabold">
                    {top10TotalCases}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold">
                    {top10Percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-center" colSpan={2}>
                    Primary OPD Drivers
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

