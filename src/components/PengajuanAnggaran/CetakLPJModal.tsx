import React, { useState, useEffect } from 'react';
import { PengajuanAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { SchoolLogo } from '../common/SchoolLogo';
import { SCHOOL_CONFIG } from '../../constants/schoolConfig';
import { UnitManagerModal } from '../AdministrasiDokumen/UnitManagerModal';
import { X, Printer, UserCheck, Settings2, RotateCcw, ClipboardCheck, Building2, Plus } from 'lucide-react';

interface CetakLPJModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
}

const STORAGE_KEY_KEPSEK_NAME = 'smpn2plg_kepsek_name';
const STORAGE_KEY_KEPSEK_NIP = 'smpn2plg_kepsek_nip';
const STORAGE_KEY_KEPSEK_JABATAN = 'smpn2plg_kepsek_jabatan';

export const CetakLPJModal: React.FC<CetakLPJModalProps> = ({ pengajuan, onClose }) => {
  const { data, savePengajuanAnggaran } = useApp();

  const defaultKepsek = data.guru.find((g) => g.role === 'Kepala Sekolah') || data.guru[0];

  // Unit Penyelenggara state
  const [selectedUnitId, setSelectedUnitId] = useState<number>(pengajuan.unit_id);
  const [isEditUnitOpen, setIsEditUnitOpen] = useState(false);
  const [isUnitManagerOpen, setIsUnitManagerOpen] = useState(false);

  const [namaKepsek, setNamaKepsek] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_KEPSEK_NAME) || defaultKepsek?.nama || 'Drs. H. Bambang Suhartono, M.Pd.';
  });

  const [nipKepsek, setNipKepsek] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_KEPSEK_NIP) || defaultKepsek?.nip || '19750312 200003 1 001';
  });

  const [jabatanKepsek, setJabatanKepsek] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_KEPSEK_JABATAN) || 'Kepala SMP Negeri 2 Pulung';
  });

  const [isEditTtdOpen, setIsEditTtdOpen] = useState(false);

  useEffect(() => {
    if (namaKepsek) localStorage.setItem(STORAGE_KEY_KEPSEK_NAME, namaKepsek);
    if (nipKepsek) localStorage.setItem(STORAGE_KEY_KEPSEK_NIP, nipKepsek);
    if (jabatanKepsek) localStorage.setItem(STORAGE_KEY_KEPSEK_JABATAN, jabatanKepsek);
  }, [namaKepsek, nipKepsek, jabatanKepsek]);

  const handleResetKepsek = () => {
    const defaultName = defaultKepsek?.nama || 'Drs. H. Bambang Suhartono, M.Pd.';
    const defaultNip = defaultKepsek?.nip || '19750312 200003 1 001';
    const defaultJab = 'Kepala SMP Negeri 2 Pulung';
    setNamaKepsek(defaultName);
    setNipKepsek(defaultNip);
    setJabatanKepsek(defaultJab);
    localStorage.setItem(STORAGE_KEY_KEPSEK_NAME, defaultName);
    localStorage.setItem(STORAGE_KEY_KEPSEK_NIP, defaultNip);
    localStorage.setItem(STORAGE_KEY_KEPSEK_JABATAN, defaultJab);
  };

  const handleUnitChange = (newUnitId: number) => {
    setSelectedUnitId(newUnitId);
    savePengajuanAnggaran({
      id: pengajuan.id,
      unit_id: newUnitId,
    });
  };

  const rincianRAB = data.rincian_anggaran.filter((r) => Number(r.pengajuan_id) === Number(pengajuan.id));
  const realisasiList = data.realisasi_anggaran.filter((r) => Number(r.pengajuan_id) === Number(pengajuan.id));
  const unit = data.unit.find((u) => u.id === selectedUnitId) || data.unit.find((u) => u.id === pengajuan.unit_id);

  const totalRAB = pengajuan.total_anggaran;
  const totalRealisasi = realisasiList.reduce((acc, curr) => acc + curr.subtotal_realisasi, 0) || pengajuan.total_realisasi || 0;
  const sisaSaldo = totalRAB - totalRealisasi;

  // Mark body when print modal is active
  useEffect(() => {
    document.body.classList.add('printing-modal');
    return () => {
      document.body.classList.remove('printing-modal');
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add('printing-modal');
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print-modal-overlay print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto">
      {/* Explicit @page rule to guarantee exact A4 pagination */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print-modal-container print:static print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:overflow-visible print:block print:m-0 print:p-0">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Laporan Pertanggungjawaban (LPJ Kegiatan)</h3>
              <p className="text-[11px] text-slate-400">Format resmi A4 • Laporan evaluasi pelaksanaan & realisasi keuangan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Ganti Unit Penyelenggara */}
            <button
              onClick={() => {
                setIsEditUnitOpen(!isEditUnitOpen);
                if (!isEditUnitOpen) setIsEditTtdOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditUnitOpen 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Ganti Unit / Penyelenggara Kegiatan"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isEditUnitOpen ? 'Tutup Unit' : 'Ganti Unit Penyelenggara'}</span>
            </button>

            {/* Tombol Ubah Nama/NIP Kepsek */}
            <button
              onClick={() => {
                setIsEditTtdOpen(!isEditTtdOpen);
                if (!isEditTtdOpen) setIsEditUnitOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditTtdOpen 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Atur Nama & NIP Kepala Sekolah"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isEditTtdOpen ? 'Tutup Form TTD' : 'Ubah Nama/NIP Kepsek'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan LPJ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input Panel for Unit Penyelenggara (Hidden on Print) */}
        {isEditUnitOpen && (
          <div className="bg-emerald-50/90 border-b border-emerald-200 px-6 py-3.5 print:hidden animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Unit Penyelenggara Kegiatan (Otomatis Diperbarui pada LPJ & Disimpan)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUnitOpen(false)}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Unit Organisasi / Penyelenggara:
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => handleUnitChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 shadow-2xs"
                >
                  {data.unit.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.jenis.toUpperCase()}] {u.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={() => setIsUnitManagerOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah / Kelola Unit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Panel for Kepala Sekolah Signature (Hidden on Print) */}
        {isEditTtdOpen && (
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-6 py-3.5 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Tanda Tangan Kepala Sekolah (Otomatis Diperbarui pada PDF)</span>
              </div>
              <button
                type="button"
                onClick={handleResetKepsek}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Default</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah & Gelar:
                </label>
                <input
                  type="text"
                  value={namaKepsek}
                  onChange={(e) => setNamaKepsek(e.target.value)}
                  placeholder="Contoh: Drs. H. Bambang Suhartono, M.Pd."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={nipKepsek}
                  onChange={(e) => setNipKepsek(e.target.value)}
                  placeholder="Contoh: 19750312 200003 1 001"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jabatan / Keterangan:
                </label>
                <input
                  type="text"
                  value={jabatanKepsek}
                  onChange={(e) => setJabatanKepsek(e.target.value)}
                  placeholder="Contoh: Kepala SMP Negeri 2 Pulung"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Body */}
        <div id="printable-lpj-area" className="p-8 sm:p-12 overflow-y-auto flex-1 text-slate-900 bg-white font-serif leading-relaxed text-sm print-document-body print:overflow-visible print:p-0 print:m-0 print:h-auto print:max-h-none print:w-full print:block">
          
          {/* KOP SURAT RESMI SEKOLAH */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 relative break-inside-avoid page-break-inside-avoid">
            <div className="flex items-center gap-4">
              <SchoolLogo 
                size="lg" 
                variant="plain" 
                showBackground={false} 
                className="w-20 h-20 shrink-0" 
              />
              <div className="flex-1 text-center space-y-0.5 pr-6 sm:pr-10">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-slate-700 font-sans">
                  {SCHOOL_CONFIG.kabupaten.toUpperCase()} • {SCHOOL_CONFIG.dinas.toUpperCase()}
                </h4>
                <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase text-slate-950 font-sans">
                  {SCHOOL_CONFIG.name.toUpperCase()}
                </h2>
                <p className="text-[11px] text-slate-600 leading-tight font-sans">
                  {SCHOOL_CONFIG.address} • Telp: {SCHOOL_CONFIG.phone}<br />
                  Website: {SCHOOL_CONFIG.website} • Email: {SCHOOL_CONFIG.email}
                </p>
              </div>
            </div>
          </div>

          {/* DOKUMEN HEADER & JUDUL */}
          <div className="text-center my-6 space-y-1 break-inside-avoid page-break-inside-avoid">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider underline text-slate-900">
              LAPORAN PERTANGGUNGJAWABAN (LPJ) KEGIATAN
            </h3>
            <p className="text-xs font-semibold text-slate-700 font-sans">
              Nomor Surat/LPJ: {pengajuan.nomor_surat.replace('PROP', 'LPJ').replace('ANGG', 'LPJ')}
            </p>
            <p className="text-sm font-bold text-slate-900 uppercase pt-1 font-sans">
              KEGIATAN: {pengajuan.nama_kegiatan}
            </p>
          </div>

          {/* ISI LPJ */}
          <div className="space-y-6 text-justify text-slate-800 text-xs sm:text-[13px]">
            
            {/* IDENTITAS KEGIATAN */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs break-inside-avoid page-break-inside-avoid">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-44 py-1 font-semibold text-slate-700">Unit / Penyelenggara</td>
                    <td className="py-1">
                      : <span className="font-bold text-slate-950">{unit?.nama || 'Kesiswaan SMPN 2 Pulung'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditUnitOpen(true);
                          setIsEditTtdOpen(false);
                        }}
                        className="ml-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors print:hidden cursor-pointer"
                        title="Klik untuk mengganti Unit Penyelenggara"
                      >
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        <span>Ganti Unit</span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Waktu Pelaksanaan</td>
                    <td className="py-1">: {pengajuan.waktu_pelaksanaan || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Tempat Pelaksanaan</td>
                    <td className="py-1">: {pengajuan.tempat || 'SMP Negeri 2 Pulung'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Jumlah Peserta Hadir</td>
                    <td className="py-1 font-bold text-slate-900">: {pengajuan.jumlah_peserta_hadir ? `${pengajuan.jumlah_peserta_hadir} Siswa/Peserta` : `${pengajuan.sasaran || '-'}`}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Tanggal Penyusunan LPJ</td>
                    <td className="py-1">: {formatTanggalIndo(pengajuan.tanggal_laporan || pengajuan.tanggal_pengajuan)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BAB I */}
            <div className="break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 font-sans text-xs uppercase mb-1.5">
                I. PENDAHULUAN
              </h4>
              <p className="whitespace-pre-line leading-relaxed indent-8">
                Puji syukur dipanjatkan ke hadirat Tuhan Yang Maha Esa atas terlaksananya kegiatan <span className="font-semibold">{pengajuan.nama_kegiatan}</span> dengan tertib dan lancar. Laporan Pertanggungjawaban ini disusun sebagai bentuk akuntabilitas, evaluasi program, dan pelaporan keuangan kesiswaan di SMP Negeri 2 Pulung.
              </p>
            </div>

            {/* BAB II - EVALUASI */}
            <div className="break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 font-sans text-xs uppercase mb-1.5">
                II. HASIL DAN EVALUASI PELAKSANAAN KEGIATAN
              </h4>
              <p className="whitespace-pre-line leading-relaxed indent-8">
                {pengajuan.laporan_evaluasi || 'Kegiatan telah terlaksana sesuai dengan jadwal rundown yang direncanakan. Antusiasme dan partisipasi peserta didik sangat tinggi dalam setiap sesi pembinaan, serta seluruh target capaian kegiatan dapat diselesaikan dengan baik.'}
              </p>
            </div>

            {/* BAB III - KENDALA & REKOMENDASI */}
            <div className="break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 font-sans text-xs uppercase mb-1.5">
                III. KENDALA DAN REKOMENDASI TINDAK LANJUT
              </h4>
              <div className="space-y-2">
                <div className="pl-4 font-sans text-xs">
                  <span className="font-semibold text-slate-900 block">• Kendala / Hambatan yang Dihadapi:</span>
                  <p className="text-slate-700 mt-0.5">{pengajuan.laporan_kendala || 'Secara umum tidak terjadi kendala berarti, penyesuaian teknis kecil di lapangan dapat ditangani langsung oleh panitia pelaksana.'}</p>
                </div>
                <div className="pl-4 font-sans text-xs">
                  <span className="font-semibold text-slate-900 block">• Rekomendasi / Masukan Perbaikan:</span>
                  <p className="text-slate-700 mt-0.5">{pengajuan.laporan_rekomendasi || 'Diharapkan persiapan sarana perlengkapan dan koordinasi teknis dapat dimulai lebih awal pada pelaksanaan kegiatan berikutnya.'}</p>
                </div>
              </div>
            </div>

            {/* BAB IV - REALISASI KEUANGAN */}
            <div className="break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 font-sans text-xs uppercase mb-2">
                IV. LAPORAN REALISASI ANGGARAN BIAYA (LPJ KEUANGAN)
              </h4>
              
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full border-collapse border border-slate-900 text-xs font-sans table-fixed">
                  <thead>
                    <tr className="bg-slate-100 print:bg-slate-200 text-slate-900">
                      <th className="border border-slate-900 p-2 text-center w-[6%]">No</th>
                      <th className="border border-slate-900 p-2 text-left w-[38%]">Uraian Belanja / Pengeluaran</th>
                      <th className="border border-slate-900 p-2 text-center w-[12%]">Volume</th>
                      <th className="border border-slate-900 p-2 text-right w-[15%]">Harga Satuan</th>
                      <th className="border border-slate-900 p-2 text-right w-[15%]">Total Realisasi</th>
                      <th className="border border-slate-900 p-2 text-center w-[14%]">Tanggal / Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realisasiList.length === 0 ? (
                      rincianRAB.map((r, idx) => (
                        <tr key={r.id || idx} className="break-inside-avoid page-break-inside-avoid">
                          <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-2 font-medium">{r.uraian}</td>
                          <td className="border border-slate-900 p-2 text-center">{r.volume} {r.satuan}</td>
                          <td className="border border-slate-900 p-2 text-right">{formatRupiah(r.harga_satuan)}</td>
                          <td className="border border-slate-900 p-2 text-right font-semibold">{formatRupiah(r.subtotal)}</td>
                          <td className="border border-slate-900 p-2 text-center text-slate-500 font-mono text-[10px]">Tersedia</td>
                        </tr>
                      ))
                    ) : (
                      realisasiList.map((re, idx) => (
                        <tr key={re.id || idx} className="break-inside-avoid page-break-inside-avoid">
                          <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-2 font-medium">{re.uraian}</td>
                          <td className="border border-slate-900 p-2 text-center">{re.jumlah_realisasi} Item</td>
                          <td className="border border-slate-900 p-2 text-right">{formatRupiah(re.harga_realisasi)}</td>
                          <td className="border border-slate-900 p-2 text-right font-semibold">{formatRupiah(re.subtotal_realisasi)}</td>
                          <td className="border border-slate-900 p-2 text-center text-slate-600 font-mono text-[10px]">
                            {re.tanggal_realisasi ? formatTanggalIndo(re.tanggal_realisasi) : 'Nota Terlampir'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 print:bg-slate-100 font-semibold break-inside-avoid page-break-inside-avoid">
                      <td colSpan={4} className="border border-slate-900 p-2 text-right uppercase">
                        Total Pagu Anggaran RAB Awal:
                      </td>
                      <td colSpan={2} className="border border-slate-900 p-2 text-right font-mono">
                        {formatRupiah(totalRAB)}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 print:bg-slate-200 font-bold break-inside-avoid page-break-inside-avoid">
                      <td colSpan={4} className="border border-slate-900 p-2 text-right uppercase">
                        Total Realisasi Pengeluaran:
                      </td>
                      <td colSpan={2} className="border border-slate-900 p-2 text-right text-emerald-900 font-black font-mono">
                        {formatRupiah(totalRealisasi)}
                      </td>
                    </tr>
                    <tr className="bg-slate-200/80 print:bg-slate-300 font-bold break-inside-avoid page-break-inside-avoid">
                      <td colSpan={4} className="border border-slate-900 p-2 text-right uppercase">
                        Sisa Saldo Anggaran (RAB - Realisasi):
                      </td>
                      <td colSpan={2} className="border border-slate-900 p-2 text-right text-slate-900 font-black font-mono">
                        {formatRupiah(sisaSaldo)} {sisaSaldo >= 0 ? '(Nihil / Surplus)' : '(Defisit)'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* BAB V */}
            <div className="break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 font-sans text-xs uppercase mb-1.5">
                V. PENUTUP
              </h4>
              <p className="leading-relaxed indent-8">
                Demikian Laporan Pertanggungjawaban ini dibuat dengan sebenarnya dan penuh tanggung jawab. Kami menyampaikan terima kasih yang sebesar-besarnya kepada Kepala Sekolah, Dewan Guru, Pembina, serta seluruh panitia yang telah mendukung kesuksesan kegiatan kesiswaan ini.
              </p>
            </div>

          </div>

          {/* LEMBAR PENGESAHAN & TANDA TANGAN (HANYA KEPALA SEKOLAH) */}
          <div className="mt-10 pt-4 font-sans text-xs page-break-inside-avoid break-inside-avoid flex justify-end">
            <div className="w-80 text-center space-y-16">
              <div>
                <p className="text-slate-700">Pulung, {formatTanggalIndo(pengajuan.tanggal_laporan || pengajuan.tanggal_pengajuan)}</p>
                <p className="font-semibold text-slate-900 mt-1">{jabatanKepsek || 'Kepala SMP Negeri 2 Pulung'}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold underline text-slate-950 text-sm tracking-wide">
                  {namaKepsek || '( ................................................. )'}
                </p>
                <p className="text-slate-700 font-mono text-xs">
                  {nipKepsek ? `NIP. ${nipKepsek}` : 'NIP. ................................................'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-500">Laporan Pertanggungjawaban (LPJ) SMP Negeri 2 Pulung siap cetak & arsip</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak LPJ</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>

      {isUnitManagerOpen && (
        <UnitManagerModal onClose={() => setIsUnitManagerOpen(false)} />
      )}
    </div>
  );
};
