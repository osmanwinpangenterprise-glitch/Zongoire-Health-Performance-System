import React, { useState } from 'react';
import {
  Users,
  Building2,
  Edit2,
  Save,
  PlusCircle,
  Calculator,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Search,
  Download,
  Filter,
  Layers,
} from 'lucide-react';
import { Facility, UserRole } from '../types';
import {
  ZONGOIRE_COMMUNITY_POPULATIONS,
  SUB_DISTRICT_TOTALS,
  BAWKU_WEST_DISTRICT_TOTALS,
  CommunityPopulationRecord,
} from '../data/communityPopulationData';

interface PopulationManagerProps {
  facilities: Facility[];
  onUpdateFacilities: (updated: Facility[]) => void;
  userRole: UserRole;
}

export const PopulationManager: React.FC<PopulationManagerProps> = ({
  facilities,
  onUpdateFacilities,
  userRole,
}) => {
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Facility | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Community table filter state
  const [communityFacilityFilter, setCommunityFacilityFilter] = useState<string>('all');
  const [communitySearchTerm, setCommunitySearchTerm] = useState<string>('');
  const [activeViewTab, setActiveViewTab] = useState<'facilities' | 'communities'>('communities');

  // New Facility Form State
  const [newFacility, setNewFacility] = useState<{
    name: string;
    type: 'Health Centre' | 'CHPS';
    inCharge: string;
    contact: string;
    catchmentPopulation: number;
  }>({
    name: '',
    type: 'CHPS',
    inCharge: '',
    contact: '',
    catchmentPopulation: 2500,
  });

  const handleStartEdit = (fac: Facility) => {
    setEditingFacilityId(fac.id);
    setEditFormData(JSON.parse(JSON.stringify(fac)));
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    const updated = facilities.map((f) => (f.id === editFormData.id ? editFormData : f));
    onUpdateFacilities(updated);
    setEditingFacilityId(null);
    setEditFormData(null);
    setSuccessMessage(`Target populations for ${editFormData.name} successfully updated! Indicator denominators updated.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleAutoApplyGhsPercentages = (facId: string) => {
    const updated = facilities.map((f) => {
      if (f.id === facId || facId === 'all') {
        const pop = f.targetPopulation.catchmentPopulation;
        return {
          ...f,
          targetPopulation: {
            catchmentPopulation: pop,
            expectedPregnancies: Math.round(pop * 0.04),
            expectedDeliveries: Math.round(pop * 0.04), // 4% GSS benchmark
            childrenUnder1: Math.round(pop * 0.04),
            childrenUnder5: Math.round(pop * 0.20),
            womenOfReproductiveAge: Math.round(pop * 0.24),
          },
        };
      }
      return f;
    });
    onUpdateFacilities(updated);
    setSuccessMessage('Standard Ghana Statistical Service (GSS) demographic percentages applied across selected facilities.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCreateNewFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacility.name) return;

    const newId = newFacility.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const pop = newFacility.catchmentPopulation || 2000;

    const created: Facility = {
      id: newId,
      name: newFacility.name,
      type: newFacility.type,
      subDistrict: 'Zongoire',
      district: 'Bawku West',
      region: 'Upper East',
      inCharge: newFacility.inCharge || 'CHO In-Charge',
      contact: newFacility.contact || '+233 24 000 0000',
      targetPopulation: {
        catchmentPopulation: pop,
        expectedPregnancies: Math.round(pop * 0.04),
        expectedDeliveries: Math.round(pop * 0.04),
        childrenUnder1: Math.round(pop * 0.04),
        childrenUnder5: Math.round(pop * 0.20),
        womenOfReproductiveAge: Math.round(pop * 0.24),
      },
    };

    onUpdateFacilities([...facilities, created]);
    setShowAddModal(false);
    setSuccessMessage(`Facility "${created.name}" added to Zongoire Sub-District monitoring system.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtered community rows
  const filteredCommunities = ZONGOIRE_COMMUNITY_POPULATIONS.filter((item) => {
    const matchesFacility =
      communityFacilityFilter === 'all' || item.facilityId === communityFacilityFilter;
    const matchesSearch =
      item.communityName.toLowerCase().includes(communitySearchTerm.toLowerCase()) ||
      item.facilityName.toLowerCase().includes(communitySearchTerm.toLowerCase());
    return matchesFacility && matchesSearch;
  });

  const exportCommunityCsv = () => {
    const headers = [
      'Facility',
      'Community',
      'Catchment Pop',
      'Expected Pregnancies (4%)',
      'Expected Deliveries (4%)',
      'Chn 6-11m (2%)',
      'Chn 0-11m (4%)',
      'Chn 0-23m (8%)',
      'Chn 6-59m (18%)',
      'Chn 12-59m (16%)',
      'Chn <5 Yrs (20%)',
      'Chn 5-9 Yrs (12.7%)',
      'Early Teens 10-14 Yrs (11.8%)',
      'Late Teens 15-19 Yrs (10.6%)',
      'WIFA / WIRA (24%)',
      'Males (48.8%)',
      'Females (51.2%)',
    ];

    const rows = filteredCommunities.map((c) => [
      `"${c.facilityName}"`,
      `"${c.communityName}"`,
      c.totalPopulation,
      c.expectedPregnancies,
      c.expectedDeliveries,
      c.chn6_11m,
      c.chn0_11m,
      c.chn0_23m,
      c.chn6_59m,
      c.chn12_59m,
      c.chnUnder5,
      c.chn5_9y,
      c.earlyTeens,
      c.lateTeens,
      c.wifa,
      c.males,
      c.females,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Zongoire_Community_Populations_GSS_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#006633] text-white rounded p-4 shadow-sm border border-green-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#FFD700] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>2026 POPULATION (GHANA STATISTICAL SERVICE) • ZONGOIRE SUB-DISTRICT</span>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Catchment Population & Demographic Projections
          </h2>
          <p className="text-xs text-green-100 mt-0.5 max-w-2xl">
            Official Ghana Statistical Service (GSS) community-level baseline targets for Zongoire Sub-District (Bawku West District). Serves as denominators for EPI, ANC, Skilled Delivery, and Child Health indicators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {userRole === 'admin' && (
            <>
              <button
                id="apply-ghs-demo-btn"
                type="button"
                onClick={() => handleAutoApplyGhsPercentages('all')}
                className="bg-green-950 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-800 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Apply GSS Demo %</span>
              </button>
              <button
                id="add-new-facility-btn"
                type="button"
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-900 hover:bg-emerald-950 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border border-green-700 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Add Facility</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-t">
        <button
          type="button"
          onClick={() => setActiveViewTab('communities')}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1.5 transition-all ${
            activeViewTab === 'communities'
              ? 'bg-[#006633] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>Community Population Projections (GSS 2026 Sheet)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab('facilities')}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center space-x-1.5 transition-all ${
            activeViewTab === 'facilities'
              ? 'bg-[#006633] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>Facility Denominators Summary</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#006633]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* VIEW TAB 1: COMMUNITY POPULATIONS (GSS 2026 SHEET) */}
      {activeViewTab === 'communities' && (
        <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006633]" />
                <span>2026 POPULATION (GHANA STATISTICAL SERVICE) BY COMMUNITY</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Official 13 communities across Apodabogo CHPS, Dagunga CHPS, Zongoire CHPS, & Zongoire Health Centre.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter community..."
                  value={communitySearchTerm}
                  onChange={(e) => setCommunitySearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs w-40 font-medium"
                />
              </div>

              <select
                value={communityFacilityFilter}
                onChange={(e) => setCommunityFacilityFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Facilities (13 Communities)</option>
                <option value="apodabogo_chps">Apodabogo CHPS (5 Communities)</option>
                <option value="dagunga_chps">Dagunga CHPS (4 Communities)</option>
                <option value="zongoire_chps">Zongoire CHPS (2 Communities)</option>
                <option value="zongoire_hc">Zongoire H/C (2 Communities)</option>
              </select>

              <button
                type="button"
                onClick={exportCommunityCsv}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#006633]" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#006633] text-white font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-2 border-r border-green-700 min-w-[110px]">FACILITY</th>
                  <th className="py-2 px-2 border-r border-green-700 min-w-[110px]">COMMUNITIES</th>
                  <th className="py-2 px-2 text-right border-r border-green-700 bg-emerald-900">
                    Exp. Pregnancies<br /><span className="text-[#FFD700] text-[9px]">4% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700 bg-emerald-900">
                    Exp. Deliveries<br /><span className="text-[#FFD700] text-[9px]">4% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 6-11m<br /><span className="text-green-200 text-[9px]">2% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 0-11m<br /><span className="text-[#FFD700] text-[9px]">4% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 0-23m<br /><span className="text-green-200 text-[9px]">8% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 6-59m<br /><span className="text-green-200 text-[9px]">18% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 12-59m<br /><span className="text-green-200 text-[9px]">16% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700 bg-emerald-900">
                    Chn &lt; 5 Yrs<br /><span className="text-[#FFD700] text-[9px]">20% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Chn 5-9 Yrs<br /><span className="text-green-200 text-[9px]">12.7% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Early Teens (10-14)<br /><span className="text-green-200 text-[9px]">11.8% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Late Teens (15-19)<br /><span className="text-green-200 text-[9px]">10.6% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700 bg-emerald-900">
                    WIFA / WIRA<br /><span className="text-[#FFD700] text-[9px]">24% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Males<br /><span className="text-green-200 text-[9px]">48.8% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right border-r border-green-700">
                    Females<br /><span className="text-green-200 text-[9px]">51.2% of Pop</span>
                  </th>
                  <th className="py-2 px-2 text-right font-black bg-emerald-950 text-[#FFD700]">
                    TOTAL POP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredCommunities.map((c, i) => (
                  <tr
                    key={`${c.facilityId}-${c.communityName}-${i}`}
                    className="hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="py-2 px-2 font-bold text-[11px] text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                      {c.facilityName}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {c.communityName}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-[#006633] dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {c.expectedPregnancies}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-[#006633] dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {c.expectedDeliveries}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.chn6_11m}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-sky-700 dark:text-sky-400 border-r border-slate-200 dark:border-slate-800">
                      {c.chn0_11m}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.chn0_23m}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.chn6_59m}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.chn12_59m}
                    </td>
                    <td className="py-2 px-2 text-right font-bold border-r border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {c.chnUnder5}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.chn5_9y}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.earlyTeens}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800">
                      {c.lateTeens}
                    </td>
                    <td className="py-2 px-2 text-right font-bold border-r border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {c.wifa}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {c.males}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {c.females}
                    </td>
                    <td className="py-2 px-2 text-right font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800">
                      {c.totalPopulation.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Sub-District Summary Row */}
                <tr className="bg-[#006633] text-white font-black text-xs">
                  <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider text-[#FFD700]">
                    ZONGOIRE SUB-DISTRICT TOTAL
                  </td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-[#FFD700]">
                    {SUB_DISTRICT_TOTALS.expectedPregnancies}
                  </td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-[#FFD700]">
                    {SUB_DISTRICT_TOTALS.expectedDeliveries}
                  </td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.chn6_11m}</td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-[#FFD700]">
                    {SUB_DISTRICT_TOTALS.chn0_11m}
                  </td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.chn0_23m}</td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.chn6_59m}</td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.chn12_59m}</td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-[#FFD700]">
                    {SUB_DISTRICT_TOTALS.chnUnder5.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.chn5_9y.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.earlyTeens.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.lateTeens.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right font-extrabold text-[#FFD700]">
                    {SUB_DISTRICT_TOTALS.wifa.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.males.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right">{SUB_DISTRICT_TOTALS.females.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right font-black text-[#FFD700] text-sm">
                    {SUB_DISTRICT_TOTALS.totalPopulation.toLocaleString()}
                  </td>
                </tr>

                {/* Bawku West District Benchmark Summary Row */}
                <tr className="bg-slate-800 text-amber-300 font-extrabold text-[11px]">
                  <td colSpan={2} className="py-2 px-3 uppercase tracking-wider text-amber-300">
                    BAWKU WEST DISTRICT BENCHMARK
                  </td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.expectedPregnancies.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.expectedDeliveries.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn6_11m.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn0_11m.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn0_23m.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn6_59m.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn12_59m.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chnUnder5.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.chn5_9y.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.earlyTeens.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.lateTeens.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.wifa.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.males.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{BAWKU_WEST_DISTRICT_TOTALS.females.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-white font-black text-xs">
                    {BAWKU_WEST_DISTRICT_TOTALS.totalPopulation.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: FACILITY TARGETS TABLE */}
      {activeViewTab === 'facilities' && (
        <div className="bg-white dark:bg-slate-900 rounded p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#006633]" />
              <span>Zongoire Sub-District Facility Target Populations (2026 Baseline)</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total Sub-District Population:{' '}
              <strong className="text-slate-900 dark:text-white font-black">
                {facilities.reduce((sum, f) => sum + f.targetPopulation.catchmentPopulation, 0).toLocaleString()}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">Facility Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Catchment Pop</th>
                  <th className="py-2 px-3 text-right">Pregnancies (4%)</th>
                  <th className="py-2 px-3 text-right">Deliveries (4%)</th>
                  <th className="py-2 px-3 text-right">Under 1 Yr (4%)</th>
                  <th className="py-2 px-3 text-right">Under 5 Yrs (20%)</th>
                  <th className="py-2 px-3 text-right">WRA (24%)</th>
                  {userRole === 'admin' && <th className="py-2 px-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {facilities.map((fac) => {
                  const isEditing = editingFacilityId === fac.id && editFormData;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={fac.id} className="bg-amber-50/50 dark:bg-amber-950/20">
                        <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">
                          {fac.name}
                        </td>
                        <td className="py-2 px-3">{fac.type}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.catchmentPopulation}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  catchmentPopulation: val,
                                },
                              });
                            }}
                            className="w-20 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.expectedPregnancies}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  expectedPregnancies: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.expectedDeliveries}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  expectedDeliveries: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.childrenUnder1}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  childrenUnder1: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.childrenUnder5}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  childrenUnder5: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={editFormData.targetPopulation.womenOfReproductiveAge}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                targetPopulation: {
                                  ...editFormData.targetPopulation,
                                  womenOfReproductiveAge: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="bg-[#006633] text-white px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 mx-auto"
                          >
                            <Save className="w-3.5 h-3.5 text-[#FFD700]" />
                            <span>Save</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={fac.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                        {fac.name}
                        <div className="text-[11px] text-slate-500 font-normal">
                          In-Charge: {fac.inCharge} ({fac.contact})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{fac.type}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#006633] dark:text-emerald-400">
                        {fac.targetPopulation.catchmentPopulation.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {fac.targetPopulation.expectedPregnancies}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {fac.targetPopulation.expectedDeliveries}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-sky-700 dark:text-sky-400">
                        {fac.targetPopulation.childrenUnder1}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {fac.targetPopulation.childrenUnder5}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {fac.targetPopulation.womenOfReproductiveAge}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(fac)}
                            className="p-1 text-slate-600 hover:text-[#006633] dark:text-slate-400 dark:hover:text-emerald-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit target populations"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Add New Facility to Zongoire Sub-District</span>
            </h3>

            <form onSubmit={handleCreateNewFacility} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yaroyiri CHPS"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Facility Type
                  </label>
                  <select
                    value={newFacility.type}
                    onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                  >
                    <option value="CHPS">CHPS Compound</option>
                    <option value="Health Centre">Health Centre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Catchment Population
                  </label>
                  <input
                    type="number"
                    required
                    value={newFacility.catchmentPopulation}
                    onChange={(e) =>
                      setNewFacility({ ...newFacility, catchmentPopulation: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Facility In-Charge Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHO Daniel Nyaaba"
                  value={newFacility.inCharge}
                  onChange={(e) => setNewFacility({ ...newFacility, inCharge: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 font-bold rounded-lg shadow-sm"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

