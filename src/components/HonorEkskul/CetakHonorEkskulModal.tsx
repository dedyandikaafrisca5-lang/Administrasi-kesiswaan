import React, { useState, useEffect } from 'react';
import { PengajuanHonorEkskul } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo, angkaTerbilang } from '../../utils/formatters';
import { SchoolLogo } from '../common/SchoolLogo';
import { SCHOOL_CONFIG } from '../../constants/schoolConfig';
import { X, Printer, UserCheck, Settings2, RotateCcw } from 'lucide-react';

interface CetakHonorEkskulModalProps {
  pengajuan: PengajuanHonorEkskul;
  onClose: () => void;
}

const STORAGE_KEY_KEPSEK_NAME = 'smpn2plg_kepsek_name';
const STORAGE_KEY_KEPSEK_NIP = 'smpn2plg_kepsek_nip';
const STORAGE_KEY_KEPSEK_JABATAN = 'smpn2plg_kepsek_jabatan';

export const CetakHonorEkskulModal: React.FC<CetakHonorEkskulModalProps> = ({ pengajuan, onClose }) => {
  const { data } = useApp();

  const defaultKepsek = data.guru.find((g) => g.role === 'Kepala Sekolah') || data.guru[0];

  // Custom Kepsek Nama, NIP, & Jabatan state
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
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // Mark body when print modal is active
  useEffect(() => {
    document.body.classList.add('printing-modal');
    return () => {
      document.body.classList.remove('printing-modal');
    };
  }, []);

  // Save changes to localStorage for future prints
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

  const handlePrint = () => {
    window.print();
  };

  const items = pengajuan.items || [];
  const totalHonor = pengajuan.total_honor_dibayarkan || items.reduce((sum, i) => sum + (i.total_honor || 0), 0);
  const totalPertemuan = pengajuan.total_pertemuan_semua || items.reduce((sum, i) => sum + (i.jumlah_pertemuan || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-modal-overlay print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block print:w-full print:h-auto">
      {/* Dynamic @page orientation rule */}
      <style>
        {orientation === 'landscape'
          ? `@page { size: A4 landscape; margin: 10mm 15mm 12mm 15mm; }`
          : `@page { size: A4 portrait; margin: 12mm 15mm 12mm 15mm; }`}
      </style>

      <div className={`bg-white rounded-2xl ${orientation === 'landscape' ? 'max-w-5xl' : 'max-w-4xl'} w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print-modal-container print:static print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:overflow-visible print:block print:m-0 print:p-0`}>
        
        {/* Action Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Dokumen Pengajuan & Tanda Terima Honorarium (PDF)</h3>
              <p className="text-[11px] text-slate-400">Pengesahan tanda tangan Kepala Sekolah SMP Negeri 2 Pulung</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            {/* Orientation Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  orientation === 'landscape' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Format Kertas Lanskap / Mendatar (Sangat disarankan untuk SPJ & tabel honor)"
              >
                Lanskap (A4)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  orientation === 'portrait' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Format Kertas Potret / Tegak"
              >
                Potret (A4)
              </button>
            </div>

            <button
              onClick={() => setIsEditTtdOpen(!isEditTtdOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditTtdOpen 
                  ? 'bg-amber-950 text-amber-300 border-amber-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Atur Nama & NIP Kepala Sekolah"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isEditTtdOpen ? 'Tutup Form TTD' : 'Ubah TTD'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Settings Panel for Kepsek Signature (Hidden on Print) */}
        {isEditTtdOpen && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 print:hidden transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Kustomisasi Pejabat Penandatangan (Kepala Sekolah)</span>
              </div>
              <button
                type="button"
                onClick={handleResetKepsek}
                className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-medium cursor-pointer"
                title="Kembalikan ke data bawaan sistem"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Default</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Kepala Sekolah Beserta Gelar
                </label>
                <input
                  type="text"
                  value={namaKepsek}
                  onChange={(e) => setNamaKepsek(e.target.value)}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={nipKepsek}
                  onChange={(e) => setNipKepsek(e.target.value)}
                  placeholder="NIP. 19xxxxxxxx xxxxxx x xxx"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Jabatan Pengesahan
                </label>
                <input
                  type="text"
                  value={jabatanKepsek}
                  onChange={(e) => setJabatanKepsek(e.target.value)}
                  placeholder="Kepala SMP Negeri 2 Pulung"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 font-serif text-slate-900 bg-white leading-relaxed print-document-body print:overflow-visible print:p-0 print:m-0 print:h-auto print:max-h-none print:w-full print:block">
          
          {/* KOP SURAT RESMI */}
          <div className="flex items-center gap-5 border-b-4 border-double border-black pb-4 mb-6 break-inside-avoid page-break-inside-avoid">
            <div className="shrink-0 flex items-center justify-center">
              <SchoolLogo size={88} className="drop-shadow-xs" />
            </div>
            <div className="flex-1 text-center font-serif">
              <p className="text-sm font-semibold tracking-wider uppercase text-black font-sans">
                {SCHOOL_CONFIG.kabupaten}
              </p>
              <p className="text-xs font-semibold tracking-wider uppercase text-black font-sans">
                {SCHOOL_CONFIG.dinas}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black my-0.5 font-sans">
                {SCHOOL_CONFIG.name.toUpperCase()}
              </h1>
              <p className="text-[11px] text-black font-sans leading-tight mt-1">
                Alamat: {SCHOOL_CONFIG.address} • Telp: {SCHOOL_CONFIG.phone}
              </p>
              <p className="text-[10px] text-black font-sans">
                Website: {SCHOOL_CONFIG.website} • Email: {SCHOOL_CONFIG.email} • NPSN: {SCHOOL_CONFIG.npsn || '20510528'}
              </p>
            </div>
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center mb-6 break-inside-avoid page-break-inside-avoid">
            <h2 className="text-base sm:text-lg font-bold uppercase underline tracking-wide text-black">
              DAFTAR PENGAJUAN & TANDA TERIMA HONORARIUM PEMBINA / PELATIH EKSTRAKURIKULER
            </h2>
            <p className="text-xs font-sans text-black mt-1 font-semibold">
              Periode: Bulan {pengajuan.bulan_mulai} s.d. {pengajuan.bulan_selesai} • Tahun Pelajaran {pengajuan.tahun_ajaran}
            </p>
            <p className="text-[11px] font-sans text-black mt-0.5">
              Nomor: {pengajuan.nomor_surat}
            </p>
          </div>

          {/* META INFORMASI */}
          <div className="font-sans text-xs mb-5 p-3.5 bg-slate-50 print:bg-transparent border border-slate-300 print:border-black rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-black break-inside-avoid page-break-inside-avoid">
            <div>
              <p><span className="font-semibold w-36 inline-block">Sumber Anggaran</span>: {pengajuan.sumber_dana}</p>
              <p><span className="font-semibold w-36 inline-block">Tanggal Pengajuan</span>: {formatTanggalIndo(pengajuan.tanggal_pengajuan)}</p>
            </div>
            <div>
              <p><span className="font-semibold w-36 inline-block">Uraian Dokumen</span>: {pengajuan.keterangan || '-'}</p>
              <p><span className="font-semibold w-36 inline-block">Status Dokumen</span>: <span className="uppercase font-bold">{pengajuan.status}</span></p>
            </div>
          </div>

          {/* TABEL RINCIAN HONOR EKSTRAKURIKULER */}
          <div className="font-sans text-xs mb-6 break-inside-avoid page-break-inside-avoid">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse border border-black text-black table-fixed">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200 font-bold text-center">
                    <th className="border border-black py-2 px-1 w-[4%]">No</th>
                    <th className="border border-black py-2 px-2 text-left w-[22%]">Nama Ekstrakurikuler</th>
                    <th className="border border-black py-2 px-2 text-left w-[22%]">Nama Pembina / Pelatih</th>
                    <th className="border border-black py-2 px-1 w-[10%]">Status</th>
                    <th className="border border-black py-2 px-2 text-right w-[12%]">Honor / Sesi</th>
                    <th className="border border-black py-2 px-1 text-center w-[8%]">Jml</th>
                    <th className="border border-black py-2 px-2 text-right w-[12%]">Total Diterima</th>
                    <th className="border border-black py-2 px-2 text-center w-[10%]">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const subtotal = item.total_honor || (item.honor_per_pertemuan * item.jumlah_pertemuan);
                    const isGanjil = idx % 2 === 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 print:hover:bg-transparent break-inside-avoid page-break-inside-avoid">
                        <td className="border border-black py-2 px-1 text-center">{idx + 1}.</td>
                        <td className="border border-black py-2 px-2 font-semibold">
                          {item.nama_ekstrakurikuler}
                          {item.keterangan && (
                            <span className="block text-[10px] text-slate-600 print:text-black font-normal">
                              ({item.keterangan})
                            </span>
                          )}
                        </td>
                        <td className="border border-black py-2 px-2">{item.nama_pembina_pelatih}</td>
                        <td className="border border-black py-2 px-1 text-center text-[11px]">
                          {item.status_penerima || 'Guru Pembina'}
                        </td>
                        <td className="border border-black py-2 px-2 text-right">{formatRupiah(item.honor_per_pertemuan)}</td>
                        <td className="border border-black py-2 px-1 text-center font-semibold">{item.jumlah_pertemuan} kali</td>
                        <td className="border border-black py-2 px-2 text-right font-bold">{formatRupiah(subtotal)}</td>
                        <td className="border border-black py-2 px-1 text-left align-bottom h-10">
                          <span className={`text-[10px] font-mono block ${isGanjil ? 'text-left pl-0.5' : 'text-right pr-0.5'}`}>
                            {idx + 1}. ..........
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 print:bg-slate-200 font-bold break-inside-avoid page-break-inside-avoid">
                    <td colSpan={5} className="border border-black py-2 px-3 text-right uppercase">
                      JUMLAH TOTAL REKAPITULASI
                    </td>
                    <td className="border border-black py-2 px-1 text-center">
                      {totalPertemuan} kali
                    </td>
                    <td className="border border-black py-2 px-2 text-right text-xs">
                      {formatRupiah(totalHonor)}
                    </td>
                    <td className="border border-black py-2 px-2 text-center text-[10px] italic">
                      Lengkap
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TERBILANG BOX */}
          <div className="font-sans text-xs mb-8 p-3 bg-slate-50 print:bg-transparent border border-slate-300 print:border-black rounded-lg text-black break-inside-avoid page-break-inside-avoid">
            <span className="font-bold uppercase tracking-wider">Terbilang : </span>
            <span className="italic font-semibold capitalize">
              {angkaTerbilang(totalHonor) ? `${angkaTerbilang(totalHonor)} Rupiah` : 'Nol Rupiah'}
            </span>
          </div>

          {/* LEMBAR PENGESAHAN TANDA TANGAN TUNGGAL KEPALA SEKOLAH */}
          <div className="font-serif mt-10 break-inside-avoid page-break-inside-avoid">
            <div className="flex justify-end">
              <div className="w-72 text-center text-black">
                <p className="font-sans text-xs">
                  Pulung, {formatTanggalIndo(pengajuan.tanggal_pengajuan)}
                </p>
                <p className="font-sans text-xs font-semibold mt-0.5">
                  Mengetahui & Menyetujui,
                </p>
                <p className="font-sans text-xs font-bold uppercase mb-16">
                  {jabatanKepsek}
                </p>
                
                {/* Garis / Nama Kepala Sekolah */}
                <p className="font-bold underline text-sm uppercase tracking-wide">
                  {namaKepsek}
                </p>
                <p className="font-sans text-xs mt-0.5">
                  NIP. {nipKepsek}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan Kaki */}
          <div className="font-sans text-[10px] text-slate-400 print:text-black mt-12 pt-2 border-t border-slate-200 print:border-black flex justify-between break-inside-avoid page-break-inside-avoid">
            <span>SIM Kesiswaan SMP Negeri 2 Pulung • Dokumen Honorarium Sah</span>
            <span>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
          </div>

        </div>

      </div>
    </div>
  );
};
