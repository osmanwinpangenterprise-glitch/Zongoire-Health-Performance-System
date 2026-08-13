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

          // Skip completely empty rows
          const keys = Object.keys(row);
          if (keys.length === 0) return;
          const hasAnyValue = keys.some(
            (k) => row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== ''
          );
          if (!hasAnyValue) return;

          // Helper to get normalized key mapping for row
          const normalizedMap = new Map<string, any>();
          keys.forEach((k) => {
            const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            normalizedMap.set(cleanKey, row[k]);
          });

          // Helper to extract string value by searching normalized keys or substring matches
          const getStrFuzzy = (targetPatterns: string[]): string => {
            for (const pattern of targetPatterns) {
              const cleanPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');
              // Direct clean key match
              if (normalizedMap.has(cleanPattern)) {
                const val = normalizedMap.get(cleanPattern);
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                  return String(val).trim();
                }
              }
              // Substring key match
              for (const [cleanKey, val] of normalizedMap.entries()) {
                if (cleanKey.includes(cleanPattern) || cleanPattern.includes(cleanKey)) {
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    return String(val).trim();
                  }
                }
              }
            }
            return '';
          };

          // Helper to extract numeric value by fuzzy matching key targets
          const getNumFuzzy = (targetPatterns: string[]): number => {
            for (const pattern of targetPatterns) {
              const cleanPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const [cleanKey, val] of normalizedMap.entries()) {
                if (cleanKey.includes(cleanPattern)) {
                  if (val !== undefined && val !== null) {
                    const parsed = parseInt(String(val), 10);
                    if (!isNaN(parsed)) return parsed;
                  }
                }
              }
            }
            return 0;
          };

          let rawName = getStrFuzzy([
            'facilityname',
            'facility',
            'healthfacility',
            'organisationunit',
            'orgunit',
            'organisationunitname',
            'orgunitname',
            'subdistrict',
            'clinic',
            'chps',
            'name',
            'location',
          ]);

          let rawId = getStrFuzzy([
            'facilityid',
            'facilitycode',
            'orgunitid',
            'orgunitcode',
            'code',
            'id',
          ]);

          // Fallback: Scan row string values for health facility terms if headers weren't matched
          if (!rawName && !rawId) {
            for (const key of keys) {
              const valStr = String(row[key] || '').trim();
              if (
                valStr.length >= 3 &&
                !/^\d+$/.test(valStr) &&
                (valStr.toLowerCase().includes('chps') ||
                  valStr.toLowerCase().includes('centre') ||
                  valStr.toLowerCase().includes('center') ||
                  valStr.toLowerCase().includes('health') ||
                  valStr.toLowerCase().includes('clinic') ||
                  valStr.toLowerCase().includes('hospital') ||
                  valStr.toLowerCase().includes('zongoire') ||
                  valStr.toLowerCase().includes('apodabogo') ||
                  valStr.toLowerCase().includes('dagunga'))
              ) {
                rawName = valStr;
                break;
              }
            }
          }

          // Ultimate fallback: If the row has data, generate a facility label rather than rejecting
          if (!rawName && !rawId) {
            // Check if row has any non-zero numbers
            const hasNumbers = keys.some((k) => !isNaN(parseInt(String(row[k]), 10)) && parseInt(String(row[k]), 10) > 0);
            if (hasNumbers) {
              rawName = `Facility ${rowNum - 1}`;
            } else {
              // Row has no recognizeable data or facility name
              return;
            }
          }

          const facilityName = rawName || (rawId ? rawId.replace(/_/g, ' ').toUpperCase() : `Facility ${rowNum - 1}`);
          const facilityId = rawId
            ? rawId.toLowerCase().replace(/[^a-z0-9]+/g, '_')
            : facilityName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

          const year = getNumFuzzy(['year', 'period', 'reportingyear']) || new Date().getFullYear();
          const month = getNumFuzzy(['month', 'period', 'reportingmonth']) || 8;

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
            dataSource: 'actual',
            isSample: false,
            epi: {
              bcg: getNumFuzzy(['bcg']),
              opv0: getNumFuzzy(['opv0']),
              opv1: getNumFuzzy(['opv1']),
              opv2: getNumFuzzy(['opv2']),
              opv3: getNumFuzzy(['opv3']),
              penta1: getNumFuzzy(['penta1', 'pentavalent1']),
              penta2: getNumFuzzy(['penta2', 'pentavalent2']),
              penta3: getNumFuzzy(['penta3', 'pentavalent3']),
              pcv1: getNumFuzzy(['pcv1']),
              pcv2: getNumFuzzy(['pcv2']),
              pcv3: getNumFuzzy(['pcv3']),
              rota1: getNumFuzzy(['rota1']),
              rota2: getNumFuzzy(['rota2']),
              ipv: getNumFuzzy(['ipv', 'ipv1']),
              ipv2: getNumFuzzy(['ipv2']),
              mr1: getNumFuzzy(['mr1', 'measles1']),
              mr2: getNumFuzzy(['mr2', 'measles2']),
              yellowFever: getNumFuzzy(['yellowfever', 'yf']),
              menA: getNumFuzzy(['mena', 'meningitisa']),
              malaria1: getNumFuzzy(['malaria1', 'rtss1']),
              malaria2: getNumFuzzy(['malaria2', 'rtss2']),
              malaria3: getNumFuzzy(['malaria3', 'rtss3']),
              malaria4: getNumFuzzy(['malaria4', 'rtss4']),
              hpv1: getNumFuzzy(['hpv1']),
              hpv2: getNumFuzzy(['hpv2']),
              vitaminA: getNumFuzzy(['vitamina', 'vita']),
              fullyImmunizedChild: getNumFuzzy(['fullyimmunized', 'fic']),
              tdTT: getNumFuzzy(['td', 'tt']),
              outreachSessionsDone: getNumFuzzy(['outreachdone', 'outreachconducted']),
              outreachSessionsPlanned: getNumFuzzy(['outreachplanned']),
              staticSessionsDone: getNumFuzzy(['staticdone', 'staticconducted']),
              staticSessionsPlanned: getNumFuzzy(['staticplanned']),
            },
            diseaseSurveillance: {
              malariaCases: getNumFuzzy(['malaria']),
              diarrhoeaCases: getNumFuzzy(['diarrhoea', 'diarrhea']),
              pneumoniaCases: getNumFuzzy(['pneumonia']),
              urtiCases: getNumFuzzy(['urti']),
              typhoidCases: getNumFuzzy(['typhoid']),
              anaemiaCases: getNumFuzzy(['anaemia', 'anemia']),
              hypertensionCases: getNumFuzzy(['hypertension']),
              diabetesCases: getNumFuzzy(['diabetes']),
              skinDiseasesCases: getNumFuzzy(['skindisease', 'skin', 'ulcer']),
              rheumatismCases: getNumFuzzy(['rheumatism', 'jointpain']),
              eyeInfectionsCases: getNumFuzzy(['eyeinfection', 'eye', 'conjunctivitis']),
              intestinalWormsCases: getNumFuzzy(['intestinalworm', 'helminth']),
              dentalCariesCases: getNumFuzzy(['dental', 'oral', 'caries']),
              snakeBitesCases: getNumFuzzy(['snakebite', 'snake']),
              dogBitesCases: getNumFuzzy(['dogbite', 'rabies']),
              hepatitisBCases: getNumFuzzy(['hepatitis', 'hepb']),
              tbCases: getNumFuzzy(['tbcases', 'tbconfirmed']),
              measlesCases: getNumFuzzy(['measles']),
              choleraCases: getNumFuzzy(['cholera']),
              meningitisCases: getNumFuzzy(['meningitis']),
              yellowFeverCases: getNumFuzzy(['yellowfever']),
              afpCases: getNumFuzzy(['afp', 'flaccidparalysis', 'polio']),
              schistosomiasisCases: getNumFuzzy(['schisto', 'bilharzia']),
              pregnancyComplicationsCases: getNumFuzzy(['pregnancycomplication', 'pregnancyopd']),
            },
            maternalHealth: {
              anc1: getNumFuzzy(['anc1']),
              anc4: getNumFuzzy(['anc4']),
              anc8: getNumFuzzy(['anc8']),
              skilledDeliveries: getNumFuzzy(['skilleddeliver', 'delivery', 'deliveries']),
              postnatalCare: getNumFuzzy(['pnc']),
              ipt1: getNumFuzzy(['ipt1']),
              ipt2: getNumFuzzy(['ipt2']),
              ipt3: getNumFuzzy(['ipt3']),
              teenagePregnancies: getNumFuzzy(['teenagepregnancy', 'teenpregnancy', 'teenage', 'adolescentpregnancy']),
              ancAnaemiaRegistration: getNumFuzzy(['ancanaemiaregistration', 'anaemiabooking', 'ancanaemiareg', 'anaemiareg']),
              ancAnaemia36Weeks: getNumFuzzy(['ancanaemia36', 'anaemia36weeks', 'anaemia36w', 'ancanaemia36w']),
            },
            childHealth: {
              growthMonitoringAttended: getNumFuzzy(['growthmonitoring', 'weighing']),
              vitaminASupplementation: getNumFuzzy(['vitaminasupplement']),
              deworming: getNumFuzzy(['deworm']),
              malnutritionScreened: getNumFuzzy(['malnutritionscreen']),
              severeAcuteMalnutrition: getNumFuzzy(['severeacutemalnutrition', 'sam']),
              moderateAcuteMalnutrition: getNumFuzzy(['moderateacutemalnutrition', 'mam']),
              exclusiveBreastfeeding6Months: getNumFuzzy(['exclusivebreastfeeding', 'ebf6', 'ebf']),
              earlyBreastfeedingInitiation: getNumFuzzy(['earlybreastfeeding', 'breastfeeding1hr', 'earlyinitiation']),
              penta3Vaccinated: getNumFuzzy(['penta3vaccinated', 'penta3child']),
              diarrhoeaTreatedOrsZinc: getNumFuzzy(['diarrhoeatorszinc', 'orszinc', 'diarrhoeatreated']),
            },
            tb: {
              screened: getNumFuzzy(['tbscreen']),
              presumptiveCases: getNumFuzzy(['tbrestump', 'tbpresump']),
              samplesCollected: getNumFuzzy(['tbsample']),
              confirmedCases: getNumFuzzy(['tbconfirm']),
              treatmentInitiated: getNumFuzzy(['tbtreat']),
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
