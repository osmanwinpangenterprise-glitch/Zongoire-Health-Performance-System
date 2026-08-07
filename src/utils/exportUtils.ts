import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Captures an HTML element by ID and downloads it as a PNG image
 */
export async function exportElementToPng(elementId: string, filename = 'chart-export.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PNG export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
  }
}

/**
 * Captures an HTML element by ID and compiles it into a downloadable PDF document
 */
export async function exportElementToPdf(elementId: string, title: string, filename = 'zongoirie-health-report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
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
