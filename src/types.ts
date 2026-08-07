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
  mr1: number;
  mr2: number;
  yellowFever: number;
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
  tbCases: number;
  measlesCases: number;
  choleraCases: number;
  meningitisCases: number;
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
}

export interface ChildHealthData {
  growthMonitoringAttended: number;
  vitaminASupplementation: number;
  deworming: number;
  malnutritionScreened: number;
  severeAcuteMalnutrition: number;
}

export interface TbData {
  screened: number;
  presumptiveCases: number;
  samplesCollected: number;
  confirmedCases: number;
  treatmentInitiated: number;
}

export interface FacilityMonthlyData {
  facilityId: FacilityID;
  facilityName: string;
  year: number;
  month: number; // 1 - 12
  monthLabel: string; // "Jan 2026", "Feb 2026", etc.
  reportStatus: 'Submitted' | 'Late' | 'Missing';
  submittedDate: string;
  
  epi: EpiData;
  diseaseSurveillance: DiseaseSurveillanceData;
  maternalHealth: MaternalHealthData;
  childHealth: ChildHealthData;
  tb: TbData;
}

export interface CalculatedFacilityMetrics {
  facilityId: FacilityID;
  facilityName: string;
  
  // EPI Metrics
  penta1CoverageRate: number;
  penta3CoverageRate: number;
  mr1CoverageRate: number;
  bcgCoverageRate: number;
  ficRate: number; // Fully Immunized Child Rate %
  pentaDropoutRate: number; // (Penta1 - Penta3) / Penta1 * 100
  mr1DropoutRate: number;    // (Penta1 - MR1) / Penta1 * 100
  pentaLeftOutRate: number; // (Target - Penta1) / Target * 100
  
  // Maternal
  anc1CoverageRate: number;
  anc4CoverageRate: number;
  ancRetentionRate: number; // (ANC4 / ANC1) * 100
  skilledDeliveryRate: number;
  pncCoverageRate: number;
  ipt3CoverageRate: number;
  
  // Child
  growthMonitoringRate: number;
  
  // Scores
  epiScore: number;
  maternalScore: number;
  diseaseScore: number;
  childScore: number;
  tbScore: number;
  overallScore: number;
  performanceLevel: 'Green' | 'Amber' | 'Red';
  rank: number;
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
