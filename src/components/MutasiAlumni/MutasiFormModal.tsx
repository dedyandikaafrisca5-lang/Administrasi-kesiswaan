import React, { useState } from 'react';
import { Mutasi, JenisMutasi, StatusMutasi } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadFileToDrive } from '../../services/gasApi';
import { X, ArrowRightLeft, Upload, Save } from 'lucide-react';

interface MutasiFormModalProps {
  mutasi?: Mutasi | null;
  preselectedSiswaId?: number;
  onClose: () => void;
}

export const MutasiFormModal: React.FC<MutasiFormModalProps> = ({
  mutasi,
  preselectedSiswaId,
  onClose,
}) => {
  const { data, saveMutasi, currentGuru, gasConfig } = useApp();

  const [formData, setFormData] = useState<Partial<Mutasi>>({
    id: mutasi?.id,
    siswa_id: mutasi?.siswa_id || preselectedSiswaId || data.siswa[0]?.id || 1,
    jenis: mutasi?.jenis || 'keluar',
    sekolah_asal: mutasi?.sekolah_asal || '',
    sekolah_tujuan: mutasi?.sekolah_tujuan || '',
    alasan: mutasi?.alasan || '',
    nomor_surat: mutasi?.nomor_surat || `0${data.mutasi.length + 1}/MUTASI/KESISWAAN/${new Date().getFullYear()}`,
    tanggal_mutasi: mutasi?.tanggal_mutasi || new Date().toISOString().split('T')[0],
    file_surat_url: mutasi?.file_surat_url || '',
    status: mutasi?.status || 'disetujui',
    disetujui_oleh_id: mutasi?.disetujui_oleh_id || currentGuru.id,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Surat_Mutasi');
      setFormData((prev) => ({ ...prev, file_surat_url: res.fileUrl }));
    } catch (err) {
      console.error('Upload surat mutasi error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.alasan || !formData.alasan.trim()) {
      alert('Alasan mutasi wajib diisi!');
      return;
    }

    saveMutasi(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              {mutasi ? 'Edit Catatan Mutasi Siswa' : 'Proses Mutasi Siswa (Masuk / Keluar)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
            💡 <strong>Ketentuan Sistem:</strong> Ketika mutasi disetujui dengan jenis <strong>Keluar</strong>, status siswa terkait otomatis diubah menjadi <strong>Pindah</strong> di Data Induk.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Jenis Mutasi</label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value as JenisMutasi })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="keluar">Mutasi Keluar (Pindah ke Sekolah Lain)</option>
                <option value="masuk">Mutasi Masuk (Pindahan dari Sekolah Lain)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor Surat Keterangan Pindah/Masuk</label>
              <input
                type="text"
                required
                value={formData.nomor_surat}
                onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pilih Siswa Terkait <span className="text-rose-500">*</span>
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
                      {s.nama_lengkap} (NISN: {s.nisn}) - Status: {s.status.toUpperCase()} - {k?.nama || 'Kelas'}
                    </option>
                  );
                })}
              </select>
            </div>

            {formData.jenis === 'masuk' ? (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sekolah Asal Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMAN 3 Bandung / SMPN 1 Jakarta"
                  value={formData.sekolah_asal}
                  onChange={(e) => setFormData({ ...formData, sekolah_asal: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sekolah Tujuan Pindah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMAN 8 Yogyakarta / SMA Luar Kota"
                  value={formData.sekolah_tujuan}
                  onChange={(e) => setFormData({ ...formData, sekolah_tujuan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Alasan Mutasi / Kepindahan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Mengikuti perpindahan tugas kedinasan orang tua ke Yogyakarta..."
                value={formData.alasan}
                onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Efektif Mutasi</label>
              <input
                type="date"
                value={formData.tanggal_mutasi}
                onChange={(e) => setFormData({ ...formData, tanggal_mutasi: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status Persetujuan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusMutasi })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-emerald-800"
              >
                <option value="diajukan">Diajukan</option>
                <option value="disetujui">Disetujui Resmi</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            {/* File Surat Mutasi Upload */}
            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-800 block">Surat Keterangan Mutasi Resmi (PDF)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="URL Google Drive atau klik Unggah di samping"
                  value={formData.file_surat_url}
                  onChange={(e) => setFormData({ ...formData, file_surat_url: e.target.value })}
                  className="flex-1 p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <label className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Mengunggah...' : 'Unggah Surat (PDF/Foto)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
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
              <span>Simpan Catatan Mutasi</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
