import React from 'react';
import { useApp } from '../context/AppContext';
import { SchoolLogo } from './common/SchoolLogo';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Award, 
  ArrowRightLeft, 
  Settings2,
  FolderOpen,
  Banknote,
  UserCheck,
  X
} from 'lucide-react';

export type NavTab = 'dashboard' | 'siswa' | 'dokumen' | 'anggaran' | 'honor_ekskul' | 'prestasi' | 'mutasi_alumni' | 'gas_setup' | 'school_identity';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { gasConfig } = useApp();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'siswa' as NavTab,
      label: 'Data Induk Siswa',
      icon: Users,
    },
    {
      id: 'dokumen' as NavTab,
      label: 'Administrasi Unit',
      icon: FolderOpen,
    },
    {
      id: 'anggaran' as NavTab,
      label: 'Proposal, RAB & LPJ',
      icon: Receipt,
    },
    {
      id: 'honor_ekskul' as NavTab,
      label: 'Honor Pembina Ekskul',
      icon: Banknote,
    },
    {
      id: 'prestasi' as NavTab,
      label: 'Prestasi & Mutasi',
      icon: Award,
    },
    {
      id: 'mutasi_alumni' as NavTab,
      label: 'Alumni & Tracer',
      icon: ArrowRightLeft,
    },
    {
      id: 'school_identity' as NavTab,
      label: 'Identitas & Kepala Sekolah',
      icon: UserCheck,
    },
    {
      id: 'gas_setup' as NavTab,
      label: 'GAS & Drive Config',
      icon: Settings2,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between p-6 pb-5">
            <div className="flex items-center gap-3">
              <SchoolLogo size="md" variant="rounded" showBackground={true} className="p-1 bg-white border-slate-700/50 shadow-md shadow-indigo-950/40 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-sm font-black text-white tracking-tight block truncate">SMPN 2 PULUNG</span>
                <p className="text-[10px] text-indigo-300 font-medium">SIM Kesiswaan SMP</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom GAS & Drive Status Bar */}
        <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{gasConfig.webAppUrl ? 'Connected to GAS API' : 'Lokal Mode Ready'}</span>
          </div>
          <p className="text-[10px] mt-1 text-slate-400">Storage: Google Drive/Sheet</p>
        </div>
      </aside>
    </>
  );
};

