import React, { useState } from 'react';
import { PengajuanAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { parsePanitiaFromText, parseAcaraFromText } from '../../utils/proposalHelpers';
import { 
  X, 
  Receipt, 
  Printer, 
  Edit3, 
  MapPin,
  Calendar,
  Building2,
  FileText,
  ClipboardCheck,
  Users2,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AnggaranDetailModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
  onOpenPrintRAB: () => void;
  onOpenPrintProposal: () => void;
  onOpenPrintLPJ?: () => void;
  onOpenEdit: () => void;
  onOpenLPJForm: () => void;
}

export const AnggaranDetailModal: React.FC<AnggaranDetailModalProps> = ({
  pengajuan,
  onClose,
  onOpenPrintRAB,
  onOpenPrintProposal,
  onOpenPrintLPJ,
  onOpenEdit,
  onOpenLPJForm,
}) => {
  const { data, savePengajuanAnggaran } = useApp();
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<number>(pengajuan.unit_id);

  const unit = data.unit.find((u) => u.id === currentUnitId) || data.unit.find((u) => u.id === pengajuan.unit_id);
  const rincianList = data.rincian_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);
  const realisasiList = data.realisasi_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);

  const isLPJSelesai = pengajuan.status_lpj === 'selesai' || pengajuan.status === 'selesai_lpj';
  const totalRealisasi = realisasiList.reduce((acc, curr) => acc + curr.subtotal_realisasi, 0) || pengajuan.total_realisasi || 0;
  const sisaSaldo = pengajuan.total_anggaran - totalRealisasi;

  const handleUnitChange = (newUnitId: number) => {
    setCurrentUnitId(newUnitId);
    savePengajuanAnggaran({
      id: pengajuan.id,
      unit_id: newUnitId,
    });
    setIsEditingUnit(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold">Detail Lengkap Dokumen Kegiatan</h3>
              <p className="text-xs text-slate-400 font-mono">{pengajuan.nomor_surat}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Top Info Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingUnit ? (
                  <div className="inline-flex items-center gap-1.5 bg-white p-1 rounded-lg border border-indigo-300 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                    <select
                      value={currentUnitId}
                      onChange={(e) => handleUnitChange(Number(e.target.value))}
                      className="text-xs font-bold text-indigo-950 bg-transparent border-none focus:outline-hidden cursor-pointer"
                    >
                      {data.unit.map((u) => (
                        <option key={u.id} value={u.id}>
                          [{u.jenis.toUpperCase()}] {u.nama}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsEditingUnit(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 inline-flex items-center gap-1.5 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{unit?.nama || 'Kesiswaan'}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingUnit(true)}
                      className="ml-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                      title="Ganti Unit Pelaksana Kegiatan"
                    >
                      (Ganti Unit)
                    </button>
                  </span>
                )}
                
                {isLPJSelesai ? (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LPJ Telah Disusun</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu LPJ Kegiatan</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900">{pengajuan.nama_kegiatan}</h3>
              <p className="text-xs text-slate-500">
                Tanggal Dibuat: <strong>{formatTanggalIndo(pengajuan.tanggal_pengajuan)}</strong>
              </p>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-indigo-200 pt-2 sm:pt-0 sm:pl-5 shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total RAB Anggaran</span>
              <span className="text-xl font-black text-indigo-950">{formatRupiah(pengajuan.total_anggaran)}</span>
              {isLPJSelesai && (
                <span className="text-[11px] text-emerald-700 font-bold mt-1">
                  Realisasi: {formatRupiah(totalRealisasi)}
                </span>
              )}
            </div>
          </div>

          {/* Bagian 1: Informasi Proposal Kegiatan */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>1. Ringkasan Naskah Proposal Kegiatan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Waktu Pelaksanaan</span>
                  <span className="text-slate-900 font-bold">{pengajuan.waktu_pelaksanaan || '-'}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Tempat / Lokasi</span>
                  <span className="text-slate-900 font-bold">{pengajuan.tempat || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Sasaran Peserta</span>
                <span className="text-slate-800 font-medium">{pengajuan.sasaran || 'Peserta Didik SMP Negeri 2 Pulung'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">Sumber Alokasi Dana</span>
                <span className="text-slate-800 font-medium">{pengajuan.sumber_dana || 'Dana BOS Kesiswaan'}</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                <span className="text-slate-400 block font-semibold text-[11px]">Latar Belakang</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{pengajuan.latar_belakang || '-'}</p>
              </div>

              {pengajuan.tujuan && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-semibold text-[11px]">Tujuan Kegiatan</span>
                  <p className="text-slate-700 mt-0.5 whitespace-pre-line leading-relaxed">{pengajuan.tujuan}</p>
                </div>
              )}

              {/* Susunan Panitia */}
              {pengajuan.susunan_panitia && (() => {
                const parsed = parsePanitiaFromText(pengajuan.susunan_panitia);
                return (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-600 block font-bold text-[11px] mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Susunan Kepanitiaan Pelaksana ({parsed.length} Personil)</span>
                    </span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2 w-8 text-center">No</th>
                            <th className="p-2 w-36 sm:w-44">Jabatan / Seksi</th>
                            <th className="p-2">Nama Personil</th>
                            <th className="p-2 w-36 sm:w-44">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsed.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2 font-bold text-slate-900">{p.jabatan}</td>
                              <td className="p-2 text-slate-800 font-medium">{p.nama}</td>
                              <td className="p-2 text-slate-500">{p.keterangan || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Susunan Acara / Rundown */}
              {pengajuan.susunan_acara && (() => {
                const parsed = parseAcaraFromText(pengajuan.susunan_acara);
                return (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-600 block font-bold text-[11px] mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Susunan Acara & Rundown Kegiatan ({parsed.length} Sesi)</span>
                    </span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2 w-8 text-center">No</th>
                            <th className="p-2 w-32 sm:w-36 font-mono">Waktu</th>
                            <th className="p-2">Uraian Kegiatan / Agenda</th>
                            <th className="p-2 w-36 sm:w-44">Penanggung Jawab</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsed.map((a, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                              <td className="p-2 font-mono font-bold text-slate-900">{a.waktu}</td>
                              <td className="p-2 text-slate-800 font-medium">{a.kegiatan}</td>
                              <td className="p-2 text-slate-500">{a.pengisi || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Bagian 2: RAB Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>2. Rencana Anggaran Biaya ({rincianList.length} Pos Belanja)</span>
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Uraian Kebutuhan</th>
                    <th className="p-2.5 w-20 text-center">Volume</th>
                    <th className="p-2.5 w-24 text-center">Satuan</th>
                    <th className="p-2.5 w-32 text-right">Harga Satuan</th>
                    <th className="p-2.5 w-36 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rincianList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        Belum ada item rincian anggaran terdaftar.
                      </td>
                    </tr>
                  ) : (
                    rincianList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="p-2.5 font-medium text-slate-900">{item.uraian}</td>
                        <td className="p-2.5 text-center font-bold">{item.volume}</td>
                        <td className="p-2.5 text-center text-slate-600">{item.satuan}</td>
                        <td className="p-2.5 text-right text-slate-600">{formatRupiah(item.harga_satuan)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-200">
                    <td colSpan={5} className="p-3 text-right uppercase text-emerald-950 font-bold">Total Nilai RAB:</td>
                    <td className="p-3 text-right font-black text-sm text-emerald-950">{formatRupiah(pengajuan.total_anggaran)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bagian 3: Laporan Pertanggungjawaban (Jika Ada) */}
          {isLPJSelesai && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                  <span>3. Ringkasan Laporan Pertanggungjawaban (LPJ Kegiatan)</span>
                </h4>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Tgl Laporan: {formatTanggalIndo(pengajuan.tanggal_laporan || pengajuan.tanggal_pengajuan)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-emerald-800 block font-semibold text-[11px]">Jumlah Peserta Hadir:</span>
                  <span className="font-bold text-slate-900">{pengajuan.jumlah_peserta_hadir ? `${pengajuan.jumlah_peserta_hadir} Siswa` : '-'}</span>
                </div>
                <div>
                  <span className="text-emerald-800 block font-semibold text-[11px]">Sisa Saldo Anggaran:</span>
                  <span className="font-black text-emerald-900">{formatRupiah(sisaSaldo)}</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-emerald-200">
                  <span className="text-emerald-800 block font-semibold text-[11px]">Hasil Evaluasi Acara:</span>
                  <p className="text-slate-800 mt-0.5">{pengajuan.laporan_evaluasi || '-'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Toolbar with 3 Document Print options */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Data</span>
            </button>

            <button
              onClick={onOpenPrintProposal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Cetak Naskah Lengkap Proposal"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Cetak Proposal</span>
            </button>

            <button
              onClick={onOpenPrintRAB}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Cetak Rencana Anggaran Biaya (RAB)"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Cetak RAB</span>
            </button>

            {isLPJSelesai && onOpenPrintLPJ ? (
              <button
                onClick={onOpenPrintLPJ}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Cetak Laporan Pertanggungjawaban (LPJ)"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Cetak LPJ</span>
              </button>
            ) : (
              <button
                onClick={onOpenLPJForm}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Susun Laporan Pertanggungjawaban"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Buat LPJ</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
