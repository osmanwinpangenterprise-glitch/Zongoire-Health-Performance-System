import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldAlert,
  Building2,
  Users,
  FileText,
  HelpCircle,
  BarChart3,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Facility, FacilityMonthlyData, UserRole } from '../types';

interface DataEntryModuleProps {
  facilities: Facility[];
  monthlyData: FacilityMonthlyData[];
  onSaveRecord: (record: FacilityMonthlyData) => void;
  userRole: UserRole;
  userEmail: string;
  selectedYear: number;
  selectedMonth: number;
  onNavigateTab?: (tab: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DataEntryModule: React.FC<DataEntryModuleProps> = ({
  facilities,
  monthlyData,
  onSaveRecord,
  userRole,
  selectedYear,
  selectedMonth,
  onNavigateTab,
}) => {
  // Primary selection state
  const [targetFacilityId, setTargetFacilityId] = useState<string>(
    facilities[0]?.id || 'zongoire_hc'
  );
  const [entryYear, setEntryYear] = useState<number>(selectedYear);
  const [entryMonth, setEntryMonth] = useState<number>(selectedMonth);
  const [activeFormSection, setActiveFormSection] = useState<'epi' | 'disease' | 'maternal' | 'child' | 'tb'>('epi');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FacilityMonthlyData>(() => createInitialForm(targetFacilityId, facilities, entryYear, entryMonth));

  // Initialize or reload form data when facility/year/month changes
  useEffect(() => {
    const existing = monthlyData.find(
      (d) => d.facilityId === targetFacilityId && d.year === entryYear && d.month === entryMonth
    );

    if (existing) {
      setFormData(JSON.parse(JSON.stringify(existing)));
    } else {
      setFormData(createInitialForm(targetFacilityId, facilities, entryYear, entryMonth));
    }
    setSaveSuccessMsg(null);
  }, [targetFacilityId, entryYear, entryMonth, monthlyData, facilities]);

  // Helper to construct empty or fresh record
  function createInitialForm(facId: string, facList: Facility[], yr: number, mo: number): FacilityMonthlyData {
    const foundFac = facList.find((f) => f.id === facId);
    const facName = foundFac ? foundFac.name : 'Zongoire Health Centre';
    const monthName = MONTH_NAMES[(mo - 1) % 12];
    const monthLabel = `${monthName.substring(0, 3)} ${yr}`;

    return {
      facilityId: facId,
      facilityName: facName,
      year: yr,
      month: mo,
      monthLabel,
      reportStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      epi: {
        bcg: 0, opv0: 0, opv1: 0, opv2: 0, opv3: 0,
        penta1: 0, penta2: 0, penta3: 0,
        pcv1: 0, pcv2: 0, pcv3: 0,
        rota1: 0, rota2: 0, ipv: 0,
        mr1: 0, mr2: 0, yellowFever: 0,
        vitaminA: 0, fullyImmunizedChild: 0, tdTT: 0,
        outreachSessionsDone: 0, outreachSessionsPlanned: 0,
        staticSessionsDone: 0, staticSessionsPlanned: 0,
      },
      diseaseSurveillance: {
        malariaCases: 0,
        diarrhoeaCases: 0,
        pneumoniaCases: 0,
        urtiCases: 0,
        typhoidCases: 0,
        anaemiaCases: 0,
        hypertensionCases: 0,
        diabetesCases: 0,
        skinDiseasesCases: 0,
        rheumatismCases: 0,
        eyeInfectionsCases: 0,
        intestinalWormsCases: 0,
        dentalCariesCases: 0,
        snakeBitesCases: 0,
        dogBitesCases: 0,
        hepatitisBCases: 0,
        tbCases: 0,
        measlesCases: 0,
        choleraCases: 0,
        meningitisCases: 0,
        yellowFeverCases: 0,
        afpCases: 0,
        schistosomiasisCases: 0,
        pregnancyComplicationsCases: 0,
      },
      maternalHealth: {
        anc1: 0, anc4: 0, anc8: 0, skilledDeliveries: 0,
        postnatalCare: 0, ipt1: 0, ipt2: 0, ipt3: 0,
        teenagePregnancies: 0, ancAnaemiaRegistration: 0, ancAnaemia36Weeks: 0,
      },
      childHealth: {
        growthMonitoringAttended: 0, vitaminASupplementation: 0,
        deworming: 0, malnutritionScreened: 0, severeAcuteMalnutrition: 0,
        moderateAcuteMalnutrition: 0, exclusiveBreastfeeding6Months: 0,
        earlyBreastfeedingInitiation: 0, penta3Vaccinated: 0, diarrhoeaTreatedOrsZinc: 0,
      },
      tb: {
        screened: 0, presumptiveCases: 0, samplesCollected: 0,
        confirmedCases: 0, treatmentInitiated: 0,
      },
    };
  }

  // Update specific nested form field
  const handleNumChange = (
    category: 'epi' | 'diseaseSurveillance' | 'maternalHealth' | 'childHealth' | 'tb',
    field: string,
    val: number
  ) => {
    const numVal = Math.max(0, isNaN(val) ? 0 : val);
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numVal,
      },
    }));
    setSaveSuccessMsg(null);
  };

  // Pre-fill realistic sample values for fast accurate data entry
  const handlePrefillSample = () => {
    const foundFac = facilities.find((f) => f.id === targetFacilityId);
    const isCHPS = foundFac?.type === 'CHPS' || targetFacilityId.includes('chps');

    const sample: FacilityMonthlyData = {
      ...formData,
      epi: {
        bcg: isCHPS ? 18 : 34,
        opv0: isCHPS ? 17 : 32,
        opv1: isCHPS ? 20 : 38,
        opv2: isCHPS ? 19 : 36,
        opv3: isCHPS ? 18 : 35,
        penta1: isCHPS ? 21 : 39,
        penta2: isCHPS ? 20 : 37,
        penta3: isCHPS ? 19 : 36,
        pcv1: isCHPS ? 21 : 39,
        pcv2: isCHPS ? 20 : 37,
        pcv3: isCHPS ? 19 : 36,
        rota1: isCHPS ? 21 : 39,
        rota2: isCHPS ? 20 : 37,
        ipv: isCHPS ? 19 : 35,
        mr1: isCHPS ? 18 : 34,
        mr2: isCHPS ? 16 : 30,
        yellowFever: isCHPS ? 18 : 34,
        vitaminA: isCHPS ? 35 : 65,
        fullyImmunizedChild: isCHPS ? 17 : 32,
        tdTT: isCHPS ? 22 : 45,
        outreachSessionsDone: isCHPS ? 4 : 8,
        outreachSessionsPlanned: isCHPS ? 4 : 8,
        staticSessionsDone: isCHPS ? 12 : 22,
        staticSessionsPlanned: isCHPS ? 12 : 22,
      },
      diseaseSurveillance: {
        malariaCases: isCHPS ? 65 : 142,
        diarrhoeaCases: isCHPS ? 12 : 28,
        pneumoniaCases: isCHPS ? 8 : 19,
        urtiCases: isCHPS ? 28 : 55,
        typhoidCases: isCHPS ? 3 : 9,
        anaemiaCases: isCHPS ? 6 : 14,
        hypertensionCases: isCHPS ? 9 : 22,
        diabetesCases: isCHPS ? 5 : 12,
        skinDiseasesCases: isCHPS ? 11 : 22,
        rheumatismCases: isCHPS ? 8 : 16,
        eyeInfectionsCases: isCHPS ? 7 : 15,
        intestinalWormsCases: isCHPS ? 10 : 20,
        dentalCariesCases: isCHPS ? 2 : 7,
        snakeBitesCases: isCHPS ? 1 : 2,
        dogBitesCases: isCHPS ? 0 : 1,
        hepatitisBCases: isCHPS ? 1 : 3,
        tbCases: isCHPS ? 0 : 2,
        measlesCases: 0,
        choleraCases: 0,
        meningitisCases: 0,
        yellowFeverCases: 0,
        afpCases: 0,
        schistosomiasisCases: isCHPS ? 2 : 4,
        pregnancyComplicationsCases: isCHPS ? 3 : 8,
      },
      maternalHealth: {
        anc1: isCHPS ? 16 : 35,
        anc4: isCHPS ? 13 : 29,
        anc8: isCHPS ? 9 : 20,
        skilledDeliveries: isCHPS ? 11 : 28,
        postnatalCare: isCHPS ? 12 : 27,
        ipt1: isCHPS ? 15 : 32,
        ipt2: isCHPS ? 14 : 30,
        ipt3: isCHPS ? 12 : 27,
        teenagePregnancies: isCHPS ? 4 : 7,
        ancAnaemiaRegistration: isCHPS ? 6 : 12,
        ancAnaemia36Weeks: isCHPS ? 2 : 5,
      },
      childHealth: {
        growthMonitoringAttended: isCHPS ? 75 : 160,
        vitaminASupplementation: isCHPS ? 28 : 58,
        deworming: isCHPS ? 24 : 52,
        malnutritionScreened: isCHPS ? 80 : 170,
        severeAcuteMalnutrition: isCHPS ? 1 : 2,
        moderateAcuteMalnutrition: isCHPS ? 3 : 5,
        exclusiveBreastfeeding6Months: isCHPS ? 12 : 28,
        earlyBreastfeedingInitiation: isCHPS ? 14 : 30,
        penta3Vaccinated: isCHPS ? 15 : 32,
        diarrhoeaTreatedOrsZinc: isCHPS ? 10 : 22,
      },
      tb: {
        screened: isCHPS ? 25 : 55,
        presumptiveCases: isCHPS ? 2 : 5,
        samplesCollected: isCHPS ? 2 : 5,
        confirmedCases: isCHPS ? 0 : 1,
        treatmentInitiated: isCHPS ? 0 : 1,
      },
    };
    setFormData(sample);
  };

  // Perform automated accuracy validation checks
  const getValidationWarnings = () => {
    const warnings: string[] = [];
    const { epi, maternalHealth, tb } = formData;

    if (epi.penta3 > epi.penta1 && epi.penta1 > 0) {
      warnings.push(`Penta 3 (${epi.penta3}) exceeds Penta 1 (${epi.penta1}) — check for vaccine sequence errors.`);
    }
    if (epi.opv3 > epi.opv1 && epi.opv1 > 0) {
      warnings.push(`OPV 3 (${epi.opv3}) exceeds OPV 1 (${epi.opv1}) — verify doses.`);
    }
    if (maternalHealth.anc4 > maternalHealth.anc1 && maternalHealth.anc1 > 0) {
      warnings.push(`ANC 4 visits (${maternalHealth.anc4}) exceed ANC 1 registrations (${maternalHealth.anc1}).`);
    }
    if (maternalHealth.ipt3 > maternalHealth.ipt1 && maternalHealth.ipt1 > 0) {
      warnings.push(`IPT 3 (${maternalHealth.ipt3}) exceeds IPT 1 (${maternalHealth.ipt1}).`);
    }
    if (epi.outreachSessionsDone > epi.outreachSessionsPlanned && epi.outreachSessionsPlanned > 0) {
      warnings.push(`Outreach Conducted (${epi.outreachSessionsDone}) exceeds Planned (${epi.outreachSessionsPlanned}).`);
    }
    if (tb.confirmedCases > tb.presumptiveCases && tb.presumptiveCases > 0) {
      warnings.push(`TB Confirmed Cases (${tb.confirmedCases}) exceeds Presumptive Cases (${tb.presumptiveCases}).`);
    }

    return warnings;
  };

  const validationWarnings = getValidationWarnings();

  // Save submit handler
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFacilityObj = facilities.find((f) => f.id === targetFacilityId);
    const finalFacilityName = selectedFacilityObj ? selectedFacilityObj.name : formData.facilityName;
    const monthName = MONTH_NAMES[(entryMonth - 1) % 12];
    const monthLabel = `${monthName.substring(0, 3)} ${entryYear}`;

    const recordToCommit: FacilityMonthlyData = {
      ...formData,
      facilityId: targetFacilityId,
      facilityName: finalFacilityName,
      year: entryYear,
      month: entryMonth,
      monthLabel,
      reportStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
    };

    onSaveRecord(recordToCommit);
    setSaveSuccessMsg(
      `Official monthly report for ${finalFacilityName} (${monthLabel}) saved to database! Dashboard analytics, indicator calculations, and performance scores have been updated.`
    );
  };

  const currentFacilityObj = facilities.find((f) => f.id === targetFacilityId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
              GHS Official Form Entry
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              ZSHPMS Primary Health Data Capture
            </span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Facility Monthly Routine Data Entry Module</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Direct manual entry portal for health facility officers. Enter verified primary numbers for EPI, Maternal & Child Health, Disease Surveillance, and TB control.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrefillSample}
            className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/80 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            title="Populate standard monthly average values for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Auto-Fill Standard Averages</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData(createInitialForm(targetFacilityId, facilities, entryYear, entryMonth))}
            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      {/* Facility & Period Selector Control Bar */}
      <div className="bg-emerald-900 text-white rounded-xl p-4 shadow-sm border border-emerald-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Facility Selector */}
            <div className="space-y-1">
              <label htmlFor="entry-facility-select" className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Target Health Facility:
              </label>
              <select
                id="entry-facility-select"
                value={targetFacilityId}
                onChange={(e) => setTargetFacilityId(e.target.value)}
                className="bg-emerald-950 border border-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg focus:outline-none cursor-pointer min-w-[220px]"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id} className="bg-emerald-950 text-white font-medium">
                    {fac.name} ({fac.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="space-y-1">
              <label htmlFor="entry-year-select" className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Reporting Year:
              </label>
              <select
                id="entry-year-select"
                value={entryYear}
                onChange={(e) => setEntryYear(Number(e.target.value))}
                className="bg-emerald-950 border border-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value={2026} className="bg-emerald-950 text-white">2026</option>
                <option value={2025} className="bg-emerald-950 text-white">2025</option>
                <option value={2024} className="bg-emerald-950 text-white">2024</option>
              </select>
            </div>

            {/* Month Selector */}
            <div className="space-y-1">
              <label htmlFor="entry-month-select" className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Reporting Month:
              </label>
              <select
                id="entry-month-select"
                value={entryMonth}
                onChange={(e) => setEntryMonth(Number(e.target.value))}
                className="bg-emerald-950 border border-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1} className="bg-emerald-950 text-white">
                    {mName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Facility Catchment Info Badge */}
          {currentFacilityObj && (
            <div className="bg-emerald-950/80 border border-emerald-700/80 px-3 py-2 rounded-lg text-xs space-y-0.5">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Facility Catchment Targets:
              </div>
              <div className="text-white font-semibold">
                Pop: <span className="text-amber-300">{currentFacilityObj.targetPopulation?.catchmentPopulation?.toLocaleString() || 5000}</span> •
                Infants (&lt;1y): <span className="text-amber-300">{currentFacilityObj.targetPopulation?.childrenUnder1?.toLocaleString() || 200}</span> •
                Pregnancies: <span className="text-amber-300">{currentFacilityObj.targetPopulation?.expectedPregnancies?.toLocaleString() || 200}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-2 shadow-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                Data Entry Saved & Verified!
              </h4>
              <p>{saveSuccessMsg}</p>
            </div>
          </div>

          {onNavigateTab && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/80">
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>View Updated Executive Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('comparison')}
                className="bg-white dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs transition-colors cursor-pointer"
              >
                <span>View Facility Ranking</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validation Warnings Bar */}
      {validationWarnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Automated Data Quality & Logic Check ({validationWarnings.length} alert{validationWarnings.length > 1 ? 's' : ''}):</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800 dark:text-amber-300 pl-1">
            {validationWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Data Entry Form */}
      <form onSubmit={handleSaveSubmit} className="space-y-6">
        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveFormSection('epi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFormSection === 'epi'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>1. EPI & Immunization</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormSection('disease')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFormSection === 'disease'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>2. Disease Surveillance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormSection('maternal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFormSection === 'maternal'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>3. Maternal Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormSection('child')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFormSection === 'child'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>4. Child Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormSection('tb')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeFormSection === 'tb'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>5. TB Control</span>
          </button>
        </div>

        {/* SECTION 1: EPI & IMMUNIZATION */}
        {activeFormSection === 'epi' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Expanded Programme on Immunization (EPI) Antigens Doses</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter total monthly doses administered per antigen for infants and young children.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="BCG (At Birth)" val={formData.epi.bcg} onChange={(v) => handleNumChange('epi', 'bcg', v)} />
              <InputField label="OPV 0 (At Birth)" val={formData.epi.opv0} onChange={(v) => handleNumChange('epi', 'opv0', v)} />
              <InputField label="OPV 1 (6 Weeks)" val={formData.epi.opv1} onChange={(v) => handleNumChange('epi', 'opv1', v)} />
              <InputField label="OPV 2 (10 Weeks)" val={formData.epi.opv2} onChange={(v) => handleNumChange('epi', 'opv2', v)} />
              <InputField label="OPV 3 (14 Weeks)" val={formData.epi.opv3} onChange={(v) => handleNumChange('epi', 'opv3', v)} />
              <InputField label="Penta 1 (6 Weeks)" val={formData.epi.penta1} onChange={(v) => handleNumChange('epi', 'penta1', v)} />
              <InputField label="Penta 2 (10 Weeks)" val={formData.epi.penta2} onChange={(v) => handleNumChange('epi', 'penta2', v)} />
              <InputField label="Penta 3 (14 Weeks)" val={formData.epi.penta3} onChange={(v) => handleNumChange('epi', 'penta3', v)} />
              <InputField label="PCV 1 (6 Weeks)" val={formData.epi.pcv1} onChange={(v) => handleNumChange('epi', 'pcv1', v)} />
              <InputField label="PCV 2 (10 Weeks)" val={formData.epi.pcv2} onChange={(v) => handleNumChange('epi', 'pcv2', v)} />
              <InputField label="PCV 3 (14 Weeks)" val={formData.epi.pcv3} onChange={(v) => handleNumChange('epi', 'pcv3', v)} />
              <InputField label="Rota 1 (6 Weeks)" val={formData.epi.rota1} onChange={(v) => handleNumChange('epi', 'rota1', v)} />
              <InputField label="Rota 2 (10 Weeks)" val={formData.epi.rota2} onChange={(v) => handleNumChange('epi', 'rota2', v)} />
              <InputField label="IPV (14 Weeks)" val={formData.epi.ipv} onChange={(v) => handleNumChange('epi', 'ipv', v)} />
              <InputField label="MR 1 (Measles 9 Months)" val={formData.epi.mr1} onChange={(v) => handleNumChange('epi', 'mr1', v)} />
              <InputField label="MR 2 (Measles 18 Months)" val={formData.epi.mr2} onChange={(v) => handleNumChange('epi', 'mr2', v)} />
              <InputField label="Yellow Fever (9 Months)" val={formData.epi.yellowFever} onChange={(v) => handleNumChange('epi', 'yellowFever', v)} />
              <InputField label="Vitamin A (<1 Year)" val={formData.epi.vitaminA} onChange={(v) => handleNumChange('epi', 'vitaminA', v)} />
              <InputField label="Fully Immunized Child (FIC)" val={formData.epi.fullyImmunizedChild} onChange={(v) => handleNumChange('epi', 'fullyImmunizedChild', v)} highlight />
              <InputField label="Td / TT Doses (Maternal)" val={formData.epi.tdTT} onChange={(v) => handleNumChange('epi', 'tdTT', v)} />
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                EPI Session Monitoring:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <InputField label="Outreach Conducted" val={formData.epi.outreachSessionsDone} onChange={(v) => handleNumChange('epi', 'outreachSessionsDone', v)} />
                <InputField label="Outreach Planned" val={formData.epi.outreachSessionsPlanned} onChange={(v) => handleNumChange('epi', 'outreachSessionsPlanned', v)} />
                <InputField label="Static Conducted" val={formData.epi.staticSessionsDone} onChange={(v) => handleNumChange('epi', 'staticSessionsDone', v)} />
                <InputField label="Static Planned" val={formData.epi.staticSessionsPlanned} onChange={(v) => handleNumChange('epi', 'staticSessionsPlanned', v)} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: DISEASE SURVEILLANCE */}
        {activeFormSection === 'disease' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Disease Surveillance & OPD Morbidity Cases</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter monthly OPD caseloads across major morbidities, NCDs, NTDs, and IDSR priority conditions.
              </p>
            </div>

            {/* Sub-group 1: Top OPD Morbidities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
                1. Common Outpatient OPD Morbidities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputField label="Malaria OPD Confirmed" val={formData.diseaseSurveillance.malariaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'malariaCases', v)} highlight />
                <InputField label="URTI Cases" val={formData.diseaseSurveillance.urtiCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'urtiCases', v)} />
                <InputField label="Diarrhoea Cases" val={formData.diseaseSurveillance.diarrhoeaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'diarrhoeaCases', v)} />
                <InputField label="Pneumonia Cases" val={formData.diseaseSurveillance.pneumoniaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'pneumoniaCases', v)} />
                <InputField label="Typhoid Fever Cases" val={formData.diseaseSurveillance.typhoidCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'typhoidCases', v)} />
                <InputField label="Anaemia Cases" val={formData.diseaseSurveillance.anaemiaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'anaemiaCases', v)} />
                <InputField label="Skin Diseases & Ulcers" val={formData.diseaseSurveillance.skinDiseasesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'skinDiseasesCases', v)} />
                <InputField label="Acute Eye Infections" val={formData.diseaseSurveillance.eyeInfectionsCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'eyeInfectionsCases', v)} />
                <InputField label="Dental & Oral Conditions" val={formData.diseaseSurveillance.dentalCariesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'dentalCariesCases', v)} />
                <InputField label="Pregnancy OPD Complications" val={formData.diseaseSurveillance.pregnancyComplicationsCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'pregnancyComplicationsCases', v)} />
              </div>
            </div>

            {/* Sub-group 2: Non-Communicable & Chronic */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-lg">
                2. Chronic & Non-Communicable Conditions (NCDs)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputField label="Hypertension Cases" val={formData.diseaseSurveillance.hypertensionCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'hypertensionCases', v)} />
                <InputField label="Diabetes Mellitus Cases" val={formData.diseaseSurveillance.diabetesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'diabetesCases', v)} />
                <InputField label="Rheumatism & Joint Pains" val={formData.diseaseSurveillance.rheumatismCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'rheumatismCases', v)} />
                <InputField label="TB Confirmed Cases" val={formData.diseaseSurveillance.tbCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'tbCases', v)} />
              </div>
            </div>

            {/* Sub-group 3: NTDs & Vector-borne */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-lg">
                3. Neglected Tropical Diseases (NTDs) & Parasitic
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputField label="Intestinal Worms (Helminths)" val={formData.diseaseSurveillance.intestinalWormsCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'intestinalWormsCases', v)} />
                <InputField label="Schistosomiasis (Bilharzia)" val={formData.diseaseSurveillance.schistosomiasisCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'schistosomiasisCases', v)} />
                <InputField label="Viral Hepatitis (B/C)" val={formData.diseaseSurveillance.hepatitisBCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'hepatitisBCases', v)} />
              </div>
            </div>

            {/* Sub-group 4: IDSR Epidemic-Prone & Emergency */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg">
                4. IDSR Epidemic-Prone, Bites & Emergency Surveillance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputField label="Snake Bites & Envenomation" val={formData.diseaseSurveillance.snakeBitesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'snakeBitesCases', v)} highlight />
                <InputField label="Dog Bites / Suspected Rabies" val={formData.diseaseSurveillance.dogBitesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'dogBitesCases', v)} highlight />
                <InputField label="Measles Suspected" val={formData.diseaseSurveillance.measlesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'measlesCases', v)} />
                <InputField label="Cholera Suspected" val={formData.diseaseSurveillance.choleraCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'choleraCases', v)} />
                <InputField label="Meningitis Suspected" val={formData.diseaseSurveillance.meningitisCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'meningitisCases', v)} />
                <InputField label="Yellow Fever / Acute Jaundice" val={formData.diseaseSurveillance.yellowFeverCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'yellowFeverCases', v)} />
                <InputField label="Acute Flaccid Paralysis (Polio)" val={formData.diseaseSurveillance.afpCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'afpCases', v)} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: MATERNAL HEALTH */}
        {activeFormSection === 'maternal' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Maternal, Adolescent & Reproductive Health Services</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter ANC registrations, teenage pregnancy cases, maternal anaemia counts, visits, skilled deliveries, PNC, and IPT malaria prophylaxis doses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="ANC 1 Registrations" val={formData.maternalHealth.anc1} onChange={(v) => handleNumChange('maternalHealth', 'anc1', v)} highlight />
              <InputField label="Teenage Pregnancies (10-19 yrs)" val={formData.maternalHealth.teenagePregnancies} onChange={(v) => handleNumChange('maternalHealth', 'teenagePregnancies', v)} highlight />
              <InputField label="ANC Anaemia @ Registration (<11g/dl)" val={formData.maternalHealth.ancAnaemiaRegistration} onChange={(v) => handleNumChange('maternalHealth', 'ancAnaemiaRegistration', v)} highlight />
              <InputField label="ANC Anaemia @ 36 Weeks (<11g/dl)" val={formData.maternalHealth.ancAnaemia36Weeks} onChange={(v) => handleNumChange('maternalHealth', 'ancAnaemia36Weeks', v)} />
              <InputField label="ANC 4 Visits" val={formData.maternalHealth.anc4} onChange={(v) => handleNumChange('maternalHealth', 'anc4', v)} highlight />
              <InputField label="ANC 8 Visits" val={formData.maternalHealth.anc8} onChange={(v) => handleNumChange('maternalHealth', 'anc8', v)} />
              <InputField label="Skilled Deliveries" val={formData.maternalHealth.skilledDeliveries} onChange={(v) => handleNumChange('maternalHealth', 'skilledDeliveries', v)} highlight />
              <InputField label="PNC Visits (within 48h)" val={formData.maternalHealth.postnatalCare} onChange={(v) => handleNumChange('maternalHealth', 'postnatalCare', v)} />
              <InputField label="IPT 1 (Maternal Malaria)" val={formData.maternalHealth.ipt1} onChange={(v) => handleNumChange('maternalHealth', 'ipt1', v)} />
              <InputField label="IPT 2 (Maternal Malaria)" val={formData.maternalHealth.ipt2} onChange={(v) => handleNumChange('maternalHealth', 'ipt2', v)} />
              <InputField label="IPT 3 (Maternal Malaria)" val={formData.maternalHealth.ipt3} onChange={(v) => handleNumChange('maternalHealth', 'ipt3', v)} />
            </div>
          </div>
        )}

        {/* SECTION 4: CHILD HEALTH */}
        {activeFormSection === 'child' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Child Health & Nutrition Services</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter child growth monitoring, Vitamin A supplementation, deworming, SAM/MAM malnutrition cases, exclusive breastfeeding, and ORS & Zinc management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="Growth Monitoring Attended" val={formData.childHealth.growthMonitoringAttended} onChange={(v) => handleNumChange('childHealth', 'growthMonitoringAttended', v)} highlight />
              <InputField label="Vitamin A Supplemented (<5)" val={formData.childHealth.vitaminASupplementation} onChange={(v) => handleNumChange('childHealth', 'vitaminASupplementation', v)} />
              <InputField label="Deworming (12-59 mos)" val={formData.childHealth.deworming} onChange={(v) => handleNumChange('childHealth', 'deworming', v)} />
              <InputField label="Children Screened for Malnutrition" val={formData.childHealth.malnutritionScreened} onChange={(v) => handleNumChange('childHealth', 'malnutritionScreened', v)} highlight />
              <InputField label="Moderate Acute Malnutrition (MAM)" val={formData.childHealth.moderateAcuteMalnutrition} onChange={(v) => handleNumChange('childHealth', 'moderateAcuteMalnutrition', v)} />
              <InputField label="Severe Acute Malnutrition (SAM)" val={formData.childHealth.severeAcuteMalnutrition} onChange={(v) => handleNumChange('childHealth', 'severeAcuteMalnutrition', v)} highlight />
              <InputField label="Early Breastfeeding Initiation (<1hr)" val={formData.childHealth.earlyBreastfeedingInitiation} onChange={(v) => handleNumChange('childHealth', 'earlyBreastfeedingInitiation', v)} />
              <InputField label="Exclusive Breastfeeding @ 6 Months" val={formData.childHealth.exclusiveBreastfeeding6Months} onChange={(v) => handleNumChange('childHealth', 'exclusiveBreastfeeding6Months', v)} highlight />
              <InputField label="Penta 3 Immunized" val={formData.childHealth.penta3Vaccinated} onChange={(v) => handleNumChange('childHealth', 'penta3Vaccinated', v)} />
              <InputField label="Under-5 Diarrhoea Treated w/ ORS & Zinc" val={formData.childHealth.diarrhoeaTreatedOrsZinc} onChange={(v) => handleNumChange('childHealth', 'diarrhoeaTreatedOrsZinc', v)} highlight />
            </div>
          </div>
        )}

        {/* SECTION 5: TB CONTROL */}
        {activeFormSection === 'tb' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Tuberculosis Screening & Control</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter TB cascade metrics: screened, presumptive, samples collected, confirmed, and treatment started.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <InputField label="TB Screened" val={formData.tb.screened} onChange={(v) => handleNumChange('tb', 'screened', v)} />
              <InputField label="TB Presumptive Cases" val={formData.tb.presumptiveCases} onChange={(v) => handleNumChange('tb', 'presumptiveCases', v)} />
              <InputField label="TB Samples Collected" val={formData.tb.samplesCollected} onChange={(v) => handleNumChange('tb', 'samplesCollected', v)} />
              <InputField label="TB Confirmed Cases" val={formData.tb.confirmedCases} onChange={(v) => handleNumChange('tb', 'confirmedCases', v)} />
              <InputField label="TB Treatment Initiated" val={formData.tb.treatmentInitiated} onChange={(v) => handleNumChange('tb', 'treatmentInitiated', v)} />
            </div>
          </div>
        )}

        {/* Submit Button Bar */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Saving will update <strong>{formData.facilityName}</strong> record for{' '}
              <strong>{MONTH_NAMES[(entryMonth - 1) % 12]} {entryYear}</strong>.
            </span>
          </div>

          <button
            id="submit-data-entry-btn"
            type="submit"
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Save & Commit Monthly Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Numeric Input Field Component
interface InputFieldProps {
  label: string;
  val: number;
  onChange: (v: number) => void;
  highlight?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, val, onChange, highlight }) => (
  <div className={`space-y-1 p-2.5 rounded-lg border ${highlight ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80' : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80'}`}>
    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block truncate" title={label}>
      {label}
    </label>
    <input
      type="number"
      min={0}
      value={val === 0 ? '' : val}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      placeholder="0"
      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
    />
  </div>
);
