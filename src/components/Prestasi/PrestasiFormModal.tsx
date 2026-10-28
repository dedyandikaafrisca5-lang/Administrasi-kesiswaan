import React, { useState } from 'react';
import { Prestasi, JenisPrestasi, TingkatPrestasi } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadFileToDrive } from '../../services/gasApi';
import { X, Trophy, Upload, Save, FileText, ExternalLink } from 'lucide-react';

interface PrestasiFormModalProps {
  prestasi?: Prestasi | null;
  preselectedSiswaId?: number;
  onClose: () => void;
}

export const PrestasiFormModal: React.FC<PrestasiFormModalProps> = ({
  prestasi,
  preselectedSiswaId,
  onClose,
}) => {
  const { data, savePrestasi, currentGuru, gasConfig } = useApp();

  const [formData, setFormData] = useState<Partial<Prestasi>>({
    id: prestasi?.id,
    siswa_id: prestasi?.siswa_id || preselectedSiswaId || data.siswa[0]?.id || 1,
    jenis: prestasi?.jenis || 'akademik',
    tingkat: prestasi?.tingkat || 'nasional',
    nama_prestasi: prestasi?.nama_prestasi || '',
    penyelenggara: prestasi?.penyelenggara || '',
    peringkat: prestasi?.peringkat || 'Juara 1',
    tanggal_perolehan: prestasi?.tanggal_perolehan || new Date().toISOString().split('T')[0],
    tahun: prestasi?.tahun || new Date().getFullYear(),
    sertifikat_url: prestasi?.sertifikat_url || '',
    guru_pembimbing_id: prestasi?.guru_pembimbing_id || currentGuru.id,
    status_verifikasi: prestasi?.status_verifikasi || 'terverifikasi',
    catatan: prestasi?.catatan || '',
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleSertifikatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Sertifikat_Prestasi');
      setFormData((prev) => ({ ...prev, sertifikat_url: res.fileUrl }));
    } catch (err) {
      console.error('Upload sertifikat error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_prestasi || !formData.nama_prestasi.trim()) {
      alert('Nama kejuaraan / prestasi wajib diisi!');
      return;
    }

    savePrestasi(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              {prestasi ? 'Edit Catatan Prestasi Siswa' : 'Catat Prestasi Siswa Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Siswa Selector */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pilih Siswa Peraih Prestasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.siswa_id}
                onChange={(e) => setFormData({ ...formData, siswa_id: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                {data.siswa.map((s) => {
                  const k = data.kelas.find((kls) => kls.id === s.kelas_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap} (NISN: {s.nisn}) - {k?.nama || 'Kelas'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori Prestasi</label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value as JenisPrestasi })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="akademik">Akademik (OSN, Lomba Ilmiah, Cerdas Cermat)</option>
                <option value="non-akademik">Non-Akademik (O2SN, FLS2N, Pramuka, Olahraga, Seni)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tingkat Prestasi</label>
              <select
                value={formData.tingkat}
                onChange={(e) => setFormData({ ...formData, tingkat: e.target.value as TingkatPrestasi })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="sekolah">Tingkat Sekolah / Internal</option>
                <option value="kecamatan">Tingkat Kecamatan</option>
                <option value="kabupaten_kota">Tingkat Kabupaten / Kota</option>
                <option value="provinsi">Tingkat Provinsi</option>
                <option value="nasional">Tingkat Nasional</option>
                <option value="internasional">Tingkat Internasional</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Kejuaraan / Prestasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Olimpiade Sains Nasional (OSN) Bidang Matematika SMA"
                value={formData.nama_prestasi}
                onChange={(e) => setFormData({ ...formData, nama_prestasi: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Peringkat / Gelar Juara</label>
              <input
                type="text"
                placeholder="Contoh: Juara 1 Emas / Medali Perak / Harapan 1"
                value={formData.peringkat}
                onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-blue-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Instansi Penyelenggara</label>
              <input
                type="text"
                placeholder="Contoh: Kemendikbudristek / Puspresnas / UI"
                value={formData.penyelenggara}
                onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Perolehan</label>
              <input
                type="date"
                value={formData.tanggal_perolehan}
                onChange={(e) => setFormData({ ...formData, tanggal_perolehan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Guru Pembimbing</label>
              <select
                value={formData.guru_pembimbing_id}
                onChange={(e) => setFormData({ ...formData, guru_pembimbing_id: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {data.guru.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.jabatan})
                  </option>
                ))}
              </select>
            </div>

            {/* Sertifikat Upload */}
            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-800 block">Sertifikat / Piagam (Google Drive)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="URL Google Drive atau klik Unggah di samping"
                  value={formData.sertifikat_url}
                  onChange={(e) => setFormData({ ...formData, sertifikat_url: e.target.value })}
                  className="flex-1 p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <label className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Mengunggah...' : 'Unggah Piagam (PDF/JPG)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleSertifikatUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan piala bergilir, reward beasiswa, atau keterangan..."
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Prestasi</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
