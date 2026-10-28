import React, { useState } from 'react';
import { DokumenAdministrasi } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTanggalIndo, getStatusDokumenBadge } from '../../utils/formatters';
import { DokumenFormModal } from './DokumenFormModal';
import { UnitManagerModal } from './UnitManagerModal';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Building2, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  GitBranch, 
  CheckCircle2, 
  FileText, 
  Download,
  Filter
} from 'lucide-react';

export const DokumenList: React.FC = () => {
  const { data, saveDokumenAdministrasi, deleteDokumenAdministrasi, currentRole, currentGuru } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('semua');
  const [unitFilter, setUnitFilter] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingDokumen, setEditingDokumen] = useState<DokumenAdministrasi | null>(null);
  const [revisionDokumen, setRevisionDokumen] = useState<DokumenAdministrasi | null>(null);

  const filteredDokumen = data.dokumen_administrasi.filter((dok) => {
    const searchLower = (searchTerm || '').toLowerCase();
    const judul = dok.judul || '';
    const subKategori = dok.sub_kategori || '';
    const catatan = dok.catatan || '';

    const matchesSearch =
      judul.toLowerCase().includes(searchLower) ||
      subKategori.toLowerCase().includes(searchLower) ||
      catatan.toLowerCase().includes(searchLower);

    const matchesKategori = kategoriFilter === 'semua' || dok.kategori === kategoriFilter;
    const matchesUnit = unitFilter === 'semua' || String(dok.unit_id) === unitFilter;
    const matchesStatus = statusFilter === 'semua' || dok.status === statusFilter;

    return matchesSearch && matchesKategori && matchesUnit && matchesStatus;
  });

  const canApprove = currentRole === 'Admin/TU' || currentRole === 'Waka Kesiswaan' || currentRole === 'Kepala Sekolah';

  const handleQuickApprove = (dok: DokumenAdministrasi) => {
    saveDokumenAdministrasi({
      ...dok,
      status: 'disetujui',
      catatan: `Disetujui oleh ${currentGuru.nama} (${currentRole}) pada ${new Date().toLocaleDateString('id-ID')}`,
    });
  };

  return (
    <div id="dokumen-list-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <span>Administrasi Dokumen Kesiswaan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan Program Kerja Tahunan, Administrasi OSIS/MPK, dan Dokumen Ekstrakurikuler dengan riwayat versi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-kelola-unit"
            onClick={() => setIsUnitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Kelola Unit & Ekskul</span>
          </button>
          
          <button
            id="btn-tambah-dokumen"
            onClick={() => {
              setEditingDokumen(null);
              setRevisionDokumen(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Dokumen</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Kategori */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setKategoriFilter('semua')}
          className={`px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
            kategoriFilter === 'semua'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Kategori ({data.dokumen_administrasi.length})
        </button>
        <button
          onClick={() => setKategoriFilter('program_kerja')}
          className={`px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
            kategoriFilter === 'program_kerja'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          Program Kerja Tahunan
        </button>
        <button
          onClick={() => setKategoriFilter('osis')}
          className={`px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
            kategoriFilter === 'osis'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          Administrasi OSIS & MPK
        </button>
        <button
          onClick={() => setKategoriFilter('ekskul')}
          className={`px-3.5 py-1.5 rounded-lg border font-semibold transition-colors ${
            kategoriFilter === 'ekskul'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Administrasi Ekstrakurikuler
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul berkas, sub-kategori, atau catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="semua">Semua Status Dokumen</option>
              <option value="draft">Draft</option>
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="diarsipkan">Diarsipkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid / Table */}
      {filteredDokumen.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Belum ada dokumen yang sesuai.</p>
          <p className="text-xs text-slate-400">Silakan klik "Unggah Dokumen" untuk menambahkan berkas baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDokumen.map((dok) => {
            const unit = data.unit.find((u) => u.id === dok.unit_id);
            const pj = data.guru.find((g) => g.id === dok.penanggung_jawab_id);
            const badge = getStatusDokumenBadge(dok.status);

            return (
              <div
                key={dok.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {dok.kategori.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Versi {dok.versi}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{dok.judul}</h3>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">{dok.sub_kategori}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                    <p>Unit: <strong className="text-slate-900">{unit?.nama || 'OSIS'}</strong></p>
                    <p>Penanggung Jawab: <strong className="text-slate-900">{pj?.nama || 'Guru'}</strong></p>
                    <p className="text-[11px] text-slate-500">
                      Tahun Ajaran: {dok.tahun_ajaran} • Diunggah: {formatTanggalIndo(dok.tanggal_upload)}
                    </p>
                    {dok.catatan && (
                      <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200 mt-1">
                        "{dok.catatan}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {dok.file_path && (
                      <a
                        href={dok.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Drive</span>
                      </a>
                    )}
                    
                    <button
                      onClick={() => {
                        setRevisionDokumen(dok);
                        setEditingDokumen(null);
                        setIsFormModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      title="Unggah Revisi Dokumen Baru (Versi Naik)"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-amber-600" />
                      <span>Revisi (v{dok.versi + 1})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {canApprove && dok.status !== 'disetujui' && (
                      <button
                        onClick={() => handleQuickApprove(dok)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold"
                        title="Setujui Dokumen Ini"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        Setujui
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingDokumen(dok);
                        setRevisionDokumen(null);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                      title="Edit Dokumen"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus dokumen "${dok.judul}"?`)) {
                          deleteDokumenAdministrasi(dok.id);
                        }
                      }}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isFormModalOpen && (
        <DokumenFormModal
          dokumen={revisionDokumen || editingDokumen}
          isRevisionMode={!!revisionDokumen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingDokumen(null);
            setRevisionDokumen(null);
          }}
        />
      )}

      {isUnitModalOpen && (
        <UnitManagerModal onClose={() => setIsUnitModalOpen(false)} />
      )}

    </div>
  );
};
