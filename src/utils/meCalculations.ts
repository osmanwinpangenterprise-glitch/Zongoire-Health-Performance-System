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
      acc.penta1 += curr.epi.penta1 || 0;
      acc.penta2 += curr.epi.penta2 || 0;
      acc.penta3 += curr.epi.penta3 || 0;
      acc.mr1 += curr.epi.mr1 || 0;
      acc.mr2 += curr.epi.mr2 || 0;
      acc.bcg += curr.epi.bcg || 0;
      acc.fic += curr.epi.fullyImmunizedChild || 0;
      acc.ipv2 += curr.epi.ipv2 || 0;
      acc.malaria1 += curr.epi.malaria1 || 0;
      acc.malaria2 += curr.epi.malaria2 || 0;
      acc.malaria3 += curr.epi.malaria3 || 0;
      acc.malaria4 += curr.epi.malaria4 || 0;
      acc.hpv1 += curr.epi.hpv1 || 0;
      acc.hpv2 += curr.epi.hpv2 || 0;
      acc.menA += curr.epi.menA || 0;

      // Maternal
      acc.anc1 += curr.maternalHealth.anc1 || 0;
      acc.anc4 += curr.maternalHealth.anc4 || 0;
      acc.anc8 += curr.maternalHealth.anc8 || 0;
      acc.skilledDeliveries += curr.maternalHealth.skilledDeliveries || 0;
      acc.pnc += curr.maternalHealth.postnatalCare || 0;
      acc.ipt3 += curr.maternalHealth.ipt3 || 0;
      acc.teenagePregnancies += curr.maternalHealth.teenagePregnancies || 0;
      acc.ancAnaemiaRegistration += curr.maternalHealth.ancAnaemiaRegistration || 0;

      // Child Health & Disease
      acc.growthMonitoring += curr.childHealth.growthMonitoringAttended || 0;
      acc.ebf += curr.childHealth.exclusiveBreastfeeding6Months || 0;
      acc.orsZinc += curr.childHealth.diarrhoeaTreatedOrsZinc || 0;
      acc.malaria += curr.diseaseSurveillance.malariaCases || 0;
      acc.diarrhoea += curr.diseaseSurveillance.diarrhoeaCases || 0;
      acc.sam += curr.childHealth.severeAcuteMalnutrition || 0;
      acc.mam += curr.childHealth.moderateAcuteMalnutrition || 0;

      // TB
      acc.tbScreened += curr.tb.screened || 0;
      acc.tbConfirmed += curr.tb.confirmedCases || 0;
      acc.tbTreatment += curr.tb.treatmentInitiated || 0;

      // Timeliness / Data Quality
      if (curr.reportStatus === 'Submitted') acc.submittedCount += 1;

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
      ipv2: 0,
      malaria1: 0,
      malaria2: 0,
      malaria3: 0,
      malaria4: 0,
      hpv1: 0,
      hpv2: 0,
      menA: 0,
      anc1: 0,
      anc4: 0,
      anc8: 0,
      skilledDeliveries: 0,
      pnc: 0,
      ipt3: 0,
      teenagePregnancies: 0,
      ancAnaemiaRegistration: 0,
      growthMonitoring: 0,
      ebf: 0,
      orsZinc: 0,
      malaria: 0,
      diarrhoea: 0,
      sam: 0,
      mam: 0,
      tbScreened: 0,
      tbConfirmed: 0,
      tbTreatment: 0,
      submittedCount: 0,
    }
  );

  const targetPop = facility.targetPopulation;

  // Adjusted denominators based on numMonths
  const periodUnder1Target = getMonthlyTarget(targetPop.childrenUnder1, numMonths);
  const periodUnder5Target = getMonthlyTarget(targetPop.childrenUnder5, numMonths);
  const periodDeliveriesTarget = getMonthlyTarget(targetPop.expectedDeliveries, numMonths);
  const periodPregnanciesTarget = getMonthlyTarget(targetPop.expectedPregnancies, numMonths);
  const wraTarget = getMonthlyTarget(targetPop.womenOfReproductiveAge, numMonths);
  const adolescentGirlsTarget = Math.round(wraTarget * 0.15); // Target for HPV vaccine (9-14 yrs)

  // Standard & 2026 EPI Coverage Rates
  const penta1CoverageRate = Math.min(120, Number(((aggregated.penta1 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const penta3CoverageRate = Math.min(120, Number(((aggregated.penta3 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const mr1CoverageRate = Math.min(120, Number(((aggregated.mr1 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const mr2CoverageRate = Math.min(120, Number(((aggregated.mr2 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const bcgCoverageRate = Math.min(120, Number(((aggregated.bcg / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const ficRate = Math.min(120, Number(((aggregated.fic / (periodUnder1Target || 1)) * 100).toFixed(1)));

  // 2026 EPI Vaccines
  const malaria3CoverageRate = Math.min(120, Number(((aggregated.malaria3 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const malaria4CoverageRate = Math.min(120, Number(((aggregated.malaria4 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const hpv1CoverageRate = Math.min(120, Number(((aggregated.hpv1 / (adolescentGirlsTarget || 1)) * 100).toFixed(1)));
  const ipv2CoverageRate = Math.min(120, Number(((aggregated.ipv2 / (periodUnder1Target || 1)) * 100).toFixed(1)));
  const zeroDoseChildrenCount = Math.max(0, Math.round(periodUnder1Target - aggregated.penta1));

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
  const anc8CoverageRate = Math.min(120, Number(((aggregated.anc8 / (periodPregnanciesTarget || 1)) * 100).toFixed(1)));
  const ancRetentionRate = aggregated.anc1 > 0 ? Number(((aggregated.anc4 / aggregated.anc1) * 100).toFixed(1)) : 0;
  const skilledDeliveryRate = Math.min(120, Number(((aggregated.skilledDeliveries / (periodDeliveriesTarget || 1)) * 100).toFixed(1)));
  const pncCoverageRate = Math.min(120, Number(((aggregated.pnc / (periodDeliveriesTarget || 1)) * 100).toFixed(1)));
  const ipt3CoverageRate = Math.min(120, Number(((aggregated.ipt3 / (periodPregnanciesTarget || 1)) * 100).toFixed(1)));
  const teenagePregnancyRate = aggregated.anc1 > 0 ? Number(((aggregated.teenagePregnancies / aggregated.anc1) * 100).toFixed(1)) : 0;
  const ancAnaemiaRegistrationRate = aggregated.anc1 > 0 ? Number(((aggregated.ancAnaemiaRegistration / aggregated.anc1) * 100).toFixed(1)) : 0;

  // Child Health
  const growthMonitoringRate = Math.min(
    120,
    Number(((aggregated.growthMonitoring / (periodUnder5Target || 1)) * 100).toFixed(1))
  );
  const ebfRate = Math.min(120, Number(((aggregated.ebf / (periodUnder1Target * 0.5 || 1)) * 100).toFixed(1)));
  const orsZincTreatmentRate = aggregated.diarrhoea > 0 ? Math.min(100, Math.round((aggregated.orsZinc / aggregated.diarrhoea) * 100)) : 100;
  const samRecoveryRate = aggregated.sam > 0 ? 85 : 100;

  // Data Quality Score (Timeliness + Completeness)
  const dataQualityScore = Math.round((aggregated.submittedCount / (numMonths || 1)) * 100);

  // EPI Sub-Score (Updated 2026: incorporates Penta3 30%, FIC 30%, RTS,S Malaria Vaccine 20%, HPV 10%, IPV2 10%)
  let epiScore = penta3CoverageRate * 0.3 + ficRate * 0.3 + malaria3CoverageRate * 0.2 + hpv1CoverageRate * 0.1 + ipv2CoverageRate * 0.1;
  if (pentaDropoutRate > 10) epiScore -= (pentaDropoutRate - 10) * 1.2;
  if (pentaDropoutRate < 0) epiScore -= Math.abs(pentaDropoutRate);
  epiScore = Math.max(0, Math.min(100, Math.round(epiScore)));

  // Maternal Sub-Score (Updated 2026: Skilled Delivery 35%, ANC4+ 25%, ANC8+ 15%, IPT3 15%, PNC 10%)
  let maternalScore = skilledDeliveryRate * 0.35 + anc4CoverageRate * 0.25 + (anc8CoverageRate || anc4CoverageRate * 0.7) * 0.15 + ipt3CoverageRate * 0.15 + pncCoverageRate * 0.10;
  maternalScore = Math.max(0, Math.min(100, Math.round(maternalScore)));

  // Child Sub-Score
  let childScore = Math.max(0, Math.min(100, Math.round(ficRate * 0.4 + growthMonitoringRate * 0.3 + ebfRate * 0.15 + orsZincTreatmentRate * 0.15)));

  // Disease Control Sub-Score
  let diseaseScore = 88;
  if (aggregated.malaria / numMonths > 120) diseaseScore -= 8;
  if (aggregated.diarrhoea / numMonths > 25) diseaseScore -= 8;
  if (aggregated.sam > 0) diseaseScore -= aggregated.sam * 4;
  diseaseScore = Math.max(0, Math.min(100, diseaseScore));

  // TB Sub-Score
  let tbScore = aggregated.tbScreened / numMonths > 10 ? 88 : 70;
  if (aggregated.tbConfirmed > 0 && aggregated.tbTreatment === aggregated.tbConfirmed) {
    tbScore = 100;
  }

  // Overall Weighted Score (EPI 25%, Maternal 25%, Disease 20%, Child 15%, Data Quality 10%, TB 5%)
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        epiScore * 0.25 + maternalScore * 0.25 + diseaseScore * 0.20 + childScore * 0.15 + dataQualityScore * 0.10 + tbScore * 0.05
      )
    )
  );

  let performanceLevel: 'Green' | 'Amber' | 'Red' = 'Green';
  let gradeLabel: 'Grade A+ Outstanding' | 'Grade A Excellent' | 'Grade B Satisfactory' | 'Grade C Needs Improvement' | 'Grade D Critical' = 'Grade A Excellent';

  if (overallScore >= 90) {
    performanceLevel = 'Green';
    gradeLabel = 'Grade A+ Outstanding';
  } else if (overallScore >= 80) {
    performanceLevel = 'Green';
    gradeLabel = 'Grade A Excellent';
  } else if (overallScore >= 70) {
    performanceLevel = 'Amber';
    gradeLabel = 'Grade B Satisfactory';
  } else if (overallScore >= 50) {
    performanceLevel = 'Amber';
    gradeLabel = 'Grade C Needs Improvement';
  } else {
    performanceLevel = 'Red';
    gradeLabel = 'Grade D Critical';
  }

  // Generate official credential verification code
  const facCodeMap: Record<string, string> = {
    zongoire_hc: 'ZHC-01',
    zongoire_chps: 'ZCH-02',
    apodabogo_chps: 'ACH-03',
    dagunga_chps: 'DCH-04',
  };
  const codeSuffix = facCodeMap[facility.id] || 'FAC-00';
  const credentialVerificationCode = `GHS-BW-ZSHPMS-2026-${codeSuffix}`;

  return {
    facilityId: facility.id,
    facilityName: facility.name,
    penta1CoverageRate,
    penta3CoverageRate,
    mr1CoverageRate,
    mr2CoverageRate,
    bcgCoverageRate,
    ficRate,
    pentaDropoutRate,
    mr1DropoutRate,
    pentaLeftOutRate,
    malaria3CoverageRate,
    malaria4CoverageRate,
    hpv1CoverageRate,
    ipv2CoverageRate,
    zeroDoseChildrenCount,
    anc1CoverageRate,
    anc4CoverageRate,
    anc8CoverageRate,
    ancRetentionRate,
    skilledDeliveryRate,
    pncCoverageRate,
    ipt3CoverageRate,
    teenagePregnancyRate,
    ancAnaemiaRegistrationRate,
    growthMonitoringRate,
    ebfRate,
    orsZincTreatmentRate,
    samRecoveryRate,
    epiScore,
    maternalScore,
    diseaseScore,
    childScore,
    tbScore,
    dataQualityScore,
    overallScore,
    performanceLevel,
    gradeLabel,
    rank: 1,
    credentialVerificationCode,
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
