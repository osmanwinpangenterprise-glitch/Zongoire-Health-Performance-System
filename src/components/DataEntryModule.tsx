import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Check,
  X,
  Database,
  TrendingUp,
  ExternalLink,
  Activity,
  AlertCircle,
  CheckCircle,
  FileCheck2,
  Trash2,
  Clock,
  HardDrive,
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

// Definition of Mandatory Core GHS DHIMS2 Indicators
export const MANDATORY_FIELDS = {
  epi: [
    { key: 'bcg', label: 'BCG (At Birth)' },
    { key: 'penta1', label: 'Penta 1 (6 Weeks)' },
    { key: 'penta3', label: 'Penta 3 (14 Weeks)' },
    { key: 'opv1', label: 'OPV 1 (6 Weeks)' },
    { key: 'opv3', label: 'OPV 3 (14 Weeks)' },
    { key: 'mr1', label: 'MR 1 (Measles 9 Months)' },
    { key: 'yellowFever', label: 'Yellow Fever (9 Months)' },
    { key: 'fullyImmunizedChild', label: 'Fully Immunized Child (FIC)' },
    { key: 'outreachSessionsPlanned', label: 'Outreach Planned' },
    { key: 'outreachSessionsDone', label: 'Outreach Conducted' },
  ],
  diseaseSurveillance: [
    { key: 'malariaCases', label: 'Malaria OPD Confirmed' },
    { key: 'diarrhoeaCases', label: 'Diarrhoea Cases' },
    { key: 'urtiCases', label: 'URTI Cases' },
    { key: 'pneumoniaCases', label: 'Pneumonia Cases' },
    { key: 'hypertensionCases', label: 'Hypertension Cases' },
    { key: 'snakeBitesCases', label: 'Snake Bites & Envenomation' },
  ],
  maternalHealth: [
    { key: 'anc1', label: 'ANC 1 Registrations' },
    { key: 'anc4', label: 'ANC 4 Visits' },
    { key: 'skilledDeliveries', label: 'Skilled Deliveries' },
    { key: 'postnatalCare', label: 'PNC Visits (within 48h)' },
    { key: 'ipt1', label: 'IPT 1 (Maternal Malaria)' },
    { key: 'teenagePregnancies', label: 'Teenage Pregnancies (10-19 yrs)' },
  ],
  childHealth: [
    { key: 'growthMonitoringAttended', label: 'Growth Monitoring Attended' },
    { key: 'malnutritionScreened', label: 'Children Screened for Malnutrition' },
    { key: 'severeAcuteMalnutrition', label: 'Severe Acute Malnutrition (SAM)' },
    { key: 'exclusiveBreastfeeding6Months', label: 'Exclusive Breastfeeding @ 6 Months' },
    { key: 'diarrhoeaTreatedOrsZinc', label: 'Under-5 Diarrhoea Treated w/ ORS & Zinc' },
  ],
  tb: [
    { key: 'screened', label: 'TB Screened' },
    { key: 'presumptiveCases', label: 'TB Presumptive Cases' },
  ],
};

