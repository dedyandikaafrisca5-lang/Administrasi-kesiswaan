import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  RefreshCw, 
  Search,
  Menu,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenGasModal: () => void;
  onOpenSchoolModal?: () => void;
  onToggleSidebar?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenGasModal, 
  onOpenSchoolModal,
  onToggleSidebar,
  searchTerm = '',
  onSearchChange
}) => {
  const { 
    gasConfig, 
    isSyncing, 
    triggerManualSyncToGas 
  } = useApp();

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Universal Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full w-full max-w-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white focus-within:border-slate-300 border border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari siswa, dokumen, atau anggaran..." 
            className="bg-transparent border-none text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls: School/Kepsek Config, GAS Sync Status, Role Switcher, & User Info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Tombol Atur Kepala Sekolah & Identitas */}
        {onOpenSchoolModal && (
          <button
            id="btn-school-identity"
            type="button"
            onClick={onOpenSchoolModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-2xs"
            title="Atur Nama & NIP Kepala Sekolah untuk Naskah Dinas"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Kepala Sekolah</span>
          </button>
        )}

        {/* GAS Status Pill */}
        <button
          id="btn-gas-status"
          onClick={onOpenGasModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            gasConfig.webAppUrl && gasConfig.isLiveConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title="Konfigurasi Backend Google Apps Script & Sheets"
        >
          {gasConfig.webAppUrl && gasConfig.isLiveConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline font-semibold">Google Cloud Terhubung</span>
              <span className="md:hidden">Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="hidden md:inline font-semibold">Mode Demo / Lokal</span>
              <span className="md:hidden">Lokal</span>
            </>
          )}
        </button>

        {/* Sync Button if GAS is configured */}
        {gasConfig.webAppUrl && (
          <button
            id="btn-sync-gas"
            onClick={triggerManualSyncToGas}
            disabled={isSyncing}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Sinkronkan Sekarang ke Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Admin Profile Display (Strict Single Admin Mode) */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Administrator
              </p>
            </div>
            <p className="text-[11px] font-semibold text-indigo-600 leading-tight mt-0.5">
              Super Admin • Akses Penuh
            </p>
          </div>

          <div className="relative group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center border border-indigo-400 shadow-sm">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


