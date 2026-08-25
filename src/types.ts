/**
 * Zongoire Sub-District Health Performance Monitoring System (ZSHPMS)
 * Types and Interfaces
 */

export type FacilityID = 'zongoire_hc' | 'zongoire_chps' | 'apodabogo_chps' | 'dagunga_chps' | string;

export interface Facility {
  id: FacilityID;
  name: string;
  type: 'Health Centre' | 'CHPS';
  subDistrict: 'Zongoire';
  district: 'Bawku West';
  region: 'Upper East';
  inCharge: string;
  contact: string;
  targetPopulation: TargetPopulation;
}

export interface TargetPopulation {
  catchmentPopulation: number;
  expectedPregnancies: number; // ~4% of total pop
  expectedDeliveries: number;  // ~3.8% of total pop
  childrenUnder1: number;       // ~4% of total pop
  childrenUnder5: number;       // ~20% of total pop
  womenOfReproductiveAge: number; // WRA ~24% of total pop
  customProgrammeTargets?: Record<string, number>;
}

export interface EpiData {
  bcg: number;
  opv0: number;
  opv1: number;
  opv2: number;
  opv3: number;
  penta1: number;
  penta2: number;
  penta3: number;
  pcv1: number;
  pcv2: number;
  pcv3: number;
  rota1: number;
  rota2: number;
  ipv: number;
  ipv2: number; // 2026 IPV 2nd Dose
  mr1: number;
  mr2: number;
  yellowFever: number;
  menA: number; // Meningitis A
  malaria1: number; // 2026 RTS,S / R21 Malaria Vaccine Dose 1 (6 months)
  malaria2: number; // 2026 RTS,S / R21 Malaria Vaccine Dose 2 (7 months)
  malaria3: number; // 2026 RTS,S / R21 Malaria Vaccine Dose 3 (9 months)
  malaria4: number; // 2026 RTS,S / R21 Malaria Vaccine Dose 4 (18-24 months)
  hpv1: number; // 2026 HPV Dose 1 (Girls 9-14 yrs)
  hpv2: number; // 2026 HPV Dose 2 (Girls 9-14 yrs)
  vitaminA: number;
  fullyImmunizedChild: number;
  tdTT: number;
  outreachSessionsDone: number;
  outreachSessionsPlanned: number;
  staticSessionsDone: number;
  staticSessionsPlanned: number;
}

export interface DiseaseSurveillanceData {
  malariaCases: number;
  diarrhoeaCases: number;
  pneumoniaCases: number;
  urtiCases: number; // Upper Respiratory Tract Infection
  typhoidCases: number;
  anaemiaCases: number;
  hypertensionCases: number;
  diabetesCases: number; // Diabetes Mellitus (NCD)
  skinDiseasesCases: number; // Skin Diseases & Ulcers
  rheumatismCases: number; // Rheumatism & Joint Pains
  eyeInfectionsCases: number; // Acute Eye Infections / Conjunctivitis
  intestinalWormsCases: number; // Intestinal Worms / Helminthiasis
  dentalCariesCases: number; // Dental & Oral Conditions
  snakeBitesCases: number; // Snake Bites & Envenomation
  dogBitesCases: number; // Dog Bites / Suspected Rabies
  hepatitisBCases: number; // Viral Hepatitis (B & C)
  tbCases: number;
  measlesCases: number; // Suspected Measles
  choleraCases: number;
  meningitisCases: number; // Acute Bacterial Meningitis
  yellowFeverCases: number; // Suspected Yellow Fever / Acute Jaundice
  afpCases: number; // Acute Flaccid Paralysis
  schistosomiasisCases: number; // Schistosomiasis / Bilharzia
  pregnancyComplicationsCases: number; // Pregnancy-related OPD Conditions
}

export interface MaternalHealthData {
  anc1: number;
  anc4: number;
  anc8: number;
  skilledDeliveries: number;
  postnatalCare: number; // PNC within 48 hours
  ipt1: number; // Intermittent Preventive Treatment for Malaria in Pregnancy
  ipt2: number;
  ipt3: number;
  teenagePregnancies: number; // Teenage Pregnancy cases (10-19 years)
  ancAnaemiaRegistration: number; // Pregnant women with Anaemia at ANC registration (<11g/dl)
  ancAnaemia36Weeks: number; // Pregnant women with Anaemia at 36 weeks term (<11g/dl)
}

export interface ChildHealthData {
  growthMonitoringAttended: number;
  vitaminASupplementation: number;
  deworming: number;
  malnutritionScreened: number;
  severeAcuteMalnutrition: number; // SAM cases
  moderateAcuteMalnutrition: number; // MAM cases
  exclusiveBreastfeeding6Months: number; // EBF at 6 months
  earlyBreastfeedingInitiation: number; // Put to breast within 1 hour
  penta3Vaccinated: number; // Penta 3 immunization
  diarrhoeaTreatedOrsZinc: number; // Under-5 diarrhoea treated with ORS & Zinc
}

