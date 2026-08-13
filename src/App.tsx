import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { Dhims2Importer } from './components/Dhims2Importer';
import { DataEntryModule } from './components/DataEntryModule';
import { PopulationManager } from './components/PopulationManager';
import { EpiModule } from './components/EpiModule';
import { DiseaseSurveillance } from './components/DiseaseSurveillance';
import { MaternalChildModule } from './components/MaternalChildModule';
import { FacilityComparison } from './components/FacilityComparison';
import { MeInsights } from './components/MeInsights';
import { ReviewReports } from './components/ReviewReports';
import { AuthModal } from './components/AuthModal';

import {
  generateBaselineData,
  INITIAL_FACILITIES,
  INITIAL_AUDIT_LOGS,
} from './data/mockDhims2Data';
import {
  calculateFacilityMetrics,
  calculateSubDistrictAlerts,
} from './utils/meCalculations';
import {
  Facility,
  FacilityMonthlyData,
  UserRole,
  ReviewType,
  AuditLog,
} from './types';

export default function App() {
  // State variables
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // June 2026
  const [selectedPeriodType, setSelectedPeriodType] = useState<ReviewType>('monthly');
  const [dataSourceFilter, setDataSourceFilter] = useState<'all' | 'actual' | 'sample'>('all');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userEmail, setUserEmail] = useState<string>('sdhmt.admin@ghs.gov.gh');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Data state with localStorage persistence
  const STORAGE_KEYS = {
    MONTHLY_DATA: 'zshpms_monthly_data_v1',
    FACILITIES: 'zshpms_facilities_v1',
    AUDIT_LOGS: 'zshpms_audit_logs_v1',
  };

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved facilities:', e);
    }
    return INITIAL_FACILITIES;
  });

  const [monthlyData, setMonthlyData] = useState<FacilityMonthlyData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_DATA);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved monthly data:', e);
    }
    return generateBaselineData();
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved audit logs:', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
    } catch (e) {
      console.error('Error saving facilities to storage:', e);
    }
  }, [facilities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_DATA, JSON.stringify(monthlyData));
    } catch (e) {
      console.error('Error saving monthly data to storage:', e);
    }
  }, [monthlyData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error saving audit logs to storage:', e);
    }
  }, [auditLogs]);

  // Apply or remove Dark Mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculate breakdown between sample baseline records and live actual records
  const dataStats = useMemo(() => {
    const sample = monthlyData.filter((d) => d.isSample !== false && d.dataSource !== 'actual').length;
    const actual = monthlyData.filter((d) => d.isSample === false || d.dataSource === 'actual').length;
    return { total: monthlyData.length, sample, actual };
  }, [monthlyData]);

  // Filter dataset based on selected data source, period, and year
  const filteredData = useMemo(() => {
    return monthlyData.filter((d) => {
      const isRecordSample = d.isSample !== false && d.dataSource !== 'actual';
      if (dataSourceFilter === 'actual' && isRecordSample) return false;
      if (dataSourceFilter === 'sample' && !isRecordSample) return false;

      if (d.year !== selectedYear) return false;
      if (selectedPeriodType === 'monthly') {
        return d.month === selectedMonth;
      } else if (selectedPeriodType === 'quarterly') {
        const q = Math.ceil(selectedMonth / 3);
        const rowQ = Math.ceil(d.month / 3);
        return rowQ === q;
      } else if (selectedPeriodType === 'midyear') {
        return d.month <= 6;
      }
      return true; // Annual
    });
  }, [monthlyData, selectedYear, selectedMonth, selectedPeriodType, dataSourceFilter]);

  // Period label generator
  const getPeriodLabel = () => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (selectedPeriodType === 'monthly') {
      return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    } else if (selectedPeriodType === 'quarterly') {
      const q = Math.ceil(selectedMonth / 3);
      return `Quarter ${q} (${selectedYear})`;
    } else if (selectedPeriodType === 'midyear') {
      return `Mid-Year Review (Jan - Jun ${selectedYear})`;
    }
    return `Annual Review (${selectedYear})`;
  };

  const periodLabel = getPeriodLabel();

  // Calculated Metrics & Alerts
  const calculatedMetrics = useMemo(() => {
    return facilities.map((f) => calculateFacilityMetrics(f, filteredData));
  }, [facilities, filteredData]);

  const alerts = useMemo(() => {
    return calculateSubDistrictAlerts(calculatedMetrics, filteredData);
  }, [calculatedMetrics, filteredData]);

  // Handle uploaded new DHIMS2 Excel/PDF dataset
  const handleDataUploaded = (newRecords: FacilityMonthlyData[]) => {
    setMonthlyData((prev) => [...newRecords, ...prev]);

    // Automatically register any newly encountered facility names
    const newFacilitiesToRegister: Facility[] = [];
    const existingIds = new Set(facilities.map((f) => f.id));
    const existingNames = new Set(facilities.map((f) => f.name.toLowerCase()));

    newRecords.forEach((rec) => {
      const recId = rec.facilityId;
      const recName = rec.facilityName;
      if (!existingIds.has(recId) && !existingNames.has(recName.toLowerCase())) {
        const isCHPS = recName.toLowerCase().includes('chps');
        const estPop = isCHPS ? 2500 : 5500;
        newFacilitiesToRegister.push({
          id: recId,
          name: recName,
          type: isCHPS ? 'CHPS' : 'Health Centre',
          subDistrict: 'Zongoire',
          district: 'Bawku West',
          region: 'Upper East',
          inCharge: 'Facility Officer',
          contact: '+233 20 000 0000',
          targetPopulation: {
            catchmentPopulation: estPop,
            expectedPregnancies: Math.round(estPop * 0.04),
            expectedDeliveries: Math.round(estPop * 0.038),
            childrenUnder1: Math.round(estPop * 0.04),
            childrenUnder5: Math.round(estPop * 0.20),
            womenOfReproductiveAge: Math.round(estPop * 0.24),
          },
        });
        existingIds.add(recId);
        existingNames.add(recName.toLowerCase());
      }
    });

    if (newFacilitiesToRegister.length > 0) {
      setFacilities((prev) => [...prev, ...newFacilitiesToRegister]);
    }

    // Automatically set view filters to match the imported period
    if (newRecords.length > 0) {
      if (newRecords[0].year) setSelectedYear(newRecords[0].year);
      if (newRecords[0].month) setSelectedMonth(newRecords[0].month);
    }

    // Create new audit log
    const newLog: AuditLog = {
      id: `LOG_${Date.now()}`,
      fileName: 'DHIMS2_Import_Batch',
      uploadedBy: userEmail,
      userRole: userRole === 'admin' ? 'Administrator' : userRole,
      timestamp: new Date().toLocaleString(),
      status: 'Success',
      recordsProcessed: newRecords.length,
      period: periodLabel,
      details: `Parsed & validated ${newRecords.length} records across ${
        new Set(newRecords.map((r) => r.facilityName)).size
      } health facility/facilities`,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handle single record manual entry save
  const handleSingleRecordSaved = (savedRecord: FacilityMonthlyData) => {
    setMonthlyData((prev) => {
      const idx = prev.findIndex(
        (d) =>
          d.facilityId === savedRecord.facilityId &&
          d.year === savedRecord.year &&
          d.month === savedRecord.month
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedRecord;
        return updated;
      }
      return [savedRecord, ...prev];
    });

    // Create audit log
    const newLog: AuditLog = {
      id: `LOG_${Date.now()}`,
      fileName: 'Manual_Data_Entry_Form',
      uploadedBy: userEmail,
      userRole: userRole === 'admin' ? 'Administrator' : userRole,
      timestamp: new Date().toLocaleString(),
      status: 'Success',
      recordsProcessed: 1,
      period: savedRecord.monthLabel,
      details: `Manual monthly data submitted for ${savedRecord.facilityName}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handle restoring baseline datasets
  const handleRestoreBaseline = () => {
    setMonthlyData(generateBaselineData());
    setFacilities(INITIAL_FACILITIES);
  };

  // Handle purging only sample/demo data to leave clean actual dataset
  const handleClearSampleData = () => {
    setMonthlyData((prev) => prev.filter((d) => d.isSample === false || d.dataSource === 'actual'));
  };

  // Handle clearing all sample data & actual data
  const handleClearAllData = () => {
    setMonthlyData([]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Navigation Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedPeriodType={selectedPeriodType}
        setSelectedPeriodType={setSelectedPeriodType}
        userRole={userRole}
        setUserRole={setUserRole}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        alertCount={alerts.length}
        dataSourceFilter={dataSourceFilter}
        setDataSourceFilter={setDataSourceFilter}
        dataStats={dataStats}
      />

      {/* Main Body Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            metrics={calculatedMetrics}
            alerts={alerts}
            facilities={facilities}
            monthlyData={filteredData}
            periodLabel={periodLabel}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'entry' && (
          <DataEntryModule
            facilities={facilities}
            monthlyData={monthlyData}
            onSaveRecord={handleSingleRecordSaved}
            userRole={userRole}
            userEmail={userEmail}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'importer' && (
          <Dhims2Importer
            onDataUploaded={handleDataUploaded}
            auditLogs={auditLogs}
            userRole={userRole}
            onRestoreBaselineData={handleRestoreBaseline}
            onClearSampleData={handleClearSampleData}
            onClearAllData={handleClearAllData}
            dataStats={dataStats}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'population' && (
          <PopulationManager
            facilities={facilities}
            onUpdateFacilities={setFacilities}
            userRole={userRole}
          />
        )}

        {activeTab === 'epi' && (
          <EpiModule
            monthlyData={filteredData}
            metrics={calculatedMetrics}
            facilities={facilities}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'disease' && (
          <DiseaseSurveillance
            monthlyData={filteredData}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'maternal_child' && (
          <MaternalChildModule
            monthlyData={filteredData}
            metrics={calculatedMetrics}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'comparison' && (
          <FacilityComparison
            metrics={calculatedMetrics}
            facilities={facilities}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'insights' && (
          <MeInsights
            metrics={calculatedMetrics}
            alerts={alerts}
            facilities={facilities}
            monthlyData={filteredData}
            periodLabel={periodLabel}
            year={selectedYear}
          />
        )}

        {activeTab === 'reports' && (
          <ReviewReports
            metrics={calculatedMetrics}
            facilities={facilities}
            monthlyData={filteredData}
            selectedPeriodType={selectedPeriodType}
            selectedYear={selectedYear}
            periodLabel={periodLabel}
          />
        )}
      </main>

      {/* Footer Banner */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-4 px-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Zongoire Sub-District Health Performance Monitoring System (ZSHPMS)</strong> • Ghana Health Service (GHS)
          </div>
          <div>
            Decision Support & DHIMS2 M&E Analytics Platform • Version 2.4
          </div>
        </div>
      </footer>

      {/* User Authentication & Role Selection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={userRole}
        onSelectRole={(role, email) => {
          setUserRole(role);
          if (email) setUserEmail(email);
        }}
      />
    </div>
  );
}
