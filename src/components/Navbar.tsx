import React, { useState, useEffect } from 'react';
import {
  Activity,
  Upload,
  Edit3,
  UserCheck,
  Moon,
  Sun,
  ShieldAlert,
  BarChart3,
  Users,
  FileSpreadsheet,
  Layers,
  FileText,
  Bell,
  Building2,
  Calendar,
  Download,
  Filter,
  Database,
  ExternalLink,
  X,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '../types';
import { PwaInstallModal } from './PwaInstallModal';

export type DataSourceFilter = 'all' | 'actual' | 'sample';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedPeriodType: 'monthly' | 'quarterly' | 'midyear' | 'annual';
  setSelectedPeriodType: (type: 'monthly' | 'quarterly' | 'midyear' | 'annual') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  alertCount: number;
  dataSourceFilter: DataSourceFilter;
  setDataSourceFilter: (filter: DataSourceFilter) => void;
  dataStats: { total: number; sample: number; actual: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedPeriodType,
  setSelectedPeriodType,
  userRole,
  setUserRole,
  darkMode,
  setDarkMode,
  alertCount,
  dataSourceFilter,
  setDataSourceFilter,
  dataStats,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [dismissIframeBanner, setDismissIframeBanner] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
    { id: 'entry', label: 'Data Entry', icon: Edit3 },
    { id: 'importer', label: 'DHIMS2 Upload', icon: Upload },
    { id: 'population', label: 'Targets & Population', icon: Users },
    { id: 'epi', label: 'EPI Immunization', icon: Layers },
    { id: 'disease', label: 'Disease Surveillance', icon: ShieldAlert },
    { id: 'maternal_child', label: 'Maternal & Child', icon: Building2 },
    { id: 'comparison', label: 'Facility Ranking', icon: BarChart3 },
    { id: 'insights', label: 'AI M&E Insights', icon: FileSpreadsheet },
    { id: 'reports', label: 'Review Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#006633] dark:bg-slate-900 text-white shadow-sm transition-colors border-b border-green-800 dark:border-slate-800">
      {/* Address Bar Install Helper Banner (shown when in preview iframe to explain why the browser address bar install icon is in standalone tab) */}
      {isInIframe && !dismissIframeBanner && (
        <div
          id="iframe-install-helper-banner"
          className="bg-amber-400 dark:bg-amber-500 text-slate-950 px-4 py-1.5 text-xs flex items-center justify-between gap-2 border-b border-amber-500 shadow-sm"
        >
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-black uppercase shrink-0">
              PWA Setup
            </span>
            <p className="truncate text-xs font-medium">
              <strong>Looking for the Download/Install button in your address bar?</strong> Browsers require a standalone tab to display the address bar install icon (💻/⊕).
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="open-standalone-tab-banner-btn"
              type="button"
              onClick={handleOpenStandalone}
              className="bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1 transition-all shadow-xs cursor-pointer"
              title="Open the app in its own browser tab to activate the address bar install icon"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in New Tab to Install</span>
            </button>
            <button
              id="dismiss-iframe-install-banner"
              type="button"
              onClick={() => setDismissIframeBanner(true)}
              className="text-slate-800 hover:text-slate-950 p-1 hover:bg-amber-300 rounded transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner with Ghana Health Service High-Density Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Institution Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#FFD700] text-[#006633] font-black flex items-center justify-center text-sm shadow-sm border border-yellow-300 shrink-0">
            GHS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">
                Zongoire Sub-District <span className="font-serif italic text-[#FFD700] lowercase font-normal text-base">ZSHPMS</span>
              </h1>
              <span className="bg-[#FFD700]/20 text-[#FFD700] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#FFD700]/30">
                GHS M&E
              </span>
            </div>
            <p className="text-[10px] text-green-200 dark:text-slate-400 font-medium">
              Bawku West District • Upper East Region • Health Performance Monitoring System
            </p>
          </div>
        </div>

        {/* Global Controls & Context Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Type Selector */}
          <div className="flex items-center bg-green-950/80 dark:bg-slate-800 rounded px-2 py-1 border border-green-700/60 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#FFD700] mr-1.5" />
            <select
              id="period-type-select"
              aria-label="Period Type Select"
              value={selectedPeriodType}
              onChange={(e) => setSelectedPeriodType(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="monthly" className="bg-[#006633] text-white">Monthly Review</option>
              <option value="quarterly" className="bg-[#006633] text-white">Quarterly Review</option>
              <option value="midyear" className="bg-[#006633] text-white">Mid-Year Review</option>
              <option value="annual" className="bg-[#006633] text-white">Annual Review</option>
            </select>
          </div>

          {/* Month Selector (if Monthly) */}
          {selectedPeriodType === 'monthly' && (
            <select
              id="month-select"
              aria-label="Month Select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-green-950/80 dark:bg-slate-800 text-white text-xs px-2 py-1 rounded border border-green-700/60 focus:outline-none cursor-pointer font-medium"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-[#006633] text-white">
                  {m.label}
                </option>
              ))}
            </select>
          )}

          {/* Year Selector */}
          <select
            id="year-select"
            aria-label="Year Select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-green-950/80 dark:bg-slate-800 text-white text-xs px-2 py-1 rounded border border-green-700/60 focus:outline-none cursor-pointer font-medium"
          >
            <option value={2026} className="bg-[#006633] text-white">2026</option>
            <option value={2025} className="bg-[#006633] text-white">2025</option>
          </select>

          {/* Data Source Filter Switcher (Sample vs Actual) */}
          <div className="flex items-center space-x-1 bg-green-950/90 dark:bg-slate-900/90 p-0.5 rounded border border-green-700/70 text-xs">
            <span className="text-[10px] text-green-300 dark:text-slate-400 font-bold px-1 hidden md:inline flex items-center space-x-1">
              <Database className="w-3 h-3 text-amber-300 inline mr-0.5" />
              <span>Data:</span>
            </span>
            <button
              id="data-filter-all"
              type="button"
              onClick={() => setDataSourceFilter('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                dataSourceFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-green-200 dark:text-slate-300 hover:text-white hover:bg-green-800/50'
              }`}
              title={`Showing all dataset records: ${dataStats.actual} Actual + ${dataStats.sample} Sample`}
            >
              All ({dataStats.total})
            </button>
            <button
              id="data-filter-actual"
              type="button"
              onClick={() => setDataSourceFilter('actual')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center space-x-1 ${
                dataSourceFilter === 'actual'
                  ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-emerald-200 dark:text-emerald-400 hover:text-white hover:bg-green-800/50'
              }`}
              title={`Show only live actual DHIMS2 imported or entered records (${dataStats.actual})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-emerald-300"></span>
              <span>Actual ({dataStats.actual})</span>
            </button>
            <button
              id="data-filter-sample"
              type="button"
              onClick={() => setDataSourceFilter('sample')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center space-x-1 ${
                dataSourceFilter === 'sample'
                  ? 'bg-amber-300 text-slate-950 font-extrabold shadow-sm'
                  : 'text-amber-200 dark:text-amber-400 hover:text-white hover:bg-green-800/50'
              }`}
              title={`Show only baseline sample/demo records (${dataStats.sample})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-300"></span>
              <span>Sample ({dataStats.sample})</span>
            </button>
          </div>

          {/* PWA Install / Download App Button (Always Visible) */}
          <button
            id="pwa-install-btn"
            type="button"
            onClick={handleInstallClick}
            className={`text-[11px] px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer border ${
              isInstalled
                ? 'bg-emerald-800 text-emerald-200 border-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 font-extrabold ring-1 ring-amber-300/60 animate-pulse'
            }`}
            title="Download and install the Ghana Health Service M&E App on your PC, Tablet, or Phone"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>APP INSTALLED</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>DOWNLOAD / INSTALL APP</span>
              </>
            )}
          </button>

          {/* User Role Toggle */}
          <button
            id="user-role-toggle"
            type="button"
            onClick={() => setUserRole(userRole === 'admin' ? 'viewer' : 'admin')}
            className={`text-[11px] px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all border ${
              userRole === 'admin'
                ? 'bg-[#FFD700] text-green-950 border-yellow-300 hover:bg-yellow-300'
                : 'bg-green-800/80 text-green-100 border-green-700 hover:bg-green-800'
            }`}
            title="Toggle between Administrator and Viewer Mode"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{userRole === 'admin' ? 'Admin Mode' : 'Viewer Mode'}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="dark-mode-toggle"
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 rounded bg-green-950/80 dark:bg-slate-800 border border-green-700/60 hover:bg-green-800 transition-colors text-[#FFD700]"
            title="Toggle theme mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs Bar */}
      <nav aria-label="Main Navigation" className="bg-[#004d26] dark:bg-slate-950 border-t border-green-800/80 dark:border-slate-800 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold uppercase tracking-tight whitespace-nowrap transition-all border-b-2 relative ${
                  isActive
                    ? 'border-[#FFD700] text-[#FFD700] bg-green-900/80 dark:bg-slate-900 font-extrabold'
                    : 'border-transparent text-green-100 dark:text-slate-400 hover:text-white hover:bg-green-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFD700]' : 'text-green-300/80'}`} />
                <span>{item.label}</span>
                {(item as any).badge !== undefined && (item as any).badge > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {(item as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* PWA Install Guidance & Trigger Modal */}
      <PwaInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallAccepted={() => setIsInstalled(true)}
      />
    </header>
  );
};