type FormSection = 'epi' | 'disease' | 'maternal' | 'child' | 'tb';

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
  const [activeFormSection, setActiveFormSection] = useState<FormSection>('epi');

  // Form Submission & Validation States
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showFloatingToast, setShowFloatingToast] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ section: FormSection; field: string; message: string }>>([]);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [draftRestoredMsg, setDraftRestoredMsg] = useState<string | null>(null);

  // Snapshot for saved verification
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{
    facilityName: string;
    monthLabel: string;
    timestamp: string;
    epiCount: number;
    surveillanceCount: number;
    maternalCount: number;
    childCount: number;
    tbCount: number;
  } | null>(null);

  // Auto-Save State for debounced localStorage persistence
  const [autoSaveState, setAutoSaveState] = useState<{
    status: 'idle' | 'saving' | 'saved';
    lastSavedAt: string | null;
  }>({
    status: 'idle',
    lastSavedAt: null,
  });

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveBtnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [formData, setFormData] = useState<FacilityMonthlyData>(() => createInitialForm(targetFacilityId, facilities, entryYear, entryMonth));

  // Refs to always have access to the latest data and target selection without stale closures
  const formDataRef = useRef<FacilityMonthlyData>(formData);
  formDataRef.current = formData;
  const currentSelectionRef = useRef({ targetFacilityId, entryYear, entryMonth });
  currentSelectionRef.current = { targetFacilityId, entryYear, entryMonth };

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
        rota1: 0, rota2: 0, ipv: 0, ipv2: 0,
        mr1: 0, mr2: 0, yellowFever: 0, menA: 0,
        malaria1: 0, malaria2: 0, malaria3: 0, malaria4: 0,
        hpv1: 0, hpv2: 0,
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

  // Synthesized web audio chime on save
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2: B5 (987.77Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Synchronously write the latest form data to localStorage
  const flushDraftToStorage = useCallback((dataToSave?: FacilityMonthlyData) => {
    try {
      const data = dataToSave || formDataRef.current;
      const { targetFacilityId: facId, entryYear: yr, entryMonth: mo } = currentSelectionRef.current;
      if (!facId || !yr || !mo || !data) return;

      const draftKey = `zshpms_draft_${facId}_${yr}_${mo}`;
      localStorage.setItem(draftKey, JSON.stringify(data));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutoSaveState({
        status: 'saved',
        lastSavedAt: timeStr,
      });
    } catch (err) {
      console.warn('[AutoSave] Could not write draft to localStorage:', err);
    }
  }, []);

  // Debounced auto-save handler invoked as user types
  const triggerDebouncedAutoSave = useCallback((updated: FacilityMonthlyData) => {
    setAutoSaveState((prev) => ({ ...prev, status: 'saving' }));
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      flushDraftToStorage(updated);
    }, 450); // 450ms debouncing window
  }, [flushDraftToStorage]);

  // Window & lifecycle event listeners to guarantee no data loss on tab close, page refresh, or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushDraftToStorage();
    };

    const handlePageHide = () => {
      flushDraftToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Guarantee that if user switches tabs within the app, unsaved input is flushed immediately
      flushDraftToStorage();
    };
  }, [flushDraftToStorage]);

  // Load existing data or local draft when target facility/year/month changes
  useEffect(() => {
    // Clear any pending debounce on selection switch
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const draftKey = `zshpms_draft_${targetFacilityId}_${entryYear}_${entryMonth}`;
    let loadedFromDraft = false;

    // Check if an actual saved record exists in database
    const existing = monthlyData.find(
      (d) =>
        d.facilityId === targetFacilityId &&
        d.year === entryYear &&
        d.month === entryMonth &&
        (d.isSample === false || d.dataSource === 'actual')
    );

    if (existing) {
      setFormData(JSON.parse(JSON.stringify(existing)));
      setAutoSaveState({ status: 'idle', lastSavedAt: null });
    } else {
      // Check if there is an unsaved local draft in browser
      try {
        const savedDraftStr = localStorage.getItem(draftKey);
        if (savedDraftStr) {
          const parsed = JSON.parse(savedDraftStr);
          if (parsed && parsed.facilityId === targetFacilityId) {
            setFormData(parsed);
            loadedFromDraft = true;
            setDraftRestoredMsg(`Restored unsaved local draft for ${parsed.facilityName || 'Facility'} (${MONTH_NAMES[entryMonth - 1]} ${entryYear})`);
            setAutoSaveState({
              status: 'saved',
              lastSavedAt: 'Restored from local draft',
            });
            setTimeout(() => setDraftRestoredMsg(null), 5000);
          }
        }
      } catch (err) {
        console.warn('Could not read draft from localStorage:', err);
      }

      if (!loadedFromDraft) {
        setFormData(createInitialForm(targetFacilityId, facilities, entryYear, entryMonth));
        setAutoSaveState({ status: 'idle', lastSavedAt: null });
      }
    }

    setSaveSuccessMsg(null);
    setSaveStatus('idle');
    setShowFloatingToast(false);
    setSubmissionAttempted(false);
    setValidationErrors([]);
  }, [targetFacilityId, entryYear, entryMonth, monthlyData, facilities]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (saveBtnTimerRef.current) clearTimeout(saveBtnTimerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Update specific nested form field with data safety and debounced local caching
  const handleNumChange = (
    category: 'epi' | 'diseaseSurveillance' | 'maternalHealth' | 'childHealth' | 'tb',
    field: string,
    val: number
  ) => {
    const numVal = Math.max(0, isNaN(val) ? 0 : val);
    setFormData((prev) => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: numVal,
        },
      };
      triggerDebouncedAutoSave(updated);
      return updated;
    });

    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  };

  // Calculate section completeness & required field states
  const mandatoryFieldStats = useMemo(() => {
    let totalRequired = 0;
    let completedRequired = 0;

    const sectionCounts: Record<FormSection, { total: number; completed: number }> = {
      epi: { total: MANDATORY_FIELDS.epi.length, completed: 0 },
      disease: { total: MANDATORY_FIELDS.diseaseSurveillance.length, completed: 0 },
      maternal: { total: MANDATORY_FIELDS.maternalHealth.length, completed: 0 },
      child: { total: MANDATORY_FIELDS.childHealth.length, completed: 0 },
      tb: { total: MANDATORY_FIELDS.tb.length, completed: 0 },
    };

    // Check EPI
    MANDATORY_FIELDS.epi.forEach((f) => {
      totalRequired++;
      const val = (formData.epi as any)[f.key];
      if (typeof val === 'number' && val >= 0) {
        // Considered entered if number exists
        completedRequired++;
        sectionCounts.epi.completed++;
      }
    });

    // Check Disease
    MANDATORY_FIELDS.diseaseSurveillance.forEach((f) => {
      totalRequired++;
      const val = (formData.diseaseSurveillance as any)[f.key];
      if (typeof val === 'number' && val >= 0) {
        completedRequired++;
        sectionCounts.disease.completed++;
      }
    });

    // Check Maternal
    MANDATORY_FIELDS.maternalHealth.forEach((f) => {
      totalRequired++;
      const val = (formData.maternalHealth as any)[f.key];
      if (typeof val === 'number' && val >= 0) {
        completedRequired++;
        sectionCounts.maternal.completed++;
      }
    });

    // Check Child
    MANDATORY_FIELDS.childHealth.forEach((f) => {
      totalRequired++;
      const val = (formData.childHealth as any)[f.key];
      if (typeof val === 'number' && val >= 0) {
        completedRequired++;
        sectionCounts.child.completed++;
      }
    });

    // Check TB
    MANDATORY_FIELDS.tb.forEach((f) => {
      totalRequired++;
      const val = (formData.tb as any)[f.key];
      if (typeof val === 'number' && val >= 0) {
        completedRequired++;
        sectionCounts.tb.completed++;
      }
    });

    // Count non-zero entered indicators across the whole form
    const nonZeroCount = [
      ...Object.values(formData.epi),
      ...Object.values(formData.diseaseSurveillance),
      ...Object.values(formData.maternalHealth),
      ...Object.values(formData.childHealth),
      ...Object.values(formData.tb),
    ].filter((v) => typeof v === 'number' && v > 0).length;

    const percentage = Math.round((completedRequired / totalRequired) * 100);

    return {
      totalRequired,
      completedRequired,
      percentage,
      sectionCounts,
      nonZeroCount,
    };
  }, [formData]);

  // Automated accuracy validation & logic checks
  const getValidationErrorsAndWarnings = () => {
    const errors: Array<{ section: FormSection; field: string; message: string }> = [];
    const warnings: string[] = [];
    const { epi, maternalHealth, childHealth, tb, diseaseSurveillance } = formData;

    // Check if the entire form is completely blank/all zero without user interaction
    if (mandatoryFieldStats.nonZeroCount === 0) {
      errors.push({
        section: 'epi',
        field: 'bcg',
        message: 'No health indicators have been entered yet. Please enter routine data before official submission.',
      });
    }

    // Logic consistency checks (Rules of Routine Health Data Validation)
    if (epi.penta3 > epi.penta1 && epi.penta1 > 0) {
      warnings.push(`Penta 3 (${epi.penta3}) exceeds Penta 1 (${epi.penta1}) — verify vaccine drop-in count.`);
    }
    if (epi.opv3 > epi.opv1 && epi.opv1 > 0) {
      warnings.push(`OPV 3 (${epi.opv3}) exceeds OPV 1 (${epi.opv1}) — check oral polio dose sequence.`);
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
      errors.push({
        section: 'tb',
        field: 'confirmedCases',
        message: `TB Confirmed Cases (${tb.confirmedCases}) cannot exceed Presumptive Cases (${tb.presumptiveCases}).`,
      });
    }
    if (childHealth.severeAcuteMalnutrition + childHealth.moderateAcuteMalnutrition > childHealth.malnutritionScreened && childHealth.malnutritionScreened > 0) {
      errors.push({
        section: 'child',
        field: 'severeAcuteMalnutrition',
        message: `Total Malnutrition Cases (SAM+MAM) exceeds total children screened (${childHealth.malnutritionScreened}).`,
      });
    }

    return { errors, warnings };
  };

  const { errors: currentErrors, warnings: validationWarnings } = getValidationErrorsAndWarnings();

  // Pre-fill realistic sample values for fast verification or training
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
        ipv2: isCHPS ? 18 : 33,
        mr1: isCHPS ? 18 : 34,
        mr2: isCHPS ? 16 : 30,
        yellowFever: isCHPS ? 18 : 34,
        menA: isCHPS ? 18 : 34,
        malaria1: isCHPS ? 20 : 38,
        malaria2: isCHPS ? 19 : 36,
        malaria3: isCHPS ? 18 : 34,
        malaria4: isCHPS ? 16 : 30,
        hpv1: isCHPS ? 12 : 24,
        hpv2: isCHPS ? 10 : 20,
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
    flushDraftToStorage(sample);
    setSubmissionAttempted(false);
    setValidationErrors([]);
  };

  // Confirmation before resetting the form so entered data is never accidentally lost
  const handleConfirmClear = () => {
    const fresh = createInitialForm(targetFacilityId, facilities, entryYear, entryMonth);
    setFormData(fresh);
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    try {
      const draftKey = `zshpms_draft_${targetFacilityId}_${entryYear}_${entryMonth}`;
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn('Draft remove error:', e);
    }
    setAutoSaveState({ status: 'idle', lastSavedAt: null });
    setSaveStatus('idle');
    setSaveSuccessMsg(null);
    setShowClearConfirmModal(false);
    setSubmissionAttempted(false);
    setValidationErrors([]);
  };

  // Calculate quick summary counts for snapshot confirmation
  const getMetricsCountSummary = () => {
    const sumEpi = Object.values(formData.epi).reduce<number>((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);
    const sumSurveillance = Object.values(formData.diseaseSurveillance).reduce<number>((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);
    const sumMaternal = Object.values(formData.maternalHealth).reduce<number>((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);
    const sumChild = Object.values(formData.childHealth).reduce<number>((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);
    const sumTb = Object.values(formData.tb).reduce<number>((acc, v) => (typeof v === 'number' ? acc + v : acc), 0);

    return {
      epiCount: sumEpi,
      surveillanceCount: sumSurveillance,
      maternalCount: sumMaternal,
      childCount: sumChild,
      tbCount: sumTb,
    };
  };

  // Safe and validated Save Submission Handler
  const handleSaveSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSubmissionAttempted(true);

    // Validate form
    const { errors } = getValidationErrorsAndWarnings();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Auto-switch to the first section that contains an error
      if (errors[0] && errors[0].section) {
        setActiveFormSection(errors[0].section);
      }
      return;
    }

    setValidationErrors([]);
    setSaveStatus('saving');

    const selectedFacilityObj = facilities.find((f) => f.id === targetFacilityId);
    const finalFacilityName = selectedFacilityObj ? selectedFacilityObj.name : formData.facilityName;
    const monthName = MONTH_NAMES[(entryMonth - 1) % 12];
    const monthLabel = `${monthName.substring(0, 3)} ${entryYear}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const recordToCommit: FacilityMonthlyData = {
      ...formData,
      facilityId: targetFacilityId,
      facilityName: finalFacilityName,
      year: entryYear,
      month: entryMonth,
      monthLabel,
      reportStatus: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      dataSource: 'actual',
      isSample: false,
    };

    setTimeout(() => {
      // Commit record into live dataset & Firestore
      onSaveRecord(recordToCommit);
      playSuccessChime();

      // Clear the local draft now that it's committed to database
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      try {
        const draftKey = `zshpms_draft_${targetFacilityId}_${entryYear}_${entryMonth}`;
        localStorage.removeItem(draftKey);
      } catch (e) {
        console.warn('Draft remove error:', e);
      }
      setAutoSaveState({ status: 'idle', lastSavedAt: null });

      const counts = getMetricsCountSummary();
      setLastSavedSnapshot({
        facilityName: finalFacilityName,
        monthLabel,
        timestamp: timestampStr,
        epiCount: counts.epiCount,
        surveillanceCount: counts.surveillanceCount,
        maternalCount: counts.maternalCount,
        childCount: counts.childCount,
        tbCount: counts.tbCount,
      });

      setSaveSuccessMsg(
        `Official monthly return for ${finalFacilityName} (${monthLabel}) verified & committed to database! Performance scores, indicator targets, and review reports are now updated.`
      );
      setSaveStatus('saved');
      setShowFloatingToast(true);

      // Auto-hide floating toast after 8 seconds
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowFloatingToast(false);
      }, 8000);

      // Reset save button status after 6 seconds
      if (saveBtnTimerRef.current) clearTimeout(saveBtnTimerRef.current);
      saveBtnTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 6000);
    }, 300);
  };

  const currentFacilityObj = facilities.find((f) => f.id === targetFacilityId);

  return (
    <div className="space-y-6 relative">
      {/* Draft Restored Banner */}
      {draftRestoredMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><strong>Draft Auto-Recovered:</strong> {draftRestoredMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftRestoredMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Clear Confirmation Modal to Prevent Accidental Data Loss */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Clear Entered Form Data?</h3>
                <p className="text-xs text-neutral-500">This will reset all entered values for this facility and month.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
              Are you sure you want to clear <strong>{currentFacilityObj?.name}</strong> for <strong>{MONTH_NAMES[entryMonth - 1]} {entryYear}</strong>? Any unsaved numbers will be wiped.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel (Keep My Data)
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
              >
                Confirm & Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Confirmation Toast in Viewport */}
      {showFloatingToast && lastSavedSnapshot && (
        <div
          id="floating-save-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md w-[92vw] sm:w-[420px] bg-white dark:bg-neutral-900 border-2 border-emerald-500 dark:border-emerald-500 rounded-2xl shadow-2xl p-4.5 text-neutral-900 dark:text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="relative mt-0.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-700 shadow-xs">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide border border-emerald-300 dark:border-emerald-800">
                    DHIMS2 Committed
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {lastSavedSnapshot.timestamp}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Data Saved Successfully!
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  <strong className="text-emerald-700 dark:text-emerald-400">{lastSavedSnapshot.facilityName}</strong> • {lastSavedSnapshot.monthLabel}
                </p>
              </div>
            </div>

            <button
              id="close-save-toast-btn"
              type="button"
              onClick={() => setShowFloatingToast(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Summary Chips */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60">
              <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 block">EPI Doses</span>
              <strong className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">{lastSavedSnapshot.epiCount.toLocaleString()}</strong>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
              <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 block">Surveillance</span>
              <strong className="text-xs text-amber-700 dark:text-amber-300 font-bold">{lastSavedSnapshot.surveillanceCount.toLocaleString()}</strong>
            </div>
            <div className="bg-blue-50/80 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200/60 dark:border-blue-900/60">
              <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 block">Maternal ANC</span>
              <strong className="text-xs text-blue-700 dark:text-blue-300 font-bold">{lastSavedSnapshot.maternalCount.toLocaleString()}</strong>
            </div>
          </div>

          {/* Direct Navigation Links */}
          {onNavigateTab && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowFloatingToast(false);
                  onNavigateTab('dashboard');
                }}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all shadow-xs cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-amber-300" />
                <span>Executive Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFloatingToast(false);
                  onNavigateTab('reports');
                }}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span>Review Reports</span>
              </button>
            </div>
          )}
        </div>
      )}

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
            Direct manual entry portal for health facility officers. Fields marked with <span className="text-red-500 font-bold">* [REQUIRED]</span> are mandatory GHS DHIMS2 reporting returns.
          </p>
        </div>

        {/* Action Controls including Quick Save & Auto-Save Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Save Live Status Indicator */}
          <div id="data-entry-autosave-indicator">
            {autoSaveState.status === 'saving' ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-pulse">
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Caching draft...</span>
              </div>
            ) : autoSaveState.status === 'saved' ? (
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-medium"
                title="Your field values are debounced and cached locally to prevent accidental data loss on navigation."
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {autoSaveState.lastSavedAt === 'Restored from local draft'
                    ? 'Local Draft Restored'
                    : `Auto-saved (${autoSaveState.lastSavedAt})`}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs font-medium"
                title="Debounced auto-save actively protects entered numbers into browser local storage."
              >
                <HardDrive className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Auto-Save Active</span>
              </div>
            )}
          </div>

          {/* Quick Save Header Button */}
          <button
            id="top-quick-save-btn"
            type="button"
            onClick={() => handleSaveSubmit()}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/60'
                : saveStatus === 'saving'
                ? 'bg-emerald-700 text-white opacity-80 cursor-wait'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
            title="Save and commit this month's data to system"
          >
            {saveStatus === 'saving' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Saved & Committed!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Save & Commit</span>
              </>
            )}
          </button>

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
            onClick={() => setShowClearConfirmModal(true)}
            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
            title="Safely clear form with confirmation"
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
                Target Health Facility: <span className="text-red-400">*</span>
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
                Reporting Year: <span className="text-red-400">*</span>
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
                Reporting Month: <span className="text-red-400">*</span>
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

        {/* Live Form Completeness & Mandatory Field Tracker */}
        <div className="pt-2 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
              Mandatory GHS Returns Progress:
            </span>
            <span className="bg-emerald-950 px-2 py-0.5 rounded text-[11px] font-bold text-white border border-emerald-700">
              {mandatoryFieldStats.nonZeroCount > 0 ? `${mandatoryFieldStats.totalRequired} Mandatory Fields Tracked` : '0 Fields Entered'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-emerald-200">
              Entered: <strong className="text-amber-300">{mandatoryFieldStats.nonZeroCount}</strong> health metrics
            </span>
            {mandatoryFieldStats.nonZeroCount > 0 ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Ready for Submission</span>
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Data Entry In Progress</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Error Alert Box (if user attempts submit with blocking errors) */}
      {submissionAttempted && validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/80 border-2 border-red-500 dark:border-red-600 p-4 rounded-xl text-xs text-red-900 dark:text-red-100 space-y-2 shadow-md animate-in fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-sm text-red-900 dark:text-red-100">
                Form Submission Blocked: Please Resolve Required Data ({validationErrors.length} Issue{validationErrors.length > 1 ? 's' : ''})
              </h4>
              <p className="text-red-800 dark:text-red-200">
                To maintain DHIMS2 data integrity, required fields must have verified numbers entered before official monthly submission:
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-red-700 dark:text-red-300 pl-1 pt-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{err.message}</span>
                    <button
                      type="button"
                      onClick={() => setActiveFormSection(err.section)}
                      className="ml-2 underline font-bold text-red-800 dark:text-red-200 hover:text-red-950 cursor-pointer"
                    >
                      Go to Section $\rightarrow$
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Automated Logic Warnings Bar */}
      {validationWarnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Automated Data Quality & Logic Checks ({validationWarnings.length} Note{validationWarnings.length > 1 ? 's' : ''}):</span>
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
        {/* Module Navigation Tabs with Live Status Badges */}
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
            <span className="bg-emerald-950/50 text-[10px] px-1.5 py-0.5 rounded text-amber-200 font-extrabold ml-1">
              10 Req
            </span>
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
            <span className="bg-emerald-950/50 text-[10px] px-1.5 py-0.5 rounded text-amber-200 font-extrabold ml-1">
              6 Req
            </span>
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
            <span className="bg-emerald-950/50 text-[10px] px-1.5 py-0.5 rounded text-amber-200 font-extrabold ml-1">
              6 Req
            </span>
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
            <span className="bg-emerald-950/50 text-[10px] px-1.5 py-0.5 rounded text-amber-200 font-extrabold ml-1">
              5 Req
            </span>
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
            <span className="bg-emerald-950/50 text-[10px] px-1.5 py-0.5 rounded text-amber-200 font-extrabold ml-1">
              2 Req
            </span>
          </button>
        </div>

        {/* SECTION 1: EPI & IMMUNIZATION */}
        {activeFormSection === 'epi' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Expanded Programme on Immunization (EPI) Antigens Doses</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter total monthly doses administered per antigen for infants and young children.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                <span className="text-red-500 font-bold">*</span> = Mandatory Core Return
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="BCG (At Birth)" val={formData.epi.bcg} onChange={(v) => handleNumChange('epi', 'bcg', v)} required highlight />
              <InputField label="OPV 0 (At Birth)" val={formData.epi.opv0} onChange={(v) => handleNumChange('epi', 'opv0', v)} />
              <InputField label="OPV 1 (6 Weeks)" val={formData.epi.opv1} onChange={(v) => handleNumChange('epi', 'opv1', v)} required highlight />
              <InputField label="OPV 2 (10 Weeks)" val={formData.epi.opv2} onChange={(v) => handleNumChange('epi', 'opv2', v)} />
              <InputField label="OPV 3 (14 Weeks)" val={formData.epi.opv3} onChange={(v) => handleNumChange('epi', 'opv3', v)} required highlight />
              <InputField label="Penta 1 (6 Weeks)" val={formData.epi.penta1} onChange={(v) => handleNumChange('epi', 'penta1', v)} required highlight />
              <InputField label="Penta 2 (10 Weeks)" val={formData.epi.penta2} onChange={(v) => handleNumChange('epi', 'penta2', v)} />
              <InputField label="Penta 3 (14 Weeks)" val={formData.epi.penta3} onChange={(v) => handleNumChange('epi', 'penta3', v)} required highlight />
              <InputField label="PCV 1 (6 Weeks)" val={formData.epi.pcv1} onChange={(v) => handleNumChange('epi', 'pcv1', v)} />
              <InputField label="PCV 2 (10 Weeks)" val={formData.epi.pcv2} onChange={(v) => handleNumChange('epi', 'pcv2', v)} />
              <InputField label="PCV 3 (14 Weeks)" val={formData.epi.pcv3} onChange={(v) => handleNumChange('epi', 'pcv3', v)} />
              <InputField label="Rota 1 (6 Weeks)" val={formData.epi.rota1} onChange={(v) => handleNumChange('epi', 'rota1', v)} />
              <InputField label="Rota 2 (10 Weeks)" val={formData.epi.rota2} onChange={(v) => handleNumChange('epi', 'rota2', v)} />
              <InputField label="IPV 1 (14 Weeks)" val={formData.epi.ipv} onChange={(v) => handleNumChange('epi', 'ipv', v)} />
              <InputField label="IPV 2 (2026 Schedule)" val={formData.epi.ipv2} onChange={(v) => handleNumChange('epi', 'ipv2', v)} />
              <InputField label="MR 1 (Measles 9 Months)" val={formData.epi.mr1} onChange={(v) => handleNumChange('epi', 'mr1', v)} required highlight />
              <InputField label="MR 2 (Measles 18 Months)" val={formData.epi.mr2} onChange={(v) => handleNumChange('epi', 'mr2', v)} />
              <InputField label="Yellow Fever (9 Months)" val={formData.epi.yellowFever} onChange={(v) => handleNumChange('epi', 'yellowFever', v)} required highlight />
              <InputField label="Meningitis A (MenA)" val={formData.epi.menA} onChange={(v) => handleNumChange('epi', 'menA', v)} />
              <InputField label="Malaria Vaccine Dose 1 (6 Mos)" val={formData.epi.malaria1} onChange={(v) => handleNumChange('epi', 'malaria1', v)} />
              <InputField label="Malaria Vaccine Dose 2 (7 Mos)" val={formData.epi.malaria2} onChange={(v) => handleNumChange('epi', 'malaria2', v)} />
              <InputField label="Malaria Vaccine Dose 3 (9 Mos)" val={formData.epi.malaria3} onChange={(v) => handleNumChange('epi', 'malaria3', v)} />
              <InputField label="Malaria Vaccine Dose 4 (18-24 Mos)" val={formData.epi.malaria4} onChange={(v) => handleNumChange('epi', 'malaria4', v)} />
              <InputField label="HPV Dose 1 (Girls 9-14 Yrs)" val={formData.epi.hpv1} onChange={(v) => handleNumChange('epi', 'hpv1', v)} />
              <InputField label="HPV Dose 2 (Girls 9-14 Yrs)" val={formData.epi.hpv2} onChange={(v) => handleNumChange('epi', 'hpv2', v)} />
              <InputField label="Vitamin A (<1 Year)" val={formData.epi.vitaminA} onChange={(v) => handleNumChange('epi', 'vitaminA', v)} />
              <InputField label="Fully Immunized Child (FIC)" val={formData.epi.fullyImmunizedChild} onChange={(v) => handleNumChange('epi', 'fullyImmunizedChild', v)} required highlight />
              <InputField label="Td / TT Doses (Maternal)" val={formData.epi.tdTT} onChange={(v) => handleNumChange('epi', 'tdTT', v)} />
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center space-x-1.5">
                <span>EPI Session Monitoring:</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">(Mandatory for Outreach Efficiency)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <InputField label="Outreach Conducted" val={formData.epi.outreachSessionsDone} onChange={(v) => handleNumChange('epi', 'outreachSessionsDone', v)} required highlight />
                <InputField label="Outreach Planned" val={formData.epi.outreachSessionsPlanned} onChange={(v) => handleNumChange('epi', 'outreachSessionsPlanned', v)} required highlight />
                <InputField label="Static Conducted" val={formData.epi.staticSessionsDone} onChange={(v) => handleNumChange('epi', 'staticSessionsDone', v)} />
                <InputField label="Static Planned" val={formData.epi.staticSessionsPlanned} onChange={(v) => handleNumChange('epi', 'staticSessionsPlanned', v)} />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: DISEASE SURVEILLANCE */}
        {activeFormSection === 'disease' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Disease Surveillance & OPD Morbidity Cases</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter monthly OPD caseloads across major morbidities, NCDs, NTDs, and IDSR priority conditions.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                <span className="text-red-500 font-bold">*</span> = Mandatory Core Return
              </span>
            </div>

            {/* Sub-group 1: Top OPD Morbidities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
                <span>1. Common Outpatient OPD Morbidities</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Top GHS Disease Return</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <InputField label="Malaria OPD Confirmed" val={formData.diseaseSurveillance.malariaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'malariaCases', v)} required highlight />
                <InputField label="URTI Cases" val={formData.diseaseSurveillance.urtiCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'urtiCases', v)} required highlight />
                <InputField label="Diarrhoea Cases" val={formData.diseaseSurveillance.diarrhoeaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'diarrhoeaCases', v)} required highlight />
                <InputField label="Pneumonia Cases" val={formData.diseaseSurveillance.pneumoniaCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'pneumoniaCases', v)} required highlight />
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
                <InputField label="Hypertension Cases" val={formData.diseaseSurveillance.hypertensionCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'hypertensionCases', v)} required highlight />
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
                <InputField label="Snake Bites & Envenomation" val={formData.diseaseSurveillance.snakeBitesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'snakeBitesCases', v)} required highlight />
                <InputField label="Dog Bites / Suspected Rabies" val={formData.diseaseSurveillance.dogBitesCases} onChange={(v) => handleNumChange('diseaseSurveillance', 'dogBitesCases', v)} />
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
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Maternal, Adolescent & Reproductive Health Services</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter ANC registrations, teenage pregnancy cases, maternal anaemia counts, visits, skilled deliveries, PNC, and IPT malaria prophylaxis doses.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                <span className="text-red-500 font-bold">*</span> = Mandatory Core Return
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="ANC 1 Registrations" val={formData.maternalHealth.anc1} onChange={(v) => handleNumChange('maternalHealth', 'anc1', v)} required highlight />
              <InputField label="Teenage Pregnancies (10-19 yrs)" val={formData.maternalHealth.teenagePregnancies} onChange={(v) => handleNumChange('maternalHealth', 'teenagePregnancies', v)} required highlight />
              <InputField label="ANC Anaemia @ Registration (<11g/dl)" val={formData.maternalHealth.ancAnaemiaRegistration} onChange={(v) => handleNumChange('maternalHealth', 'ancAnaemiaRegistration', v)} />
              <InputField label="ANC Anaemia @ 36 Weeks (<11g/dl)" val={formData.maternalHealth.ancAnaemia36Weeks} onChange={(v) => handleNumChange('maternalHealth', 'ancAnaemia36Weeks', v)} />
              <InputField label="ANC 4 Visits" val={formData.maternalHealth.anc4} onChange={(v) => handleNumChange('maternalHealth', 'anc4', v)} required highlight />
              <InputField label="ANC 8 Visits" val={formData.maternalHealth.anc8} onChange={(v) => handleNumChange('maternalHealth', 'anc8', v)} />
              <InputField label="Skilled Deliveries" val={formData.maternalHealth.skilledDeliveries} onChange={(v) => handleNumChange('maternalHealth', 'skilledDeliveries', v)} required highlight />
              <InputField label="PNC Visits (within 48h)" val={formData.maternalHealth.postnatalCare} onChange={(v) => handleNumChange('maternalHealth', 'postnatalCare', v)} required highlight />
              <InputField label="IPT 1 (Maternal Malaria)" val={formData.maternalHealth.ipt1} onChange={(v) => handleNumChange('maternalHealth', 'ipt1', v)} required highlight />
              <InputField label="IPT 2 (Maternal Malaria)" val={formData.maternalHealth.ipt2} onChange={(v) => handleNumChange('maternalHealth', 'ipt2', v)} />
              <InputField label="IPT 3 (Maternal Malaria)" val={formData.maternalHealth.ipt3} onChange={(v) => handleNumChange('maternalHealth', 'ipt3', v)} />
            </div>
          </div>
        )}

        {/* SECTION 4: CHILD HEALTH */}
        {activeFormSection === 'child' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Child Health & Nutrition Services</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter child growth monitoring, Vitamin A supplementation, deworming, SAM/MAM malnutrition cases, exclusive breastfeeding, and ORS & Zinc management.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                <span className="text-red-500 font-bold">*</span> = Mandatory Core Return
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField label="Growth Monitoring Attended" val={formData.childHealth.growthMonitoringAttended} onChange={(v) => handleNumChange('childHealth', 'growthMonitoringAttended', v)} required highlight />
              <InputField label="Vitamin A Supplemented (<5)" val={formData.childHealth.vitaminASupplementation} onChange={(v) => handleNumChange('childHealth', 'vitaminASupplementation', v)} />
              <InputField label="Deworming (12-59 mos)" val={formData.childHealth.deworming} onChange={(v) => handleNumChange('childHealth', 'deworming', v)} />
              <InputField label="Children Screened for Malnutrition" val={formData.childHealth.malnutritionScreened} onChange={(v) => handleNumChange('childHealth', 'malnutritionScreened', v)} required highlight />
              <InputField label="Moderate Acute Malnutrition (MAM)" val={formData.childHealth.moderateAcuteMalnutrition} onChange={(v) => handleNumChange('childHealth', 'moderateAcuteMalnutrition', v)} />
              <InputField label="Severe Acute Malnutrition (SAM)" val={formData.childHealth.severeAcuteMalnutrition} onChange={(v) => handleNumChange('childHealth', 'severeAcuteMalnutrition', v)} required highlight />
              <InputField label="Early Breastfeeding Initiation (<1hr)" val={formData.childHealth.earlyBreastfeedingInitiation} onChange={(v) => handleNumChange('childHealth', 'earlyBreastfeedingInitiation', v)} />
              <InputField label="Exclusive Breastfeeding @ 6 Months" val={formData.childHealth.exclusiveBreastfeeding6Months} onChange={(v) => handleNumChange('childHealth', 'exclusiveBreastfeeding6Months', v)} required highlight />
              <InputField label="Penta 3 Immunized" val={formData.childHealth.penta3Vaccinated} onChange={(v) => handleNumChange('childHealth', 'penta3Vaccinated', v)} />
              <InputField label="Under-5 Diarrhoea Treated w/ ORS & Zinc" val={formData.childHealth.diarrhoeaTreatedOrsZinc} onChange={(v) => handleNumChange('childHealth', 'diarrhoeaTreatedOrsZinc', v)} required highlight />
            </div>
          </div>
        )}

        {/* SECTION 5: TB CONTROL */}
        {activeFormSection === 'tb' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Tuberculosis Screening & Control</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter TB cascade metrics: screened, presumptive, samples collected, confirmed, and treatment started.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                <span className="text-red-500 font-bold">*</span> = Mandatory Core Return
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <InputField label="TB Screened" val={formData.tb.screened} onChange={(v) => handleNumChange('tb', 'screened', v)} required highlight />
              <InputField label="TB Presumptive Cases" val={formData.tb.presumptiveCases} onChange={(v) => handleNumChange('tb', 'presumptiveCases', v)} required highlight />
              <InputField label="TB Samples Collected" val={formData.tb.samplesCollected} onChange={(v) => handleNumChange('tb', 'samplesCollected', v)} />
              <InputField label="TB Confirmed Cases" val={formData.tb.confirmedCases} onChange={(v) => handleNumChange('tb', 'confirmedCases', v)} />
              <InputField label="TB Treatment Initiated" val={formData.tb.treatmentInitiated} onChange={(v) => handleNumChange('tb', 'treatmentInitiated', v)} />
            </div>
          </div>
        )}

        {/* In-Page Bottom Confirmation Card */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-500 dark:border-emerald-600 p-5 rounded-2xl text-xs text-emerald-900 dark:text-emerald-100 space-y-3 shadow-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                      Verified & Saved
                    </span>
                    {lastSavedSnapshot && (
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                        Committed at {lastSavedSnapshot.timestamp}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-white">
                    Facility Monthly Data Successfully Saved!
                  </h4>
                  <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    {saveSuccessMsg}
                  </p>
                </div>
              </div>
            </div>

            {onNavigateTab && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-200 dark:border-emerald-800/80">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mr-1">
                  Next Steps:
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('dashboard')}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-300" />
                  <span>View Executive Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('comparison')}
                  className="bg-white dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs transition-colors cursor-pointer"
                >
                  <span>Facility Rankings</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('reports')}
                  className="bg-white dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs transition-colors cursor-pointer"
                >
                  <span>Review Reports</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Button Bar */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-4 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Saving will commit <strong>{formData.facilityName}</strong> record for{' '}
              <strong>{MONTH_NAMES[(entryMonth - 1) % 12]} {entryYear}</strong> into live indicators.
            </span>
          </div>

          <button
            id="submit-data-entry-btn"
            type="submit"
            disabled={saveStatus === 'saving'}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center space-x-2 transition-all cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-neutral-900'
                : saveStatus === 'saving'
                ? 'bg-emerald-700 text-white opacity-80 cursor-wait'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-amber-300" />
                <span>Saving & Committing to Database...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>✓ Monthly Data Saved to Database!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save & Commit Monthly Data</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable Numeric Input Field Component with Visual Cues for Mandatory Fields
interface InputFieldProps {
  label: string;
  val: number;
  onChange: (v: number) => void;
  required?: boolean;
  highlight?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, val, onChange, required, highlight }) => {
  const isEntered = typeof val === 'number' && !isNaN(val) && val > 0;

  return (
    <div
      className={`space-y-1.5 p-3 rounded-xl border transition-all ${
        required
          ? isEntered
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/30'
            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80'
          : highlight
          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 block truncate" title={label}>
          {label}
        </label>
        {required ? (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center space-x-0.5">
            <span className="text-red-600 dark:text-red-400 font-black">*</span>
            <span>REQ</span>
          </span>
        ) : (
          <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500 uppercase shrink-0">
            Opt
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          min={0}
          value={val === 0 ? '' : val}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(0);
            } else {
              onChange(parseInt(raw, 10));
            }
          }}
          placeholder="0"
          className={`w-full bg-white dark:bg-neutral-900 border rounded-lg px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none transition-all ${
            required
              ? 'border-amber-400/80 dark:border-amber-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/40'
              : 'border-neutral-300 dark:border-neutral-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/40'
          }`}
        />
        {isEntered && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        )}
      </div>
    </div>
  );
};
