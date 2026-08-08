import React from 'react';
import {
  Heart,
  Baby,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Award,
  Stethoscope,
  Users,
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Pill,
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
      acc.anc1 += m.anc1 || 0;
      acc.anc4 += m.anc4 || 0;
      acc.anc8 += m.anc8 || 0;
      acc.skilledDeliveries += m.skilledDeliveries || 0;
      acc.pnc += m.postnatalCare || 0;
      acc.ipt1 += m.ipt1 || 0;
      acc.ipt2 += m.ipt2 || 0;
      acc.ipt3 += m.ipt3 || 0;
      acc.teenagePregnancies += m.teenagePregnancies || 0;
      acc.ancAnaemiaRegistration += m.ancAnaemiaRegistration || 0;
      acc.ancAnaemia36Weeks += m.ancAnaemia36Weeks || 0;
      return acc;
    },
    {
      anc1: 0,
      anc4: 0,
      anc8: 0,
      skilledDeliveries: 0,
      pnc: 0,
      ipt1: 0,
      ipt2: 0,
      ipt3: 0,
      teenagePregnancies: 0,
      ancAnaemiaRegistration: 0,
      ancAnaemia36Weeks: 0,
    }
  );

  // Aggregate Child Totals
  const childTotals = monthlyData.reduce(
    (acc, curr) => {
      const c = curr.childHealth;
      acc.growthMonitoring += c.growthMonitoringAttended || 0;
      acc.vitaminA += c.vitaminASupplementation || 0;
      acc.deworming += c.deworming || 0;
      acc.malnutritionScreened += c.malnutritionScreened || 0;
      acc.sam += c.severeAcuteMalnutrition || 0;
      acc.mam += c.moderateAcuteMalnutrition || 0;
      acc.ebf += c.exclusiveBreastfeeding6Months || 0;
      acc.earlyBF += c.earlyBreastfeedingInitiation || 0;
      acc.penta3 += c.penta3Vaccinated || 0;
      acc.orsZinc += c.diarrhoeaTreatedOrsZinc || 0;
      return acc;
    },
    {
      growthMonitoring: 0,
      vitaminA: 0,
      deworming: 0,
      malnutritionScreened: 0,
      sam: 0,
      mam: 0,
      ebf: 0,
      earlyBF: 0,
      penta3: 0,
      orsZinc: 0,
    }
  );

  // Aggregate TB Totals
  const tbTotals = monthlyData.reduce(
    (acc, curr) => {
      const t = curr.tb;
      acc.screened += t.screened || 0;
      acc.presumptive += t.presumptiveCases || 0;
      acc.samples += t.samplesCollected || 0;
      acc.confirmed += t.confirmedCases || 0;
      acc.treatment += t.treatmentInitiated || 0;
      return acc;
    },
    { screened: 0, presumptive: 0, samples: 0, confirmed: 0, treatment: 0 }
  );

  // Maternal Cascade Chart Data
  const maternalCascadeData = [
    { indicator: 'ANC 1 Registration', count: maternalTotals.anc1 },
    { indicator: 'Teenage Pregnancies', count: maternalTotals.teenagePregnancies },
    { indicator: 'Anaemia @ Booking', count: maternalTotals.ancAnaemiaRegistration },
    { indicator: 'IPT 3 (Malaria)', count: maternalTotals.ipt3 },
    { indicator: 'ANC 4 Visits', count: maternalTotals.anc4 },
    { indicator: 'Anaemia @ 36 Weeks', count: maternalTotals.ancAnaemia36Weeks },
    { indicator: 'Skilled Deliveries', count: maternalTotals.skilledDeliveries },
    { indicator: 'PNC (within 48h)', count: maternalTotals.pnc },
  ];

  // Anaemia Comparison Chart Data
  const anaemiaComparisonData = monthlyData.map((d) => ({
    facilityName: d.facilityName.replace(' Health Centre', '').replace(' CHPS', ''),
    anc1: d.maternalHealth.anc1 || 0,
    anaemiaBooking: d.maternalHealth.ancAnaemiaRegistration || 0,
    anaemia36Wks: d.maternalHealth.ancAnaemia36Weeks || 0,
    teenage: d.maternalHealth.teenagePregnancies || 0,
  }));

  // Child Health & Nutrition Facility Comparison Chart Data
  const childHealthChartData = monthlyData.map((d) => ({
    facilityName: d.facilityName.replace(' Health Centre', '').replace(' CHPS', ''),
    GrowthMonitoring: d.childHealth.growthMonitoringAttended || 0,
    Screened: d.childHealth.malnutritionScreened || 0,
    VitaminA: d.childHealth.vitaminASupplementation || 0,
    Deworming: d.childHealth.deworming || 0,
    EBF6Months: d.childHealth.exclusiveBreastfeeding6Months || 0,
    MAM: d.childHealth.moderateAcuteMalnutrition || 0,
    SAM: d.childHealth.severeAcuteMalnutrition || 0,
  }));

  // TB Cascade Data
  const tbCascadeData = [
    { stage: 'Screened at OPD', cases: tbTotals.screened },
    { stage: 'Presumptive Cases', cases: tbTotals.presumptive },
    { stage: 'Sputum Samples Collected', cases: tbTotals.samples },
    { stage: 'GeneXpert Confirmed TB', cases: tbTotals.confirmed },
    { stage: 'DOTS Treatment Initiated', cases: tbTotals.treatment },
  ];

  const teenagePregnancyRate =
    maternalTotals.anc1 > 0
      ? Math.round((maternalTotals.teenagePregnancies / maternalTotals.anc1) * 100)
      : 0;

  const anaemiaBookingRate =
    maternalTotals.anc1 > 0
      ? Math.round((maternalTotals.ancAnaemiaRegistration / maternalTotals.anc1) * 100)
      : 0;

  const anaemia36WksRate =
    maternalTotals.anc1 > 0
      ? Math.round((maternalTotals.ancAnaemia36Weeks / maternalTotals.anc1) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span>MATERNAL, TEENAGE PREGNANCY, REPRODUCTIVE & CHILD HEALTH</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Reproductive, Maternal, Newborn, Adolescent & Child Health (RMNCAH)
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-3xl">
            Monitors ANC1-ANC8 retention, teenage pregnancy prevalence, maternal anaemia burden (booking vs 36 weeks), skilled birth attendance, PNC 48h, IPT malaria prophylaxis, and TB diagnosis cascade.
          </p>
        </div>
      </div>

      {/* Primary RMNCAH KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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

        {/* Teenage Pregnancy KPI */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Teenage Pregnancies</span>
            <Users className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">
            {maternalTotals.teenagePregnancies} cases
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
            {teenagePregnancyRate}% of total ANC1 bookings
          </p>
        </div>

        {/* ANC Anaemia KPI */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Anaemia @ Booking</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-0.5">
            {maternalTotals.ancAnaemiaRegistration} mothers
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
            {anaemiaBookingRate}% prevalence (&lt;11g/dl)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Skilled Deliveries</span>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {maternalTotals.skilledDeliveries} births
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Midwife & CHO assisted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">IPT3 Malaria Prophylaxis</span>
          <div className="text-xl font-bold text-teal-700 dark:text-teal-400 mt-0.5">
            {maternalTotals.ipt3} mothers
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">3+ doses SP in ANC</p>
        </div>
      </div>

      {/* Adolescent Reproductive Health & Maternal Anaemia Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Teenage Pregnancy Surveillance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-amber-200 dark:border-amber-900/40 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Adolescent Reproductive Health & Teenage Pregnancy</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Target: &lt;10% ANC1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total Teen Pregnancies</span>
              <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                {maternalTotals.teenagePregnancies} cases
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Sub-District Teen Rate</span>
              <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                {teenagePregnancyRate}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Teenage Pregnancy Proportion by Facility:
            </div>
            <div className="space-y-1.5">
              {monthlyData.map((d) => {
                const teen = d.maternalHealth.teenagePregnancies || 0;
                const anc1 = d.maternalHealth.anc1 || 1;
                const pct = Math.round((teen / anc1) * 100);

                return (
                  <div key={d.facilityId} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-32">
                      {d.facilityName.replace(' Health Centre', '').replace(' CHPS', '')}
                    </span>
                    <div className="flex-1 mx-3 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct > 25 ? 'bg-red-500' : pct > 15 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, pct * 2)}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 w-12 text-right">
                      {teen} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold text-slate-800 dark:text-white flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Priority Interventions:</span>
            </div>
            <p>
              Deploy Adolescent Friendly Health Services (AFHS) in CHPS zones, integrate SRHR education in Junior High Schools, and provide post-abortion care & contraceptive options.
            </p>
          </div>
        </div>

        {/* Card 2: Maternal Anaemia Tracking (Booking vs 36 Weeks) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-rose-200 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Maternal Anaemia Burden (&lt;11g/dl Hb)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              Hb Threshold &lt;11g/dl
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Anaemia @ Registration</span>
              <div className="text-lg font-bold text-rose-800 dark:text-rose-300">
                {maternalTotals.ancAnaemiaRegistration} mothers ({anaemiaBookingRate}%)
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Anaemia @ 36 Weeks</span>
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                <span>{maternalTotals.ancAnaemia36Weeks} mothers ({anaemia36WksRate}%)</span>
                {maternalTotals.ancAnaemiaRegistration > maternalTotals.ancAnaemia36Weeks && (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Anaemia Burden: Booking vs 36 Weeks Term:
            </div>
            <div className="space-y-1.5">
              {monthlyData.map((d) => {
                const booking = d.maternalHealth.ancAnaemiaRegistration || 0;
                const week36 = d.maternalHealth.ancAnaemia36Weeks || 0;

                return (
                  <div key={d.facilityId} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-32">
                      {d.facilityName.replace(' Health Centre', '').replace(' CHPS', '')}
                    </span>
                    <div className="flex-1 mx-3 flex items-center space-x-1">
                      <span className="text-[10px] font-bold text-rose-600 w-8">{booking} reg</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, booking * 4)}%` }}></div>
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, week36 * 4)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 w-8">{week36} 36w</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-bold text-slate-800 dark:text-white flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Anaemia Control Actions:</span>
            </div>
            <p>
              Ensure 100% Iron & Folic Acid (IFA) tablet compliance, IPTp-SP malaria prophylaxis, Mebendazole deworming in 2nd trimester, and maternal nutrition counseling.
            </p>
          </div>
        </div>
      </div>

      {/* Maternal & Child Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Maternal Continuum of Care */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Maternal Continuum of Care & Risk Cascade ({periodLabel})</span>
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
          <span>Facility RMNCAH & Adolescent Health Indicators Comparison</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-3">Facility</th>
                <th className="py-2 px-3 text-center">ANC1 Cov</th>
                <th className="py-2 px-3 text-center">Teen Preg (% ANC1)</th>
                <th className="py-2 px-3 text-center">Anaemia Reg (&lt;11g)</th>
                <th className="py-2 px-3 text-center">Anaemia 36w</th>
                <th className="py-2 px-3 text-center">ANC4 Cov</th>
                <th className="py-2 px-3 text-center">Skilled Delivery</th>
                <th className="py-2 px-3 text-center">IPT3 Cov</th>
                <th className="py-2 px-3 text-center">SAM Cases</th>
                <th className="py-2 px-3 text-center">Maternal Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.map((m) => {
                const facData = monthlyData.find((d) => d.facilityId === m.facilityId);
                const samCases = facData?.childHealth.severeAcuteMalnutrition || 0;
                const teenCases = facData?.maternalHealth.teenagePregnancies || 0;
                const anc1Cases = facData?.maternalHealth.anc1 || 1;
                const teenPct = Math.round((teenCases / anc1Cases) * 100);
                const anaemiaReg = facData?.maternalHealth.ancAnaemiaRegistration || 0;
                const anaemia36w = facData?.maternalHealth.ancAnaemia36Weeks || 0;

                return (
                  <tr key={m.facilityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                      {m.facilityName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{m.anc1CoverageRate}%</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={teenPct > 20 ? 'text-amber-600 font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
                        {teenCases} ({teenPct}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                      {anaemiaReg}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                      {anaemia36w}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#006633] dark:text-emerald-400">
                      {m.anc4CoverageRate}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={m.skilledDeliveryRate >= 60 ? 'text-green-600' : 'text-amber-600'}>
                        {m.skilledDeliveryRate}%
                      </span>
                    </td>
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

      {/* DEDICATED CHILD HEALTH & NUTRITION SERVICES DASHBOARD */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Baby className="w-4 h-4 text-emerald-600" />
              <span>GHANA HEALTH SERVICE CHILD SURVIVAL & NUTRITION PROGRAMME</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
              <span>Child Health, Malnutrition & IYCF Nutrition Services</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive surveillance of Growth Monitoring (GMP), Infant & Young Child Feeding (IYCF), SAM/MAM malnutrition management, Vitamin A, Deworming, and Diarrhoea ORS+Zinc treatment ({periodLabel}).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Child Survival Score: {Math.round(metrics.reduce((acc, m) => acc + m.childScore, 0) / (metrics.length || 1))}%</span>
          </span>
        </div>

        {/* Child Health KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Card 1: Growth Monitoring */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Growth Monitoring</span>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {childTotals.growthMonitoring} sessions
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Under-5 monthly weighing</p>
          </div>

          {/* Card 2: Screened & Malnutrition */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-500 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Malnutrition Screened</span>
            <div className="text-xl font-bold text-slate-800 dark:text-white">
              {childTotals.malnutritionScreened} children
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
              MUAC & WFH Screening
            </p>
          </div>

          {/* Card 3: SAM & MAM Cases */}
          <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-600 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Acute Malnutrition</span>
            <div className="text-lg font-bold text-rose-900 dark:text-rose-200 flex items-baseline space-x-1">
              <span className="text-rose-600 font-extrabold">{childTotals.sam} SAM</span>
              <span className="text-xs text-slate-500 font-normal">/ {childTotals.mam} MAM</span>
            </div>
            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">
              {childTotals.sam > 0 ? 'OTP Protocol Active' : 'No SAM Cases'}
            </p>
          </div>

          {/* Card 4: IYCF & Exclusive Breastfeeding */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 border-l-4 border-l-emerald-600 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">IYCF & EBF @ 6 Mo</span>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
              {childTotals.ebf} infants
            </div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Early BF: {childTotals.earlyBF} newborns
            </p>
          </div>

          {/* Card 5: Micronutrients */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vit A & Deworming</span>
            <div className="text-lg font-bold text-slate-800 dark:text-white">
              {childTotals.vitaminA} Vit A / {childTotals.deworming} Dew.
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Child health week doses</p>
          </div>

          {/* Card 6: Diarrhoea ORS + Zinc */}
          <div className="bg-sky-50/70 dark:bg-sky-950/30 p-3 rounded-lg border border-sky-200 dark:border-sky-900/50 border-l-4 border-l-sky-500 space-y-1">
            <span className="text-[10px] font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wider">Diarrhoea ORS + Zinc</span>
            <div className="text-xl font-bold text-sky-900 dark:text-sky-300">
              {childTotals.orsZinc} treated
            </div>
            <p className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">100% ORS & Zinc co-pack</p>
          </div>
        </div>

        {/* Charts & Clinical Protocols Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Facility Child Health Services Chart */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
              <Activity className="w-3.5 h-3.5 text-[#006633]" />
              <span>Facility Child Health & Nutrition Service Volume Comparison</span>
            </h4>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={childHealthChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="facilityName" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                  <Bar dataKey="GrowthMonitoring" name="Growth Monitored" fill="#006633" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Screened" name="Malnutrition Screened" fill="#d97706" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="VitaminA" name="Vitamin A" fill="#0284c7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="EBF6Months" name="Exclusive BF (6mo)" fill="#059669" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Child Malnutrition Protocol & Interventions */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Child Malnutrition Management & Clinical Protocols</span>
            </h4>

            <div className="space-y-2.5">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
                <div className="font-bold text-rose-800 dark:text-rose-400 flex items-center justify-between">
                  <span>Severe Acute Malnutrition (SAM) OTP Protocol</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-bold uppercase">MUAC &lt; 11.5 cm</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Total SAM Cases: <strong className="text-rose-600 font-bold">{childTotals.sam}</strong>. Initiate Outpatient Therapeutic Program (OTP) with Ready-to-Use Therapeutic Food (RUTF / Plumpy'Nut), Amoxicillin 7-day course, and weekly MUAC weight checks.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center justify-between">
                  <span>Moderate Acute Malnutrition (MAM) Intervention</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold uppercase">MUAC 11.5 - 12.5 cm</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Total MAM Cases: <strong className="text-amber-700 font-bold">{childTotals.mam}</strong>. Enrollment into Supplementary Feeding Program (SFP), demonstration of enriched local infant foods (Koko Plus, soya blend), and bi-weekly growth monitoring.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-emerald-200 dark:border-emerald-900/50 text-xs space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
                  <span>Infant & Young Child Feeding (IYCF) & Diarrhoea</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold uppercase">ORS + 20mg Zinc</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  100% early breastfeeding initiation within 1 hour of birth and strict 6-month exclusive breastfeeding. Administer ORS co-packaged with 20mg Zinc tablets daily for 10-14 days for acute diarrhoea.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Child Health Indicators Comparison Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Baby className="w-3.5 h-3.5 text-[#006633]" />
            <span>Facility Child Health & Nutrition Indicators Performance Matrix</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3 text-center">Growth Monitored</th>
                  <th className="py-2 px-3 text-center">Screened</th>
                  <th className="py-2 px-3 text-center">MAM Cases</th>
                  <th className="py-2 px-3 text-center">SAM Cases</th>
                  <th className="py-2 px-3 text-center">Early BF (&lt;1h)</th>
                  <th className="py-2 px-3 text-center">EBF @ 6 Months</th>
                  <th className="py-2 px-3 text-center">Vitamin A</th>
                  <th className="py-2 px-3 text-center">Dewormed</th>
                  <th className="py-2 px-3 text-center">ORS + Zinc</th>
                  <th className="py-2 px-3 text-center">Child Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.map((m) => {
                  const facData = monthlyData.find((d) => d.facilityId === m.facilityId);
                  const ch = facData?.childHealth;

                  return (
                    <tr key={m.facilityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                        {m.facilityName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#006633] dark:text-emerald-400">
                        {ch?.growthMonitoringAttended || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">
                        {ch?.malnutritionScreened || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-600">
                        {ch?.moderateAcuteMalnutrition || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={(ch?.severeAcuteMalnutrition || 0) > 0 ? 'text-red-600 font-extrabold' : 'text-emerald-600'}>
                          {ch?.severeAcuteMalnutrition || 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">
                        {ch?.earlyBreastfeedingInitiation || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        {ch?.exclusiveBreastfeeding6Months || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">
                        {ch?.vitaminASupplementation || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">
                        {ch?.deworming || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-sky-600">
                        {ch?.diarrhoeaTreatedOrsZinc || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                        {m.childScore}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
