import React, { useState } from 'react';
import { Siswa, DokumenSiswa } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTanggalIndo, getStatusSiswaBadge } from '../../utils/formatters';
import { uploadFileToDrive } from '../../services/gasApi';
import { CetakBiodataModal } from './CetakBiodataModal';
import { 
  X, 
  User, 
  Users, 
  History, 
  FileText, 
  Upload, 
  ExternalLink, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';

interface SiswaDetailModalProps {
  siswa: Siswa;
  onClose: () => void;
  onEdit: (siswa: Siswa) => void;
}

export const SiswaDetailModal: React.FC<SiswaDetailModalProps> = ({ siswa, onClose, onEdit }) => {
  const { data, addDokumenSiswa, deleteDokumenSiswa, gasConfig, currentRole } = useApp();
  const [activeTab, setActiveTab] = useState<'biodata' | 'ortu' | 'riwayat' | 'dokumen' | 'prestasi'>('biodata');
  
  // Upload state for Dokumen Siswa
  const [uploadJenis, setUploadJenis] = useState<DokumenSiswa['jenis_dokumen']>('kartu_keluarga');
  const [uploadJudul, setUploadJudul] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPrintBiodataOpen, setIsPrintBiodataOpen] = useState(false);

  const kelas = data.kelas.find((k) => k.id === siswa.kelas_id);
  const waliKelas = data.guru.find((g) => g.id === kelas?.wali_kelas_id);
  const ortuList = data.orang_tua_wali.filter((o) => o.siswa_id === siswa.id);
  const riwayatList = data.riwayat_kelas.filter((r) => r.siswa_id === siswa.id);
  const dokumenList = data.dokumen_siswa.filter((d) => d.siswa_id === siswa.id);
  const prestasiList = data.prestasi.filter((p) => p.siswa_id === siswa.id);

  const badge = getStatusSiswaBadge(siswa.status);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Dokumen_Siswa');
      addDokumenSiswa({
        siswa_id: siswa.id,
        jenis_dokumen: uploadJenis,
        judul: uploadJudul.trim() || file.name,
        file_path: result.fileUrl,
        tanggal_upload: new Date().toISOString().split('T')[0],
      });
      setUploadJudul('');
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700">
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
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">{siswa.nama_lengkap}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NISN: {siswa.nisn || '-'} • NIS: {siswa.nis || '-'} • Kelas: {kelas?.nama || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintBiodataOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer shadow-2xs"
              title="Cetak Lembar Buku Induk / Biodata Resmi Siswa (PDF)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Cetak Biodata (PDF)</span>
            </button>
            <button
              onClick={() => onEdit(siswa)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              Edit Data
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'biodata' ? 'border-blue-600 text-blue-600 font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Biodata Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('ortu')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'ortu' ? 'border-blue-600 text-blue-600 font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Orang Tua / Wali ({ortuList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'riwayat' ? 'border-blue-600 text-blue-600 font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Kelas ({riwayatList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dokumen')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'dokumen' ? 'border-blue-600 text-blue-600 font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen ({dokumenList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('prestasi')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'prestasi' ? 'border-blue-600 text-blue-600 font-bold bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Prestasi ({prestasiList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* TAB 1: BIODATA */}
          {activeTab === 'biodata' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Nama Lengkap</span>
                  <p className="font-bold text-slate-900">{siswa.nama_lengkap}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Jenis Kelamin</span>
                  <p className="font-bold text-slate-900">{siswa.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">NISN / NIS</span>
                  <p className="font-bold text-slate-900">{siswa.nisn || '-'} / {siswa.nis || '-'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Tempat, Tanggal Lahir</span>
                  <p className="font-bold text-slate-900">
                    {siswa.tempat_lahir ? `${siswa.tempat_lahir}, ` : ''}{formatTanggalIndo(siswa.tanggal_lahir)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Agama</span>
                  <p className="font-bold text-slate-900">{siswa.agama || '-'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">No. WhatsApp / HP Siswa</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {siswa.no_hp || '-'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Alamat Domisili</span>
                  <p className="font-medium text-slate-800 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    {siswa.alamat || '-'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase">Kelas Saat Ini & Wali Kelas</span>
                  <p className="font-bold text-blue-950">
                    {kelas?.nama || '-'} ({kelas?.tahun_ajaran || '2025/2026'}) — Wali: {waliKelas?.nama || 'Belum Ditentukan'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORANG TUA / WALI */}
          {activeTab === 'ortu' && (
            <div className="space-y-4">
              {ortuList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada data orang tua / wali yang tercatat. Klik tombol Edit Data untuk menambahkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ortuList.map((ortu) => (
                    <div key={ortu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {ortu.jenis}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm">{ortu.nama}</p>
                        <p className="text-xs text-slate-600">Pekerjaan: <strong>{ortu.pekerjaan || '-'}</strong></p>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {ortu.no_hp || '-'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{ortu.alamat || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RIWAYAT KELAS */}
          {activeTab === 'riwayat' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Tahun Ajaran</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">Wali Kelas</th>
                      <th className="p-3">Status Kenaikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayatList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          Belum ada riwayat kelas tercatat.
                        </td>
                      </tr>
                    ) : (
                      riwayatList.map((riwayat) => {
                        const k = data.kelas.find((kls) => kls.id === riwayat.kelas_id);
                        const wk = data.guru.find((g) => g.id === riwayat.wali_kelas_id);
                        return (
                          <tr key={riwayat.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{riwayat.tahun_ajaran}</td>
                            <td className="p-3">{k?.nama || `Kelas #${riwayat.kelas_id}`}</td>
                            <td className="p-3">{wk?.nama || '-'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                riwayat.status_naik === 'naik' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {riwayat.status_naik === 'naik' ? 'Naik Kelas' : 'Tinggal Kelas'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DOKUMEN SISWA */}
          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              {/* Upload Box */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-900">Upload Dokumen Pendukung (KK / Akta / Ijazah)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jenis Dokumen</label>
                    <select
                      value={uploadJenis}
                      onChange={(e) => setUploadJenis(e.target.value as DokumenSiswa['jenis_dokumen'])}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
                    >
                      <option value="kartu_keluarga">Kartu Keluarga (KK)</option>
                      <option value="akta_kelahiran">Akta Kelahiran</option>
                      <option value="ijazah_sd">Ijazah SD / MI (Asal)</option>
                      <option value="ijazah_smp">Ijazah SMP / MTs</option>
                      <option value="raport">Buku Raport</option>
                      <option value="lainnya">Dokumen Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Judul / Keterangan File</label>
                    <input
                      type="text"
                      placeholder="Contoh: KK_Muhammad_Rizky.pdf"
                      value={uploadJudul}
                      onChange={(e) => setUploadJudul(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pilih File (PDF/Gambar)</label>
                    <label className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-blue-400 bg-white hover:bg-blue-50 text-blue-600 cursor-pointer text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Mengunggah...' : 'Pilih File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* List of uploaded documents */}
              <div className="space-y-2">
                {dokumenList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada file dokumen tersimpan untuk siswa ini.</p>
                ) : (
                  dokumenList.map((dok) => (
                    <div key={dok.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{dok.judul || dok.jenis_dokumen}</p>
                          <p className="text-[11px] text-slate-500">
                            Tipe: <span className="capitalize">{dok.jenis_dokumen.replace('_', ' ')}</span> • Diunggah: {formatTanggalIndo(dok.tanggal_upload)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {dok.file_path && (
                          <a
                            href={dok.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Buka / Unduh File di Tab Baru"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteDokumenSiswa(dok.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRESTASI */}
          {activeTab === 'prestasi' && (
            <div className="space-y-3">
              {prestasiList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada catatan prestasi kejuaraan untuk siswa ini.</p>
              ) : (
                prestasiList.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.peringkat}</span>
                        <span className="text-[11px] text-blue-700 font-semibold">• {p.nama_kegiatan}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tingkat: <span className="capitalize">{p.tingkat.replace('_', ' ')}</span> • Penyelenggara: {p.penyelenggara} • {formatTanggalIndo(p.tanggal)}
                      </p>
                    </div>
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        p.status_verifikasi === 'terverifikasi'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status_verifikasi}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>

      {isPrintBiodataOpen && (
        <CetakBiodataModal
          siswa={siswa}
          onClose={() => setIsPrintBiodataOpen(false)}
        />
      )}
    </div>
  );
};
