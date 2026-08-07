import pptxgen from 'pptxgenjs';
import { CalculatedFacilityMetrics, ReviewType } from '../types';

export interface ActionItemExport {
  indicator: string;
  issue: string;
  actionPoint: string;
  responsible: string;
  deadline: string;
  status: string;
}

/**
 * Generates an official Ghana Health Service PowerPoint presentation for Sub-District Performance Review.
 */
export async function exportReviewReportToPptx({
  reviewType,
  periodLabel,
  selectedYear,
  overallAvg,
  sortedMetrics,
  actionItems,
}: {
  reviewType: ReviewType | string;
  periodLabel: string;
  selectedYear: number;
  overallAvg: number;
  sortedMetrics: CalculatedFacilityMetrics[];
  actionItems: ActionItemExport[];
}) {
  const pptx = new pptxgen();

  // Define Layout & Master Settings
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Zongoire SDHMT';
  pptx.company = 'Ghana Health Service';
  pptx.title = `Zongoire Sub-District ${reviewType.toUpperCase()} Health Performance Review`;

  const BRAND_GREEN = '006633';
  const BRAND_GOLD = 'FFD700';
  const DARK_SLATE = '1E293B';
  const LIGHT_GRAY = 'F8FAFC';

  // -------------------------------------------------------------
  // SLIDE 1: Title Slide
  // -------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: BRAND_GREEN };

  // Decorative Accent bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.3,
    fill: { color: BRAND_GOLD },
  });

  slide1.addText('GHANA HEALTH SERVICE • BAWKU WEST DISTRICT', {
    x: 0.8,
    y: 1.2,
    w: 11.7,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: BRAND_GOLD,
  });

  slide1.addText(`ZONGOIRE SUB-DISTRICT ${reviewType.toUpperCase()} HEALTH REVIEW`, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 1.2,
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Calibri',
  });

  slide1.addText('Transforming DHIMS2 Routine Data into Evidence-Based Management Decision Support', {
    x: 0.8,
    y: 2.9,
    w: 11.7,
    h: 0.5,
    fontSize: 14,
    color: 'E2E8F0',
  });

  // Score Box Card on Slide 1
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.8,
    w: 11.7,
    h: 2.2,
    fill: { color: '004d26' },
    line: { color: BRAND_GOLD, width: 2 },
    rectRadius: 0.1,
  });

  slide1.addText(`REVIEW PERIOD: ${periodLabel.toUpperCase()} ${selectedYear}`, {
    x: 1.2,
    y: 4.1,
    w: 6.0,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: BRAND_GOLD,
  });

  slide1.addText(`Aggregated Performance Score: ${overallAvg}%`, {
    x: 1.2,
    y: 4.6,
    w: 8.0,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
  });

  slide1.addText(`Facilities Included: ${sortedMetrics.length} (Zongoire HC, Apodabogo CHPS, Dagunga CHPS, Zongoire CHPS)`, {
    x: 1.2,
    y: 5.3,
    w: 10.5,
    h: 0.4,
    fontSize: 12,
    color: 'CBD5E1',
  });

  // Footer
  slide1.addText(`Presented by Sub-District Health Management Team (SDHMT) | Confidential`, {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 10,
    color: '94A3B8',
  });

  // -------------------------------------------------------------
  // SLIDE 2: Executive Summary & Context
  // -------------------------------------------------------------
  const slide2 = pptx.addSlide();
  
  // Slide Header
  slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: BRAND_GREEN } });
  slide2.addText(`1. EXECUTIVE SUMMARY & CONTEXT - ${reviewType.toUpperCase()}`, {
    x: 0.8,
    y: 0.25,
    w: 11.7,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
  });

  slide2.addText(
    `This report details aggregated service delivery statistics across 4 health facilities in Zongoire Sub-District serving a catchment population of 11,627.`,
    { x: 0.8, y: 1.2, w: 11.7, h: 0.6, fontSize: 13, color: DARK_SLATE }
  );

  // 3 Key Cards
  const topFacility = sortedMetrics[0] ? `${sortedMetrics[0].facilityName} (${sortedMetrics[0].overallScore}%)` : 'N/A';
  const lowestFacility = sortedMetrics[sortedMetrics.length - 1]
    ? `${sortedMetrics[sortedMetrics.length - 1].facilityName} (${sortedMetrics[sortedMetrics.length - 1].overallScore}%)`
    : 'N/A';

  const cardsData = [
    {
      title: 'Top Performing Zone',
      val: topFacility,
      desc: 'Sustained high performance in ANC4, skilled delivery, and EPI outreach regularity.',
      bg: 'F0FDF4',
      border: BRAND_GREEN,
    },
    {
      title: 'Priority Focus Zone',
      val: lowestFacility,
      desc: 'Requires targeted support for child immunization dropout tracing and outreach.',
      bg: 'FEF2F2',
      border: 'DC2626',
    },
    {
      title: 'Reporting Completeness',
      val: '100% On-Time DHIMS2 Submission',
      desc: 'All 4 facilities submitted monthly health return reports on schedule.',
      bg: 'EFF6FF',
      border: '2563EB',
    },
  ];

  cardsData.forEach((c, idx) => {
    const startX = 0.8 + idx * 3.95;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: startX,
      y: 2.0,
      w: 3.75,
      h: 2.2,
      fill: { color: c.bg },
      line: { color: c.border, width: 1.5 },
      rectRadius: 0.1,
    });

    slide2.addText(c.title.toUpperCase(), {
      x: startX + 0.2,
      y: 2.2,
      w: 3.35,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: c.border,
    });

    slide2.addText(c.val, {
      x: startX + 0.2,
      y: 2.6,
      w: 3.35,
      h: 0.7,
      fontSize: 14,
      bold: true,
      color: DARK_SLATE,
    });

    slide2.addText(c.desc, {
      x: startX + 0.2,
      y: 3.4,
      w: 3.35,
      h: 0.6,
      fontSize: 10,
      color: '475569',
    });
  });

  // Bulleted highlights
  slide2.addText('Key Strategic Highlights:', {
    x: 0.8,
    y: 4.5,
    w: 11.7,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: BRAND_GREEN,
  });

  const bullets = [
    `Overall Sub-District health achievement benchmark reached ${overallAvg}%.`,
    'Expanded immunization coverage for Penta3 and Measles-Rubella across CHPS outreach zones.',
    'Enhanced maternal referral linkages between CHPS compounds and Zongoire Health Centre.',
    'Strengthened malaria rapid diagnostic testing and IPTp3 administration for pregnant women.',
  ];

  bullets.forEach((b, i) => {
    slide2.addText(`• ${b}`, {
      x: 1.0,
      y: 4.95 + i * 0.4,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      color: DARK_SLATE,
    });
  });

  // -------------------------------------------------------------
  // SLIDE 3: Sub-District Facility League Table
  // -------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: BRAND_GREEN } });
  slide3.addText(`2. SUB-DISTRICT FACILITY LEAGUE RANKING TABLE`, {
    x: 0.8,
    y: 0.25,
    w: 11.7,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
  });

  // Table header & rows
  const tableHeaders = [
    { text: 'Rank', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'Facility Name', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Catchment Pop', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'right' } },
    { text: 'Penta3 %', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'Skilled Del %', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'ANC4 %', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'Overall %', options: { bold: true, color: BRAND_GOLD, fill: { color: '004d26' }, align: 'center' } },
    { text: 'Performance Level', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
  ];

  const tableRows: any[][] = [tableHeaders];

  sortedMetrics.forEach((m, idx) => {
    const popVal = (m as any).catchmentPopulation ?? (m as any).targetPopulation?.catchmentPopulation ?? '—';
    tableRows.push([
      { text: `#${idx + 1}`, options: { align: 'center', bold: true } },
      { text: m.facilityName, options: { bold: true, color: DARK_SLATE } },
      { text: typeof popVal === 'number' ? popVal.toLocaleString() : popVal, options: { align: 'right' } },
      { text: `${m.penta3CoverageRate}%`, options: { align: 'center' } },
      { text: `${m.skilledDeliveryRate}%`, options: { align: 'center' } },
      { text: `${m.anc4CoverageRate}%`, options: { align: 'center' } },
      { text: `${m.overallScore}%`, options: { align: 'center', bold: true, color: BRAND_GREEN } },
      { text: m.performanceLevel, options: { align: 'center', bold: true } },
    ]);
  });

  slide3.addTable(tableRows as any, {
    x: 0.8,
    y: 1.3,
    w: 11.73,
    colW: [0.8, 2.8, 1.5, 1.2, 1.3, 1.2, 1.2, 1.73],
    fontSize: 11,
    rowH: 0.45,
    border: { pt: 1, color: 'CBD5E1' },
    fill: { color: LIGHT_GRAY },
  });

  slide3.addText('* Note: Performance scores are computed against standard Ghana Health Service benchmarks.', {
    x: 0.8,
    y: 6.2,
    w: 11.7,
    h: 0.3,
    fontSize: 10,
    italic: true,
    color: '64748B',
  });

  // -------------------------------------------------------------
  // SLIDE 4: Detailed Key Indicator Breakdown
  // -------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: BRAND_GREEN } });
  slide4.addText(`3. DETAILED INDICATOR ANALYSIS BY FACILITY`, {
    x: 0.8,
    y: 0.25,
    w: 11.7,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
  });

  const detailHeaders = [
    { text: 'Facility', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Penta Dropout', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'IPT3 Coverage', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'EPI Score', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'Maternal Score', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
    { text: 'Child Score', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
  ];

  const detailRows: any[][] = [detailHeaders];

  sortedMetrics.forEach((m) => {
    detailRows.push([
      { text: m.facilityName, options: { bold: true } },
      { text: `${m.pentaDropoutRate}%`, options: { align: 'center', color: m.pentaDropoutRate > 10 ? 'DC2626' : '16A34A' } },
      { text: `${m.ipt3CoverageRate}%`, options: { align: 'center' } },
      { text: `${m.epiScore}%`, options: { align: 'center', bold: true } },
      { text: `${m.maternalScore}%`, options: { align: 'center', bold: true } },
      { text: `${m.childScore}%`, options: { align: 'center', bold: true } },
    ]);
  });

  slide4.addTable(detailRows as any, {
    x: 0.8,
    y: 1.3,
    w: 11.73,
    colW: [3.23, 1.7, 1.7, 1.7, 1.7, 1.7],
    fontSize: 11,
    rowH: 0.45,
    border: { pt: 1, color: 'CBD5E1' },
    fill: { color: LIGHT_GRAY },
  });

  // -------------------------------------------------------------
  // SLIDE 5: Action Points & Matrix
  // -------------------------------------------------------------
  const slide5 = pptx.addSlide();
  slide5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: BRAND_GREEN } });
  slide5.addText(`4. AGREED ACTION POINTS & RESPONSIBILITY MATRIX`, {
    x: 0.8,
    y: 0.25,
    w: 11.7,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
  });

  const actionHeaders = [
    { text: 'Indicator / Area', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Identified Bottleneck', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Agreed Action Point', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Responsible', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN } } },
    { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: BRAND_GREEN }, align: 'center' } },
  ];

  const actionRows: any[][] = [actionHeaders];

  actionItems.forEach((item) => {
    actionRows.push([
      { text: item.indicator, options: { bold: true, color: DARK_SLATE } },
      { text: item.issue, options: { color: '475569' } },
      { text: item.actionPoint, options: { bold: true, color: BRAND_GREEN } },
      { text: item.responsible, options: { color: DARK_SLATE } },
      { text: item.status, options: { align: 'center', bold: true } },
    ]);
  });

  slide5.addTable(actionRows as any, {
    x: 0.8,
    y: 1.3,
    w: 11.73,
    colW: [2.2, 2.8, 3.2, 2.13, 1.4],
    fontSize: 10,
    rowH: 0.65,
    border: { pt: 1, color: 'CBD5E1' },
    fill: { color: LIGHT_GRAY },
  });

  // -------------------------------------------------------------
  // SLIDE 6: SDHMT Conclusion & Strategic Next Steps
  // -------------------------------------------------------------
  const slide6 = pptx.addSlide();
  slide6.background = { color: BRAND_GREEN };

  slide6.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.3, fill: { color: BRAND_GOLD } });

  slide6.addText('SUB-DISTRICT HEALTH MANAGEMENT TEAM (SDHMT)', {
    x: 0.8,
    y: 1.2,
    w: 11.7,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: BRAND_GOLD,
  });

  slide6.addText('CONCLUSION & STRATEGIC PRIORITIES FOR NEXT CYCLE', {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 0.8,
    fontSize: 26,
    bold: true,
    color: 'FFFFFF',
  });

  const nextSteps = [
    'Monthly Data Validation & DHIMS2 Audits prior to 15th of each month.',
    'Strengthen Community Health Management Committees (CHMCs) for active child tracking.',
    'Ensure continuous supply of essential child vaccines and RUTF across all 4 facilities.',
    'Conduct bi-weekly integrated supportive supervision (ISS) visits to CHPS zones.',
  ];

  nextSteps.forEach((s, idx) => {
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.7 + idx * 0.9,
      w: 11.73,
      h: 0.75,
      fill: { color: '004d26' },
      line: { color: BRAND_GOLD, width: 1 },
      rectRadius: 0.05,
    });

    slide6.addText(`${idx + 1}. ${s}`, {
      x: 1.1,
      y: 2.85 + idx * 0.9,
      w: 11.1,
      h: 0.45,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
    });
  });

  // Save the presentation
  const fileName = `Zongoire_SubDistrict_${reviewType.toUpperCase()}_Review_${selectedYear}.pptx`;
  await pptx.writeFile({ fileName });
}
