import React, { useState } from 'react';
import { Siswa } from '../../types';
import { useApp } from '../../context/AppContext';
import { getStatusSiswaBadge, formatTanggalIndo } from '../../utils/formatters';
import { SiswaDetailModal } from './SiswaDetailModal';
import { SiswaFormModal } from './SiswaFormModal';
import { KelolaKelasModal } from './KelolaKelasModal';
import { CetakBiodataModal } from './CetakBiodataModal';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  GraduationCap, 
  Phone,
  LayoutGrid,
  List,
  Printer
} from 'lucide-react';

interface SiswaListProps {
  onOpenMutasiModalWithSiswa?: (siswa: Siswa) => void;
  onOpenAlumniModalWithSiswa?: (siswa: Siswa) => void;
}

export const SiswaList: React.FC<SiswaListProps> = ({ 
  onOpenMutasiModalWithSiswa,
  onOpenAlumniModalWithSiswa
}) => {
  const { data, deleteSiswa, currentRole } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [kelasFilter, setKelasFilter] = useState<string>('semua');
  const [jkFilter, setJkFilter] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [selectedDetailSiswa, setSelectedDetailSiswa] = useState<Siswa | null>(null);
  const [selectedSiswaForPrint, setSelectedSiswaForPrint] = useState<Siswa | null>(null);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);

  // Filtered dataset
  const filteredSiswa = data.siswa.filter((siswa) => {
    const searchLower = (searchTerm || '').toLowerCase();
    const nama = siswa.nama_lengkap || '';
    const nisn = siswa.nisn || '';
    const nis = siswa.nis || '';
    const alamat = siswa.alamat || '';
    const tempatLahir = siswa.tempat_lahir || '';

    const matchesSearch = 
      nama.toLowerCase().includes(searchLower) ||
      nisn.includes(searchTerm) ||
      nis.includes(searchTerm) ||
      alamat.toLowerCase().includes(searchLower) ||
      tempatLahir.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'semua' || siswa.status === statusFilter;
    const matchesKelas = kelasFilter === 'semua' || String(siswa.kelas_id) === kelasFilter;
    const matchesJk = jkFilter === 'semua' || siswa.jenis_kelamin === jkFilter;

    return matchesSearch && matchesStatus && matchesKelas && matchesJk;
  });

  const totalAktif = data.siswa.filter((s) => s.status === 'aktif').length;
  const totalLulus = data.siswa.filter((s) => s.status === 'lulus').length;
  const totalPindah = data.siswa.filter((s) => s.status === 'pindah').length;

  return (
    <div id="siswa-list-view" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Data Induk Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen lengkap biodata siswa, orang tua/wali, riwayat kelas, dan berkas pendukung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-kelola-kelas"
            onClick={() => setIsKelasModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Kelola Kelas</span>
          </button>
          
          <button
            id="btn-tambah-siswa"
            onClick={() => {
              setEditingSiswa(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Pill counters */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setStatusFilter('semua')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            statusFilter === 'semua'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({data.siswa.length})
        </button>
        <button
          onClick={() => setStatusFilter('aktif')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            statusFilter === 'aktif'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Aktif ({totalAktif})
        </button>
        <button
          onClick={() => setStatusFilter('lulus')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            statusFilter === 'lulus'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          Lulus / Alumni ({totalLulus})
        </button>
        <button
          onClick={() => setStatusFilter('pindah')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            statusFilter === 'pindah'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          Mutasi Keluar ({totalPindah})
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NISN, NIS, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Kelas */}
          <div className="sm:col-span-3">
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Rombel / Kelas</option>
              {data.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.tingkat})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div className="sm:col-span-2">
            <select
              value={jkFilter}
              onChange={(e) => setJkFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Gender</option>
              <option value="L">Laki-Laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border ${
                viewMode === 'table' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border ${
                viewMode === 'grid' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {filteredSiswa.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
          <Users className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Tidak ada data siswa yang cocok dengan filter.</p>
          <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau reset filter.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Foto & Siswa</th>
                  <th className="p-3.5">NISN / NIS</th>
                  <th className="p-3.5">Kelas & Wali</th>
                  <th className="p-3.5">Jenis Kelamin</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.map((siswa) => {
                  const kelas = data.kelas.find((k) => k.id === siswa.kelas_id);
                  const wali = data.guru.find((g) => g.id === kelas?.wali_kelas_id);
                  const badge = getStatusSiswaBadge(siswa.status);
                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Foto & Nama */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={siswa.foto}
                              alt={siswa.nama_lengkap}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <span 
                              onClick={() => setSelectedDetailSiswa(siswa)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block"
                            >
                              {siswa.nama_lengkap}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {siswa.tempat_lahir ? `${siswa.tempat_lahir}, ` : ''}{formatTanggalIndo(siswa.tanggal_lahir)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NISN / NIS */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{siswa.nisn || '-'}</span>
                        <span className="text-[11px] text-slate-500 block">NIS: {siswa.nis || '-'}</span>
                      </td>

                      {/* Kelas */}
                      <td className="p-3.5">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {kelas?.nama || '-'}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Wali: {wali?.nama.split(',')[0] || '-'}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="p-3.5">
                        <span className={`font-semibold ${siswa.jenis_kelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                          {siswa.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Kontak */}
                      <td className="p-3.5 text-slate-600">
                        {siswa.no_hp ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {siswa.no_hp}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedSiswaForPrint(siswa)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Lembar Buku Induk / Biodata Siswa (PDF)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDetailSiswa(siswa)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Biodata Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSiswa(siswa);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data siswa ${siswa.nama_lengkap}?`)) {
                                deleteSiswa(siswa.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSiswa.map((siswa) => {
            const kelas = data.kelas.find((k) => k.id === siswa.kelas_id);
            const badge = getStatusSiswaBadge(siswa.status);
            return (
              <div
                key={siswa.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={siswa.foto}
                      alt={siswa.nama_lengkap}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {kelas?.nama || '-'}
                      </span>
                    </div>
                    <h4 
                      onClick={() => setSelectedDetailSiswa(siswa)}
                      className="font-bold text-slate-900 text-sm mt-1 truncate hover:text-blue-600 cursor-pointer"
                    >
                      {siswa.nama_lengkap}
                    </h4>
                    <p className="text-xs text-slate-500">NISN: {siswa.nisn || '-'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">JK: <strong>{siswa.jenis_kelamin}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedSiswaForPrint(siswa)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Cetak Biodata (PDF)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedDetailSiswa(siswa)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setEditingSiswa(siswa);
                        setIsFormModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedDetailSiswa && (
        <SiswaDetailModal
          siswa={selectedDetailSiswa}
          onClose={() => setSelectedDetailSiswa(null)}
          onEdit={(s) => {
            setSelectedDetailSiswa(null);
            setEditingSiswa(s);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {selectedSiswaForPrint && (
        <CetakBiodataModal
          siswa={selectedSiswaForPrint}
          onClose={() => setSelectedSiswaForPrint(null)}
        />
      )}

      {isFormModalOpen && (
        <SiswaFormModal
          siswa={editingSiswa}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingSiswa(null);
          }}
        />
      )}

      {isKelasModalOpen && (
        <KelolaKelasModal onClose={() => setIsKelasModalOpen(false)} />
      )}

    </div>
  );
};
