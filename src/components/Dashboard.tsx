import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Sidebar';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { SchoolLogo } from './common/SchoolLogo';
import { PengajuanAnggaran } from '../types';
import { CetakProposalModal } from './PengajuanAnggaran/CetakProposalModal';
import { CetakRABModal } from './PengajuanAnggaran/CetakRABModal';
import { 
  Award, 
  Check, 
  ArrowUpRight, 
  UserPlus, 
  ArrowRightLeft, 
  Plus,
  FileText,
  Receipt,
  Printer
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAddSiswa: () => void;
  onOpenAddAnggaran: () => void;
  onOpenAddPrestasi: () => void;
  onOpenAddDokumen: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onOpenAddSiswa,
  onOpenAddAnggaran,
  onOpenAddPrestasi,
}) => {
  const { data } = useApp();
  const [printProposalItem, setPrintProposalItem] = useState<PengajuanAnggaran | null>(null);
  const [printRABItem, setPrintRABItem] = useState<PengajuanAnggaran | null>(null);

  const siswaAktif = data.siswa.filter((s) => s.status === 'aktif');
  const totalAnggaranRAB = data.pengajuan_anggaran.reduce((sum, p) => sum + p.total_anggaran, 0);
  const totalDokumenRAB = data.pengajuan_anggaran.length;

  const prestasiTerverifikasi = data.prestasi.filter((p) => p.status_verifikasi === 'terverifikasi').length;
  const mutasiMasuk = data.mutasi.filter((m) => m.jenis === 'masuk').length;
  const mutasiKeluar = data.mutasi.filter((m) => m.jenis === 'keluar').length;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* School Welcome Card with Official Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <SchoolLogo size="xl" variant="rounded" showBackground={true} className="p-1.5 bg-white border-2 border-indigo-400/30 shadow-lg shadow-indigo-950/60" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold tracking-wide">
              <span>SISTEM INFORMASI KESISWAAN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">SMP NEGERI 2 PULUNG</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Pusat Pengelolaan Data Siswa, Dokumen Progja, RAB Kegiatan, Prestasi & Tracer Alumni
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenAddAnggaran}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat RAB Baru</span>
          </button>
          <button
            onClick={onOpenAddSiswa}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div 
          onClick={() => setActiveTab('siswa')}
          className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa Aktif</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800">{siswaAktif.length.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Jenjang Kelas VII, VIII, IX</p>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => setActiveTab('anggaran')}
          className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Anggaran RAB</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800">
            {formatRupiah(totalAnggaranRAB)}
          </h3>
          <p className="text-xs text-emerald-600 mt-1 font-medium">{totalDokumenRAB} Dokumen RAB Siap Cetak</p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => setActiveTab('prestasi')}
          className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prestasi Terverifikasi</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800">{prestasiTerverifikasi}</h3>
          <p className="text-xs text-indigo-600 mt-1 font-medium">{data.prestasi.length} Total Prestasi Tercatat</p>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setActiveTab('mutasi_alumni')}
          className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mutasi Masuk/Keluar</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-800">{mutasiMasuk} Masuk / {mutasiKeluar} Keluar</h3>
          <p className="text-xs text-slate-500 mt-1">Tahun Ajaran 2025/2026</p>
        </div>
      </div>

      {/* Grid 3 Columns: Left 2 cols Proposals, Right 1 col Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pengajuan Anggaran Terbaru */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-xs border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Rencana Anggaran Biaya (RAB) Kegiatan</h4>
            <button 
              onClick={() => setActiveTab('anggaran')}
              className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-tight"
            >
              Lihat & Cetak PDF
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {data.pengajuan_anggaran.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400 space-y-3">
                <p className="text-xs font-medium">Belum ada pengajuan RAB / proposal kegiatan.</p>
                <button
                  onClick={onOpenAddAnggaran}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  + Buat Pengajuan Anggaran Pertama
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3">No. Surat</th>
                    <th className="text-left px-5 py-3">Nama Kegiatan</th>
                    <th className="text-left px-5 py-3">Unit</th>
                    <th className="text-right px-5 py-3">Total Anggaran</th>
                    <th className="text-center px-5 py-3">Cetak PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.pengajuan_anggaran.slice(0, 5).map((item) => {
                    const unit = data.unit.find((u) => u.id === item.unit_id);

                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td 
                          onClick={() => setActiveTab('anggaran')}
                          className="px-5 py-3.5 font-mono text-xs text-slate-600 cursor-pointer"
                        >
                          {item.nomor_surat}
                        </td>
                        <td 
                          onClick={() => setActiveTab('anggaran')}
                          className="px-5 py-3.5 font-semibold text-slate-800 cursor-pointer"
                        >
                          {item.nama_kegiatan}
                        </td>
                        <td 
                          onClick={() => setActiveTab('anggaran')}
                          className="px-5 py-3.5 text-slate-600 text-xs cursor-pointer"
                        >
                          {unit?.nama || 'Kesiswaan'}
                        </td>
                        <td 
                          onClick={() => setActiveTab('anggaran')}
                          className="px-5 py-3.5 text-right font-black text-slate-900 cursor-pointer"
                        >
                          {formatRupiah(item.total_anggaran)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrintProposalItem(item);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-[10px] transition-colors cursor-pointer shadow-2xs"
                              title="Cetak Naskah Proposal PDF"
                            >
                              <FileText className="w-3 h-3 text-indigo-300" />
                              <span>Proposal</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrintRABItem(item);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-[10px] transition-colors cursor-pointer shadow-2xs"
                              title="Cetak Lembar RAB PDF"
                            >
                              <Receipt className="w-3 h-3 text-indigo-200" />
                              <span>RAB</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Aktifitas Mutasi & Prestasi Feed */}
        <div className="rounded-2xl bg-white shadow-xs border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h4 className="font-bold text-slate-800">Aktifitas Mutasi & Prestasi</h4>
          </div>
          
          <div className="p-5 flex-1 space-y-4">
            {data.prestasi.length === 0 && data.mutasi.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <p>Belum ada data aktifitas prestasi dan mutasi siswa yang dicatat.</p>
                <p className="text-[11px] text-slate-400">Silakan input data siswa, prestasi, atau mutasi untuk memulai.</p>
              </div>
            ) : (
              <>
                {data.prestasi.slice(0, 2).map((p) => {
                  const siswa = data.siswa.find(s => s.id === p.siswa_id);
                  return (
                    <div key={`pres-${p.id}`} className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          Prestasi: {siswa?.nama_lengkap || 'Siswa'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {p.peringkat} {p.nama_kegiatan || p.nama_prestasi}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.tanggal_perolehan || p.tanggal || 'Tercatat'}</p>
                      </div>
                    </div>
                  );
                })}

                {data.mutasi.slice(0, 2).map((m) => {
                  const siswa = data.siswa.find(s => s.id === m.siswa_id);
                  return (
                    <div key={`mut-${m.id}`} className="flex gap-3 items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        m.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.jenis === 'masuk' ? <UserPlus className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          Mutasi {m.jenis === 'masuk' ? 'Masuk' : 'Keluar'}: {siswa?.nama_lengkap || 'Siswa'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {m.alasan || (m.jenis === 'masuk' ? `Asal: ${m.asal_sekolah}` : `Tujuan: ${m.tujuan_sekolah}`)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatTanggalIndo(m.tanggal_mutasi)}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
            <button 
              id="btn-mulai-pengajuan-baru"
              onClick={onOpenAddAnggaran}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Pengajuan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Proposal Modal */}
      {printProposalItem && (
        <CetakProposalModal
          pengajuan={printProposalItem}
          onClose={() => setPrintProposalItem(null)}
        />
      )}

      {/* Print RAB Modal */}
      {printRABItem && (
        <CetakRABModal
          pengajuan={printRABItem}
          onClose={() => setPrintRABItem(null)}
        />
      )}
    </div>
  );
};
