import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, AccountMode } from './components/Navbar';
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
import {
  subscribeLiveFacilities,
  subscribeLiveMonthlyRecords,
  subscribeLiveAuditLogs,
  saveLiveMonthlyRecord,
  saveLiveMonthlyRecordsBatch,
  saveLiveFacility,
  seedLiveFacilitiesIfEmpty,
} from './firebase/firestoreService';

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

  // Account Mode: 'live' (Firebase Cloud DB - saves actual data, zero sample interference) vs 'demo' (Sandbox)
  const [accountMode, setAccountMode] = useState<AccountMode>(() => {
    try {
      const savedMode = localStorage.getItem('zshpms_account_mode');
      return (savedMode === 'demo' ? 'demo' : 'live') as AccountMode;
    } catch {
      return 'live';
    }
  });

  // Persist account mode
  useEffect(() => {
    try {
      localStorage.setItem('zshpms_account_mode', accountMode);
    } catch (e) {
      console.error('Error saving account mode:', e);
    }
  }, [accountMode]);

  // Live Firestore State (for Live Account)
  const [liveFacilities, setLiveFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [liveMonthlyData, setLiveMonthlyData] = useState<FacilityMonthlyData[]>([]);
  const [liveAuditLogs, setLiveAuditLogs] = useState<AuditLog[]>([]);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Demo Sandbox State (for Demo Account)
  const [demoFacilities, setDemoFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [demoMonthlyData, setDemoMonthlyData] = useState<FacilityMonthlyData[]>(() => generateBaselineData());
  const [demoAuditLogs, setDemoAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Initialize Firestore listeners and seed facilities if empty
  useEffect(() => {
    // Seed initial facilities in Firestore if collection is empty
    seedLiveFacilitiesIfEmpty(INITIAL_FACILITIES).catch((err) => {
      console.warn('Firestore seed error (offline/cached):', err);
    });

    const unsubFacilities = subscribeLiveFacilities((facilities) => {
      if (facilities.length > 0) {
        setLiveFacilities(facilities);
      }
    });

    const unsubRecords = subscribeLiveMonthlyRecords((records) => {
      // In live account, all records are actual (isSample: false)
      setLiveMonthlyData(records);
      setCloudSyncStatus('synced');
    });

    const unsubLogs = subscribeLiveAuditLogs((logs) => {
      setLiveAuditLogs(logs);
    });

    return () => {
      unsubFacilities();
      unsubRecords();
      unsubLogs();
    };
  }, []);

  // Active state based on selected Account Mode
  const facilities = accountMode === 'live' ? liveFacilities : demoFacilities;
  const monthlyData = accountMode === 'live' ? liveMonthlyData : demoMonthlyData;
  const auditLogs = accountMode === 'live' ? liveAuditLogs : demoAuditLogs;

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
    if (accountMode === 'live') {
      return { total: liveMonthlyData.length, sample: 0, actual: liveMonthlyData.length };
    }
    const sample = demoMonthlyData.filter((d) => d.isSample !== false && d.dataSource !== 'actual').length;
    const actual = demoMonthlyData.filter((d) => d.isSample === false || d.dataSource === 'actual').length;
    return { total: demoMonthlyData.length, sample, actual };
  }, [accountMode, liveMonthlyData, demoMonthlyData]);

  // Filter dataset based on selected data source, period, and year
  const filteredData = useMemo(() => {
    return monthlyData.filter((d) => {
      if (accountMode === 'demo') {
        const isRecordSample = d.isSample !== false && d.dataSource !== 'actual';
        if (dataSourceFilter === 'actual' && isRecordSample) return false;
        if (dataSourceFilter === 'sample' && !isRecordSample) return false;
      }

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
  }, [monthlyData, accountMode, selectedYear, selectedMonth, selectedPeriodType, dataSourceFilter]);

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
  const expectedMonths = useMemo(() => {
    if (selectedPeriodType === 'monthly') return 1;
    if (selectedPeriodType === 'quarterly') return 3;
    if (selectedPeriodType === 'midyear') return 6;
    return 12;
  }, [selectedPeriodType]);

  const calculatedMetrics = useMemo(() => {
    return facilities.map((f) => calculateFacilityMetrics(f, filteredData, expectedMonths));
  }, [facilities, filteredData, expectedMonths]);

  const alerts = useMemo(() => {
    return calculateSubDistrictAlerts(calculatedMetrics, filteredData);
  }, [calculatedMetrics, filteredData]);

  // Handle uploaded new DHIMS2 Excel/PDF dataset
  const handleDataUploaded = async (newRecords: FacilityMonthlyData[]) => {
    setCloudSyncStatus('saving');

    // Ensure all uploaded records are marked actual with no sample interference
    const sanitizedRecords = newRecords.map((r) => ({
      ...r,
      dataSource: 'actual' as const,
      isSample: false,
    }));

    if (accountMode === 'live') {
      try {
        await saveLiveMonthlyRecordsBatch(sanitizedRecords, 'DHIMS2_Import_Batch', userEmail);
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Error saving batch to Firestore:', err);
        setCloudSyncStatus('offline');
      }
    } else {
      setDemoMonthlyData((prev) => [...sanitizedRecords, ...prev]);
      const newLog: AuditLog = {
        id: `LOG_${Date.now()}`,
        fileName: 'DHIMS2_Import_Batch',
        uploadedBy: userEmail,
        userRole: userRole === 'admin' ? 'Administrator' : userRole,
        timestamp: new Date().toLocaleString(),
        status: 'Success',
        recordsProcessed: sanitizedRecords.length,
        period: periodLabel,
        details: `Parsed & validated ${sanitizedRecords.length} records in Demo sandbox`,
      };
      setDemoAuditLogs((prev) => [newLog, ...prev]);
    }

    // Automatically register any newly encountered facility names
    const newFacilitiesToRegister: Facility[] = [];
    const existingIds = new Set(facilities.map((f) => f.id));
    const existingNames = new Set(facilities.map((f) => f.name.toLowerCase()));

    sanitizedRecords.forEach((rec) => {
      const recId = rec.facilityId;
      const recName = rec.facilityName;
      if (!existingIds.has(recId) && !existingNames.has(recName.toLowerCase())) {
        const isCHPS = recName.toLowerCase().includes('chps');
        const estPop = isCHPS ? 2500 : 5500;
        const newFac: Facility = {
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
        };
        newFacilitiesToRegister.push(newFac);
        existingIds.add(recId);
        existingNames.add(recName.toLowerCase());

        if (accountMode === 'live') {
          saveLiveFacility(newFac).catch(console.error);
        }
      }
    });

    if (newFacilitiesToRegister.length > 0 && accountMode === 'demo') {
      setDemoFacilities((prev) => [...prev, ...newFacilitiesToRegister]);
    }

    // Automatically set view filters to match the imported period
    if (sanitizedRecords.length > 0) {
      if (sanitizedRecords[0].year) setSelectedYear(sanitizedRecords[0].year);
      if (sanitizedRecords[0].month) setSelectedMonth(sanitizedRecords[0].month);
    }
  };

  // Handle single record manual entry save
  const handleSingleRecordSaved = async (savedRecord: FacilityMonthlyData) => {
    setCloudSyncStatus('saving');

    const cleanRecord: FacilityMonthlyData = {
      ...savedRecord,
      dataSource: 'actual',
      isSample: false,
    };

    if (accountMode === 'live') {
      try {
        await saveLiveMonthlyRecord(cleanRecord, userEmail);
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Error saving record to Firestore:', err);
        setCloudSyncStatus('offline');
      }
    } else {
      setDemoMonthlyData((prev) => {
        const idx = prev.findIndex(
          (d) =>
            d.facilityId === cleanRecord.facilityId &&
            d.year === cleanRecord.year &&
            d.month === cleanRecord.month
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = cleanRecord;
          return updated;
        }
        return [cleanRecord, ...prev];
      });

      const newLog: AuditLog = {
        id: `LOG_${Date.now()}`,
        fileName: 'Manual_Data_Entry_Form',
        uploadedBy: userEmail,
        userRole: userRole === 'admin' ? 'Administrator' : userRole,
        timestamp: new Date().toLocaleString(),
        status: 'Success',
        recordsProcessed: 1,
        period: cleanRecord.monthLabel,
        details: `Manual monthly data submitted for ${cleanRecord.facilityName}`,
      };
      setDemoAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Handle updating facility populations
  const handleUpdateFacilities = (updatedList: Facility[]) => {
    if (accountMode === 'live') {
      setLiveFacilities(updatedList);
      updatedList.forEach((fac) => {
        saveLiveFacility(fac).catch(console.error);
      });
    } else {
      setDemoFacilities(updatedList);
    }
  };

  // Handle restoring baseline datasets (Demo mode only)
  const handleRestoreBaseline = () => {
    if (accountMode === 'demo') {
      setDemoMonthlyData(generateBaselineData());
      setDemoFacilities(INITIAL_FACILITIES);
      setDemoAuditLogs(INITIAL_AUDIT_LOGS);
    }
  };

  // Handle clearing sample data
  const handleClearSampleData = () => {
    if (accountMode === 'demo') {
      setDemoMonthlyData((prev) => prev.filter((d) => d.isSample === false || d.dataSource === 'actual'));
    }
  };

  // Handle clearing all data
  const handleClearAllData = () => {
    if (accountMode === 'demo') {
      setDemoMonthlyData([]);
    }
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
        accountMode={accountMode}
        setAccountMode={setAccountMode}
        cloudSyncStatus={cloudSyncStatus}
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
            onUpdateFacilities={handleUpdateFacilities}
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
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <strong>Zongoire Sub-District Health Performance Monitoring System (ZSHPMS)</strong> • Ghana Health Service
          </div>
          <div>
            Connected to <strong>Firebase Cloud Database</strong> • Live & Demo Accounts Active
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
