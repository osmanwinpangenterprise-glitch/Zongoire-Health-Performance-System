import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Captures an HTML element by ID and downloads it as a high-resolution PNG image
 */
export async function exportElementToPng(
  elementId: string,
  filename = 'ghs-health-chart.png',
  options: { backgroundColor?: string; scale?: number } = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PNG export.`);
    // Fallback: try capturing the main content area or container
    const mainArea = document.querySelector('main') || document.body;
    if (mainArea && elementId === 'main-dashboard-content') {
      return captureAndDownloadPng(mainArea as HTMLElement, filename, options);
    }
    return false;
  }

  return captureAndDownloadPng(element, filename, options);
}

/**
 * Direct capture of any HTMLElement to PNG
 */
export async function captureAndDownloadPng(
  element: HTMLElement,
  filename = 'ghs-report.png',
  options: { backgroundColor?: string; scale?: number } = {}
): Promise<boolean> {
  try {
    const isDark = document.documentElement.classList.contains('dark');
    const defaultBg = isDark ? '#0f172a' : '#ffffff';
    const bg = options.backgroundColor || defaultBg;

    // Temporarily ensure element is visible for capture
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      scale: options.scale || 2, // High DPI for crisp printing and presentations
      useCORS: true,
      allowTaint: true,
      backgroundColor: bg,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure cloned styles and dark mode classes match
        const clonedHtml = clonedDoc.documentElement;
        if (isDark) {
          clonedHtml.classList.add('dark');
        } else {
          clonedHtml.classList.remove('dark');
        }

        // Ensure SVGs have proper bounding boxes in clone
        const svgs = clonedDoc.querySelectorAll('svg');
        svgs.forEach((svg) => {
          if (!svg.getAttribute('xmlns')) {
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          }
        });
      },
    });

    element.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL('image/png');
    const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;

    const link = document.createElement('a');
    link.href = imgData;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Failed to export PNG:', error);
    return false;
  }
}

/**
 * Captures an HTML element by ID and compiles it into a downloadable PDF document
 */
export async function exportElementToPdf(elementId: string, title = 'GHS Health Report', filename = 'zongoire-health-report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return;
  }

  try {
    const isDark = document.documentElement.classList.contains('dark');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
  }
}

/**
 * Exports an array of objects to an Excel file
 */
export function exportDataToExcel(data: any[], filename = 'health-data.xlsx', sheetName = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Exports a detailed facility-specific M&E report in Excel format
 */
export function exportFacilitySpecificReport(
  facilityMetrics: any,
  facilityMonthlyRecords: any[],
  periodLabel: string
) {
  const summarySheetData = [
    { Indicator: 'Facility Name', Value: facilityMetrics.facilityName },
    { Indicator: 'Reporting Period', Value: periodLabel },
    { Indicator: 'Official Credential Verification Code', Value: facilityMetrics.credentialVerificationCode || 'N/A' },
    { Indicator: 'Performance Grade', Value: facilityMetrics.gradeLabel || 'N/A' },
    { Indicator: 'Overall Weighted Score', Value: `${facilityMetrics.overallScore}%` },
    { Indicator: 'Sub-District Ranking', Value: `Rank #${facilityMetrics.rank}` },
    { Indicator: 'Penta1 Coverage Rate', Value: `${facilityMetrics.penta1CoverageRate}%` },
    { Indicator: 'Penta3 Coverage Rate', Value: `${facilityMetrics.penta3CoverageRate}%` },
    { Indicator: 'Penta Dropout Rate', Value: `${facilityMetrics.pentaDropoutRate}%` },
    { Indicator: 'RTS,S Malaria 3 Coverage (2026)', Value: `${facilityMetrics.malaria3CoverageRate || 0}%` },
    { Indicator: 'HPV 1 Coverage (2026)', Value: `${facilityMetrics.hpv1CoverageRate || 0}%` },
    { Indicator: 'IPV2 Coverage (2026)', Value: `${facilityMetrics.ipv2CoverageRate || 0}%` },
    { Indicator: 'ANC1 Coverage Rate', Value: `${facilityMetrics.anc1CoverageRate}%` },
    { Indicator: 'ANC4+ Coverage Rate', Value: `${facilityMetrics.anc4CoverageRate}%` },
    { Indicator: 'ANC8+ Coverage Rate (2026)', Value: `${facilityMetrics.anc8CoverageRate || 0}%` },
    { Indicator: 'Skilled Birth Delivery Rate', Value: `${facilityMetrics.skilledDeliveryRate}%` },
    { Indicator: 'PNC Coverage Rate', Value: `${facilityMetrics.pncCoverageRate}%` },
    { Indicator: 'IPT3 Coverage Rate', Value: `${facilityMetrics.ipt3CoverageRate}%` },
    { Indicator: 'Teenage Pregnancy Rate', Value: `${facilityMetrics.teenagePregnancyRate}%` },
    { Indicator: 'Growth Monitoring Coverage', Value: `${facilityMetrics.growthMonitoringRate}%` },
    { Indicator: 'Exclusive Breastfeeding Rate', Value: `${facilityMetrics.ebfRate || 0}%` },
    { Indicator: 'ORS + Zinc Diarrhoea Treatment Rate', Value: `${facilityMetrics.orsZincTreatmentRate || 0}%` },
  ];

  const rawMonthlyRows = facilityMonthlyRecords.map((rec) => ({
    Year: rec.year,
    Month: rec.monthLabel,
    Status: rec.reportStatus,
    'BCG Doses': rec.epi?.bcg || 0,
    'Penta1 Doses': rec.epi?.penta1 || 0,
    'Penta3 Doses': rec.epi?.penta3 || 0,
    'MR1 Doses': rec.epi?.mr1 || 0,
    'MR2 Doses': rec.epi?.mr2 || 0,
    'IPV2 Doses': rec.epi?.ipv2 || 0,
    'Malaria 3 Doses': rec.epi?.malaria3 || 0,
    'HPV 1 Doses': rec.epi?.hpv1 || 0,
    'FIC Children': rec.epi?.fullyImmunizedChild || 0,
    'ANC 1 Registrations': rec.maternalHealth?.anc1 || 0,
    'ANC 4 Visits': rec.maternalHealth?.anc4 || 0,
    'ANC 8 Visits': rec.maternalHealth?.anc8 || 0,
    'Skilled Deliveries': rec.maternalHealth?.skilledDeliveries || 0,
    'PNC Visits': rec.maternalHealth?.postnatalCare || 0,
    'IPT 3 Doses': rec.maternalHealth?.ipt3 || 0,
    'Malaria Cases': rec.diseaseSurveillance?.malariaCases || 0,
    'Diarrhoea Cases': rec.diseaseSurveillance?.diarrhoeaCases || 0,
    'SAM Cases': rec.childHealth?.severeAcuteMalnutrition || 0,
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summarySheetData);
  const monthlySheet = XLSX.utils.json_to_sheet(rawMonthlyRows);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'M&E Performance Summary');
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly DHIMS2 Records');

  const sanitizedFacName = facilityMetrics.facilityName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `${sanitizedFacName}_GHS_Report_2026.xlsx`);
}
