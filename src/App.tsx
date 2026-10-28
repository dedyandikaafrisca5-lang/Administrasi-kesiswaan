import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SiswaList } from './components/DataIndukSiswa/SiswaList';
import { DokumenList } from './components/AdministrasiDokumen/DokumenList';
import { AnggaranList } from './components/PengajuanAnggaran/AnggaranList';
import { HonorEkskulList } from './components/HonorEkskul/HonorEkskulList';
import { PrestasiList } from './components/Prestasi/PrestasiList';
import { MutasiAlumniView } from './components/MutasiAlumni/MutasiAlumniView';
import { GasConfigModal } from './components/Settings/GasConfigModal';
import { SchoolIdentityModal } from './components/Settings/SchoolIdentityModal';

const AppContent: React.FC = () => {
  const { syncMessage, clearSyncMessage } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'gas_setup') {
      setIsGasModalOpen(true);
    } else if (tab === 'school_identity') {
      setIsSchoolModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab}
            onOpenAddSiswa={() => setActiveTab('siswa')}
            onOpenAddAnggaran={() => setActiveTab('anggaran')}
            onOpenAddPrestasi={() => setActiveTab('prestasi')}
            onOpenAddDokumen={() => setActiveTab('dokumen')}
          />
        );
      case 'siswa':
        return <SiswaList />;
      case 'dokumen':
        return <DokumenList />;
      case 'anggaran':
        return <AnggaranList />;
      case 'honor_ekskul':
        return <HonorEkskulList />;
      case 'prestasi':
        return <PrestasiList />;
      case 'mutasi_alumni':
        return <MutasiAlumniView />;
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab}
            onOpenAddSiswa={() => setActiveTab('siswa')}
            onOpenAddAnggaran={() => setActiveTab('anggaran')}
            onOpenAddPrestasi={() => setActiveTab('prestasi')}
            onOpenAddDokumen={() => setActiveTab('dokumen')}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 print:bg-white print:min-h-0 print:block">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpenMobile={isSidebarOpen}
          setIsOpenMobile={setIsSidebarOpen}
        />
      </div>

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen print:bg-white print:min-h-0 print:block print:w-full">
        {/* Header Bar */}
        <div className="print:hidden">
          <Header 
            onOpenGasModal={() => setIsGasModalOpen(true)}
            onOpenSchoolModal={() => setIsSchoolModalOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Global Sync Notification Banner if any */}
        {syncMessage && (
          <div className="px-6 sm:px-8 pt-4 print:hidden">
            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              syncMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : syncMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              <span>{syncMessage.text}</span>
              <button 
                onClick={clearSyncMessage}
                className="text-xs font-bold underline hover:opacity-80 ml-4 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Dynamic View Content */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:block">
          {renderActiveView()}
        </main>

        {/* Bottom Micro Footer */}
        <footer className="mt-auto border-t border-slate-100 bg-white py-3.5 px-6 sm:px-8 text-xs text-slate-400 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              <strong className="text-slate-600 font-semibold">SISWA PRO</strong> • Sistem Informasi Kesiswaan Berbasis Google Apps Script
            </p>
            <p className="text-[11px] text-slate-400">
              Live Realtime Sheets & Drive Data Storage
            </p>
          </div>
        </footer>
      </div>

      {/* Google Apps Script & Cloud Config Modal */}
      {isGasModalOpen && (
        <GasConfigModal onClose={() => setIsGasModalOpen(false)} />
      )}

      {/* School & Kepala Sekolah Identity Modal */}
      {isSchoolModalOpen && (
        <SchoolIdentityModal onClose={() => setIsSchoolModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

