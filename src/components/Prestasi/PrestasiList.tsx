import React, { useState } from 'react';
import { Prestasi } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTanggalIndo, getTingkatPrestasiBadge } from '../../utils/formatters';
import { PrestasiFormModal } from './PrestasiFormModal';
import { 
  Trophy, 
  Search, 
  Plus, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  Star,
  Medal,
  Sparkles
} from 'lucide-react';

export const PrestasiList: React.FC = () => {
  const { data, savePrestasi, deletePrestasi, currentRole, currentGuru } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('semua');
  const [tingkatFilter, setTingkatFilter] = useState<string>('semua');
  const [verifikasiFilter, setVerifikasiFilter] = useState<string>('semua');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);

  const filteredList = data.prestasi.filter((item) => {
    const siswa = data.siswa.find((s) => s.id === item.siswa_id);
    const searchLower = (searchTerm || '').toLowerCase();
    const namaKegiatan = item.nama_prestasi || item.nama_kegiatan || '';
    const peringkat = item.peringkat || '';
    const penyelenggara = item.penyelenggara || '';
    const namaSiswa = siswa?.nama_lengkap || '';
    const nisn = siswa?.nisn || '';

    const matchesSearch =
      namaKegiatan.toLowerCase().includes(searchLower) ||
      peringkat.toLowerCase().includes(searchLower) ||
      penyelenggara.toLowerCase().includes(searchLower) ||
      namaSiswa.toLowerCase().includes(searchLower) ||
      nisn.includes(searchTerm);

    const matchesJenis = jenisFilter === 'semua' || item.jenis === jenisFilter;
    const matchesTingkat = tingkatFilter === 'semua' || item.tingkat === tingkatFilter;
    const matchesVerifikasi = verifikasiFilter === 'semua' || item.status_verifikasi === verifikasiFilter;

    return matchesSearch && matchesJenis && matchesTingkat && matchesVerifikasi;
  });

  const totalNasional = data.prestasi.filter((p) => p.tingkat === 'nasional' || p.tingkat === 'internasional').length;
  const totalProvinsi = data.prestasi.filter((p) => p.tingkat === 'provinsi').length;
  const totalKota = data.prestasi.filter((p) => p.tingkat === 'kabupaten_kota').length;

  const canVerify = currentRole === 'Admin/TU' || currentRole === 'Waka Kesiswaan' || currentRole === 'Kepala Sekolah';

  const toggleVerify = (prestasi: Prestasi) => {
    savePrestasi({
      ...prestasi,
      status_verifikasi: prestasi.status_verifikasi === 'terverifikasi' ? 'menunggu' : 'terverifikasi',
    });
  };

  return (
    <div id="prestasi-list-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Pencatatan Prestasi & Rekam Jejak Siswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi rekam jejak juara akademik dan non-akademik dari tingkat sekolah hingga internasional.
          </p>
        </div>

        <button
          id="btn-tambah-prestasi"
          onClick={() => {
            setEditingPrestasi(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Prestasi Baru</span>
        </button>
      </div>

      {/* KPI Highlight Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-800 block">Nasional & Internasional</span>
            <span className="text-xl font-black text-amber-950">{totalNasional} Kejuaraan</span>
            <span className="text-[10px] text-amber-700 block">Tingkat Tertinggi</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Medal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-blue-800 block">Tingkat Provinsi</span>
            <span className="text-xl font-black text-blue-950">{totalProvinsi} Kejuaraan</span>
            <span className="text-[10px] text-blue-700 block">DKI Jakarta</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 block">Total Prestasi Tercatat</span>
            <span className="text-xl font-black text-emerald-950">{data.prestasi.length} Piagam</span>
            <span className="text-[10px] text-emerald-700 block">Tersimpan di Sistem</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setJenisFilter('semua')}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            jenisFilter === 'semua'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Bidang ({data.prestasi.length})
        </button>
        <button
          onClick={() => setJenisFilter('akademik')}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            jenisFilter === 'akademik'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          Akademik (OSN / Lomba Ilmiah)
        </button>
        <button
          onClick={() => setJenisFilter('non-akademik')}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            jenisFilter === 'non-akademik'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          Non-Akademik (Olah Raga / Seni / Ekskul)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, nama lomba/kejuaraan, atau penyelenggara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={tingkatFilter}
              onChange={(e) => setTingkatFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="semua">Semua Jenjang Tingkat</option>
              <option value="internasional">Internasional</option>
              <option value="nasional">Nasional</option>
              <option value="provinsi">Provinsi</option>
              <option value="kabupaten_kota">Kabupaten / Kota</option>
              <option value="kecamatan">Kecamatan</option>
              <option value="sekolah">Sekolah</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={verifikasiFilter}
              onChange={(e) => setVerifikasiFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="semua">Semua Status Verifikasi</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="menunggu">Menunggu Verifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prestasi Grid Cards */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
          <Trophy className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Belum ada data prestasi yang cocok.</p>
          <p className="text-xs text-slate-400">Klik "Catat Prestasi Baru" untuk menambahkan piagam kejuaraan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const siswa = data.siswa.find((s) => s.id === item.siswa_id);
            const kelas = data.kelas.find((k) => k.id === siswa?.kelas_id);
            const pembimbing = data.guru.find((g) => g.id === item.guru_pembimbing_id);
            const tingkatBadge = getTingkatPrestasiBadge(item.tingkat);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${tingkatBadge.bg}`}>
                        {tingkatBadge.label}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                        {item.jenis}
                      </span>
                    </div>

                    <span
                      onClick={() => canVerify && toggleVerify(item)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border cursor-pointer transition-colors ${
                        item.status_verifikasi === 'terverifikasi'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                      }`}
                      title={canVerify ? 'Klik untuk ubah status verifikasi' : ''}
                    >
                      {item.status_verifikasi === 'terverifikasi' ? '✓ Terverifikasi' : '⏳ Menunggu'}
                    </span>
                  </div>

                  {/* Title & Rank */}
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-600 font-black text-sm">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>{item.peringkat}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">
                      {item.nama_prestasi || item.nama_kegiatan}
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">Penyelenggara: {item.penyelenggara}</p>
                  </div>

                  {/* Siswa Card snippet */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <img
                        src={siswa?.foto}
                        alt={siswa?.nama_lengkap}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold text-slate-900 truncate">{siswa?.nama_lengkap || 'Nama Siswa'}</p>
                      <p className="text-slate-500 text-[11px]">
                        Kelas: {kelas?.nama || '-'} • Pembimbing: {pembimbing?.nama.split(',')[0] || '-'}
                      </p>
                    </div>
                  </div>

                  {item.catatan && (
                    <p className="text-[11px] text-slate-500 italic">"{item.catatan}"</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    {formatTanggalIndo(item.tanggal_perolehan)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.sertifikat_url ? (
                      <a
                        href={item.sertifikat_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Sertifikat</span>
                      </a>
                    ) : null}

                    <button
                      onClick={() => {
                        setEditingPrestasi(item);
                        setIsFormModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                      title="Edit Data Prestasi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus prestasi "${item.nama_prestasi}" milik ${siswa?.nama_lengkap}?`)) {
                          deletePrestasi(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Hapus Prestasi"
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

      {/* Modal */}
      {isFormModalOpen && (
        <PrestasiFormModal
          prestasi={editingPrestasi}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingPrestasi(null);
          }}
        />
      )}

    </div>
  );
};
