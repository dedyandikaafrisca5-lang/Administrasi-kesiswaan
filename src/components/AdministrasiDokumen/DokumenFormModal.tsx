import React, { useState } from 'react';
import { DokumenAdministrasi, KategoriDokumen, StatusDokumen } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadFileToDrive } from '../../services/gasApi';
import { X, Upload, FileText, Save, GitBranch } from 'lucide-react';

interface DokumenFormModalProps {
  dokumen?: DokumenAdministrasi | null;
  isRevisionMode?: boolean;
  onClose: () => void;
}

export const DokumenFormModal: React.FC<DokumenFormModalProps> = ({ 
  dokumen, 
  isRevisionMode = false, 
  onClose 
}) => {
  const { data, saveDokumenAdministrasi, currentGuru, gasConfig } = useApp();

  const [formData, setFormData] = useState<Partial<DokumenAdministrasi>>({
    id: isRevisionMode ? undefined : dokumen?.id,
    kategori: dokumen?.kategori || 'program_kerja',
    sub_kategori: dokumen?.sub_kategori || '',
    judul: dokumen?.judul || '',
    file_path: dokumen?.file_path || '',
    versi: dokumen?.versi || 1,
    tahun_ajaran: dokumen?.tahun_ajaran || '2025/2026',
    unit_id: dokumen?.unit_id || data.unit[0]?.id || 1,
    penanggung_jawab_id: dokumen?.penanggung_jawab_id || currentGuru.id,
    status: isRevisionMode ? 'diajukan' : (dokumen?.status || 'draft'),
    catatan: dokumen?.catatan || '',
    tanggal_upload: new Date().toISOString().split('T')[0],
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Dokumen_Administrasi');
      setFormData((prev) => ({
        ...prev,
        file_path: result.fileUrl,
        judul: prev.judul ? prev.judul : file.name.replace(/\.[^/.]+$/, ''),
      }));
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.judul.trim()) {
      alert('Judul dokumen wajib diisi!');
      return;
    }

    saveDokumenAdministrasi(formData, isRevisionMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">
              {isRevisionMode 
                ? `Unggah Revisi Dokumen (Versi ${(dokumen?.versi || 1) + 1})` 
                : dokumen 
                  ? 'Edit Informasi Dokumen Administrasi' 
                  : 'Unggah Dokumen Kesiswaan Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {isRevisionMode && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-800 text-xs">
              <GitBranch className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Dokumen ini akan disimpan sebagai versi baru (<strong>v{(dokumen?.versi || 1) + 1}</strong>). Versi lama (<strong>v{dokumen?.versi || 1}</strong>) tetap tersimpan dalam riwayat arsip.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori Dokumen</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriDokumen })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="program_kerja">Program Kerja Tahunan</option>
                <option value="osis">Administrasi OSIS / MPK</option>
                <option value="ekskul">Administrasi Ekstrakurikuler</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Sub-Kategori / Jenis Berkas</label>
              <input
                type="text"
                required
                placeholder="Misal: SK Pengurus / Proposal / Notulen / Juklak"
                value={formData.sub_kategori}
                onChange={(e) => setFormData({ ...formData, sub_kategori: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Judul Dokumen Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Proposal Perkemahan Sabtu Minggu (Persami) Pramuka TP 2025/2026"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Unit Organisasi Pengaju</label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {data.unit.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.jenis.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Penanggung Jawab (Guru / Pembina)</label>
              <select
                value={formData.penanggung_jawab_id}
                onChange={(e) => setFormData({ ...formData, penanggung_jawab_id: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {data.guru.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.jabatan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tahun Ajaran</label>
              <input
                type="text"
                placeholder="2025/2026"
                value={formData.tahun_ajaran}
                onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status Dokumen</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusDokumen })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="draft">Draft (Konsep)</option>
                <option value="diajukan">Diajukan ke Waka/Kepsek</option>
                <option value="disetujui">Disetujui Resmi</option>
                <option value="diarsipkan">Diarsipkan</option>
              </select>
            </div>

            {/* File Upload Box */}
            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-800 block">Berkas Dokumen (Google Drive)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="URL Google Drive atau klik Unggah File di samping"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  className="flex-1 p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <label className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Mengunggah ke Drive...' : 'Upload Berkas (PDF/DOC)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan / Keterangan Dokumen</label>
              <textarea
                rows={2}
                placeholder="Catatan pengesahan, no. agenda, atau keterangan pengesahan..."
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Footer Submit */}
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
              <span>Simpan Dokumen</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
