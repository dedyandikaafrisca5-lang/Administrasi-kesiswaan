import React, { useState, useEffect } from 'react';
import { PengajuanAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { SchoolLogo } from '../common/SchoolLogo';
import { SCHOOL_CONFIG } from '../../constants/schoolConfig';
import { UnitManagerModal } from '../AdministrasiDokumen/UnitManagerModal';
import { X, Printer, UserCheck, Settings2, RotateCcw, Building2, Plus } from 'lucide-react';

interface CetakRABModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
}

const STORAGE_KEY_KEPSEK_NAME = 'smpn2plg_kepsek_name';
const STORAGE_KEY_KEPSEK_NIP = 'smpn2plg_kepsek_nip';
const STORAGE_KEY_KEPSEK_JABATAN = 'smpn2plg_kepsek_jabatan';

export const CetakRABModal: React.FC<CetakRABModalProps> = ({ pengajuan, onClose }) => {
  const { data, savePengajuanAnggaran } = useApp();

  // Unit Organisasi state
  const [selectedUnitId, setSelectedUnitId] = useState<number>(pengajuan.unit_id);
  const [isEditUnitOpen, setIsEditUnitOpen] = useState(false);
  const [isUnitManagerOpen, setIsUnitManagerOpen] = useState(false);

  const unit = data.unit.find((u) => u.id === selectedUnitId) || data.unit.find((u) => u.id === pengajuan.unit_id);
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

  const handleUnitChange = (newUnitId: number) => {
    setSelectedUnitId(newUnitId);
    savePengajuanAnggaran({
      id: pengajuan.id,
      unit_id: newUnitId,
    });
  };

  const rincianList = data.rincian_anggaran.filter((r) => Number(r.pengajuan_id) === Number(pengajuan.id));

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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-modal-overlay print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block print:w-full print:h-auto">
      {/* Explicit @page rule to guarantee exact A4 pagination */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print-modal-container print:static print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none print:overflow-visible print:block print:m-0 print:p-0">
        
        {/* Action Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Dokumen Cetak RAB (PDF)</h3>
              <p className="text-[11px] text-slate-400">Format resmi A4 • Pengesahan tanda tangan tunggal Kepala Sekolah</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Ganti Unit Organisasi */}
            <button
              onClick={() => {
                setIsEditUnitOpen(!isEditUnitOpen);
                if (!isEditUnitOpen) setIsEditTtdOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditUnitOpen 
                  ? 'bg-blue-950 text-blue-300 border-blue-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Ganti Unit Organisasi"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isEditUnitOpen ? 'Tutup Unit' : 'Ganti Unit Organisasi'}</span>
            </button>

            {/* Tombol Ubah Nama/NIP Kepsek */}
            <button
              onClick={() => {
                setIsEditTtdOpen(!isEditTtdOpen);
                if (!isEditTtdOpen) setIsEditUnitOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditTtdOpen 
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Atur Nama & NIP Kepala Sekolah"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isEditTtdOpen ? 'Sembunyikan Form TTD' : 'Ubah Nama/NIP Kepsek'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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

        {/* Input Panel for Unit Organisasi (Hidden on Print) */}
        {isEditUnitOpen && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-3.5 print:hidden animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Unit Organisasi Kegiatan (Otomatis Diperbarui pada RAB & Disimpan)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUnitOpen(false)}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Unit Organisasi / Pelaksana:
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => handleUnitChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-2xs"
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
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
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
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3.5 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Pengaturan Tanda Tangan Kepala Sekolah (Otomatis Diperbarui pada PDF)</span>
              </div>
              <button
                type="button"
                onClick={handleResetKepsek}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-2xs"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 shadow-2xs"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Document Body (Paper simulation) */}
        <div id="printable-rab-area" className="p-8 sm:p-12 overflow-y-auto flex-1 text-slate-900 bg-white font-serif print-document-body print:overflow-visible print:p-0 print:m-0 print:h-auto print:max-h-none print:w-full print:block">
          
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
                <p className="text-[11px] text-slate-600 font-sans leading-tight">
                  {SCHOOL_CONFIG.address} • Telp: {SCHOOL_CONFIG.phone}
                </p>
                <p className="text-[11px] text-slate-600 font-sans">
                  Website: {SCHOOL_CONFIG.website} • Email: {SCHOOL_CONFIG.email}
                </p>
              </div>
            </div>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center my-6 space-y-1 break-inside-avoid page-break-inside-avoid">
            <h3 className="text-base sm:text-lg font-bold uppercase underline decoration-2">
              RENCANA ANGGARAN BIAYA (RAB) KEGIATAN KESISWAAN
            </h3>
            <p className="text-xs font-sans text-slate-600">
              Nomor Surat / Kode RAB: <span className="font-semibold text-slate-900">{pengajuan.nomor_surat}</span>
            </p>
          </div>

          {/* Informasi Kegiatan */}
          <div className="mb-6 space-y-2 text-xs font-sans break-inside-avoid page-break-inside-avoid">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-40 py-1 font-semibold text-slate-700">Unit Organisasi</td>
                  <td className="py-1">
                    : <span className="font-bold text-slate-950">{unit?.nama || 'Kesiswaan'}</span> ({unit?.jenis.toUpperCase()})
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditUnitOpen(true);
                        setIsEditTtdOpen(false);
                      }}
                      className="ml-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors print:hidden cursor-pointer"
                      title="Klik untuk mengganti Unit Organisasi"
                    >
                      <Building2 className="w-3 h-3 text-blue-600" />
                      <span>Ganti Unit</span>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-700">Nama Kegiatan</td>
                  <td className="py-1 font-bold text-slate-900">: {pengajuan.nama_kegiatan}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-700">Waktu Pelaksanaan</td>
                  <td className="py-1">: {pengajuan.waktu_pelaksanaan || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-700">Tempat / Lokasi</td>
                  <td className="py-1">: {pengajuan.tempat || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold text-slate-700 align-top">Latar Belakang / Tujuan</td>
                  <td className="py-1 text-justify leading-relaxed">: {pengajuan.latar_belakang || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL RINCIAN ANGGARAN (RAB) */}
          <div className="mb-6 space-y-2 break-inside-avoid page-break-inside-avoid">
            <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-900">
              Rincian Pos Anggaran Pengeluaran
            </h4>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse border border-slate-900 text-xs font-sans table-fixed">
                <thead className="bg-slate-100 print:bg-slate-200 font-bold text-slate-900 text-center">
                  <tr>
                    <th className="border border-slate-900 p-2 w-[6%]">No</th>
                    <th className="border border-slate-900 p-2 text-left w-[42%]">Uraian Kebutuhan / Pos Pengeluaran</th>
                    <th className="border border-slate-900 p-2 w-[10%]">Vol</th>
                    <th className="border border-slate-900 p-2 w-[12%]">Satuan</th>
                    <th className="border border-slate-900 p-2 text-right w-[15%]">Harga Satuan</th>
                    <th className="border border-slate-900 p-2 text-right w-[15%]">Subtotal (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {rincianList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-900 p-3 text-center text-slate-500 italic">
                        Belum ada rincian anggaran yang diinput.
                      </td>
                    </tr>
                  ) : (
                    rincianList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 print:hover:bg-transparent break-inside-avoid page-break-inside-avoid">
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2">{item.uraian}</td>
                        <td className="border border-slate-900 p-2 text-center font-semibold">{item.volume}</td>
                        <td className="border border-slate-900 p-2 text-center">{item.satuan}</td>
                        <td className="border border-slate-900 p-2 text-right">{formatRupiah(item.harga_satuan)}</td>
                        <td className="border border-slate-900 p-2 text-right font-semibold">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 print:bg-slate-200 font-bold break-inside-avoid page-break-inside-avoid">
                    <td colSpan={5} className="border border-slate-900 p-2.5 text-right uppercase">
                      Total Rencana Anggaran Biaya (RAB)
                    </td>
                    <td className="border border-slate-900 p-2.5 text-right text-slate-950 font-black">
                      {formatRupiah(pengajuan.total_anggaran)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* LEMBAR PENGESAHAN & TANDA TANGAN (HANYA KEPALA SEKOLAH) */}
          <div className="mt-10 pt-4 font-sans text-xs page-break-inside-avoid break-inside-avoid flex justify-end">
            <div className="w-80 text-center space-y-16">
              <div>
                <p className="text-slate-700">Pulung, {formatTanggalIndo(pengajuan.tanggal_pengajuan)}</p>
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
          <span className="text-xs text-slate-500">Format surat RAB SMP Negeri 2 Pulung dengan TTD Kepala Sekolah siap cetak & arsip PDF</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
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

