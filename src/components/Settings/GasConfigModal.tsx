import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GAS_CODE_GS } from '../../data/gasCodeTemplate';
import { testGasConnection } from '../../services/gasApi';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  FolderCheck,
  Zap,
  CheckCheck
} from 'lucide-react';

interface GasConfigModalProps {
  onClose: () => void;
}

export const GasConfigModal: React.FC<GasConfigModalProps> = ({ onClose }) => {
  const { gasConfig, updateGasConfig, syncToGas, isLoadingGas } = useApp();

  const [webAppUrl, setWebAppUrl] = useState(gasConfig.webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<{ 
    success: boolean; 
    message: string; 
    spreadsheetName?: string;
    spreadsheetUrl?: string;
    folderName?: string;
    tablesCount?: number;
  } | null>(null);
  
  const [isConnecting, setIsConnecting] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleConnectAndAutoSetup = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, message: 'Harap masukkan Web App URL terlebih dahulu!' });
      return;
    }

    setIsConnecting(true);
    setTestResult(null);
    try {
      const res = await testGasConnection(webAppUrl.trim());
      if (res.success) {
        setTestResult({ 
          success: true, 
          message: 'Berhasil Terhubung! Seluruh 16 sheet tabel database di Google Spreadsheet Anda telah dibuat otomatis.',
          spreadsheetName: res.spreadsheetName,
          spreadsheetUrl: res.spreadsheetUrl,
          folderName: res.folderName
        });
        
        updateGasConfig({
          webAppUrl: webAppUrl.trim(),
          spreadsheetId: res.spreadsheetId,
          folderId: res.folderId,
          autoSync: true,
        });
      } else {
        setTestResult({ 
          success: false, 
          message: res.message || 'Gagal terhubung. Pastikan Web App di-deploy dengan hak akses "Anyone" (Siapa saja).' 
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: `Error koneksi: ${e.message || 'Periksa koneksi internet atau URL'}` });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Integrasi Google Spreadsheet & Drive (100% Otomatis)</h3>
              <p className="text-xs text-slate-300">Semua tab database & header kolom dibuat otomatis tanpa klik manual</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Highlight Notice */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-950 text-xs">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Otomatisasi Penuh (Auto-Create 16 Sheets & Auto Folder Drive)</p>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Begitu skrip dipasang dan dihubungkan, Google Apps Script akan <strong>otomatis membuat seluruh 16 lembar kerja (Siswa, Anggaran, Dokumen, Mutasi, Prestasi, dsb.)</strong> lengkap dengan baris judul/kolom yang rapi di Spreadsheet Anda.
              </p>
            </div>
          </div>

          {/* Step 1: Copy Code & Paste to Apps Script */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Langkah 1: Salin Kode Skrip & Terapkan (Deploy)</span>
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Kode Tersalin!' : 'Salin Kode Script (Code.gs)'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p>Di Google Spreadsheet Anda, buka menu <strong>Ekstensi (Extensions) &gt; Apps Script</strong>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p>Hapus semua kode default di file <code>Code.gs</code>, lalu <strong>Paste / Tempel</strong> kode yang disalin di atas.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  <p>Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan Baru (New deployment)</strong>:</p>
                  <ul className="list-disc list-inside pl-2 text-slate-600 font-medium mt-1 space-y-0.5">
                    <li>Pilih jenis: <strong>Aplikasi Web (Web app)</strong></li>
                    <li>Jalankan sebagai (Execute as): <strong>Saya / Me</strong></li>
                    <li>Akses (Who has access): <strong>Siapa saja / Anyone</strong> <em>(Wajib)</em></li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <p>Klik <strong>Deploy</strong> ➔ Izinkan Akses ➔ Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berakhiran <code>/exec</code>.</p>
              </div>
            </div>
          </div>

          {/* Step 2: Input Web App URL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Langkah 2: Masukkan Web App URL & Hubungkan</span>
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Google Apps Script Web App URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleConnectAndAutoSetup}
                  disabled={isConnecting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-300" />}
                  <span>{isConnecting ? 'Menghubungkan & Membuat Sheet...' : 'Hubungkan Sekarang'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Cukup tempel Web App URL, sistem otomatis memverifikasi koneksi dan membuat semua tabel database.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 text-xs font-medium animate-in fade-in duration-200 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>

                {testResult.success && testResult.spreadsheetName && (
                  <div className="bg-white/90 p-3 rounded-xl border border-emerald-200 text-[11px] space-y-1.5 font-normal">
                    <div className="flex items-center justify-between text-emerald-950 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Spreadsheet Terhubung: {testResult.spreadsheetName}</span>
                      </div>
                      {testResult.spreadsheetUrl && (
                        <a 
                          href={testResult.spreadsheetUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-bold text-xs"
                        >
                          Buka Google Spreadsheet <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {testResult.folderName && (
                      <div className="flex items-center gap-1.5 text-emerald-900">
                        <FolderCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Folder Berkas Upload: <strong>{testResult.folderName}</strong> (Tersambung Otomatis)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Sinkronisasi Real-time */}
          {gasConfig.webAppUrl && gasConfig.isLiveConnected && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Status Database: Online & Live Connected</p>
                  <p className="text-[11px] text-emerald-800">Setiap input data di aplikasi akan langsung tersinkronkan ke Google Sheets.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={syncToGas}
                disabled={isLoadingGas}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGas ? 'animate-spin' : ''}`} />
                <span>Sinkronkan Sekarang</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Aplikasi tetap bekerja lancar jika offline dan akan otomatis menyinkronkan saat tersambung.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
