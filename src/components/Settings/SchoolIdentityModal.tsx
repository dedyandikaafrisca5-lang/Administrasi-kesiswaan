import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  School, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { 
  SCHOOL_CONFIG, 
  DEFAULT_KEPSEK, 
  getStoredKepsek, 
  setStoredKepsek,
  KEPSEK_STORAGE_KEYS 
} from '../../constants/schoolConfig';
import { SchoolLogo } from '../common/SchoolLogo';

interface SchoolIdentityModalProps {
  onClose: () => void;
}

export const SchoolIdentityModal: React.FC<SchoolIdentityModalProps> = ({ onClose }) => {
  const currentKepsek = getStoredKepsek();

  const [namaKepsek, setNamaKepsek] = useState(currentKepsek.nama);
  const [nipKepsek, setNipKepsek] = useState(currentKepsek.nip);
  const [jabatanKepsek, setJabatanKepsek] = useState(currentKepsek.jabatan);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredKepsek({
      nama: namaKepsek.trim() || DEFAULT_KEPSEK.nama,
      nip: nipKepsek.trim() || DEFAULT_KEPSEK.nip,
      jabatan: jabatanKepsek.trim() || DEFAULT_KEPSEK.jabatan,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setNamaKepsek(DEFAULT_KEPSEK.nama);
    setNipKepsek(DEFAULT_KEPSEK.nip);
    setJabatanKepsek(DEFAULT_KEPSEK.jabatan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" variant="rounded" showBackground={true} className="p-0.5 bg-white shrink-0" />
            <div>
              <h3 className="font-bold text-base text-white">Identitas & Penandatangan Sekolah</h3>
              <p className="text-xs text-indigo-200">Pengaturan Nama & NIP Kepala Sekolah untuk Naskah Dinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data Kepala Sekolah & Pengesahan berhasil diperbarui dan diterapkan ke seluruh dokumen!</span>
            </div>
          )}

          {/* Section 1: Kepala Sekolah / Pejabat Penandatangan */}
          <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs sm:text-sm">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Data Kepala Sekolah (Pejabat Penandatangan)</span>
              </div>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
                title="Kembalikan ke Nama & NIP bawaan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Standar</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nama Lengkap Kepala Sekolah & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaKepsek}
                  onChange={(e) => setNamaKepsek(e.target.value)}
                  placeholder="Contoh: Drs. H. Bambang Suhartono, M.Pd."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    NIP Kepala Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nipKepsek}
                    onChange={(e) => setNipKepsek(e.target.value)}
                    placeholder="Contoh: 19750312 200003 1 001"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Jabatan Penandatangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jabatanKepsek}
                    onChange={(e) => setJabatanKepsek(e.target.value)}
                    placeholder="Contoh: Kepala SMP Negeri 2 Pulung"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-indigo-900/80 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-indigo-100 flex items-start gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Nama dan NIP ini akan dicetak otomatis pada <strong>Lembar Pengesahan Proposal</strong>, <strong>Kop Dokumen RAB</strong>, <strong>LPJ Kegiatan</strong>, dan <strong>Daftar Pembayaran Honor</strong>.</span>
            </p>
          </div>

          {/* Section 2: Data Lembaga Sekolah */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm border-b border-slate-200 pb-2">
              <School className="w-4 h-4 text-slate-600" />
              <span>Informasi Satuan Pendidikan (SMPN 2 Pulung)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] block">Satuan Pendidikan:</span>
                <p className="font-bold text-slate-800">{SCHOOL_CONFIG.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] block">NPSN:</span>
                <p className="font-mono font-bold text-slate-800">{SCHOOL_CONFIG.npsn}</p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-slate-500 text-[10px] block">Alamat Resmi:</span>
                <p className="font-medium text-slate-700">{SCHOOL_CONFIG.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] block">Kontak / Telepon:</span>
                <p className="text-slate-700">{SCHOOL_CONFIG.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] block">Website / Email:</span>
                <p className="text-slate-700">{SCHOOL_CONFIG.website} • {SCHOOL_CONFIG.email}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
