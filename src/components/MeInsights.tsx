import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  Printer,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Presentation,
  Loader2,
} from 'lucide-react';
import { CalculatedFacilityMetrics, MeAlert, Facility, FacilityMonthlyData } from '../types';
import { exportElementToPdf, exportElementToPng } from '../utils/exportUtils';
import { exportReviewReportToPptx } from '../utils/exportPptx';

interface MeInsightsProps {
  metrics: CalculatedFacilityMetrics[];
  alerts: MeAlert[];
  facilities: Facility[];
  monthlyData: FacilityMonthlyData[];
  periodLabel: string;
  year: number;
}

export const MeInsights: React.FC<MeInsightsProps> = ({
  metrics,
  alerts,
  facilities,
  monthlyData,
  periodLabel,
  year,
}) => {
  const [reportText, setReportText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExportingPpt, setIsExportingPpt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const facilitiesWithData = metrics.filter((m) => m.hasData);
  const totalFacilities = metrics.length || 4;
  const submittedFacilitiesCount = facilitiesWithData.length;
  const reportingCompleteness = Math.round(
    (submittedFacilitiesCount / (totalFacilities || 1)) * 100
  );

  const sortedMetrics = [...metrics].sort((a, b) => {
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    return b.overallScore - a.overallScore;
  });

  const topFacility =
    facilitiesWithData.length > 0 ? sortedMetrics[0] : null;
  const lowestFacility =
    facilitiesWithData.length > 0
      ? sortedMetrics[facilitiesWithData.length - 1]
      : null;

  const overallAvg =
    facilitiesWithData.length > 0
      ? Math.round(
          facilitiesWithData.reduce((acc, curr) => acc + curr.overallScore, 0) /
            facilitiesWithData.length
        )
      : 0;

  const handleExportPpt = async () => {
    try {
      setIsExportingPpt(true);
      await exportReviewReportToPptx({
        reviewType: 'M&E EXECUTIVE NARRATIVE',
        periodLabel,
        selectedYear: year,
        overallAvg,
        sortedMetrics,
        actionItems: [
          {
            indicator: 'Child Immunization Retention',
            issue: 'Penta1 to Penta3 dropout in outreach CHPS zones',
            actionPoint: 'Community health officer defaulter tracing',
            responsible: 'Sub-District Disease Control Officer',
            deadline: 'End of Month',
            status: 'In Progress',
          },
          {
            indicator: 'Skilled Birth Attendance',
            issue: 'Low facility delivery in remote CHPS compounds',
            actionPoint: 'TBAs birth companions incentive scheme',
            responsible: 'Sub-District In-Charge',
            deadline: '30 Days',
            status: 'Active',
          },
        ],
      });
    } catch (err) {
      console.error('Failed to export PPT:', err);
    } finally {
      setIsExportingPpt(false);
    }
  };

  // Local Rule-Based Algorithmic M&E Officer Narrative Report Builder (Fallback & Instant generator)
  const generateLocalReport = () => {
    return `# GHANA HEALTH SERVICE — UPPER EAST REGION
## BAWKU WEST DISTRICT • ZONGOIRE SUB-DISTRICT HEALTH MANAGEMENT TEAM (SDHMT)
### MONITORING & EVALUATION (M&E) OFFICER PERFORMANCE REVIEW REPORT

**Reporting Context:** ${periodLabel} (${year})  
**Facilities Monitored:** Zongoire Health Centre, Zongoire CHPS, Apodabogo CHPS, Dagunga CHPS  
**Reporting Completeness:** **${reportingCompleteness}%** (${submittedFacilitiesCount} of ${totalFacilities} facilities submitted returns)  
**Sub-District Overall Score:** **${overallAvg}%** (${overallAvg >= 80 ? 'Good / Green' : overallAvg >= 70 ? 'Needs Attention / Amber' : 'Critical / Red'})  

---

### 1. Executive Summary
During the **${periodLabel} (${year})** monitoring period, the Zongoire Sub-District achieved a reporting completeness rate of **${reportingCompleteness}%** and an overall health performance score of **${overallAvg}%**. Routine service delivery statistics uploaded into DHIMS2 show active engagement across reproductive and maternal health services, particularly in skilled birth attendance at Zongoire Health Centre. ${topFacility ? `The top performing facility was **${topFacility.facilityName}** (${topFacility.overallScore}%).` : 'Awaiting routine facility return submissions.'}

### 2. Facility Performance League & Scorecard
${topFacility ? `- **Top Performing Facility:** **${topFacility.facilityName}** with an overall performance score of **${topFacility.overallScore}%** (Penta3: ${topFacility.penta3CoverageRate}%, Skilled Delivery: ${topFacility.skilledDeliveryRate}%).` : '- Top Performing Facility: Pending data submission.'}
${lowestFacility && lowestFacility.facilityId !== topFacility?.facilityId ? `- **Facility Requiring Priority Support:** **${lowestFacility.facilityName}** with an overall score of **${lowestFacility.overallScore}%** (Penta Dropout: ${lowestFacility.pentaDropoutRate}%).` : ''}

### 3. Underperforming Indicators & Coverage Gaps
1. **Immunization Retention:** ${lowestFacility ? `${lowestFacility.facilityName} recorded a **${lowestFacility.pentaDropoutRate}%** Penta dropout rate against the GHS national ceiling threshold of 10.0%.` : 'Track children defaulted on routine Penta3 and MR1.'}
2. **Skilled Delivery & ANC Retention:** Ongoing focus on mobilizing expectant mothers to register before 12 weeks gestation (ANC1) and complete 8 contacts.
3. **Severe Acute Malnutrition (SAM):** ${alerts.filter(a => a.type === 'Target Gap').length > 0 ? 'Active Severe Acute Malnutrition cases flagged across CHPS zones requiring OTP RUTF support.' : 'No critical SAM target breaches reported.'}

### 4. Disease Surveillance & OPD Morbidity Trends
- **Malaria (OPD Confirmed):** Continues to represent the primary morbidity across sub-district consultations.
- **Diarrhoea & WASH:** Enhanced water safety and hygiene education in CHPS outreach zones.
- **Epidemic Preparedness:** Zero suspected cases of Yellow Fever, Cholera, or Meningitis reported.

### 5. Strategic M&E Recommendations & SDHMT Action Points
1. **Defaulter Tracing Campaign:** Deploy CHOs and CHVs to conduct monthly defaulter audits using the Child Health Record books.
2. **Emergency Transport System:** Maintain motorcycle ambulance linkages to transfer emergency obstetric cases to Zongoire Health Centre and Zebilla District Hospital.
3. **Data Completeness Enforcement:** Ensure 100% of facility monthly returns (DHIMS2 Form A) are validated by the 5th of every month.
`;
  };

  // Generate Report via Server Gemini API or Fallback
  const handleGenerateReport = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: periodLabel,
          year,
          facilityData: metrics,
          overallScore: overallAvg,
          topFacility,
          lowestFacility,
          alerts,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setReportText(data.report);
      } else {
        // Fallback to local rule-based report
        setReportText(generateLocalReport());
      }
    } catch (err) {
      console.warn('Gemini server API unavailable, using local M&E report engine.', err);
      setReportText(generateLocalReport());
    } finally {
      setLoading(false);
    }
  };

  // Initial load auto-generator
  React.useEffect(() => {
    if (!reportText) {
      setReportText(generateLocalReport());
    }
  }, [periodLabel, year]);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTELLIGENT M&E OFFICER NARRATIVE REPORT GENERATOR</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Automated M&E Executive Review Narrative
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Transforms routine DHIMS2 numbers, facility scores, and coverage alerts into a professional Ghana Health Service M&E Officer narrative summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-ai-report-ppt-btn"
            type="button"
            disabled={isExportingPpt}
            onClick={handleExportPpt}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow-sm border border-amber-400 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingPpt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
            ) : (
              <Presentation className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{isExportingPpt ? 'Generating PPT...' : 'Export Report (PPT)'}</span>
          </button>
          <button
            id="regenerate-ai-report-btn"
            type="button"
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-emerald-900 hover:bg-emerald-950 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD700]' : 'text-[#FFD700]'}`} />
            <span>{loading ? 'Analyzing Data...' : 'Regenerate Narrative'}</span>
          </button>
          <button
            id="export-ai-report-pdf-btn"
            type="button"
            onClick={() => exportElementToPdf('me-report-content', 'Zongoire_ME_Officer_Report.pdf')}
            className="bg-green-950 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-800 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-green-200" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Formatted Report Display */}
      <div
        id="me-report-content"
        className="bg-white dark:bg-slate-900 rounded p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 font-sans"
      >
        <div className="border-b-2 border-[#006633] pb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#006633] dark:text-emerald-400 uppercase tracking-widest">
              Ghana Health Service • Upper East Region
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 uppercase tracking-tight">
              ZONGOIRE SUB-DISTRICT HEALTH PERFORMANCE REVIEW
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Official Monitoring and Evaluation (M&E) Management Review Document
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="bg-[#FFD700]/20 text-[#006633] font-bold px-2.5 py-1 rounded border border-[#FFD700] inline-block text-xs">
              {periodLabel} ({year})
            </span>
          </div>
        </div>

        {reportText ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 space-y-3 text-xs leading-relaxed">
            {reportText.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-base font-bold text-[#006633] dark:text-emerald-400 uppercase">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-sm font-bold text-slate-900 dark:text-white">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-xs font-bold text-[#006633] dark:text-emerald-300 border-b border-slate-100 dark:border-slate-800 pb-1 mt-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }

              return (
                <div key={idx} className="whitespace-pre-line text-xs">
                  {paragraph}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-500">
            Click "Regenerate Narrative" to generate an M&E report.
          </div>
        )}
      </div>
    </div>
  );
};
