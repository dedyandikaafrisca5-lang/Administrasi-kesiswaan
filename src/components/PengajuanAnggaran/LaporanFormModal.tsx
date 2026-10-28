import React, { useState } from 'react';
import { PengajuanAnggaran, RealisasiAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { X, Plus, Trash2, ClipboardCheck, Save, Printer, AlertCircle } from 'lucide-react';

interface LaporanFormModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
  onOpenPrintLPJ?: (pengajuan: PengajuanAnggaran) => void;
}

export const LaporanFormModal: React.FC<LaporanFormModalProps> = ({ pengajuan, onClose, onOpenPrintLPJ }) => {
  const { data, saveLaporanKegiatan } = useApp();

  const existingRealisasi = data.realisasi_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);
  const rincianRAB = data.rincian_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);

  // LPJ Text inputs state
  const [tanggalLaporan, setTanggalLaporan] = useState<string>(
    pengajuan.tanggal_laporan || new Date().toISOString().split('T')[0]
  );
  const [jumlahPesertaHadir, setJumlahPesertaHadir] = useState<number>(
    pengajuan.jumlah_peserta_hadir || 40
  );
  const [laporanEvaluasi, setLaporanEvaluasi] = useState<string>(
    pengajuan.laporan_evaluasi || 
    'Kegiatan telah berjalan dengan tertib, lancar, dan sesuai dengan jadwal rencana. Seluruh peserta berpartisipasi aktif dan target tujuan kegiatan tercapai dengan baik.'
  );
  const [laporanKendala, setLaporanKendala] = useState<string>(
    pengajuan.laporan_kendala || 
    'Tidak ada kendala yang berarti. Sedikit penyesuaian teknis di lapangan dapat ditangani dengan baik oleh tim panitia.'
  );
  const [laporanRekomendasi, setLaporanRekomendasi] = useState<string>(
    pengajuan.laporan_rekomendasi || 
    'Persiapan teknis dan koordinasi antar seksi dapat dimulai lebih awal pada pelaksanaan kegiatan berikutnya.'
  );

  // Realisasi Item List State
  const [realisasiList, setRealisasiList] = useState<Partial<RealisasiAnggaran>[]>(() => {
    if (existingRealisasi.length > 0) {
      return existingRealisasi;
    }
    // Pre-populate with RAB items for convenience
    if (rincianRAB.length > 0) {
      return rincianRAB.map((r) => ({
        pengajuan_id: pengajuan.id,
        uraian: r.uraian,
        jumlah_realisasi: r.volume,
        harga_realisasi: r.harga_satuan,
        subtotal_realisasi: r.subtotal,
        bukti_file: '',
        tanggal_realisasi: new Date().toISOString().split('T')[0],
      }));
    }
    return [
      { uraian: 'Konsumsi & Snack Peserta', jumlah_realisasi: 40, harga_realisasi: 25000, subtotal_realisasi: 1000000 },
      { uraian: 'Banner & Publikasi', jumlah_realisasi: 1, harga_realisasi: 300000, subtotal_realisasi: 300000 },
    ];
  });

  const handleAddRow = () => {
    setRealisasiList([
      ...realisasiList,
      { 
        uraian: '', 
        jumlah_realisasi: 1, 
        harga_realisasi: 0, 
        subtotal_realisasi: 0,
        tanggal_realisasi: tanggalLaporan
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (realisasiList.length <= 1) return;
    setRealisasiList(realisasiList.filter((_, idx) => idx !== index));
  };

  const handleRealisasiChange = (index: number, field: keyof RealisasiAnggaran, val: any) => {
    const updated = [...realisasiList];
    const current = { ...updated[index], [field]: val };
    
    // Auto-calculate subtotal
    const vol = Number(current.jumlah_realisasi || 1);
    const harga = Number(current.harga_realisasi || 0);
    current.subtotal_realisasi = vol * harga;

    updated[index] = current;
    setRealisasiList(updated);
  };

  const calculatedTotalRealisasi = realisasiList.reduce((acc, curr) => acc + (curr.subtotal_realisasi || 0), 0);
  const sisaSaldo = pengajuan.total_anggaran - calculatedTotalRealisasi;

  const handleSaveAndPrint = (printDirect: boolean) => {
    saveLaporanKegiatan(
      pengajuan.id,
      {
        tanggal_laporan: tanggalLaporan,
        jumlah_peserta_hadir: Number(jumlahPesertaHadir || 0),
        laporan_evaluasi: laporanEvaluasi,
        laporan_kendala: laporanKendala,
        laporan_rekomendasi: laporanRekomendasi,
        status_lpj: 'selesai',
      },
      realisasiList
    );

    const updatedPengajuan: PengajuanAnggaran = {
      ...pengajuan,
      tanggal_laporan: tanggalLaporan,
      jumlah_peserta_hadir: Number(jumlahPesertaHadir || 0),
      laporan_evaluasi: laporanEvaluasi,
      laporan_kendala: laporanKendala,
      laporan_rekomendasi: laporanRekomendasi,
      total_realisasi: calculatedTotalRealisasi,
      status: 'selesai_lpj',
      status_lpj: 'selesai',
    };

    onClose();

    if (printDirect && onOpenPrintLPJ) {
      onOpenPrintLPJ(updatedPengajuan);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold">Penyusunan Laporan Pertanggungjawaban (LPJ Kegiatan)</h3>
              <p className="text-xs text-emerald-100">Evaluasi pelaksanaan dan rincian realisasi pengeluaran riil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 text-xs">
          
          {/* Ringkasan Kegiatan */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block">Nama Kegiatan:</span>
              <span className="font-bold text-slate-900 text-sm block">{pengajuan.nama_kegiatan}</span>
              <span className="text-[11px] text-slate-500">{pengajuan.nomor_surat}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block">Waktu & Tempat:</span>
              <span className="font-medium text-slate-900 block">{pengajuan.waktu_pelaksanaan || '-'}</span>
              <span className="text-[11px] text-slate-500">{pengajuan.tempat || '-'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block">Pagu Anggaran (RAB Awal):</span>
              <span className="font-black text-emerald-800 text-base">{formatRupiah(pengajuan.total_anggaran)}</span>
            </div>
          </div>

          {/* Bagian 1: Data Evaluasi Pelaksanaan */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2 border-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">1</span>
              <span>Evaluasi & Hasil Pelaksanaan Kegiatan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Penyusunan LPJ:</label>
                <input
                  type="date"
                  value={tanggalLaporan}
                  onChange={(e) => setTanggalLaporan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Peserta Hadir (Siswa/Orang):</label>
                <input
                  type="number"
                  value={jumlahPesertaHadir}
                  onChange={(e) => setJumlahPesertaHadir(Number(e.target.value))}
                  placeholder="Contoh: 40"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi Hasil & Ketercapaian Kegiatan:</label>
              <textarea
                rows={3}
                value={laporanEvaluasi}
                onChange={(e) => setLaporanEvaluasi(e.target.value)}
                placeholder="Jelaskan jalannya acara, pencapaian target, dan evaluasi umum..."
                className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kendala / Hambatan yang Terjadi:</label>
                <textarea
                  rows={2}
                  value={laporanKendala}
                  onChange={(e) => setLaporanKendala(e.target.value)}
                  placeholder="Kendala di lapangan..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rekomendasi Solusi / Tindak Lanjut:</label>
                <textarea
                  rows={2}
                  value={laporanRekomendasi}
                  onChange={(e) => setLaporanRekomendasi(e.target.value)}
                  placeholder="Rekomendasi untuk perbaikan periode depan..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Realisasi Penggunaan Anggaran Riil */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">2</span>
                <span>Rincian Realisasi Pengeluaran Anggaran (Kuitansi / Nota Riil)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Realisasi</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-10">No</th>
                    <th className="p-2.5">Uraian Belanja Realisasi</th>
                    <th className="p-2.5 w-24 text-center">Volume</th>
                    <th className="p-2.5 w-32 text-right">Harga Satuan (Rp)</th>
                    <th className="p-2.5 w-36 text-right">Total Realisasi</th>
                    <th className="p-2.5 text-center w-12">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {realisasiList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.uraian || ''}
                          onChange={(e) => handleRealisasiChange(idx, 'uraian', e.target.value)}
                          placeholder="Nama barang / jasa / honor..."
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.jumlah_realisasi || 1}
                          onChange={(e) => handleRealisasiChange(idx, 'jumlah_realisasi', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-center border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          value={item.harga_realisasi || 0}
                          onChange={(e) => handleRealisasiChange(idx, 'harga_realisasi', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-right border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2.5 text-right font-black text-slate-900">
                        {formatRupiah(item.subtotal_realisasi || 0)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={realisasiList.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rekap Saldo */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Pagu Anggaran RAB Awal:</span>
                <span className="font-semibold text-slate-900">{formatRupiah(pengajuan.total_anggaran)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-800 font-bold">
                <span>Total Realisasi Pengeluaran:</span>
                <span>{formatRupiah(calculatedTotalRealisasi)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 text-slate-900">
                <span>Sisa Saldo Anggaran:</span>
                <span className={sisaSaldo >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  {formatRupiah(sisaSaldo)} {sisaSaldo >= 0 ? '(Nihil / Surplus)' : '(Defisit)'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Menyimpan akan menandai status kegiatan sebagai "Selesai LPJ"</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSaveAndPrint(false)}
              className="w-1/2 sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan LPJ</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveAndPrint(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Simpan & Cetak LPJ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
