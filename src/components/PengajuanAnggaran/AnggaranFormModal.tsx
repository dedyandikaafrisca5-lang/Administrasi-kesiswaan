import React, { useState } from 'react';
import { PengajuanAnggaran, RincianAnggaran } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { generateProposalWithAI } from '../../services/geminiProposalService';
import { SchoolLogo } from '../common/SchoolLogo';
import { SCHOOL_CONFIG, getStoredKepsek, setStoredKepsek, DEFAULT_KEPSEK } from '../../constants/schoolConfig';
import { UnitManagerModal } from '../AdministrasiDokumen/UnitManagerModal';
import { 
  PanitiaRow, 
  AcaraRow, 
  parsePanitiaFromText, 
  formatPanitiaToText, 
  parseAcaraFromText, 
  formatAcaraToText,
  DEFAULT_PANITIA_ROWS,
  DEFAULT_ACARA_ROWS
} from '../../utils/proposalHelpers';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Save, 
  Receipt, 
  Calendar, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Wand2,
  Eye,
  Printer,
  MapPin,
  Coins,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  Users,
  Clock,
  RotateCcw,
  UserCheck,
  Building2
} from 'lucide-react';

interface AnggaranFormModalProps {
  pengajuan?: PengajuanAnggaran | null;
  onClose: () => void;
  onOpenPrintRAB?: (pengajuan: PengajuanAnggaran) => void;
  onOpenPrintProposal?: (pengajuan: PengajuanAnggaran) => void;
}

const QUICK_PRESETS = [
  'LDKS OSIS SMPN 2 Pulung',
  'Peringatan HUT RI & Lomba Tradisional',
  'Perkemahan Pramuka Penggalang',
  'Gelar Karya & Pentas Seni P5',
  'Classmeeting Semester Ganjil',
  'Peringatan Maulid Nabi Muhammad SAW',
  'Diklat PMR Madya Unit Sekolah'
];

