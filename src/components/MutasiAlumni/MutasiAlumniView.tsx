import React, { useState } from 'react';
import { Mutasi, Alumni } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTanggalIndo, getStatusMutasiBadge, getStatusAlumniBadge } from '../../utils/formatters';
import { MutasiFormModal } from './MutasiFormModal';
import { AlumniFormModal } from './AlumniFormModal';
import { 
  ArrowRightLeft, 
  GraduationCap, 
  Search, 
  Plus, 
  Building, 
  Briefcase, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Users,
  Building2,
  Compass
} from 'lucide-react';

export const MutasiAlumniView: React.FC = () => {
  const { data, deleteMutasi, deleteAlumni, saveMutasi, currentRole } = useApp();

  const [activeTab, setActiveTab] = useState<'mutasi' | 'alumni'>('mutasi');
  const [searchTerm, setSearchTerm] = useState('');

  // Mutasi filters
  const [mutasiJenisFilter, setMutasiJenisFilter] = useState<string>('semua');
  const [mutasiStatusFilter, setMutasiStatusFilter] = useState<string>('semua');

  // Alumni filters
  const [alumniStatusFilter, setAlumniStatusFilter] = useState<string>('semua');
  const [alumniTahunFilter, setAlumniTahunFilter] = useState<string>('semua');

  // Modals
  const [isMutasiModalOpen, setIsMutasiModalOpen] = useState(false);
  const [editingMutasi, setEditingMutasi] = useState<Mutasi | null>(null);

  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);

  // Filtered Mutasi
  const filteredMutasi = data.mutasi.filter((m) => {
    const siswa = data.siswa.find((s) => s.id === m.siswa_id);
    const searchLower = (searchTerm || '').toLowerCase();
    const noSurat = m.nomor_surat || m.no_surat_mutasi || '';
    const alasan = m.alasan || '';
    const asal = m.sekolah_asal || m.asal_sekolah || '';
    const tujuan = m.sekolah_tujuan || m.tujuan_sekolah || '';
    const namaSiswa = siswa?.nama_lengkap || '';
    const nisn = siswa?.nisn || '';

    const matchesSearch =
      noSurat.toLowerCase().includes(searchLower) ||
      alasan.toLowerCase().includes(searchLower) ||
      asal.toLowerCase().includes(searchLower) ||
      tujuan.toLowerCase().includes(searchLower) ||
      namaSiswa.toLowerCase().includes(searchLower) ||
      nisn.includes(searchTerm);

    const matchesJenis = mutasiJenisFilter === 'semua' || m.jenis === mutasiJenisFilter;
    const matchesStatus = mutasiStatusFilter === 'semua' || m.status === mutasiStatusFilter;

    return matchesSearch && matchesJenis && matchesStatus;
  });

  // Filtered Alumni
  const filteredAlumni = data.alumni.filter((a) => {
    const siswa = data.siswa.find((s) => s.id === a.siswa_id);
    const searchLower = (searchTerm || '').toLowerCase();
    const instansi = a.nama_instansi || a.detail_tujuan || '';
    const jurusan = a.jurusan_posisi || '';
    const catatan = a.catatan || '';
    const namaSiswa = siswa?.nama_lengkap || '';
    const nisn = siswa?.nisn || '';

    const matchesSearch =
      instansi.toLowerCase().includes(searchLower) ||
      jurusan.toLowerCase().includes(searchLower) ||
      catatan.toLowerCase().includes(searchLower) ||
      namaSiswa.toLowerCase().includes(searchLower) ||
      nisn.includes(searchTerm);

    const matchesStatus = alumniStatusFilter === 'semua' || a.status_setelah_lulus === alumniStatusFilter;
    const matchesTahun = alumniTahunFilter === 'semua' || String(a.tahun_lulus) === alumniTahunFilter;

    return matchesSearch && matchesStatus && matchesTahun;
  });

  // Alumni stats
  const totalSMA = data.alumni.filter((a) => a.status_setelah_lulus === 'sma' || a.status_setelah_lulus === 'kuliah').length;
  const totalSMK = data.alumni.filter((a) => a.status_setelah_lulus === 'smk').length;
  const totalPesantrenMA = data.alumni.filter((a) => a.status_setelah_lulus === 'pesantren' || a.status_setelah_lulus === 'ma').length;

  return (
    <div id="mutasi-alumni-view" className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {activeTab === 'mutasi' ? (
              <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            ) : (
              <GraduationCap className="w-6 h-6 text-blue-600" />
            )}
            <span>Layanan Mutasi Siswa & Tracer Study Alumni</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan perpindahan siswa (masuk/keluar), kelulusan peserta didik, dan pelacakan karir/studi alumni.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'mutasi' ? (
            <button
              id="btn-tambah-mutasi"
              onClick={() => {
                setEditingMutasi(null);
                setIsMutasiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Proses Mutasi Siswa</span>
            </button>
          ) : (
            <button
              id="btn-tambah-alumni"
              onClick={() => {
                setEditingAlumni(null);
                setIsAlumniModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Kelulusan / Alumni</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('mutasi')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 relative transition-colors ${
            activeTab === 'mutasi'
              ? 'text-amber-700 border-b-2 border-amber-600 -mb-[2px]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Mutasi Siswa ({data.mutasi.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alumni')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 relative transition-colors ${
            activeTab === 'alumni'
              ? 'text-blue-700 border-b-2 border-blue-600 -mb-[2px]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Tracer Study Alumni ({data.alumni.length})</span>
        </button>
      </div>

      {/* TAB 1: MUTASI SISWA */}
      {activeTab === 'mutasi' && (
        <div className="space-y-4">
          
          {/* Filter Bar Mutasi */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa, no. surat mutasi, sekolah asal/tujuan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={mutasiJenisFilter}
                  onChange={(e) => setMutasiJenisFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="semua">Semua Jenis Mutasi</option>
                  <option value="keluar">Mutasi Keluar (Pindah Sekolah)</option>
                  <option value="masuk">Mutasi Masuk (Siswa Baru Pindahan)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={mutasiStatusFilter}
                  onChange={(e) => setMutasiStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="semua">Semua Status</option>
                  <option value="disetujui">Disetujui Resmi</option>
                  <option value="diajukan">Diajukan / Proses</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mutasi Table */}
          {filteredMutasi.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada riwayat mutasi yang cocok.</p>
              <p className="text-xs text-slate-400">Klik "Proses Mutasi Siswa" untuk mencatat kepindahan.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">No. Surat & Siswa</th>
                      <th className="p-3.5">Jenis Mutasi</th>
                      <th className="p-3.5">Sekolah Asal / Tujuan</th>
                      <th className="p-3.5">Alasan Kepindahan</th>
                      <th className="p-3.5">Tanggal Efektif</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMutasi.map((item) => {
                      const siswa = data.siswa.find((s) => s.id === item.siswa_id);
                      const badge = getStatusMutasiBadge(item.status);
                      const noSurat = item.nomor_surat || item.no_surat_mutasi || '-';
                      const sekolahAsal = item.sekolah_asal || item.asal_sekolah || '-';
                      const sekolahTujuan = item.sekolah_tujuan || item.tujuan_sekolah || '-';
                      const fileSuratUrl = item.file_surat_url || item.file_surat;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono text-[11px] text-slate-400 block">{noSurat}</span>
                            <span className="font-bold text-slate-900 text-sm block">
                              {siswa?.nama_lengkap || 'Siswa Terkait'}
                            </span>
                            <span className="text-[11px] text-slate-500">NISN: {siswa?.nisn || '-'}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                item.jenis === 'keluar'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Mutasi {item.jenis}
                            </span>
                          </td>

                          <td className="p-3.5 font-medium text-slate-800">
                            {item.jenis === 'masuk' ? (
                              <span>Dari: <strong>{sekolahAsal}</strong></span>
                            ) : (
                              <span>Ke: <strong>{sekolahTujuan}</strong></span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600 max-w-xs truncate">
                            {item.alasan}
                          </td>

                          <td className="p-3.5 text-slate-700">
                            {formatTanggalIndo(item.tanggal_mutasi)}
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {fileSuratUrl && (
                                <a
                                  href={fileSuratUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Buka Surat Mutasi di Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setEditingMutasi(item);
                                  setIsMutasiModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                title="Edit Mutasi"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus catatan mutasi ${siswa?.nama_lengkap}?`)) {
                                    deleteMutasi(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Hapus Mutasi"
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
      )}

      {/* TAB 2: ALUMNI & TRACER STUDY */}
      {activeTab === 'alumni' && (
        <div className="space-y-6">
          
          {/* Alumni KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Melanjutkan SMA Negeri / Swasta</span>
                <span className="text-xl font-black text-slate-900">{totalSMA} Alumni</span>
                <span className="text-[10px] text-blue-600 font-semibold block">Sekolah Menengah Atas</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Melanjutkan SMK (Kejuruan)</span>
                <span className="text-xl font-black text-slate-900">{totalSMK} Alumni</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Sekolah Menengah Kejuruan</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Pondok Pesantren & MA</span>
                <span className="text-xl font-black text-slate-900">{totalPesantrenMA} Alumni</span>
                <span className="text-[10px] text-indigo-600 font-semibold block">Pesantren / Madrasah Aliyah</span>
              </div>
            </div>
          </div>

          {/* Filter Bar Alumni */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama alumni, sekolah lanjutan, jurusan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={alumniStatusFilter}
                  onChange={(e) => setAlumniStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="semua">Semua Pilihan Lanjutan</option>
                  <option value="sma">Lanjut SMA</option>
                  <option value="smk">Lanjut SMK</option>
                  <option value="ma">Lanjut MA</option>
                  <option value="pesantren">Pondok Pesantren</option>
                  <option value="kerja">Bekerja / Magang</option>
                  <option value="wirausaha">Wirausaha</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={alumniTahunFilter}
                  onChange={(e) => setAlumniTahunFilter(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="semua">Semua Angkatan Kelulusan</option>
                  <option value="2025">Lulusan 2025</option>
                  <option value="2024">Lulusan 2024</option>
                  <option value="2023">Lulusan 2023</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alumni Grid / Cards */}
          {filteredAlumni.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Belum ada data tracer study alumni yang sesuai.</p>
              <p className="text-xs text-slate-400">Klik "Daftarkan Kelulusan / Alumni" untuk menambahkan tracer study.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAlumni.map((alumni) => {
                const siswa = data.siswa.find((s) => s.id === alumni.siswa_id);
                const badge = getStatusAlumniBadge(alumni.status_setelah_lulus);

                return (
                  <div
                    key={alumni.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          Angkatan {alumni.tahun_lulus}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={siswa?.foto}
                            alt={siswa?.nama_lengkap}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{siswa?.nama_lengkap}</h4>
                          <p className="text-xs text-slate-500">NISN: {siswa?.nisn || '-'}</p>
                        </div>
                      </div>

                      {/* Current Destination */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          <span>{alumni.nama_instansi || 'Belum diisi'}</span>
                        </p>
                        <p className="text-slate-600 pl-4">{alumni.jurusan_posisi || '-'}</p>
                        {alumni.alamat_terbaru && (
                          <p className="text-[11px] text-slate-400 pl-4">Domisili: {alumni.alamat_terbaru}</p>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-xs text-slate-600">
                        {alumni.no_hp_terbaru && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{alumni.no_hp_terbaru}</span>
                          </div>
                        )}
                        {alumni.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span className="truncate">{alumni.email}</span>
                          </div>
                        )}
                      </div>

                      {alumni.catatan && (
                        <p className="text-[11px] text-slate-500 italic">"{alumni.catatan}"</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingAlumni(alumni);
                          setIsAlumniModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Tracer Study"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data alumni ${siswa?.nama_lengkap}?`)) {
                            deleteAlumni(alumni.id);
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus Alumni"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modals */}
      {isMutasiModalOpen && (
        <MutasiFormModal
          mutasi={editingMutasi}
          onClose={() => {
            setIsMutasiModalOpen(false);
            setEditingMutasi(null);
          }}
        />
      )}

      {isAlumniModalOpen && (
        <AlumniFormModal
          alumni={editingAlumni}
          onClose={() => {
            setIsAlumniModalOpen(false);
            setEditingAlumni(null);
          }}
        />
      )}

    </div>
  );
};
