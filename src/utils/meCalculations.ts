import {
  Facility,
  FacilityMonthlyData,
  CalculatedFacilityMetrics,
  MeAlert,
} from '../types';

/**
 * Calculates monthly target for a specific target population indicator
 */
export function getMonthlyTarget(annualTarget: number, numMonths = 1): number {
  return (annualTarget / 12) * numMonths;
}

/**
 * Calculates comprehensive M&E performance metrics for a single facility's monthly or periodic data
 */
export function calculateFacilityMetrics(
  facility: Facility,
  filteredMonthlyData: FacilityMonthlyData[]
): CalculatedFacilityMetrics {
  // Filter for this specific facility
  const facDataList = filteredMonthlyData.filter((d) => d.facilityId === facility.id);
  const numMonths = Math.max(1, facDataList.length);

  // Aggregate stats across all matched months for this facility
  const aggregated = facDataList.reduce(
    (acc, curr) => {
      // EPI
      acc.penta1 += curr.epi.penta1;
      acc.penta2 += curr.epi.penta2;
      acc.penta3 += curr.epi.penta3;
      acc.mr1 += curr.epi.mr1;
      acc.mr2 += curr.epi.mr2;
      acc.bcg += curr.epi.bcg;
      acc.fic += curr.epi.fullyImmunizedChild;

      // Maternal
      acc.anc1 += curr.maternalHealth.anc1;
      acc.anc4 += curr.maternalHealth.anc4;
      acc.anc8 += curr.maternalHealth.anc8;
      acc.skilledDeliveries += curr.maternalHealth.skilledDeliveries;
      acc.pnc += curr.maternalHealth.postnatalCare;
      acc.ipt3 += curr.maternalHealth.ipt3;

      // Child Health & Disease
      acc.growthMonitoring += curr.childHealth.growthMonitoringAttended;
      acc.malaria += curr.diseaseSurveillance.malariaCases;
      acc.diarrhoea += curr.diseaseSurveillance.diarrhoeaCases;
      acc.sam += curr.childHealth.severeAcuteMalnutrition;

      // TB
      acc.tbScreened += curr.tb.screened;
      acc.tbConfirmed += curr.tb.confirmedCases;
      acc.tbTreatment += curr.tb.treatmentInitiated;

      return acc;
    },
    {
      penta1: 0,
      penta2: 0,
      penta3: 0,
      mr1: 0,
      mr2: 0,
      bcg: 0,
      fic: 0,
      anc1: 0,
      anc4: 0,
      anc8: 0,
      skilledDeliveries: 0,
      pnc: 0,
      ipt3: 0,
      growthMonitoring: 0,
      malaria: 0,
      diarrhoea: 0,
      sam: 0,
      tbScreened: 0,
      tbConfirmed: 0,
      tbTreatment: 0,
    }
  );

  const targetPop = facility.targetPopulation;

  // Adjusted denominators
  const periodUnder1Target = getMonthlyTarget(targetPop.childrenUnder1, numMonths);
  const periodDeliveriesTarget = getMonthlyTarget(targetPop.expectedDeliveries, numMonths);
  const periodPregnanciesTarget = getMonthlyTarget(targetPop.expectedPregnancies, numMonths);

  // EPI Coverage Rates
  const penta1CoverageRate = Math.min(120, Number(((aggregated.penta1 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const penta3CoverageRate = Math.min(120, Number(((aggregated.penta3 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const mr1CoverageRate = Math.min(120, Number(((aggregated.mr1 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const bcgCoverageRate = Math.min(120, Number(((aggregated.bcg / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const ficRate = Math.min(120, Number(((aggregated.fic / (periodUnder1Target || 1)) * 100).toFixed(1)));

  // Dropouts
  const pentaDropoutRate =
    aggregated.penta1 > 0
      ? Number((((aggregated.penta1 - aggregated.penta3) / aggregated.penta1) * 100).toFixed(1))
      : 0;
  const mr1DropoutRate =
    aggregated.penta1 > 0
      ? Number((((aggregated.penta1 - aggregated.mr1) / aggregated.penta1) * 100).toFixed(1))
      : 0;
  const pentaLeftOutRate = Number((((periodUnder1Target - aggregated.penta1) / (periodUnder1Target || 1)) * 100).toFixed(1));

  // Maternal Coverage Rates
  const anc1CoverageRate = Math.min(120, Number(((aggregated.anc1 / (periodPregnanciesTarget || 1)) * 100).toFixed(1)));
  const anc4CoverageRate = Math.min(120, Number(((aggregated.anc4 / (periodPregnanciesTarget || 1)) * 100).toFixed(1)));
  const ancRetentionRate = aggregated.anc1 > 0 ? Number(((aggregated.anc4 / aggregated.anc1) * 100).toFixed(1)) : 0;
  const skilledDeliveryRate = Math.min(120, Number(((aggregated.skilledDeliveries / (periodDeliveriesTarget || 1)) * 100).toFixed(1)));
  const pncCoverageRate = Math.min(120, Number(((aggregated.pnc / (periodDeliveriesTarget || 1)) * 100).toFixed(1)));
  const ipt3CoverageRate = Math.min(120, Number(((aggregated.ipt3 / (periodPregnanciesTarget || 1)) * 100).toFixed(1)));

  // Child Health
  const growthMonitoringRate = Math.min(
    120,
    Number(((aggregated.growthMonitoring / (getMonthlyTarget(targetPop.childrenUnder5, numMonths) || 1)) * 100).toFixed(1))
  );

  // EPI Sub-Score
  let epiScore = penta3CoverageRate * 0.5 + ficRate * 0.5;
  if (pentaDropoutRate > 10) epiScore -= (pentaDropoutRate - 10) * 1.5;
  if (pentaDropoutRate < 0) epiScore -= Math.abs(pentaDropoutRate);
  epiScore = Math.max(0, Math.min(100, Math.round(epiScore)));

  // Maternal Sub-Score
  let maternalScore = skilledDeliveryRate * 0.4 + anc4CoverageRate * 0.3 + ipt3CoverageRate * 0.3;
  maternalScore = Math.max(0, Math.min(100, Math.round(maternalScore)));

  // Child Sub-Score
  let childScore = Math.max(0, Math.min(100, Math.round(ficRate * 0.6 + growthMonitoringRate * 0.4)));

  // Disease Control Sub-Score
  let diseaseScore = 85;
  if (aggregated.malaria / numMonths > 100) diseaseScore -= 10;
  if (aggregated.diarrhoea / numMonths > 20) diseaseScore -= 10;
  if (aggregated.sam > 0) diseaseScore -= aggregated.sam * 5;
  diseaseScore = Math.max(0, Math.min(100, diseaseScore));

  // TB Sub-Score
  let tbScore = aggregated.tbScreened / numMonths > 10 ? 85 : 65;
  if (aggregated.tbConfirmed > 0 && aggregated.tbTreatment === aggregated.tbConfirmed) {
    tbScore = 100;
  }

  // Overall Weighted Score (EPI 30%, Maternal 35%, Child 15%, Disease 10%, TB 10%)
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        epiScore * 0.3 + maternalScore * 0.35 + childScore * 0.15 + diseaseScore * 0.1 + tbScore * 0.1
      )
    )
  );

  let performanceLevel: 'Green' | 'Amber' | 'Red' = 'Green';
  if (overallScore < 50) {
    performanceLevel = 'Red';
  } else if (overallScore < 80) {
    performanceLevel = 'Amber';
  }

  return {
    facilityId: facility.id,
    facilityName: facility.name,
    penta1CoverageRate,
    penta3CoverageRate,
    mr1CoverageRate,
    bcgCoverageRate,
    ficRate,
    pentaDropoutRate,
    mr1DropoutRate,
    pentaLeftOutRate,
    anc1CoverageRate,
    anc4CoverageRate,
    ancRetentionRate,
    skilledDeliveryRate,
    pncCoverageRate,
    ipt3CoverageRate,
    growthMonitoringRate,
    epiScore,
    maternalScore,
    diseaseScore,
    childScore,
    tbScore,
    overallScore,
    performanceLevel,
    rank: 1,
  };
}

/**
 * Calculates alerts for all sub-district facilities
 */
export function calculateSubDistrictAlerts(
  metricsList: CalculatedFacilityMetrics[],
  monthlyData: FacilityMonthlyData[]
): MeAlert[] {
  const alerts: MeAlert[] = [];

  metricsList.forEach((metric) => {
    const facilityRecords = monthlyData.filter((d) => d.facilityId === metric.facilityId);
    const latestRecord = facilityRecords[facilityRecords.length - 1];

    if (metric.penta3CoverageRate < 80) {
      alerts.push({
        id: `alert-penta-${metric.facilityId}`,
        facilityId: metric.facilityId,
        facilityName: metric.facilityName,
        type: 'Low Coverage',
        severity: metric.penta3CoverageRate < 50 ? 'Red' : 'Amber',
        indicator: 'Penta3 Immunization Coverage',
        value: `${metric.penta3CoverageRate}%`,
        target: '80%',
        message: `${metric.facilityName} Penta3 coverage is at ${metric.penta3CoverageRate}%, below the 80% GHS target threshold.`,
        recommendedAction: 'Conduct community child welfare outreach sessions and intensify defaulter tracing with CHVs.',
      });
    }

    if (metric.pentaDropoutRate > 10) {
      alerts.push({
        id: `alert-dropout-${metric.facilityId}`,
        facilityId: metric.facilityId,
        facilityName: metric.facilityName,
        type: 'High Dropout',
        severity: metric.pentaDropoutRate > 20 ? 'Red' : 'Amber',
        indicator: 'Penta1 to Penta3 Dropout Rate',
        value: `${metric.pentaDropoutRate}%`,
        target: '< 10%',
        message: `${metric.facilityName} recorded a ${metric.pentaDropoutRate}% Penta dropout rate. Children receiving Penta1 are failing to return for Penta3.`,
        recommendedAction: 'Verify immunization register records, update child tracking cards, and engage community health volunteers.',
      });
    }

    if (metric.skilledDeliveryRate < 50) {
      alerts.push({
        id: `alert-delivery-${metric.facilityId}`,
        facilityId: metric.facilityId,
        facilityName: metric.facilityName,
        type: 'Low Coverage',
        severity: metric.skilledDeliveryRate < 35 ? 'Red' : 'Amber',
        indicator: 'Skilled Birth Attendance',
        value: `${metric.skilledDeliveryRate}%`,
        target: '50%',
        message: `${metric.facilityName} skilled delivery rate stands at ${metric.skilledDeliveryRate}%. Risk of unassisted home deliveries.`,
        recommendedAction: 'Strengthen maternity referral linkage with traditional birth attendants and community transport systems.',
      });
    }

    if (latestRecord && latestRecord.childHealth.severeAcuteMalnutrition > 0) {
      alerts.push({
        id: `alert-sam-${metric.facilityId}`,
        facilityId: metric.facilityId,
        facilityName: metric.facilityName,
        type: 'Target Gap',
        severity: 'Red',
        indicator: 'Severe Acute Malnutrition (SAM)',
        value: `${latestRecord.childHealth.severeAcuteMalnutrition} SAM case(s)`,
        target: '0 cases',
        message: `${metric.facilityName} reported ${latestRecord.childHealth.severeAcuteMalnutrition} active Severe Acute Malnutrition cases requiring therapeutic feeding.`,
        recommendedAction: 'Immediate referral or enrollment in Outpatient Therapeutic Program (OTP) and supply RUTF.',
      });
    }
  });

  return alerts;
}