export const AnggaranFormModal: React.FC<AnggaranFormModalProps> = ({ 
  pengajuan, 
  onClose, 
  onOpenPrintRAB,
  onOpenPrintProposal 
}) => {
  const { data, savePengajuanAnggaran, currentGuru } = useApp();

  // Mode Tampilan: 'form' (Pengisian) atau 'preview' (Pratinjau Dokumen)
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  
  // Accordion untuk menyunting narasi rinci
  const [showNarasiDetail, setShowNarasiDetail] = useState(false);

  // Status AI Generator
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [suggestedRabItems, setSuggestedRabItems] = useState<any[]>([]);
  const [isUnitManagerOpen, setIsUnitManagerOpen] = useState(false);

  // Existing rincian if editing
  const existingRincian = pengajuan ? data.rincian_anggaran.filter((r) => r.pengajuan_id === pengajuan.id) : [];

  const [formData, setFormData] = useState<Partial<PengajuanAnggaran>>({
    id: pengajuan?.id,
    nomor_surat: pengajuan?.nomor_surat || `0${data.pengajuan_anggaran.length + 1}/PROP-KESISWAAN/SMPN2/${new Date().getFullYear()}`,
    unit_id: pengajuan?.unit_id || data.unit[0]?.id || 1,
    nama_kegiatan: pengajuan?.nama_kegiatan || '',
    waktu_pelaksanaan: pengajuan?.waktu_pelaksanaan || '',
    tempat: pengajuan?.tempat || 'SMP Negeri 2 Pulung',
    latar_belakang: pengajuan?.latar_belakang || '',
    tujuan: pengajuan?.tujuan || '1. Meningkatkan kedisiplinan dan kepemimpinan siswa.\n2. Membangun solidaritas dan kerjasama tim antar peserta didik.\n3. Mewujudkan program kerja kesiswaan SMP Negeri 2 Pulung.',
    sasaran: pengajuan?.sasaran || 'Peserta Didik SMP Negeri 2 Pulung',
    sumber_dana: pengajuan?.sumber_dana || 'Dana BOS Kesiswaan SMP Negeri 2 Pulung TA 2025/2026',
    susunan_panitia: pengajuan?.susunan_panitia || 'Penanggung Jawab: Drs. H. Bambang Suhartono, M.Pd. (Kepala Sekolah)\nKetua Pelaksana: Rahmat Hidayat, S.Pd\nSekretaris: Siti Rahmawati, S.Pd\nBendahara: Retno Wulandari, S.Pd\nSeksi Acara: Koordinator Sie Acara\nSeksi Perlengkapan: Tim Sarpras\nSeksi Dokumentasi: Tim Jurnalistik Kesiswaan\nSeksi Konsumsi: Koordinator Sie Konsumsi',
    susunan_acara: pengajuan?.susunan_acara || '- 07.00 - 07.30 WIB : Registrasi & Apel Pembukaan\n- 08.00 - 11.30 WIB : Sesi Materi & Pembinaan Karakter\n- 11.30 - 13.00 WIB : Ishoma & Ramah Tamah\n- 13.00 - 15.30 WIB : Praktik Lapangan, Evaluasi & Penutupan',
    status: pengajuan?.status || 'disetujui',
    diajukan_oleh_id: pengajuan?.diajukan_oleh_id || currentGuru.id,
    tanggal_pengajuan: pengajuan?.tanggal_pengajuan || new Date().toISOString().split('T')[0],
  });

  // Dynamic Rincian Items list (RAB)
  const [rincianList, setRincianList] = useState<Partial<RincianAnggaran>[]>(
    existingRincian.length > 0
      ? existingRincian
      : [
          { uraian: 'Banner Backdrop Panggung & Publikasi', volume: 1, satuan: 'Paket', harga_satuan: 350000, subtotal: 350000 },
          { uraian: 'Konsumsi & Snack Panitia dan Peserta', volume: 50, satuan: 'Porsi', harga_satuan: 20000, subtotal: 1000000 },
          { uraian: 'ATK, ID Card Tanda Panitia & Sertifikat Piagam', volume: 1, satuan: 'Paket', harga_satuan: 300000, subtotal: 300000 },
        ]
  );

  const handleAddRow = () => {
    setRincianList([
      ...rincianList,
      { uraian: '', volume: 1, satuan: 'Paket', harga_satuan: 0, subtotal: 0 },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rincianList.length <= 1) return;
    setRincianList(rincianList.filter((_, idx) => idx !== index));
  };

  const handleRincianChange = (index: number, field: keyof RincianAnggaran, val: any) => {
    const updated = [...rincianList];
    const current = { ...updated[index], [field]: val };
    
    const vol = Number(current.volume || 1);
    const harga = Number(current.harga_satuan || 0);
    current.subtotal = vol * harga;

    updated[index] = current;
    setRincianList(updated);
  };

  const calculatedTotal = rincianList.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  // Dynamic Panitia list (Kepanitiaan)
  const [panitiaList, setPanitiaList] = useState<PanitiaRow[]>(() => 
    parsePanitiaFromText(pengajuan?.susunan_panitia)
  );

  // Dynamic Acara list (Rundown Kegiatan)
  const [acaraList, setAcaraList] = useState<AcaraRow[]>(() => 
    parseAcaraFromText(pengajuan?.susunan_acara)
  );

  // Kepala Sekolah / Pejabat Penandatangan
  const initialKepsek = getStoredKepsek();
  const [namaKepsek, setNamaKepsek] = useState(initialKepsek.nama);
  const [nipKepsek, setNipKepsek] = useState(initialKepsek.nip);
  const [jabatanKepsek, setJabatanKepsek] = useState(initialKepsek.jabatan);

  const handleResetKepsekDefault = () => {
    setNamaKepsek(DEFAULT_KEPSEK.nama);
    setNipKepsek(DEFAULT_KEPSEK.nip);
    setJabatanKepsek(DEFAULT_KEPSEK.jabatan);
  };

  const handleSyncKepsekToPanitia = () => {
    const updated = [...panitiaList];
    const pIndex = updated.findIndex(p => 
      p.jabatan.toLowerCase().includes('penanggung jawab') || 
      p.keterangan.toLowerCase().includes('kepala')
    );
    if (pIndex >= 0) {
      updated[pIndex] = {
        ...updated[pIndex],
        nama: namaKepsek,
        keterangan: 'Kepala SMPN 2 Pulung'
      };
      setPanitiaList(updated);
    } else {
      setPanitiaList([
        { jabatan: 'Penanggung Jawab', nama: namaKepsek, keterangan: 'Kepala SMPN 2 Pulung' },
        ...panitiaList
      ]);
    }
  };

  // Handlers Panitia
  const handleAddPanitiaRow = () => {
    setPanitiaList([
      ...panitiaList,
      { jabatan: '', nama: '', keterangan: '' }
    ]);
  };

  const handleRemovePanitiaRow = (index: number) => {
    if (panitiaList.length <= 1) return;
    setPanitiaList(panitiaList.filter((_, idx) => idx !== index));
  };

  const handlePanitiaChange = (index: number, field: keyof PanitiaRow, val: string) => {
    const updated = [...panitiaList];
    updated[index] = { ...updated[index], [field]: val };
    setPanitiaList(updated);
  };

  const handleResetPanitiaDefault = () => {
    setPanitiaList(DEFAULT_PANITIA_ROWS);
  };

  // Handlers Acara
  const handleAddAcaraRow = () => {
    setAcaraList([
      ...acaraList,
      { waktu: '', kegiatan: '', pengisi: '' }
    ]);
  };

  const handleRemoveAcaraRow = (index: number) => {
    if (acaraList.length <= 1) return;
    setAcaraList(acaraList.filter((_, idx) => idx !== index));
  };

  const handleAcaraChange = (index: number, field: keyof AcaraRow, val: string) => {
    const updated = [...acaraList];
    updated[index] = { ...updated[index], [field]: val };
    setAcaraList(updated);
  };

  const handleResetAcaraDefault = () => {
    setAcaraList(DEFAULT_ACARA_ROWS);
  };

  // Trigger AI Proposal Generation
  const handleGenerateAIProposal = async () => {
    if (!formData.nama_kegiatan || !formData.nama_kegiatan.trim()) {
      alert('Ketik atau pilih Nama Kegiatan terlebih dahulu agar AI dapat menyusun proposal.');
      return;
    }

    setIsGeneratingAI(true);
    setAiSuccessMessage(null);

    try {
      const selectedUnit = data.unit.find((u) => u.id === formData.unit_id);
      const unitNama = selectedUnit?.nama || 'Kesiswaan & OSIS SMP Negeri 2 Pulung';

      const result = await generateProposalWithAI({
        nama_kegiatan: formData.nama_kegiatan,
        unit_nama: unitNama,
        waktu_pelaksanaan: formData.waktu_pelaksanaan || '',
        tempat: formData.tempat || 'SMP Negeri 2 Pulung',
        catatan_tambahan: '',
        rincian_rab: rincianList,
      });

      if (result && result.data) {
        const generated = result.data;
        setFormData((prev) => ({
          ...prev,
          latar_belakang: generated.latar_belakang || prev.latar_belakang,
          tujuan: generated.tujuan || prev.tujuan,
          sasaran: generated.sasaran || prev.sasaran,
          sumber_dana: generated.sumber_dana || prev.sumber_dana,
        }));

        if (generated.susunan_panitia) {
          setPanitiaList(parsePanitiaFromText(generated.susunan_panitia));
        }

        if (generated.susunan_acara) {
          setAcaraList(parseAcaraFromText(generated.susunan_acara));
        }

        if (generated.suggested_rab && generated.suggested_rab.length > 0) {
          setSuggestedRabItems(generated.suggested_rab);
        }

        setAiSuccessMessage('Naskah proposal, kepanitiaan, rundown & RAB berhasil disusun oleh AI! Silakan periksa formulir.');
      }
    } catch (err) {
      console.error('Error in AI generation:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Terapkan Rekomendasi Pos Belanja RAB dari AI
  const handleApplySuggestedRab = () => {
    if (!suggestedRabItems || suggestedRabItems.length === 0) return;

    const formatted = suggestedRabItems.map((item) => ({
      uraian: item.uraian,
      volume: Number(item.volume || 1),
      satuan: item.satuan || 'Paket',
      harga_satuan: Number(item.harga_satuan || 0),
      subtotal: Number(item.volume || 1) * Number(item.harga_satuan || 0),
    }));

    setRincianList(formatted);
    setAiSuccessMessage('Item rekomendasi RAB berhasil diterapkan ke tabel.');
  };

  const handleSaveAndAct = (action: 'save_only' | 'print_rab' | 'print_proposal') => {
    if (!formData.nama_kegiatan || !formData.nama_kegiatan.trim()) {
      alert('Nama kegiatan wajib diisi!');
      setViewMode('form');
      return;
    }

    const formattedPanitia = formatPanitiaToText(panitiaList);
    const formattedAcara = formatAcaraToText(acaraList);

    const cleanedFormData = {
      ...formData,
      susunan_panitia: formattedPanitia,
      susunan_acara: formattedAcara,
      total_anggaran: calculatedTotal,
      status: (formData.status || 'disetujui') as any,
    };

    // Save/persist Kepsek data
    setStoredKepsek({
      nama: namaKepsek.trim() || DEFAULT_KEPSEK.nama,
      nip: nipKepsek.trim() || DEFAULT_KEPSEK.nip,
      jabatan: jabatanKepsek.trim() || DEFAULT_KEPSEK.jabatan,
    });

    const savedRecord = savePengajuanAnggaran(cleanedFormData, rincianList);

    onClose();

    if (action === 'print_rab' && onOpenPrintRAB) {
      onOpenPrintRAB(savedRecord);
    } else if (action === 'print_proposal' && onOpenPrintProposal) {
      onOpenPrintProposal(savedRecord);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                {pengajuan ? 'Edit Proposal & Anggaran RAB' : 'Penyusunan Proposal Kegiatan & Rencana Anggaran (RAB)'}
              </h3>
              <p className="text-[11px] text-slate-400">SMP Negeri 2 Pulung • Format Naskah Dinas Terintegrasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Buttons */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'form'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Formulir & RAB</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Proposal</span>
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 text-xs sm:text-sm">
          
          {/* ===================== VIEW 1: FORMULIR & RAB ===================== */}
          {viewMode === 'form' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              
              {/* BAGIAN 1: INFO KEGIATAN & AI GENERATOR */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-slate-900 text-sm">Informasi Kegiatan & AI Generator</h4>
                  </div>
                  <span className="text-[11px] text-slate-500">Cukup isi nama & klik susun otomatis</span>
                </div>

                {/* Input Nama Kegiatan & Action Button */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nama Kegiatan / Program <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Latihan Dasar Kepemimpinan Siswa (LDKS) OSIS"
                      value={formData.nama_kegiatan}
                      onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 shadow-2xs text-xs sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={handleGenerateAIProposal}
                      disabled={isGeneratingAI || !formData.nama_kegiatan?.trim()}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Menyusun dengan AI...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 text-slate-950" />
                          <span>✨ Susun Proposal Otomatis</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pilihan Cepat Presets */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Pilihan Cepat Kegiatan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, nama_kegiatan: preset })}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            formData.nama_kegiatan === preset
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PILIHAN UNIT PELAKSANA / PENGAJU KEGIATAN */}
                <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>Unit / Organisasi Pelaksana Kegiatan <span className="text-rose-500">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsUnitManagerOpen(true)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah / Kelola Unit Organisasi</span>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={formData.unit_id}
                      onChange={(e) => setFormData({ ...formData, unit_id: Number(e.target.value) })}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 shadow-2xs text-xs sm:text-sm"
                    >
                      {data.unit.map((u) => (
                        <option key={u.id} value={u.id}>
                          [{u.jenis.toUpperCase()}] {u.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Unit pelaksana ini akan tercetak otomatis pada Proposal Kegiatan resmi (Bab Sasaran & Pelaksana), RAB, dan Laporan Pertanggungjawaban (LPJ).
                  </p>
                </div>

                {/* Feedback AI Banner */}
                {aiSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{aiSuccessMessage}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {suggestedRabItems.length > 0 && (
                        <button
                          type="button"
                          onClick={handleApplySuggestedRab}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2 py-1 rounded-lg transition cursor-pointer"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-700" />
                          <span>Terapkan Rekomendasi RAB ({suggestedRabItems.length})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                      >
                        Buka Pratinjau →
                      </button>
                    </div>
                  </div>
                )}

                {/* Detail Tempat, Waktu & Surat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      placeholder="Contoh: 22 - 23 Agustus 2025"
                      value={formData.waktu_pelaksanaan}
                      onChange={(e) => setFormData({ ...formData, waktu_pelaksanaan: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tempat / Lokasi</label>
                    <input
                      type="text"
                      placeholder="SMP Negeri 2 Pulung"
                      value={formData.tempat}
                      onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor Surat Proposal</label>
                    <input
                      type="text"
                      placeholder="01/PROP-KESISWAAN/SMPN2/2025"
                      value={formData.nomor_surat}
                      onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal Dokumen</label>
                    <input
                      type="date"
                      value={formData.tanggal_pengajuan}
                      onChange={(e) => setFormData({ ...formData, tanggal_pengajuan: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Sumber Dana</label>
                    <input
                      type="text"
                      placeholder="Dana BOS Kesiswaan SMP Negeri 2 Pulung TA 2025/2026"
                      value={formData.sumber_dana}
                      onChange={(e) => setFormData({ ...formData, sumber_dana: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: TABEL RINCIAN ANGGARAN BIAYA (RAB) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">2</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>Rincian Rencana Anggaran Biaya (RAB)</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {formatRupiah(calculatedTotal)}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {suggestedRabItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleApplySuggestedRab}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gunakan AI Items</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris</span>
                    </button>
                  </div>
                </div>

                {/* Table RAB */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5 min-w-[180px]">Uraian Kebutuhan</th>
                        <th className="p-2.5 w-20 text-center">Volume</th>
                        <th className="p-2.5 w-24 text-center">Satuan</th>
                        <th className="p-2.5 w-32 text-right">Harga Satuan (Rp)</th>
                        <th className="p-2.5 w-36 text-right">Subtotal (Rp)</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rincianList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Misal: Konsumsi Peserta / Honor Juri / Banner"
                              value={row.uraian || ''}
                              onChange={(e) => handleRincianChange(idx, 'uraian', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              required
                              value={row.volume || 1}
                              onChange={(e) => handleRincianChange(idx, 'volume', Number(e.target.value))}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-center font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Porsi / Paket"
                              value={row.satuan || ''}
                              onChange={(e) => handleRincianChange(idx, 'satuan', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              required
                              value={row.harga_satuan || 0}
                              onChange={(e) => handleRincianChange(idx, 'harga_satuan', Number(e.target.value))}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-right font-medium focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900 font-mono bg-emerald-50/40">
                            {formatRupiah(row.subtotal || 0)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              disabled={rincianList.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50/90 border-t-2 border-emerald-300">
                        <td colSpan={5} className="p-2.5 text-right font-bold text-emerald-950 uppercase text-xs">
                          Total Rencana Anggaran (RAB):
                        </td>
                        <td className="p-2.5 text-right font-black text-sm text-emerald-900 font-mono">
                          {formatRupiah(calculatedTotal)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* BAGIAN 3: SUSUNAN KEPANITIAAN (TABEL DINAMIS SEPERTI RAB) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">3</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Susunan Kepanitiaan Pelaksana</span>
                        <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {panitiaList.length} Personil
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetPanitiaDefault}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Kembalikan ke format panitia standar sekolah"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Format Standar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPanitiaRow}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Panitia</span>
                    </button>
                  </div>
                </div>

                {/* Table Panitia */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5 w-44 sm:w-52">Jabatan / Seksi</th>
                        <th className="p-2.5 min-w-[180px]">Nama Personil & Gelar</th>
                        <th className="p-2.5 w-44 sm:w-52">Keterangan / Peran</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {panitiaList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Misal: Ketua Pelaksana / Seksi Acara"
                              value={row.jabatan}
                              onChange={(e) => handlePanitiaChange(idx, 'jabatan', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Misal: Drs. H. Bambang Suhartono, M.Pd. / Rahmat Hidayat, S.Pd"
                              value={row.nama}
                              onChange={(e) => handlePanitiaChange(idx, 'nama', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Misal: Kepala Sekolah / Guru Pembina / Siswa OSIS"
                              value={row.keterangan || ''}
                              onChange={(e) => handlePanitiaChange(idx, 'keterangan', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white text-slate-600"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePanitiaRow(idx)}
                              disabled={panitiaList.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded cursor-pointer"
                              title="Hapus baris"
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

              {/* BAGIAN 4: SUSUNAN ACARA / RUNDOWN KEGIATAN (TABEL DINAMIS SEPERTI RAB) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">4</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Susunan Acara / Rundown Kegiatan</span>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {acaraList.length} Sesi Kegiatan
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAcaraDefault}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Kembalikan ke susunan rundown standar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rundown Standar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAcaraRow}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Sesi Acara</span>
                    </button>
                  </div>
                </div>

                {/* Table Acara */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5 w-40 sm:w-48">Waktu / Pukul</th>
                        <th className="p-2.5 min-w-[200px]">Uraian Kegiatan / Agenda</th>
                        <th className="p-2.5 w-44 sm:w-52">Penanggung Jawab / Pengisi</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {acaraList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="07.00 - 07.30 WIB"
                              value={row.waktu}
                              onChange={(e) => handleAcaraChange(idx, 'waktu', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 bg-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Misal: Registrasi & Apel Pembukaan / Pelaksanaan Sesi I"
                              value={row.kegiatan}
                              onChange={(e) => handleAcaraChange(idx, 'kegiatan', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Misal: Sie Kesekretariatan / Kepala Sekolah / Tim Juri"
                              value={row.pengisi || ''}
                              onChange={(e) => handleAcaraChange(idx, 'pengisi', e.target.value)}
                              className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 bg-white text-slate-600"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAcaraRow(idx)}
                              disabled={acaraList.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded cursor-pointer"
                              title="Hapus baris"
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

              {/* BAGIAN 5: DETAIL NARASI DOKUMEN (ACCORDION EDITABLE) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowNarasiDetail(!showNarasiDetail)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">5</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Sunting Teks Narasi Proposal (Latar Belakang & Tujuan)</h4>
                      <p className="text-[11px] text-slate-500">Latar Belakang, Maksud & Tujuan, Sasaran, dan Sumber Alokasi Anggaran</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                    <span>{showNarasiDetail ? 'Sembunyikan' : 'Buka & Edit Narasi'}</span>
                    {showNarasiDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showNarasiDetail && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50/60 space-y-4 animate-in fade-in duration-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">A. Latar Belakang</label>
                      <textarea
                        rows={4}
                        value={formData.latar_belakang}
                        onChange={(e) => setFormData({ ...formData, latar_belakang: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">B. Maksud & Tujuan</label>
                        <textarea
                          rows={4}
                          value={formData.tujuan}
                          onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">C. Sasaran Kegiatan</label>
                        <textarea
                          rows={4}
                          value={formData.sasaran}
                          onChange={(e) => setFormData({ ...formData, sasaran: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BAGIAN 6: PENGESAHAN & PEJABAT PENANDATANGAN (NAMA & NIP KEPALA SEKOLAH) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">6</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Pejabat Penandatangan / Pengesahan (Kepala Sekolah)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Nama & NIP ini akan tertera pada lembar persetujuan naskah proposal & dokumen RAB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncKepsekToPanitia}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Salin nama Kepala Sekolah ke Susunan Panitia Penanggung Jawab"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Sinkronkan ke Panitia</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetKepsekDefault}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Kembalikan ke data bawaan"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Standar</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Kepala Sekolah & Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Drs. H. Bambang Suhartono, M.Pd."
                      value={namaKepsek}
                      onChange={(e) => setNamaKepsek(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      NIP Kepala Sekolah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 19750312 200003 1 001"
                      value={nipKepsek}
                      onChange={(e) => setNipKepsek(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Jabatan Penandatangan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kepala SMP Negeri 2 Pulung"
                      value={jabatanKepsek}
                      onChange={(e) => setJabatanKepsek(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================== VIEW 2: PRATINJAU DOKUMEN PROPOSAL ===================== */}
          {viewMode === 'preview' && (
            <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-150">
              
              {/* Toolbar Preview */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>Pratinjau Dokumen Siap Cetak.</strong> Dokumen ini telah terintegrasi narasi hasil AI, tabel kepanitiaan, rundown acara, dan tabel rincian RAB.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveAndAct('print_proposal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer text-xs"
                    title="Simpan & Buka Dialog Cetak PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Proposal (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('form')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-bold rounded-lg border border-indigo-300 shadow-2xs transition cursor-pointer text-xs"
                  >
                    ← Form & RAB
                  </button>
                </div>
              </div>

              {/* Kertas Naskah Proposal Resmi */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-md text-slate-900 font-sans space-y-6">
                
                {/* Kop Surat */}
                <div className="flex items-center gap-4 pb-4 border-b-4 border-double border-slate-900">
                  <SchoolLogo 
                    size="lg" 
                    variant="plain" 
                    showBackground={false} 
                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" 
                  />
                  <div className="text-center flex-1 pr-4 sm:pr-8">
                    <p className="text-xs font-bold tracking-wider uppercase text-slate-700 font-sans">
                      {SCHOOL_CONFIG.kabupaten.toUpperCase()} • {SCHOOL_CONFIG.dinas.toUpperCase()}
                    </p>
                    <h3 className="text-lg sm:text-xl font-black tracking-wide uppercase text-slate-950 font-sans">
                      {SCHOOL_CONFIG.name.toUpperCase()}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-sans leading-tight">
                      {SCHOOL_CONFIG.address} • Telp: {SCHOOL_CONFIG.phone}
                    </p>
                    <p className="text-[11px] text-slate-600 font-sans">
                      Website: {SCHOOL_CONFIG.website} • Email: {SCHOOL_CONFIG.email}
                    </p>
                  </div>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center space-y-1">
                  <h2 className="text-sm sm:text-base font-black tracking-wider uppercase underline underline-offset-4 text-slate-900">
                    PROPOSAL KEGIATAN KESISWAAN
                  </h2>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {formData.nama_kegiatan || '[Nama Kegiatan Belum Diisi]'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Nomor: {formData.nomor_surat || '.../PROP-KESISWAAN/SMPN2/2025'}
                  </p>
                </div>

                {/* Bab A: Latar Belakang */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    A. LATAR BELAKANG
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">
                    {formData.latar_belakang || 'Latar belakang belum diisi.'}
                  </p>
                </div>

                {/* Bab B: Tujuan */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    B. MAKSUD DAN TUJUAN
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {formData.tujuan || 'Tujuan belum diisi.'}
                  </p>
                </div>

                {/* Bab C: Sasaran */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    C. SASARAN KEGIATAN
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {formData.sasaran || 'Sasaran belum diisi.'}
                  </p>
                </div>

                {/* Bab D: Waktu & Tempat */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    D. WAKTU DAN TEMPAT PELAKSANAAN
                  </h4>
                  <table className="text-xs text-slate-700">
                    <tbody>
                      <tr>
                        <td className="pr-4 py-0.5 font-medium w-36">Unit / Pelaksana</td>
                        <td className="pr-2 py-0.5">:</td>
                        <td className="py-0.5 font-bold text-slate-900">
                          {data.unit.find((u) => u.id === formData.unit_id)?.nama || 'Kesiswaan SMPN 2 Pulung'}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-4 py-0.5 font-medium w-36">Hari / Tanggal</td>
                        <td className="pr-2 py-0.5">:</td>
                        <td className="py-0.5 font-semibold text-slate-900">{formData.waktu_pelaksanaan || '-'}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 py-0.5 font-medium">Tempat Kegiatan</td>
                        <td className="pr-2 py-0.5">:</td>
                        <td className="py-0.5 font-semibold text-slate-900">{formData.tempat || 'SMP Negeri 2 Pulung'}</td>
                      </tr>
                      <tr>
                        <td className="pr-4 py-0.5 font-medium">Sumber Dana</td>
                        <td className="pr-2 py-0.5">:</td>
                        <td className="py-0.5 font-semibold text-slate-900">{formData.sumber_dana || 'Dana BOS Kesiswaan SMPN 2 Pulung'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bab E: Susunan Panitia (Tabel Rapi) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    E. SUSUNAN KEPANITIAAN
                  </h4>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <tr>
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2 w-48">Jabatan / Seksi</th>
                          <th className="p-2">Nama Personil & Gelar</th>
                          <th className="p-2 w-48">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {panitiaList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-500 font-semibold">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{item.jabatan || '-'}</td>
                            <td className="p-2 text-slate-800 font-medium">{item.nama || '-'}</td>
                            <td className="p-2 text-slate-600">{item.keterangan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bab F: Susunan Acara (Tabel Rapi) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                    F. SUSUNAN ACARA / RUNDOWN KEGIATAN
                  </h4>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <tr>
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2 w-40 font-mono">Waktu / Pukul</th>
                          <th className="p-2">Uraian Kegiatan / Agenda</th>
                          <th className="p-2 w-48">Penanggung Jawab</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {acaraList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-500 font-semibold">{idx + 1}</td>
                            <td className="p-2 font-mono font-semibold text-slate-900">{item.waktu || '-'}</td>
                            <td className="p-2 text-slate-800 font-medium">{item.kegiatan || '-'}</td>
                            <td className="p-2 text-slate-600">{item.pengisi || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bab G: Rencana Anggaran Biaya (RAB) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      G. ESTIMASI RENCANA ANGGARAN BIAYA (RAB)
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      Total: {formatRupiah(calculatedTotal)}
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <tr>
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2">Uraian Belanja</th>
                          <th className="p-2 w-16 text-center">Vol</th>
                          <th className="p-2 w-20 text-center">Satuan</th>
                          <th className="p-2 w-28 text-right">Harga (Rp)</th>
                          <th className="p-2 w-32 text-right">Jumlah (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {rincianList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-500 font-semibold">{idx + 1}</td>
                            <td className="p-2 font-medium text-slate-800">{item.uraian || '-'}</td>
                            <td className="p-2 text-center">{item.volume || 1}</td>
                            <td className="p-2 text-center">{item.satuan || 'Paket'}</td>
                            <td className="p-2 text-right font-mono">{formatRupiah(item.harga_satuan || 0)}</td>
                            <td className="p-2 text-right font-bold font-mono text-slate-900 bg-slate-50/50">
                              {formatRupiah(item.subtotal || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                          <td colSpan={5} className="p-2.5 text-right uppercase text-[11px] text-slate-800">
                            Total Kebutuhan Anggaran:
                          </td>
                          <td className="p-2.5 text-right text-emerald-800 font-black font-mono text-xs">
                            {formatRupiah(calculatedTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Bab H: Penutup & Lembar Pengesahan */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-200 pb-1">
                      H. PENUTUP
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-700 text-justify">
                      Demikian proposal kegiatan ini disusun sebagai kerangka acuan dan pedoman pelaksanaan kegiatan. Atas perhatian, dukungan, dan persetujuan Kepala Sekolah kami sampaikan terima kasih.
                    </p>
                  </div>

                  <div className="pt-4 text-center flex flex-col items-center">
                    <p className="text-xs text-slate-700">
                      Pulung, {formatTanggalIndo(formData.tanggal_pengajuan || new Date().toISOString().split('T')[0])}
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      Mengetahui / Menyetujui,<br />
                      {jabatanKepsek || 'Kepala SMP Negeri 2 Pulung'}
                    </p>
                    <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
                      [ Tanda Tangan & Stempel Resmi ]
                    </div>
                    <p className="text-xs font-bold text-slate-900 underline underline-offset-2">
                      {namaKepsek || DEFAULT_KEPSEK.nama}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      NIP. {nipKepsek || DEFAULT_KEPSEK.nip}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-700">
            Total Anggaran: <strong className="text-emerald-700 font-black font-mono text-sm">{formatRupiah(calculatedTotal)}</strong>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer text-xs"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndAct('print_proposal')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs transition-colors cursor-pointer text-xs"
              title="Simpan & Cetak Proposal Utuh (PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-200" />
              <span>Cetak Proposal (PDF)</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleSaveAndAct('print_rab')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shadow-xs transition-colors cursor-pointer text-xs"
              title="Simpan & Cetak Lembar RAB Saja"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-300" />
              <span>Cetak RAB Saja</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndAct('save_only')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-colors cursor-pointer text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data</span>
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
