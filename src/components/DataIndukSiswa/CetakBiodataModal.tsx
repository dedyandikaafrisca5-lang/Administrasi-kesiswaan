import React, { useState, useEffect } from 'react';
import { Siswa } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTanggalIndo } from '../../utils/formatters';
import { SchoolLogo } from '../common/SchoolLogo';
import { SCHOOL_CONFIG } from '../../constants/schoolConfig';
import { X, Printer, UserCheck, Settings2, RotateCcw, User, MapPin, Phone, Award } from 'lucide-react';

interface CetakBiodataModalProps {
  siswa: Siswa;
  onClose: () => void;
}

const STORAGE_KEY_KEPSEK_NAME = 'smpn2plg_kepsek_name';
const STORAGE_KEY_KEPSEK_NIP = 'smpn2plg_kepsek_nip';
const STORAGE_KEY_KEPSEK_JABATAN = 'smpn2plg_kepsek_jabatan';

export const CetakBiodataModal: React.FC<CetakBiodataModalProps> = ({ siswa, onClose }) => {
  const { data } = useApp();

  const defaultKepsek = data.guru.find((g) => g.role === 'Kepala Sekolah') || data.guru[0];

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

  const kelas = data.kelas.find((k) => k.id === siswa.kelas_id);
  const waliKelas = data.guru.find((g) => g.id === kelas?.wali_kelas_id);
  const ortuList = data.orang_tua_wali.filter((o) => o.siswa_id === siswa.id);
  const riwayatList = data.riwayat_kelas.filter((r) => r.siswa_id === siswa.id);
  const prestasiList = data.prestasi.filter((p) => p.siswa_id === siswa.id);

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
            <User className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">Pratinjau Lembar Buku Induk / Biodata Siswa (PDF)</h3>
              <p className="text-[11px] text-slate-400">Format resmi A4 • Data lengkap siswa & tanda tangan pengesahan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditTtdOpen(!isEditTtdOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isEditTtdOpen 
                  ? 'bg-blue-950 text-blue-300 border-blue-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Atur Nama & NIP Kepala Sekolah"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isEditTtdOpen ? 'Tutup Form TTD' : 'Ubah Nama/NIP Kepsek'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input Panel for Kepala Sekolah Signature (Hidden on Print) */}
        {isEditTtdOpen && (
          <div className="bg-blue-50/80 border-b border-blue-200 px-6 py-3.5 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Pejabat Penandatangan / Pengesahan Buku Induk</span>
              </div>
              <button
                type="button"
                onClick={handleResetKepsek}
                className="text-[11px] text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 shadow-2xs"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 shadow-2xs"
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
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Body */}
        <div id="printable-biodata-area" className="p-8 sm:p-12 overflow-y-auto flex-1 text-slate-900 bg-white font-serif leading-relaxed text-sm print-document-body print:overflow-visible print:p-0 print:m-0 print:h-auto print:max-h-none print:w-full print:block">
          
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
          <div className="text-center my-5 space-y-1 break-inside-avoid page-break-inside-avoid">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider underline text-slate-900 font-sans">
              LEMBAR BUKU INDUK SISWA
            </h3>
            <p className="text-xs font-semibold text-slate-700 font-sans">
              TAHUN AJARAN {kelas?.tahun_ajaran || '2025/2026'}
            </p>
          </div>

          {/* FOTO & BIODATA UTAMA */}
          <div className="border border-slate-900 p-4 rounded-lg mb-6 break-inside-avoid page-break-inside-avoid font-sans">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Pas Foto 3x4 */}
              <div className="w-28 h-36 border-2 border-slate-900 p-1 bg-slate-50 shrink-0 flex items-center justify-center text-center overflow-hidden">
                {siswa.foto ? (
                  <img
                    src={siswa.foto}
                    alt={siswa.nama_lengkap}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 font-sans">Pas Foto 3x4</span>
                )}
              </div>

              {/* Rincian Identitas */}
              <div className="flex-1 w-full">
                <h4 className="font-bold text-slate-950 text-xs uppercase border-b border-slate-300 pb-1 mb-2">
                  A. IDENTITAS PESERTA DIDIK
                </h4>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="w-40 py-1 font-semibold text-slate-700">Nama Lengkap</td>
                      <td className="py-1">: <span className="font-bold text-slate-950 uppercase">{siswa.nama_lengkap}</span></td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">NISN / NIS</td>
                      <td className="py-1">: <span className="font-mono font-semibold">{siswa.nisn || '-'}</span> / <span className="font-mono">{siswa.nis || '-'}</span></td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Jenis Kelamin</td>
                      <td className="py-1">: {siswa.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Tempat, Tanggal Lahir</td>
                      <td className="py-1">: {siswa.tempat_lahir || '-'}, {formatTanggalIndo(siswa.tanggal_lahir)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Agama</td>
                      <td className="py-1">: {siswa.agama || 'Islam'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Kelas / Rombel</td>
                      <td className="py-1">: <span className="font-bold">{kelas?.nama || '-'}</span> (Wali: {waliKelas?.nama || '-'})</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">Status Siswa</td>
                      <td className="py-1">: <span className="uppercase font-semibold text-emerald-800">{siswa.status}</span></td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700">No. HP / WhatsApp</td>
                      <td className="py-1">: {siswa.no_hp || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-700 align-top">Alamat Lengkap</td>
                      <td className="py-1 align-top">: {siswa.alamat || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* BAGIAN B: DATA ORANG TUA / WALI */}
          <div className="border border-slate-900 p-4 rounded-lg mb-6 break-inside-avoid page-break-inside-avoid font-sans">
            <h4 className="font-bold text-slate-950 text-xs uppercase border-b border-slate-300 pb-1 mb-2">
              B. DATA ORANG TUA / WALI
            </h4>
            {ortuList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">Belum ada rincian data orang tua/wali tersimpan.</p>
            ) : (
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-900 p-2 text-center w-10">No</th>
                    <th className="border border-slate-900 p-2 text-left w-28">Hubungan</th>
                    <th className="border border-slate-900 p-2 text-left">Nama Lengkap</th>
                    <th className="border border-slate-900 p-2 text-left">Pekerjaan</th>
                    <th className="border border-slate-900 p-2 text-left">No. Telepon / HP</th>
                  </tr>
                </thead>
                <tbody>
                  {ortuList.map((ortu, idx) => (
                    <tr key={ortu.id || idx}>
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-bold uppercase">{ortu.jenis}</td>
                      <td className="border border-slate-900 p-2 font-semibold">{ortu.nama}</td>
                      <td className="border border-slate-900 p-2">{ortu.pekerjaan || '-'}</td>
                      <td className="border border-slate-900 p-2 font-mono">{ortu.no_hp || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* BAGIAN C: RIWAYAT KELAS & PRESTASI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 font-sans">
            {/* Riwayat Kelas */}
            <div className="border border-slate-900 p-4 rounded-lg break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 text-xs uppercase border-b border-slate-300 pb-1 mb-2">
                C. RIWAYAT KELAS
              </h4>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-slate-900 p-1.5 text-left">Tahun Ajaran</th>
                    <th className="border border-slate-900 p-1.5 text-left">Kelas</th>
                    <th className="border border-slate-900 p-1.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="border border-slate-900 p-2 text-center text-slate-500 italic">
                        {kelas?.tahun_ajaran || '2025/2026'} - {kelas?.nama || 'Kelas Baru'}
                      </td>
                    </tr>
                  ) : (
                    riwayatList.map((r, idx) => {
                      const k = data.kelas.find((kl) => kl.id === r.kelas_id);
                      return (
                        <tr key={idx}>
                          <td className="border border-slate-900 p-1.5">{r.tahun_ajaran}</td>
                          <td className="border border-slate-900 p-1.5 font-bold">{k?.nama || `Kelas #${r.kelas_id}`}</td>
                          <td className="border border-slate-900 p-1.5 text-center capitalize">{r.status_naik === 'naik' ? 'Naik' : 'Tinggal'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Catatan Prestasi */}
            <div className="border border-slate-900 p-4 rounded-lg break-inside-avoid page-break-inside-avoid">
              <h4 className="font-bold text-slate-950 text-xs uppercase border-b border-slate-300 pb-1 mb-2">
                D. PRESTASI & KEJUARAAN
              </h4>
              {prestasiList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Belum ada catatan kejuaraan / prestasi resmi.</p>
              ) : (
                <ul className="text-xs space-y-1.5 list-disc pl-4">
                  {prestasiList.map((p, idx) => (
                    <li key={idx} className="text-slate-800">
                      <strong>{p.peringkat}</strong> - {p.nama_kegiatan} ({p.tingkat})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* TANDA TANGAN PENGESAHAN KEPALA SEKOLAH */}
          <div className="mt-8 pt-4 font-sans text-xs page-break-inside-avoid break-inside-avoid flex justify-end">
            <div className="w-72 text-center space-y-16">
              <div>
                <p className="text-slate-700">Pulung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
          <span className="text-xs text-slate-500">Lembar Buku Induk Siswa resmi SMP Negeri 2 Pulung siap cetak & arsip PDF</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
    </div>
  );
};
