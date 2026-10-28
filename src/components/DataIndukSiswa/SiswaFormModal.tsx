import React, { useState } from 'react';
import { Siswa, OrangTuaWali } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadFileToDrive } from '../../services/gasApi';
import { X, Upload, User, Users, Save, Image as ImageIcon } from 'lucide-react';

interface SiswaFormModalProps {
  siswa?: Siswa | null;
  onClose: () => void;
}

export const SiswaFormModal: React.FC<SiswaFormModalProps> = ({ siswa, onClose }) => {
  const { data, saveSiswa, gasConfig } = useApp();

  // Form State Siswa
  const [formData, setFormData] = useState<Partial<Siswa>>({
    id: siswa?.id,
    nisn: siswa?.nisn || '',
    nis: siswa?.nis || '',
    nama_lengkap: siswa?.nama_lengkap || '',
    jenis_kelamin: siswa?.jenis_kelamin || 'L',
    tempat_lahir: siswa?.tempat_lahir || '',
    tanggal_lahir: siswa?.tanggal_lahir || '',
    agama: siswa?.agama || 'Islam',
    alamat: siswa?.alamat || '',
    no_hp: siswa?.no_hp || '',
    foto: siswa?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    kelas_id: siswa?.kelas_id || data.kelas[0]?.id || 1,
    tahun_masuk: siswa?.tahun_masuk || new Date().getFullYear(),
    status: siswa?.status || 'aktif',
  });

  // Existing ortu records if editing
  const existingOrtu = siswa ? data.orang_tua_wali.filter((o) => o.siswa_id === siswa.id) : [];

  // Form State Ortu: Ayah & Ibu & Wali
  const ayahInitial = existingOrtu.find((o) => o.jenis === 'ayah');
  const ibuInitial = existingOrtu.find((o) => o.jenis === 'ibu');

  const [ayahData, setAyahData] = useState<Partial<OrangTuaWali>>({
    id: ayahInitial?.id,
    jenis: 'ayah',
    nama: ayahInitial?.nama || '',
    pekerjaan: ayahInitial?.pekerjaan || '',
    no_hp: ayahInitial?.no_hp || '',
    alamat: ayahInitial?.alamat || '',
  });

  const [ibuData, setIbuData] = useState<Partial<OrangTuaWali>>({
    id: ibuInitial?.id,
    jenis: 'ibu',
    nama: ibuInitial?.nama || '',
    pekerjaan: ibuInitial?.pekerjaan || '',
    no_hp: ibuInitial?.no_hp || '',
    alamat: ibuInitial?.alamat || '',
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const result = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Foto_Siswa');
      setFormData((prev) => ({ ...prev, foto: result.fileUrl }));
    } catch (err) {
      console.error('Foto upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap || formData.nama_lengkap.trim() === '') {
      alert('Nama lengkap siswa wajib diisi!');
      return;
    }

    const ortuToSave: Partial<OrangTuaWali>[] = [];
    if (ayahData.nama && ayahData.nama.trim() !== '') {
      ortuToSave.push(ayahData);
    }
    if (ibuData.nama && ibuData.nama.trim() !== '') {
      ortuToSave.push(ibuData);
    }

    saveSiswa(formData, ortuToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">
              {siswa ? 'Edit Data Siswa & Orang Tua' : 'Tambah Siswa Baru ke Data Induk'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Section 1: Biodata Siswa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-bold text-slate-900 text-sm">Biodata Utama Siswa</h4>
            </div>

            {/* Foto Profile Row */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                <img 
                  src={formData.foto} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Foto Profil Siswa</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isUploadingPhoto ? 'Mengunggah...' : 'Pilih Foto Baru'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">JPG/PNG maks 2MB (Tersimpan ke Drive)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Contoh: 0061234561"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">NIS Sekolah</label>
                <input
                  type="text"
                  placeholder="Contoh: 23241001"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta"
                  value={formData.tempat_lahir}
                  onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Agama</label>
                <select
                  value={formData.agama}
                  onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">No. WhatsApp / HP Siswa</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Kelas Saat Ini</label>
                <select
                  value={formData.kelas_id}
                  onChange={(e) => setFormData({ ...formData, kelas_id: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {data.kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama} ({k.tingkat}) - TP {k.tahun_ajaran}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status Siswa</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Siswa['status'] })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="aktif">Aktif</option>
                  <option value="pindah">Mutasi / Pindah</option>
                  <option value="lulus">Lulus (Alumni)</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Alamat Lengkap Domisili</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kab"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Orang Tua / Wali */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-bold text-slate-900 text-sm">Data Orang Tua / Wali</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ayah Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-blue-700">Data Ayah Kandung</h5>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap Ayah"
                    value={ayahData.nama}
                    onChange={(e) => setAyahData({ ...ayahData, nama: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Wiraswasta / Karyawan"
                    value={ayahData.pekerjaan}
                    onChange={(e) => setAyahData({ ...ayahData, pekerjaan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. HP / WA Ayah</label>
                  <input
                    type="text"
                    placeholder="081xxxx"
                    value={ayahData.no_hp}
                    onChange={(e) => setAyahData({ ...ayahData, no_hp: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Ibu Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-emerald-700">Data Ibu Kandung</h5>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap Ibu"
                    value={ibuData.nama}
                    onChange={(e) => setIbuData({ ...ibuData, nama: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Rumah Tangga / PNS"
                    value={ibuData.pekerjaan}
                    onChange={(e) => setIbuData({ ...ibuData, pekerjaan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">No. HP / WA Ibu</label>
                  <input
                    type="text"
                    placeholder="081xxxx"
                    value={ibuData.no_hp}
                    onChange={(e) => setIbuData({ ...ibuData, no_hp: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
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
              <span>Simpan Data Siswa</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
