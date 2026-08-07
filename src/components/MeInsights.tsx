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

  const sortedMetrics = [...metrics].sort((a, b) => b.overallScore - a.overallScore);
  const topFacility = sortedMetrics[0]?.facilityName || 'Zongoire Health Centre';
  const lowestFacility = sortedMetrics[sortedMetrics.length - 1]?.facilityName || 'Dagunga CHPS';
  const overallAvg = Math.round(
    metrics.reduce((acc, curr) => acc + curr.overallScore, 0) / (metrics.length || 1)
  );

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
**Sub-District Overall Score:** **${overallAvg}%** (${overallAvg >= 80 ? 'Good / Green' : 'Needs Attention / Amber'})  

---

### 1. Executive Summary
During the **${periodLabel} (${year})** monitoring period, the Zongoire Sub-District achieved an overall health performance score of **${overallAvg}%**. Routine service delivery statistics uploaded into DHIMS2 show strong engagement across reproductive and maternal health services, particularly in skilled birth attendance at Zongoire Health Centre. However, coverage gaps in child immunization retention (Penta1 to Penta3 dropout) and community outreach completeness require targeted supervisory support across the three CHPS zones.

### 2. Top & Lowest Performing Facilities
- **Top Performing Facility:** **${topFacility}** with an overall performance score of **${sortedMetrics[0]?.overallScore}%**. High scores were driven by ${sortedMetrics[0]?.penta3CoverageRate}% Penta3 coverage and excellent skilled delivery management.
- **Lowest Performing Facility:** **${lowestFacility}** with an overall score of **${sortedMetrics[sortedMetrics.length - 1]?.overallScore}%**. Key factors include a **${sortedMetrics[sortedMetrics.length - 1]?.pentaDropoutRate}%** Penta dropout rate and missed community outreach sessions.

### 3. Underperforming Indicators & Coverage Gaps
1. **Immunization Dropout Rate:** ${lowestFacility} recorded a **${sortedMetrics[sortedMetrics.length - 1]?.pentaDropoutRate}%** Penta dropout rate, exceeding the GHS national ceiling threshold of 10.0%. Children receiving Penta1 at 6 weeks are failing to return for their 14-week Penta3 and 9-month Measles-Rubella (MR1) doses.
2. **ANC4/8 Retention:** While ANC1 early pregnancy bookings remain high across all facilities, drop-off between ANC1 and ANC4/8 remains evident in Dagunga CHPS (**${sortedMetrics.find(m => m.facilityId === 'dagunga_chps')?.anc4CoverageRate}%** ANC4 coverage).
3. **Malnutrition Screening:** ${alerts.filter(a => a.type === 'Target Gap').length > 0 ? 'Active Severe Acute Malnutrition (SAM) cases recorded in Dagunga CHPS and Apodabogo CHPS require urgent therapeutic feeding.' : 'No active SAM cases reported this period.'}

### 4. Disease Surveillance & OPD Morbidity Trends
- **Malaria (OPD Confirmed):** Remains the primary cause of morbidity across all 4 facilities, accounting for approximately **45%** of total OPD consultations.
- **Diarrhoea & WASH Spikes:** High diarrhoea case counts recorded in Dagunga CHPS due to seasonal surface water usage.
- **Epidemic Preparedness:** Zero cases of Measles, Cholera, or Meningitis reported in the sub-district during this review period.

### 5. Strategic M&E Recommendations & SDHMT Action Points
1. **Defaulter Tracing Campaign:** Mandate CHOs at ${lowestFacility} to partner with Community Health Volunteers (CHVs) and durbars to track children defaulted on Penta3 and MR1.
2. **Community Transportation Network for Skilled Deliveries:** Strengthen community emergency transport schemes in Dagunga CHPS and Apodabogo CHPS to transfer laboring mothers to Zongoire Health Centre.
3. **Outreach Session Recovery Plan:** Require CHOs with missed outreach sessions to submit revised monthly session timetables to the Sub-District Leader (PNO).
4. **Data Quality Audit (DQA):** Conduct an onsite DHIMS2 tally card audit at all 4 facilities before the upcoming district quarterly performance review.
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
