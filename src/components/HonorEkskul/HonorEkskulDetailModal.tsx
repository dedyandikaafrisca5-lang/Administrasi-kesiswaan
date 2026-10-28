import React from 'react';
import { PengajuanHonorEkskul } from '../../types';
import { formatRupiah, formatTanggalIndo, getStatusHonorBadge } from '../../utils/formatters';
import { 
  X, 
  Printer, 
  Edit, 
  Trash2, 
  Banknote, 
  Calendar, 
  Layers, 
  CheckCircle2,
  FileText
} from 'lucide-react';

interface HonorEkskulDetailModalProps {
  pengajuan: PengajuanHonorEkskul;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDelete: () => void;
}

export const HonorEkskulDetailModal: React.FC<HonorEkskulDetailModalProps> = ({
  pengajuan,
  onClose,
  onEdit,
  onPrint,
  onDelete,
}) => {
  const statusBadge = getStatusHonorBadge(pengajuan.status);
  const items = pengajuan.items || [];
  const totalHonor = pengajuan.total_honor_dibayarkan || items.reduce((s, i) => s + (i.total_honor || 0), 0);
  const totalPertemuan = pengajuan.total_pertemuan_semua || items.reduce((s, i) => s + (i.jumlah_pertemuan || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Detail Pengajuan Honor Ekstrakurikuler
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                No. Surat: {pengajuan.nomor_surat}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Periode Bulan</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {pengajuan.bulan_mulai} s.d. {pengajuan.bulan_selesai}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Tahun Pelajaran</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                TP {pengajuan.tahun_ajaran}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Tanggal Pengajuan</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {formatTanggalIndo(pengajuan.tanggal_pengajuan)}
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[11px] text-amber-800 block">Total Honor Dibayarkan</span>
              <span className="text-sm font-extrabold text-amber-700 block mt-0.5 font-mono">
                {formatRupiah(totalHonor)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
            <p><strong className="text-slate-900">Sumber Dana:</strong> {pengajuan.sumber_dana}</p>
            <p><strong className="text-slate-900">Uraian / Keterangan:</strong> {pengajuan.keterangan || '-'}</p>
          </div>

          {/* Table Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Rincian Pembina & Pelatih Ekstrakurikuler ({items.length})</span>
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Pertemuan: {totalPertemuan} Kali
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Ekstrakurikuler</th>
                    <th className="py-2.5 px-3">Nama Pembina / Pelatih</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status Penerima</th>
                    <th className="py-2.5 px-3 w-32 text-right">Honor / Pertemuan</th>
                    <th className="py-2.5 px-3 w-28 text-center">Jml Pertemuan</th>
                    <th className="py-2.5 px-3 w-36 text-right">Total Honor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => {
                    const subtotal = item.total_honor || (item.honor_per_pertemuan * item.jumlah_pertemuan);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.nama_ekstrakurikuler}
                          {item.keterangan && (
                            <span className="block text-[11px] text-slate-400 font-normal">
                              {item.keterangan}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {item.nama_pembina_pelatih}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            item.status_penerima === 'Pelatih Eksternal' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {item.status_penerima || 'Guru Pembina'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatRupiah(item.honor_per_pertemuan)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {item.jumlah_pertemuan} kali
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 font-mono bg-amber-50/50">
                          {formatRupiah(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={5} className="py-3 px-3 text-right text-xs uppercase tracking-wider text-slate-300">
                      Total Rekapitulasi Honor Yang Dibayarkan
                    </td>
                    <td className="py-3 px-3 text-center text-amber-400 font-extrabold">
                      {totalPertemuan} kali
                    </td>
                    <td className="py-3 px-3 text-right text-base text-amber-400 font-mono font-extrabold">
                      {formatRupiah(totalHonor)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Pengajuan</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
