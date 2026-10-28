import React, { useState, useEffect } from 'react';
import { PengajuanHonorEkskul, ItemHonorEkskul } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Banknote, 
  Sparkles,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface HonorEkskulFormModalProps {
  pengajuan?: PengajuanHonorEkskul | null;
  onClose: () => void;
}

const BULAN_PILIHAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const PRESET_EKSKUL = [
  { nama: 'Pramuka (Gudep SMPN 2 Pulung)', defaultHonor: 75000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'PMR Madya & UKS', defaultHonor: 70000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'Paskibra SMPN 2 Pulung', defaultHonor: 75000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'Seni Tari Tradisional Reyog & Jathil', defaultHonor: 85000, defaultStatus: 'Pelatih Eksternal' as const },
  { nama: 'Futsal & Bola Voli', defaultHonor: 75000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'Karawitan & Musik Gamelan', defaultHonor: 85000, defaultStatus: 'Pelatih Eksternal' as const },
  { nama: 'Rohani Islam (Rohis & BTQ)', defaultHonor: 70000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'English Club & Story Telling', defaultHonor: 75000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'TIK / Komputer & Multimedia', defaultHonor: 75000, defaultStatus: 'Guru Pembina' as const },
  { nama: 'Bulutangkis & Tenis Meja', defaultHonor: 70000, defaultStatus: 'Guru Pembina' as const },
];

