import * as XLSX from 'xlsx';
import { FacilityMonthlyData } from '../types';

/**
 * Downloads a pre-formatted standard Ghana Health Service DHIMS2 Excel template
 * containing sample rows for Zongoire Sub-District facilities.
 */
export function generateDhims2Template() {
  const templateRows = [
    {
      'Facility ID': 'zongoire_hc',
      'Facility Name': 'Zongoire Health Centre',
      'Year': 2026,
      'Month Number (1-12)': 8,
      'BCG': 28,
      'OPV 0': 26,
      'OPV 1': 28,
      'OPV 2': 27,
      'OPV 3': 26,
      'Penta 1': 28,
      'Penta 2': 27,
      'Penta 3': 26,
      'PCV 1': 28,
      'PCV 2': 27,
      'PCV 3': 26,
      'Rota 1': 28,
      'Rota 2': 27,
      'IPV': 26,
      'MR 1': 25,
      'MR 2': 24,
      'Yellow Fever': 25,
      'Vitamin A (Children <1)': 48,
      'Fully Immunized Child (FIC)': 24,
      'Td / TT Doses': 34,
      'Outreach Sessions Conducted': 6,
      'Outreach Sessions Planned': 6,
      'Static Sessions Conducted': 20,
      'Static Sessions Planned': 20,
      'ANC 1 Registrations': 30,
      'ANC 4 Visits': 25,
      'ANC 8 Visits': 19,
      'Skilled Deliveries': 24,
      'PNC Visits (within 48 hrs)': 23,
      'IPT 1 (Malaria Prophylaxis)': 28,
      'IPT 2': 26,
      'IPT 3': 23,
      'Malaria Cases (OPD)': 120,
      'Diarrhoea Cases': 22,
      'Pneumonia Cases': 16,
      'URTI Cases': 58,
      'Typhoid Cases': 10,
      'Anaemia Cases': 14,
      'Hypertension Cases': 20,
      'TB Confirmed Cases': 1,
      'Measles Suspected Cases': 0,
      'Cholera Cases': 0,
      'Meningitis Cases': 0,
      'Growth Monitoring Attended': 125,
      'Vitamin A Supplemented (<5)': 45,
      'Dewormed (<5)': 40,
      'Malnutrition Screened': 135,
      'Severe Acute Malnutrition (SAM)': 1,
      'TB Screened': 48,
      'TB Presumptive Cases': 5,
      'TB Samples Collected': 5,
      'TB Confirmed Cases Screened': 1,
      'TB Treatment Initiated': 1,
    },
    {
      'Facility ID': 'zongoire_chps',
      'Facility Name': 'Zongoire CHPS',
      'Year': 2026,
      'Month Number (1-12)': 8,
      'BCG': 15,
      'OPV 0': 14,
      'OPV 1': 16,
      'OPV 2': 15,
      'OPV 3': 15,
      'Penta 1': 16,
      'Penta 2': 15,
      'Penta 3': 15,
      'PCV 1': 16,
      'PCV 2': 15,
      'PCV 3': 15,
      'Rota 1': 16,
      'Rota 2': 15,
      'IPV': 15,
      'MR 1': 14,
      'MR 2': 13,
      'Yellow Fever': 14,
      'Vitamin A (Children <1)': 28,
      'Fully Immunized Child (FIC)': 14,
      'Td / TT Doses': 20,
      'Outreach Sessions Conducted': 4,
      'Outreach Sessions Planned': 4,
      'Static Sessions Conducted': 12,
      'Static Sessions Planned': 12,
      'ANC 1 Registrations': 16,
      'ANC 4 Visits': 14,
      'ANC 8 Visits': 10,
      'Skilled Deliveries': 12,
      'PNC Visits (within 48 hrs)': 13,
      'IPT 1 (Malaria Prophylaxis)': 16,
      'IPT 2': 14,
      'IPT 3': 12,
      'Malaria Cases (OPD)': 70,
      'Diarrhoea Cases': 15,
      'Pneumonia Cases': 8,
      'URTI Cases': 35,
      'Typhoid Cases': 4,
      'Anaemia Cases': 7,
      'Hypertension Cases': 10,
      'TB Confirmed Cases': 0,
      'Measles Suspected Cases': 0,
      'Cholera Cases': 0,
      'Meningitis Cases': 0,
      'Growth Monitoring Attended': 70,
      'Vitamin A Supplemented (<5)': 25,
      'Dewormed (<5)': 22,
      'Malnutrition Screened': 75,
      'Severe Acute Malnutrition (SAM)': 0,
      'TB Screened': 25,
      'TB Presumptive Cases': 3,
      'TB Samples Collected': 3,
      'TB Confirmed Cases Screened': 0,
      'TB Treatment Initiated': 0,
    },
    {
      'Facility ID': 'apodabogo_chps',
      'Facility Name': 'Apodabogo CHPS',
      'Year': 2026,
      'Month Number (1-12)': 8,
      'BCG': 13,
      'OPV 0': 12,
      'OPV 1': 14,
      'OPV 2': 13,
      'OPV 3': 12,
      'Penta 1': 14,
      'Penta 2': 13,
      'Penta 3': 12,
      'PCV 1': 14,
      'PCV 2': 13,
      'PCV 3': 12,
      'Rota 1': 14,
      'Rota 2': 13,
      'IPV': 12,
      'MR 1': 11,
      'MR 2': 10,
      'Yellow Fever': 11,
      'Vitamin A (Children <1)': 22,
      'Fully Immunized Child (FIC)': 11,
      'Td / TT Doses': 15,
      'Outreach Sessions Conducted': 3,
      'Outreach Sessions Planned': 4,
      'Static Sessions Conducted': 10,
      'Static Sessions Planned': 10,
      'ANC 1 Registrations': 14,
      'ANC 4 Visits': 11,
      'ANC 8 Visits': 7,
      'Skilled Deliveries': 9,
      'PNC Visits (within 48 hrs)': 10,
      'IPT 1 (Malaria Prophylaxis)': 14,
      'IPT 2': 11,
      'IPT 3': 9,
      'Malaria Cases (OPD)': 60,
      'Diarrhoea Cases': 13,
      'Pneumonia Cases': 7,
      'URTI Cases': 30,
      'Typhoid Cases': 3,
      'Anaemia Cases': 6,
      'Hypertension Cases': 8,
      'TB Confirmed Cases': 0,
      'Measles Suspected Cases': 0,
      'Cholera Cases': 0,
      'Meningitis Cases': 0,
      'Growth Monitoring Attended': 60,
      'Vitamin A Supplemented (<5)': 20,
      'Dewormed (<5)': 18,
      'Malnutrition Screened': 65,
      'Severe Acute Malnutrition (SAM)': 1,
      'TB Screened': 20,
      'TB Presumptive Cases': 2,
      'TB Samples Collected': 2,
      'TB Confirmed Cases Screened': 0,
      'TB Treatment Initiated': 0,
    },
    {
      'Facility ID': 'dagunga_chps',
      'Facility Name': 'Dagunga CHPS',
      'Year': 2026,
      'Month Number (1-12)': 8,
      'BCG': 10,
      'OPV 0': 9,
      'OPV 1': 12,
      'OPV 2': 10,
      'OPV 3': 9,
      'Penta 1': 12,
      'Penta 2': 10,
      'Penta 3': 9,
      'PCV 1': 12,
      'PCV 2': 10,
      'PCV 3': 9,
      'Rota 1': 12,
      'Rota 2': 10,
      'IPV': 9,
      'MR 1': 8,
      'MR 2': 7,
      'Yellow Fever': 8,
      'Vitamin A (Children <1)': 16,
      'Fully Immunized Child (FIC)': 8,
      'Td / TT Doses': 11,
      'Outreach Sessions Conducted': 2,
      'Outreach Sessions Planned': 4,
      'Static Sessions Conducted': 8,
      'Static Sessions Planned': 8,
      'ANC 1 Registrations': 12,
      'ANC 4 Visits': 7,
      'ANC 8 Visits': 4,
      'Skilled Deliveries': 6,
      'PNC Visits (within 48 hrs)': 6,
      'IPT 1 (Malaria Prophylaxis)': 11,
      'IPT 2': 8,
      'IPT 3': 6,
      'Malaria Cases (OPD)': 55,
      'Diarrhoea Cases': 18,
      'Pneumonia Cases': 10,
      'URTI Cases': 28,
      'Typhoid Cases': 5,
      'Anaemia Cases': 9,
      'Hypertension Cases': 4,
      'TB Confirmed Cases': 0,
      'Measles Suspected Cases': 0,
      'Cholera Cases': 0,
      'Meningitis Cases': 0,
      'Growth Monitoring Attended': 45,
      'Vitamin A Supplemented (<5)': 15,
      'Dewormed (<5)': 12,
      'Malnutrition Screened': 50,
      'Severe Acute Malnutrition (SAM)': 2,
      'TB Screened': 15,
      'TB Presumptive Cases': 1,
      'TB Samples Collected': 1,
      'TB Confirmed Cases Screened': 0,
      'TB Treatment Initiated': 0,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DHIMS2_Monthly_Import');
  XLSX.writeFile(workbook, 'DHIMS2_Zongoire_SubDistrict_Template.xlsx');
}

/**
 * Parses an uploaded Excel / CSV file into standard ZSHPMS FacilityMonthlyData records
 */
export async function parseUploadedExcel(file: File): Promise<{
  data: FacilityMonthlyData[];
  summary: { totalRows: number; successCount: number; errors: string[] };
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        const errors: string[] = [];
        const parsedData: FacilityMonthlyData[] = [];

        const MONTH_NAMES = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // 1-indexed header is row 1
          const facilityId = (row['Facility ID'] || '').toString().trim().toLowerCase();
          const facilityName = row['Facility Name'] || 'Unknown Facility';
          const year = parseInt(row['Year']) || new Date().getFullYear();
          const month = parseInt(row['Month Number (1-12)']) || 1;

          if (!facilityId) {
            errors.push(`Row ${rowNum}: Missing Facility ID.`);
            return;
          }

          const monthName = MONTH_NAMES[(month - 1) % 12] || 'January';
          const monthLabel = `${monthName.substring(0, 3)} ${year}`;

          const parsedRecord: FacilityMonthlyData = {
            facilityId,
            facilityName,
            year,
            month,
            monthLabel,
            reportStatus: 'Submitted',
            submittedDate: new Date().toISOString().split('T')[0],
            epi: {
              bcg: parseInt(row['BCG']) || 0,
              opv0: parseInt(row['OPV 0']) || 0,
              opv1: parseInt(row['OPV 1']) || 0,
              opv2: parseInt(row['OPV 2']) || 0,
              opv3: parseInt(row['OPV 3']) || 0,
              penta1: parseInt(row['Penta 1']) || 0,
              penta2: parseInt(row['Penta 2']) || 0,
              penta3: parseInt(row['Penta 3']) || 0,
              pcv1: parseInt(row['PCV 1']) || 0,
              pcv2: parseInt(row['PCV 2']) || 0,
              pcv3: parseInt(row['PCV 3']) || 0,
              rota1: parseInt(row['Rota 1']) || 0,
              rota2: parseInt(row['Rota 2']) || 0,
              ipv: parseInt(row['IPV']) || 0,
              mr1: parseInt(row['MR 1']) || 0,
              mr2: parseInt(row['MR 2']) || 0,
              yellowFever: parseInt(row['Yellow Fever']) || 0,
              vitaminA: parseInt(row['Vitamin A (Children <1)']) || 0,
              fullyImmunizedChild: parseInt(row['Fully Immunized Child (FIC)']) || 0,
              tdTT: parseInt(row['Td / TT Doses']) || 0,
              outreachSessionsDone: parseInt(row['Outreach Sessions Conducted']) || 0,
              outreachSessionsPlanned: parseInt(row['Outreach Sessions Planned']) || 0,
              staticSessionsDone: parseInt(row['Static Sessions Conducted']) || 0,
              staticSessionsPlanned: parseInt(row['Static Sessions Planned']) || 0,
            },
            diseaseSurveillance: {
              malariaCases: parseInt(row['Malaria Cases (OPD)']) || 0,
              diarrhoeaCases: parseInt(row['Diarrhoea Cases']) || 0,
              pneumoniaCases: parseInt(row['Pneumonia Cases']) || 0,
              urtiCases: parseInt(row['URTI Cases']) || 0,
              typhoidCases: parseInt(row['Typhoid Cases']) || 0,
              anaemiaCases: parseInt(row['Anaemia Cases']) || 0,
              hypertensionCases: parseInt(row['Hypertension Cases']) || 0,
              tbCases: parseInt(row['TB Confirmed Cases']) || 0,
              measlesCases: parseInt(row['Measles Suspected Cases']) || 0,
              choleraCases: parseInt(row['Cholera Cases']) || 0,
              meningitisCases: parseInt(row['Meningitis Cases']) || 0,
            },
            maternalHealth: {
              anc1: parseInt(row['ANC 1 Registrations']) || 0,
              anc4: parseInt(row['ANC 4 Visits']) || 0,
              anc8: parseInt(row['ANC 8 Visits']) || 0,
              skilledDeliveries: parseInt(row['Skilled Deliveries']) || 0,
              postnatalCare: parseInt(row['PNC Visits (within 48 hrs)']) || 0,
              ipt1: parseInt(row['IPT 1 (Malaria Prophylaxis)']) || 0,
              ipt2: parseInt(row['IPT 2']) || 0,
              ipt3: parseInt(row['IPT 3']) || 0,
            },
            childHealth: {
              growthMonitoringAttended: parseInt(row['Growth Monitoring Attended']) || 0,
              vitaminASupplementation: parseInt(row['Vitamin A Supplemented (<5)']) || 0,
              deworming: parseInt(row['Dewormed (<5)']) || 0,
              malnutritionScreened: parseInt(row['Malnutrition Screened']) || 0,
              severeAcuteMalnutrition: parseInt(row['Severe Acute Malnutrition (SAM)']) || 0,
            },
            tb: {
              screened: parseInt(row['TB Screened']) || 0,
              presumptiveCases: parseInt(row['TB Presumptive Cases']) || 0,
              samplesCollected: parseInt(row['TB Samples Collected']) || 0,
              confirmedCases: parseInt(row['TB Confirmed Cases Screened']) || 0,
              treatmentInitiated: parseInt(row['TB Treatment Initiated']) || 0,
            },
          };

          parsedData.push(parsedRecord);
        });

        resolve({
          data: parsedData,
          summary: {
            totalRows: rawJson.length,
            successCount: parsedData.length,
            errors,
          },
        });
      } catch (err: any) {
        reject(new Error(`Failed to parse file: ${err.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };

    reader.readAsBinaryString(file);
  });
}