export interface TbData {
  screened: number;
  presumptiveCases: number;
  samplesCollected: number;
  confirmedCases: number;
  treatmentInitiated: number;
}

export type DataSource = 'sample' | 'actual';

export interface FacilityMonthlyData {
  facilityId: FacilityID;
  facilityName: string;
  year: number;
  month: number; // 1 - 12
  monthLabel: string; // "Jan 2026", "Feb 2026", etc.
  reportStatus: 'Submitted' | 'Late' | 'Missing';
  submittedDate: string;
  dataSource?: DataSource; // 'sample' (Baseline/Demo) | 'actual' (Imported/Entered)
  isSample?: boolean; // Convenience flag: true if baseline/demo data, false if actual data
  
  epi: EpiData;
  diseaseSurveillance: DiseaseSurveillanceData;
  maternalHealth: MaternalHealthData;
  childHealth: ChildHealthData;
  tb: TbData;
}

export interface CalculatedFacilityMetrics {
  facilityId: FacilityID;
  facilityName: string;
  
  // EPI Metrics (Standard & 2026 Updated)
  penta1CoverageRate: number;
  penta3CoverageRate: number;
  mr1CoverageRate: number;
  mr2CoverageRate: number;
  bcgCoverageRate: number;
  ficRate: number; // Fully Immunized Child Rate %
  pentaDropoutRate: number; // (Penta1 - Penta3) / Penta1 * 100
  mr1DropoutRate: number;    // (Penta1 - MR1) / Penta1 * 100
  pentaLeftOutRate: number; // (Target - Penta1) / Target * 100
  
  // 2026 Ghana EPI Vaccines
  malaria3CoverageRate: number; // RTS,S/R21 Malaria Vaccine 3rd Dose %
  malaria4CoverageRate: number; // RTS,S/R21 Malaria Vaccine Booster (4th Dose) %
  hpv1CoverageRate: number;     // HPV Dose 1 Coverage %
  ipv2CoverageRate: number;     // IPV2 Dose Coverage %
  zeroDoseChildrenCount: number; // Unvaccinated zero-dose children estimate
  
  // Maternal (Standard & 2026 Updated)
  anc1CoverageRate: number;
  anc4CoverageRate: number;
  anc8CoverageRate: number; // 2026 WHO 8 Contact Model Coverage %
  ancRetentionRate: number; // (ANC4 / ANC1) * 100
  skilledDeliveryRate: number;
  pncCoverageRate: number;
  ipt3CoverageRate: number;
  teenagePregnancyRate: number; // (Teenage Pregnancies / ANC1) * 100
  ancAnaemiaRegistrationRate: number; // (ANC Anaemia at Booking / ANC1) * 100
  
  // Child Health & Nutrition (2026 Updated)
  growthMonitoringRate: number;
  ebfRate: number; // Exclusive Breastfeeding @ 6 Months %
  orsZincTreatmentRate: number; // Diarrhoea treated with ORS + Zinc %
  samRecoveryRate: number; // SAM case recovery rate %
  
  // Scores & Ranking Credentials
  hasData: boolean; // True if facility has at least one submitted monthly record in the period
  submittedReportsCount: number; // Actual number of submitted monthly records
  expectedReportsCount: number; // Expected monthly reports for the review period
  reportingCompletenessRate: number; // (submittedReportsCount / expectedReportsCount) * 100
  latestSubmissionDate?: string;
  epiScore: number;
  maternalScore: number;
  diseaseScore: number;
  childScore: number;
  tbScore: number;
  dataQualityScore: number; // Data Timeliness & Completeness Score
  overallScore: number;
  performanceLevel: 'Green' | 'Amber' | 'Red';
  gradeLabel: 'Grade A+ Outstanding' | 'Grade A Excellent' | 'Grade B Satisfactory' | 'Grade C Needs Improvement' | 'Grade D Critical';
  rank: number;
  credentialVerificationCode: string; // Official credential ID e.g. GHS-BW-ZSHPMS-2026-RANK-01
}

export interface AuditLog {
  id: string;
  timestamp: string;
  fileName: string;
  userRole: string;
  uploadedBy: string;
  period: string;
  recordsProcessed: number;
  status: 'Success' | 'Failed' | 'Warning';
  details: string;
}

export interface MeAlert {
  id: string;
  facilityId: FacilityID;
  facilityName: string;
  type: 'Low Coverage' | 'High Dropout' | 'Missing Report' | 'Disease Spike' | 'Target Gap';
  severity: 'Red' | 'Amber' | 'Green';
  indicator: string;
  message: string;
  value: string;
  target: string;
  recommendedAction: string;
}

export type ReviewType = 'monthly' | 'quarterly' | 'midyear' | 'annual';
export type UserRole = 'admin' | 'viewer';
