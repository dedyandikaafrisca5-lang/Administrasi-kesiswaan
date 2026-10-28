import React, { useState } from 'react';
import { PengajuanAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { AnggaranFormModal } from './AnggaranFormModal';
import { CetakRABModal } from './CetakRABModal';
import { CetakProposalModal } from './CetakProposalModal';
import { CetakLPJModal } from './CetakLPJModal';
import { LaporanFormModal } from './LaporanFormModal';
import { AnggaranDetailModal } from './AnggaranDetailModal';
import { UnitManagerModal } from '../AdministrasiDokumen/UnitManagerModal';
import { 
  Receipt, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  FolderKanban,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';

export const AnggaranList: React.FC = () => {
  const { data, deletePengajuanAnggaran } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'rab' | 'lpj_selesai' | 'lpj_pending'>('semua');

  // Modal states
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanAnggaran | null>(null);
  const [editingPengajuan, setEditingPengajuan] = useState<PengajuanAnggaran | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintRABOpen, setIsPrintRABOpen] = useState(false);
  const [isPrintProposalOpen, setIsPrintProposalOpen] = useState(false);
  const [isPrintLPJOpen, setIsPrintLPJOpen] = useState(false);
  const [isLPJFormOpen, setIsLPJFormOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const filteredList = data.pengajuan_anggaran.filter((item) => {
    const searchLower = (searchTerm || '').toLowerCase();
    const namaKegiatan = item.nama_kegiatan || '';
    const nomorSurat = item.nomor_surat || '';
    const tempat = item.tempat || '';

    const matchesSearch =
      namaKegiatan.toLowerCase().includes(searchLower) ||
      nomorSurat.toLowerCase().includes(searchLower) ||
      tempat.toLowerCase().includes(searchLower);

    const matchesUnit = unitFilter === 'semua' || String(item.unit_id) === unitFilter;

    const isSelesaiLPJ = item.status_lpj === 'selesai' || item.status === 'selesai_lpj';
    const matchesStatus =
      statusFilter === 'semua'
        ? true
        : statusFilter === 'lpj_selesai'
        ? isSelesaiLPJ
        : statusFilter === 'lpj_pending'
        ? !isSelesaiLPJ
        : true;

    return matchesSearch && matchesUnit && matchesStatus;
  });

  // KPI Calculations
  const totalAnggaran = data.pengajuan_anggaran.reduce((acc, p) => acc + p.total_anggaran, 0);
  const totalRealisasi = data.pengajuan_anggaran.reduce((acc, p) => acc + (p.total_realisasi || 0), 0);
  const jumlahKegiatan = data.pengajuan_anggaran.length;
  const jumlahSelesaiLPJ = data.pengajuan_anggaran.filter(p => p.status_lpj === 'selesai' || p.status === 'selesai_lpj').length;

  return (
    <div id="anggaran-list-view" className="space-y-6">
      
      {/* List View Container (Hidden when printing modals) */}
      <div className="space-y-6 print-hide-when-modal print:hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" />
            <span>Manajemen Kegiatan: Proposal, RAB & LPJ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Siklus utuh kegiatan kesiswaan SMP Negeri 2 Pulung: Penyusunan Proposal, Rincian RAB, hingga Laporan Pertanggungjawaban (LPJ).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-kelola-unit-anggaran"
            onClick={() => setIsUnitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-98"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Kelola Unit Organisasi</span>
          </button>

          <button
            id="btn-tambah-anggaran"
            onClick={() => {
              setEditingPengajuan(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>✨ Susun Proposal (AI) & RAB Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Pagu Anggaran (RAB)</span>
            <span className="text-base font-black text-slate-900">{formatRupiah(totalAnggaran)}</span>
            <span className="text-[10px] text-slate-400 block">{jumlahKegiatan} Kegiatan Terdaftar</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Realisasi Keuangan (LPJ)</span>
            <span className="text-base font-black text-emerald-700">{formatRupiah(totalRealisasi)}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">{jumlahSelesaiLPJ} dari {jumlahKegiatan} LPJ Selesai</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Status Dokumen Lengkap</span>
            <span className="text-base font-black text-blue-900">Proposal • RAB • LPJ</span>
            <span className="text-[10px] text-blue-600 font-semibold block">Tersedia Cetak PDF Resmi</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kegiatan, nomor surat, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="semua">Semua Unit Organisasi</option>
              {data.unit.map((u) => (
                <option key={u.id} value={u.id}>{u.nama}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="semua">Semua Status LPJ</option>
              <option value="lpj_selesai">LPJ Selesai Disusun</option>
              <option value="lpj_pending">Menunggu Penyusunan LPJ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kegiatan & Documents List Table */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
          <Receipt className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Belum ada kegiatan yang sesuai pencarian.</p>
          <p className="text-xs text-slate-400">Klik tombol "Buat Kegiatan & RAB Baru" untuk menambahkan dokumen baru.</p>
          <button
            onClick={() => {
              setEditingPengajuan(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kegiatan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Dokumen & Nama Kegiatan</th>
                  <th className="p-3.5">Penyelenggara</th>
                  <th className="p-3.5">Waktu & Tempat</th>
                  <th className="p-3.5 text-right">Pagu Anggaran</th>
                  <th className="p-3.5 text-center">Status LPJ</th>
                  <th className="p-3.5 text-center">Cetak Dokumen Resmi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const unit = data.unit.find((u) => u.id === item.unit_id);
                  const isLPJSelesai = item.status_lpj === 'selesai' || item.status === 'selesai_lpj';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Surat & Nama */}
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-slate-400 block">{item.nomor_surat}</span>
                        <span 
                          onClick={() => {
                            setSelectedPengajuan(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer block text-sm"
                        >
                          {item.nama_kegiatan}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Dibuat: {formatTanggalIndo(item.tanggal_pengajuan)}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="p-3.5">
                        <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 shadow-2xs">
                          <Building2 className="w-3 h-3 text-indigo-600" />
                          <span>{unit?.nama || 'Kesiswaan'}</span>
                        </span>
                      </td>

                      {/* Waktu & Lokasi */}
                      <td className="p-3.5">
                        <span className="text-slate-800 font-medium block">{item.waktu_pelaksanaan || '-'}</span>
                        <span className="text-[11px] text-slate-500 block">{item.tempat || '-'}</span>
                      </td>

                      {/* Total Anggaran */}
                      <td className="p-3.5 text-right">
                        <span className="font-black text-slate-900 text-sm block">{formatRupiah(item.total_anggaran)}</span>
                        {isLPJSelesai && item.total_realisasi && (
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            Realisasi: {formatRupiah(item.total_realisasi)}
                          </span>
                        )}
                      </td>

                      {/* Status LPJ */}
                      <td className="p-3.5 text-center">
                        {isLPJSelesai ? (
                          <button
                            onClick={() => {
                              setSelectedPengajuan(item);
                              setIsLPJFormOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold hover:bg-emerald-200 transition-colors cursor-pointer"
                            title="Klik untuk melihat/mengedit LPJ"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>LPJ Selesai</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedPengajuan(item);
                              setIsLPJFormOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Klik untuk input Laporan Pertanggungjawaban"
                          >
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Input LPJ</span>
                          </button>
                        )}
                      </td>

                      {/* 3 Cetak Buttons: Proposal, RAB, LPJ */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Cetak Proposal */}
                          <button
                            onClick={() => {
                              setSelectedPengajuan(item);
                              setIsPrintProposalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs"
                            title="Cetak Naskah Lengkap Proposal Kegiatan"
                          >
                            <FileText className="w-3 h-3 text-indigo-300" />
                            <span>Proposal</span>
                          </button>

                          {/* Cetak RAB */}
                          <button
                            onClick={() => {
                              setSelectedPengajuan(item);
                              setIsPrintRABOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs"
                            title="Cetak Rincian Rencana Anggaran Biaya (RAB)"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>RAB</span>
                          </button>

                          {/* Cetak LPJ */}
                          {isLPJSelesai ? (
                            <button
                              onClick={() => {
                                setSelectedPengajuan(item);
                                setIsPrintLPJOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs"
                              title="Cetak Laporan Pertanggungjawaban (LPJ)"
                            >
                              <ClipboardCheck className="w-3 h-3 text-emerald-200" />
                              <span>LPJ</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPengajuan(item);
                                setIsLPJFormOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              title="Belum disusun. Klik untuk input LPJ."
                            >
                              <Plus className="w-3 h-3" />
                              <span>LPJ</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Other Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail */}
                          <button
                            onClick={() => {
                              setSelectedPengajuan(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap Kegiatan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingPengajuan(item);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Dokumen Kegiatan & RAB"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kegiatan "${item.nama_kegiatan}"?`)) {
                                deletePengajuanAnggaran(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kegiatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Modals */}
      {/* 1. Modal Input / Edit Proposal & RAB */}
      {isFormModalOpen && (
        <AnggaranFormModal
          pengajuan={editingPengajuan}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingPengajuan(null);
          }}
          onOpenPrintRAB={(newPengajuan) => {
            setSelectedPengajuan(newPengajuan);
            setIsPrintRABOpen(true);
          }}
          onOpenPrintProposal={(newPengajuan) => {
            setSelectedPengajuan(newPengajuan);
            setIsPrintProposalOpen(true);
          }}
        />
      )}

      {/* 2. Modal Detail Lengkap */}
      {isDetailModalOpen && selectedPengajuan && (
        <AnggaranDetailModal
          pengajuan={selectedPengajuan}
          onClose={() => setIsDetailModalOpen(false)}
          onOpenPrintRAB={() => {
            setIsDetailModalOpen(false);
            setIsPrintRABOpen(true);
          }}
          onOpenPrintProposal={() => {
            setIsDetailModalOpen(false);
            setIsPrintProposalOpen(true);
          }}
          onOpenPrintLPJ={() => {
            setIsDetailModalOpen(false);
            setIsPrintLPJOpen(true);
          }}
          onOpenEdit={() => {
            setIsDetailModalOpen(false);
            setEditingPengajuan(selectedPengajuan);
            setIsFormModalOpen(true);
          }}
          onOpenLPJForm={() => {
            setIsDetailModalOpen(false);
            setIsLPJFormOpen(true);
          }}
        />
      )}

      {/* 3. Modal Cetak Proposal */}
      {isPrintProposalOpen && selectedPengajuan && (
        <CetakProposalModal
          pengajuan={selectedPengajuan}
          onClose={() => setIsPrintProposalOpen(false)}
        />
      )}

      {/* 4. Modal Cetak RAB */}
      {isPrintRABOpen && selectedPengajuan && (
        <CetakRABModal
          pengajuan={selectedPengajuan}
          onClose={() => setIsPrintRABOpen(false)}
        />
      )}

      {/* 5. Modal Cetak LPJ */}
      {isPrintLPJOpen && selectedPengajuan && (
        <CetakLPJModal
          pengajuan={selectedPengajuan}
          onClose={() => setIsPrintLPJOpen(false)}
        />
      )}

      {/* 6. Modal Input/Edit LPJ */}
      {isLPJFormOpen && selectedPengajuan && (
        <LaporanFormModal
          pengajuan={selectedPengajuan}
          onClose={() => setIsLPJFormOpen(false)}
          onOpenPrintLPJ={(savedPengajuan) => {
            setSelectedPengajuan(savedPengajuan);
            setIsPrintLPJOpen(true);
          }}
        />
      )}

      {/* 7. Modal Kelola Unit Organisasi */}
      {isUnitModalOpen && (
        <UnitManagerModal
          onClose={() => setIsUnitModalOpen(false)}
        />
      )}

    </div>
  );
};
