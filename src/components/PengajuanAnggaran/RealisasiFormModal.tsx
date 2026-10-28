import React, { useState } from 'react';
import { PengajuanAnggaran, RealisasiAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { uploadFileToDrive } from '../../services/gasApi';
import { X, Plus, Trash2, CheckSquare, Upload, Save, FileCheck, ExternalLink } from 'lucide-react';

interface RealisasiFormModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
}

export const RealisasiFormModal: React.FC<RealisasiFormModalProps> = ({ pengajuan, onClose }) => {
  const { data, saveRealisasiAnggaran, gasConfig } = useApp();

  const existingRealisasi = data.realisasi_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);
  const rincianList = data.rincian_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);

  // Initialize items from existing realisasi or prepopulate from RAB items
  const [realisasiItems, setRealisasiItems] = useState<Partial<RealisasiAnggaran>[]>(
    existingRealisasi.length > 0
      ? existingRealisasi
      : rincianList.map((r) => ({
          pengajuan_id: pengajuan.id,
          uraian: r.uraian,
          jumlah_realisasi: r.volume,
          harga_realisasi: r.harga_satuan,
          subtotal_realisasi: r.subtotal,
          bukti_nota_url: '',
          tanggal_realisasi: new Date().toISOString().split('T')[0],
        }))
  );

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const handleAddRow = () => {
    setRealisasiItems([
      ...realisasiItems,
      {
        pengajuan_id: pengajuan.id,
        uraian: '',
        jumlah_realisasi: 1,
        harga_realisasi: 0,
        subtotal_realisasi: 0,
        bukti_nota_url: '',
        tanggal_realisasi: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (realisasiItems.length <= 1) return;
    setRealisasiItems(realisasiItems.filter((_, idx) => idx !== index));
  };

  const handleChange = (index: number, field: keyof RealisasiAnggaran, val: any) => {
    const updated = [...realisasiItems];
    const current = { ...updated[index], [field]: val };
    
    // Auto calculate subtotal realisasi
    const vol = Number(current.jumlah_realisasi || 1);
    const harga = Number(current.harga_realisasi || 0);
    current.subtotal_realisasi = vol * harga;

    updated[index] = current;
    setRealisasiItems(updated);
  };

  const handleNotaUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(index);
    try {
      const res = await uploadFileToDrive(gasConfig.webAppUrl, file, 'Nota_LPJ');
      handleChange(index, 'bukti_nota_url', res.fileUrl);
    } catch (err) {
      console.error('Error upload nota:', err);
    } finally {
      setUploadingIdx(null);
    }
  };

  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + (curr.subtotal_realisasi || 0), 0);
  const selisih = pengajuan.total_anggaran - totalRealisasi;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRealisasiAnggaran(pengajuan.id, realisasiItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold">Input Laporan Pertanggungjawaban (LPJ) & Realisasi</h3>
              <p className="text-xs text-slate-400 font-mono">{pengajuan.nomor_surat} • {pengajuan.nama_kegiatan}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700 block">Pagu Anggaran Disetujui (RAB)</span>
              <span className="text-base font-black text-blue-950">{formatRupiah(pengajuan.total_anggaran)}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 block">Total Realisasi Terpakai</span>
              <span className="text-base font-black text-emerald-950">{formatRupiah(totalRealisasi)}</span>
            </div>
            <div className={`p-3 rounded-xl border ${selisih >= 0 ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
              <span className="text-[11px] font-semibold text-slate-600 block">
                {selisih >= 0 ? 'Sisa Saldo / Hemat' : 'Defisit / Melebihi Anggaran'}
              </span>
              <span className={`text-base font-black ${selisih >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatRupiah(Math.abs(selisih))}
              </span>
            </div>
          </div>

          {/* Realisasi Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700">
                Rincian Pos Realisasi & Bukti Nota Fisik / Foto
              </h4>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Realisasi</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Uraian Realisasi</th>
                    <th className="p-2.5 w-16 text-center">Jumlah</th>
                    <th className="p-2.5 w-28 text-right">Harga Satuan</th>
                    <th className="p-2.5 w-32 text-right">Subtotal</th>
                    <th className="p-2.5 w-44">Bukti Nota / Kwitansi</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {realisasiItems.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={row.uraian || ''}
                          onChange={(e) => handleChange(idx, 'uraian', e.target.value)}
                          placeholder="Misal: Nota Pembelian Konsumsi"
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={row.jumlah_realisasi || 1}
                          onChange={(e) => handleChange(idx, 'jumlah_realisasi', Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-center font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={row.harga_realisasi || 0}
                          onChange={(e) => handleChange(idx, 'harga_realisasi', Number(e.target.value))}
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-right font-medium"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        {formatRupiah(row.subtotal_realisasi || 0)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {row.bukti_nota_url ? (
                            <a
                              href={row.bukti_nota_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-semibold shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Nota</span>
                            </a>
                          ) : null}
                          <label className="p-1 px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer shrink-0">
                            {uploadingIdx === idx ? 'Upload...' : 'Unggah Nota'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => handleNotaUpload(idx, e)}
                              disabled={uploadingIdx === idx}
                            />
                          </label>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={realisasiItems.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Realisasi Terinput: <strong>{formatRupiah(totalRealisasi)}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Realisasi LPJ</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