export const HonorEkskulFormModal: React.FC<HonorEkskulFormModalProps> = ({ pengajuan, onClose }) => {
  const { data, currentGuru, savePengajuanHonorEkskul } = useApp();

  const [nomorSurat, setNomorSurat] = useState(
    pengajuan?.nomor_surat || `${String((data.pengajuan_honor_ekskul || []).length + 1).padStart(3, '0')}/HONOR-EKSKUL/SMPN2/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
  );
  const [tahunAjaran, setTahunAjaran] = useState(pengajuan?.tahun_ajaran || '2025/2026');
  const [bulanMulai, setBulanMulai] = useState(pengajuan?.bulan_mulai || 'Juli 2025');
  const [bulanSelesai, setBulanSelesai] = useState(pengajuan?.bulan_selesai || 'September 2025');
  const [tanggalPengajuan, setTanggalPengajuan] = useState(
    pengajuan?.tanggal_pengajuan || new Date().toISOString().split('T')[0]
  );
  const [sumberDana, setSumberDana] = useState(
    pengajuan?.sumber_dana || 'Dana BOS Kesiswaan SMP Negeri 2 Pulung TA 2025/2026'
  );
  const [status, setStatus] = useState<PengajuanHonorEkskul['status']>(pengajuan?.status || 'disetujui');
  const [keterangan, setKeterangan] = useState(
    pengajuan?.keterangan || `Pengajuan Honorarium Pembina & Pelatih Ekstrakurikuler Triwulan (Juli - September 2025)`
  );

  // Items State
  const [items, setItems] = useState<Array<Partial<ItemHonorEkskul>>>(() => {
    if (pengajuan && pengajuan.items && pengajuan.items.length > 0) {
      return pengajuan.items;
    }
    return [
      {
        id: 1,
        nama_ekstrakurikuler: 'Pramuka (Gudep SMPN 2 Pulung)',
        nama_pembina_pelatih: 'Budi Santoso, S.Pd.',
        status_penerima: 'Guru Pembina',
        honor_per_pertemuan: 75000,
        jumlah_pertemuan: 12,
        total_honor: 900000,
        keterangan: 'Latihan rutin hari Jumat sore',
      },
      {
        id: 2,
        nama_ekstrakurikuler: 'PMR Madya & UKS',
        nama_pembina_pelatih: 'Dewi Lestari, S.Pd.',
        status_penerima: 'Guru Pembina',
        honor_per_pertemuan: 70000,
        jumlah_pertemuan: 10,
        total_honor: 700000,
        keterangan: 'Pelatihan P3K & Sanitasi',
      },
      {
        id: 3,
        nama_ekstrakurikuler: 'Seni Tari Tradisional Reyog & Jathil',
        nama_pembina_pelatih: 'Ki Suryo Sasmito, S.Sn.',
        status_penerima: 'Pelatih Eksternal',
        honor_per_pertemuan: 85000,
        jumlah_pertemuan: 12,
        total_honor: 1020000,
        keterangan: 'Pelatih sanggar kesenian Ponorogo',
      }
    ];
  });

  const [errors, setErrors] = useState<string | null>(null);

  // Update item field
  const handleItemChange = (index: number, field: keyof ItemHonorEkskul, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    
    // Auto calculate total_honor
    if (field === 'honor_per_pertemuan' || field === 'jumlah_pertemuan') {
      const honor = field === 'honor_per_pertemuan' ? Number(value) || 0 : Number(current.honor_per_pertemuan) || 0;
      const pertemuan = field === 'jumlah_pertemuan' ? Number(value) || 0 : Number(current.jumlah_pertemuan) || 0;
      current.total_honor = honor * pertemuan;
    }

    updated[index] = current;
    setItems(updated);
  };

  // Add new item
  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
    setItems([
      ...items,
      {
        id: nextId,
        nama_ekstrakurikuler: '',
        nama_pembina_pelatih: '',
        status_penerima: 'Guru Pembina',
        honor_per_pertemuan: 75000,
        jumlah_pertemuan: 12,
        total_honor: 900000,
        keterangan: '',
      }
    ]);
  };

  // Quick Add Preset
  const handleAddPreset = (preset: typeof PRESET_EKSKUL[0]) => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
    setItems([
      ...items,
      {
        id: nextId,
        nama_ekstrakurikuler: preset.nama,
        nama_pembina_pelatih: '',
        status_penerima: preset.defaultStatus,
        honor_per_pertemuan: preset.defaultHonor,
        jumlah_pertemuan: 12,
        total_honor: preset.defaultHonor * 12,
        keterangan: '',
      }
    ]);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      setErrors('Minimal harus ada 1 rincian ekstrakurikuler dalam pengajuan');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
    setErrors(null);
  };

  // Calculation Grand Totals
  const totalPertemuanSemua = items.reduce((sum, item) => sum + (Number(item.jumlah_pertemuan) || 0), 0);
  const totalHonorDibayarkan = items.reduce((sum, item) => {
    const honor = Number(item.honor_per_pertemuan) || 0;
    const pertemuan = Number(item.jumlah_pertemuan) || 0;
    return sum + (honor * pertemuan);
  }, 0);

  // Auto update keterangan based on bulan mulai & bulan selesai if user hasn't heavily customized
  const handleBulanChange = (mulai: string, selesai: string) => {
    setBulanMulai(mulai);
    setBulanSelesai(selesai);
    if (!pengajuan) {
      setKeterangan(`Pengajuan Honorarium Pembina & Pelatih Ekstrakurikuler Periode ${mulai} s.d. ${selesai}`);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim()) {
      setErrors('Nomor Surat / Pengajuan wajib diisi');
      return;
    }
    if (!bulanMulai.trim() || !bulanSelesai.trim()) {
      setErrors('Periode Bulan Mulai dan Bulan Selesai wajib diisi');
      return;
    }
    if (items.length === 0) {
      setErrors('Tambahkan minimal 1 ekstrakurikuler');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.nama_ekstrakurikuler?.trim()) {
        setErrors(`Baris ke-${i + 1}: Nama Ekstrakurikuler wajib diisi`);
        return;
      }
      if (!it.nama_pembina_pelatih?.trim()) {
        setErrors(`Baris ke-${i + 1} (${it.nama_ekstrakurikuler}): Nama Pembina/Pelatih wajib diisi`);
        return;
      }
      if (!it.honor_per_pertemuan || it.honor_per_pertemuan <= 0) {
        setErrors(`Baris ke-${i + 1}: Honor per pertemuan harus lebih besar dari Rp 0`);
        return;
      }
      if (!it.jumlah_pertemuan || it.jumlah_pertemuan <= 0) {
        setErrors(`Baris ke-${i + 1}: Jumlah pertemuan harus lebih besar dari 0`);
        return;
      }
    }

    savePengajuanHonorEkskul(
      {
        id: pengajuan?.id,
        nomor_surat: nomorSurat,
        tahun_ajaran: tahunAjaran,
        bulan_mulai: bulanMulai,
        bulan_selesai: bulanSelesai,
        tanggal_pengajuan: tanggalPengajuan,
        sumber_dana: sumberDana,
        keterangan: keterangan,
        status: status,
        diajukan_oleh_id: currentGuru.id,
      },
      items
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {pengajuan ? 'Edit Pengajuan Honor Ekstrakurikuler' : 'Form Pengajuan Honor Pembina & Pelatih Ekstrakurikuler'}
              </h2>
              <p className="text-xs text-slate-500">
                SMP Negeri 2 Pulung • Kalkulasi Honor Pertemuan Otomatis & Standar Cetak SPJ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errors && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span>{errors}</span>
            <button onClick={() => setErrors(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Informasi Dokumen & Periode */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>1. Identitas Dokumen & Periode Bulan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Surat / Pengajuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Contoh: 002/HONOR-EKSKUL/SMPN2/IX/2025"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pengajuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalPengajuan}
                  onChange={(e) => setTanggalPengajuan(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Rentang Periode Bulan (Sesuai Permintaan User: Bulan Apa Sampai Bulan Apa) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bulan Mulai (Dari Bulan) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bulanMulai}
                  onChange={(e) => handleBulanChange(e.target.value, bulanSelesai)}
                  placeholder="Contoh: Juli 2025"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {['Juli 2025', 'Januari 2026', 'April 2025', 'Oktober 2025'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBulanChange(b, bulanSelesai)}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-200/70 hover:bg-slate-300 rounded text-slate-700 transition cursor-pointer"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bulan Selesai (Sampai Bulan) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bulanSelesai}
                  onChange={(e) => handleBulanChange(bulanMulai, e.target.value)}
                  placeholder="Contoh: September 2025 atau Desember 2025"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {['September 2025', 'Desember 2025', 'Juni 2026', 'Maret 2026'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBulanChange(bulanMulai, b)}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-200/70 hover:bg-slate-300 rounded text-slate-700 transition cursor-pointer"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sumber Anggaran / Dana <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  placeholder="Contoh: Dana BOS Kesiswaan / Komite Sekolah"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Uraian Dokumen Pengajuan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Deskripsi singkat pengajuan honorarium"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Berkas Pengajuan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="draft">Draft (Konsep)</option>
                  <option value="disetujui">Disetujui (Siap Cetak)</option>
                  <option value="dicairkan">Telah Dicairkan (Lunas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Preset Pilihan Cepat Ekstrakurikuler */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Pilih Cepat Ekstrakurikuler SMPN 2 Pulung:</span>
              </div>
              <span className="text-[11px] text-amber-700">Klik untuk langsung menambahkan ke tabel</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EKSKUL.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="text-xs px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 border border-amber-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>+ {preset.nama.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400">({formatRupiah(preset.defaultHonor)}/pertemuan)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Tabel Rincian Honorarium Ekstrakurikuler */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>2. Rincian Ekstrakurikuler, Honor & Jumlah Pertemuan</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600 font-semibold">
                  {items.length} Ekstrakurikuler
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Ekskul</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Nama Ekstrakurikuler <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 min-w-[180px]">Nama Pembina / Pelatih <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 w-36">Status</th>
                      <th className="py-2.5 px-3 w-36">Honor / Pertemuan (Rp) <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 w-28 text-center">Pertemuan <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 w-40 text-right">Total Honor Dibayarkan</th>
                      <th className="py-2.5 px-3 w-10 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const subtotal = (Number(item.honor_per_pertemuan) || 0) * (Number(item.jumlah_pertemuan) || 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.nama_ekstrakurikuler || ''}
                              onChange={(e) => handleItemChange(idx, 'nama_ekstrakurikuler', e.target.value)}
                              placeholder="Contoh: Pramuka, PMR, Futsal, Tari Reyog"
                              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                              required
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.nama_pembina_pelatih || ''}
                              onChange={(e) => handleItemChange(idx, 'nama_pembina_pelatih', e.target.value)}
                              placeholder="Nama Guru / Pelatih Luar"
                              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                              required
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.status_penerima || 'Guru Pembina'}
                              onChange={(e) => handleItemChange(idx, 'status_penerima', e.target.value)}
                              className="w-full text-[11px] px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
                            >
                              <option value="Guru Pembina">Guru Pembina</option>
                              <option value="Pelatih Eksternal">Pelatih Eksternal</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="relative">
                              <span className="absolute left-2 top-1.5 text-[11px] text-slate-400">Rp</span>
                              <input
                                type="number"
                                min="0"
                                step="5000"
                                value={item.honor_per_pertemuan ?? ''}
                                onChange={(e) => handleItemChange(idx, 'honor_per_pertemuan', Number(e.target.value))}
                                className="w-full text-xs pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-medium"
                                required
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={item.jumlah_pertemuan ?? ''}
                                onChange={(e) => handleItemChange(idx, 'jumlah_pertemuan', Number(e.target.value))}
                                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-center font-bold text-slate-800"
                                required
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-bold text-slate-900 bg-amber-50 border border-amber-200/70 px-2 py-1 rounded text-xs block">
                              {formatRupiah(subtotal)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Footer Card */}
              <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total Ekstrakurikuler</span>
                    <span className="text-base font-bold text-white">{items.length} Ekskul</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Akumulasi Pertemuan</span>
                    <span className="text-base font-bold text-amber-400">{totalPertemuanSemua} Kali Pertemuan</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-300/80 uppercase font-semibold tracking-wider block">
                      TOTAL HONOR YANG DIBAYARKAN
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                      {formatRupiah(totalHonorDibayarkan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>{pengajuan ? 'Simpan Perubahan Honor' : 'Simpan & Buat Pengajuan Honor'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
