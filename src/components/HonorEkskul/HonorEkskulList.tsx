import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PengajuanHonorEkskul } from '../../types';
import { formatRupiah, formatTanggalIndo, getStatusHonorBadge } from '../../utils/formatters';
import { HonorEkskulFormModal } from './HonorEkskulFormModal';
import { CetakHonorEkskulModal } from './CetakHonorEkskulModal';
import { HonorEkskulDetailModal } from './HonorEkskulDetailModal';
import { 
  Banknote, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  Layers, 
  Calendar, 
  Calculator,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

export const HonorEkskulList: React.FC = () => {
  const { data, deletePengajuanHonorEkskul } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('semua');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPengajuan, setEditingPengajuan] = useState<PengajuanHonorEkskul | null>(null);
  const [selectedPengajuanForDetail, setSelectedPengajuanForDetail] = useState<PengajuanHonorEkskul | null>(null);
  const [selectedPengajuanForPrint, setSelectedPengajuanForPrint] = useState<PengajuanHonorEkskul | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const pengajuanList = useApp().data.pengajuan_honor_ekskul || [];

  // Filtered List
  const filteredList = useMemo(() => {
    return pengajuanList.filter((p) => {
      // Search matches
      const query = searchTerm.toLowerCase();
      const matchNomor = p.nomor_surat.toLowerCase().includes(query);
      const matchPeriode = `${p.bulan_mulai} ${p.bulan_selesai}`.toLowerCase().includes(query);
      const matchKeterangan = (p.keterangan || '').toLowerCase().includes(query);
      const matchItems = (p.items || []).some(
        (i) =>
          i.nama_ekstrakurikuler.toLowerCase().includes(query) ||
          i.nama_pembina_pelatih.toLowerCase().includes(query)
      );

      const matchesSearch = !searchTerm || matchNomor || matchPeriode || matchKeterangan || matchItems;

      // Status match
      const matchesStatus = filterStatus === 'semua' || p.status === filterStatus;

      // Tahun match
      const matchesTahun = filterTahun === 'semua' || p.tahun_ajaran === filterTahun;

      return matchesSearch && matchesStatus && matchesTahun;
    });
  }, [pengajuanList, searchTerm, filterStatus, filterTahun]);

  // Overall Aggregate Statistics
  const totalPengajuan = pengajuanList.length;
  const totalHonorSemua = pengajuanList.reduce((sum, p) => sum + (p.total_honor_dibayarkan || 0), 0);
  const totalPertemuanSemua = pengajuanList.reduce((sum, p) => sum + (p.total_pertemuan_semua || 0), 0);
  const totalEkskulUnik = useMemo(() => {
    const ekskulSet = new Set<string>();
    pengajuanList.forEach((p) => {
      (p.items || []).forEach((i) => ekskulSet.add(i.nama_ekstrakurikuler));
    });
    return ekskulSet.size;
  }, [pengajuanList]);

  // Available school years for filtering
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    pengajuanList.forEach((p) => {
      if (p.tahun_ajaran) years.add(p.tahun_ajaran);
    });
    return Array.from(years);
  }, [pengajuanList]);

  const handleOpenCreate = () => {
    setEditingPengajuan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: PengajuanHonorEkskul) => {
    setEditingPengajuan(p);
    setIsFormOpen(true);
    setSelectedPengajuanForDetail(null);
  };

  const handleDelete = (id: number) => {
    deletePengajuanHonorEkskul(id);
    setDeleteConfirmId(null);
    setSelectedPengajuanForDetail(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* List Container (Hidden during print) */}
      <div className="space-y-6 print-hide-when-modal print:hidden">
        {/* Top Header & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Banknote className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Pengajuan Honor Pembina & Pelatih Ekstrakurikuler
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan formulir pengajuan honorarium, perhitungan pertemuan otomatis, dan cetak SPJ resmi SMP Negeri 2 Pulung
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Honor Baru</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Pengajuan</span>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalPengajuan} Berkas</h3>
            <span className="text-[11px] text-slate-400">Dokumen Honorarium</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Ekskul Dibina</span>
            <h3 className="text-2xl font-black text-indigo-600 mt-0.5">{totalEkskulUnik || 5} Ekskul</h3>
            <span className="text-[11px] text-slate-400">Unit Ekstrakurikuler Aktif</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Akumulasi Pertemuan</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{totalPertemuanSemua} Kali</h3>
            <span className="text-[11px] text-slate-400">Total Pertemuan Latihan</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-100 uppercase tracking-wider">Total Honor Dibayarkan</span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono">
              {formatRupiah(totalHonorSemua)}
            </h3>
            <span className="text-[11px] text-amber-100/80">Kalkulasi Otomatis BOS</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
            <Calculator className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nomor surat, periode bulan, nama ekskul, atau pembina..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-700 text-xs cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="disetujui">Disetujui Kepsek</option>
              <option value="dicairkan">Dicairkan</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-700 text-xs cursor-pointer"
            >
              <option value="semua">Semua TP</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>TP {yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada data pengajuan honor</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada berkas pengajuan honor ekstrakurikuler yang sesuai dengan filter pencarian.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengajuan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[200px]">Dokumen Pengajuan</th>
                  <th className="py-3 px-4 min-w-[160px]">Periode Bulan</th>
                  <th className="py-3 px-4 min-w-[220px]">Rincian Ekskul</th>
                  <th className="py-3 px-4 w-28 text-center">Pertemuan</th>
                  <th className="py-3 px-4 w-36 text-right">Total Honor Dibayarkan</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-40 text-center">Aksi & Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => {
                  const statusBadge = getStatusHonorBadge(item.status);
                  const itemsList = item.items || [];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">
                          {item.nomor_surat}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                          {item.keterangan || item.sumber_dana}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Tgl: {formatTanggalIndo(item.tanggal_pengajuan)} • TP {item.tahun_ajaran}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{item.bulan_mulai}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pl-5">
                          s.d. {item.bulan_selesai}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {itemsList.slice(0, 3).map((ekskul, eIdx) => (
                            <span 
                              key={eIdx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                              title={`${ekskul.nama_ekstrakurikuler} (${ekskul.nama_pembina_pelatih})`}
                            >
                              {ekskul.nama_ekstrakurikuler.split(' ')[0]}
                            </span>
                          ))}
                          {itemsList.length > 3 && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold">
                              +{itemsList.length - 3} lainnya
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {itemsList.length} pembina & pelatih terdaftar
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                          {item.total_pertemuan_semua || itemsList.reduce((s, i) => s + i.jumlah_pertemuan, 0)} kali
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-amber-600 font-mono text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 block">
                          {formatRupiah(item.total_honor_dibayarkan)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedPengajuanForDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Rincian Pengajuan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedPengajuanForPrint(item)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak SPJ / Slip PDF Resmi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Pengajuan Honor"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pengajuan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Modals */}
      {isFormOpen && (
        <HonorEkskulFormModal
          pengajuan={editingPengajuan}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPengajuan(null);
          }}
        />
      )}

      {selectedPengajuanForDetail && (
        <HonorEkskulDetailModal
          pengajuan={selectedPengajuanForDetail}
          onClose={() => setSelectedPengajuanForDetail(null)}
          onEdit={() => handleOpenEdit(selectedPengajuanForDetail)}
          onPrint={() => {
            setSelectedPengajuanForPrint(selectedPengajuanForDetail);
            setSelectedPengajuanForDetail(null);
          }}
          onDelete={() => handleDelete(selectedPengajuanForDetail.id)}
        />
      )}

      {selectedPengajuanForPrint && (
        <CetakHonorEkskulModal
          pengajuan={selectedPengajuanForPrint}
          onClose={() => setSelectedPengajuanForPrint(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800">Hapus Berkas Pengajuan Honor?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus dokumen pengajuan beserta seluruh rincian honor ekstrakurikuler di dalamnya.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
