import React, { useState } from 'react';
import { Alumni, StatusAlumni } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, GraduationCap, Save, Briefcase, Building, Phone } from 'lucide-react';

interface AlumniFormModalProps {
  alumni?: Alumni | null;
  preselectedSiswaId?: number;
  onClose: () => void;
}

export const AlumniFormModal: React.FC<AlumniFormModalProps> = ({
  alumni,
  preselectedSiswaId,
  onClose,
}) => {
  const { data, saveAlumni } = useApp();

  const selectedSiswaInitial = preselectedSiswaId 
    ? data.siswa.find((s) => s.id === preselectedSiswaId)
    : alumni 
      ? data.siswa.find((s) => s.id === alumni.siswa_id)
      : data.siswa[0];

  const [formData, setFormData] = useState<Partial<Alumni>>({
    id: alumni?.id,
    siswa_id: alumni?.siswa_id || preselectedSiswaId || data.siswa[0]?.id || 1,
    tahun_lulus: alumni?.tahun_lulus || new Date().getFullYear(),
    status_setelah_lulus: alumni?.status_setelah_lulus || 'kuliah',
    nama_instansi: alumni?.nama_instansi || '',
    jurusan_posisi: alumni?.jurusan_posisi || '',
    no_hp_terbaru: alumni?.no_hp_terbaru || selectedSiswaInitial?.no_hp || '',
    email: alumni?.email || '',
    alamat_terbaru: alumni?.alamat_terbaru || selectedSiswaInitial?.alamat || '',
    catatan: alumni?.catatan || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAlumni(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">
              {alumni ? 'Update Tracer Study Alumni' : 'Daftarkan Kelulusan / Alumni Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs">
            🎓 <strong>Kelulusan Siswa:</strong> Menyimpan data ini otomatis memperbarui status siswa menjadi <strong>Lulus (Alumni)</strong> di Data Induk Siswa.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pilih Siswa yang Dinyatakan Lulus <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.siswa_id}
                onChange={(e) => {
                  const sId = Number(e.target.value);
                  const found = data.siswa.find((s) => s.id === sId);
                  setFormData({
                    ...formData,
                    siswa_id: sId,
                    no_hp_terbaru: found?.no_hp || formData.no_hp_terbaru,
                    alamat_terbaru: found?.alamat || formData.alamat_terbaru,
                  });
                }}
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

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tahun Kelulusan (Angkatan)</label>
              <input
                type="number"
                min="2000"
                max="2099"
                required
                value={formData.tahun_lulus}
                onChange={(e) => setFormData({ ...formData, tahun_lulus: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status Melanjutkan / Tracer Study</label>
              <select
                value={formData.status_setelah_lulus}
                onChange={(e) => setFormData({ ...formData, status_setelah_lulus: e.target.value as StatusAlumni })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-blue-700"
              >
                <option value="sma">Melanjutkan SMA (Sekolah Menengah Atas)</option>
                <option value="smk">Melanjutkan SMK (Kejuruan)</option>
                <option value="ma">Melanjutkan MA (Madrasah Aliyah)</option>
                <option value="pesantren">Pondok Pesantren / Islamic Boarding</option>
                <option value="kerja">Bekerja / Magang</option>
                <option value="wirausaha">Wirausaha / Bisnis Mandiri</option>
                <option value="lainnya">Lainnya / Belum Melanjutkan</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Sekolah Lanjutan / Pesantren / Instansi
              </label>
              <input
                type="text"
                placeholder="Contoh: SMA Negeri 1 Ponorogo / SMK Negeri 1 Ponorogo / Pondok Gontor"
                value={formData.nama_instansi}
                onChange={(e) => setFormData({ ...formData, nama_instansi: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Jurusan / Program Peminatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Peminatan MIPA / Teknik Komputer / Tata Boga"
                value={formData.jurusan_posisi}
                onChange={(e) => setFormData({ ...formData, jurusan_posisi: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">No. WhatsApp / HP Terbaru</label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={formData.no_hp_terbaru}
                onChange={(e) => setFormData({ ...formData, no_hp_terbaru: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Alamat Email Aktif</label>
              <input
                type="email"
                placeholder="alumni@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Domisili / Alamat Tempat Tinggal Saat Ini</label>
              <textarea
                rows={2}
                placeholder="Kota domisili sekarang..."
                value={formData.alamat_terbaru}
                onChange={(e) => setFormData({ ...formData, alamat_terbaru: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
              <input
                type="text"
                placeholder="Jalur masuk SNBP/SNBT, beasiswa, atau info lainnya..."
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
              <span>Simpan Data Alumni</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
