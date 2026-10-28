import React, { useState } from 'react';
import { PengajuanAnggaran, StatusPengajuan } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { X, CheckCircle2, XCircle, AlertCircle, Save, ShieldCheck } from 'lucide-react';

interface PersetujuanModalProps {
  pengajuan: PengajuanAnggaran;
  onClose: () => void;
}

export const PersetujuanModal: React.FC<PersetujuanModalProps> = ({ pengajuan, onClose }) => {
  const { data, approvePengajuanAnggaran, currentGuru, currentRole } = useApp();

  const [status, setStatus] = useState<StatusPengajuan>('disetujui');
  const [catatan, setCatatan] = useState('');

  const rincianList = data.rincian_anggaran.filter((r) => r.pengajuan_id === pengajuan.id);
  const unit = data.unit.find((u) => u.id === pengajuan.unit_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    approvePengajuanAnggaran(pengajuan.id, status, catatan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Verifikasi & Persetujuan Anggaran</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <p className="text-slate-500 font-mono">{pengajuan.nomor_surat}</p>
            <h4 className="font-bold text-slate-900 text-sm">{pengajuan.nama_kegiatan}</h4>
            <p className="text-slate-600">Unit Pengaju: <strong>{unit?.nama}</strong></p>
            <p className="text-slate-600">
              Total RAB: <strong className="text-emerald-700 font-bold">{formatRupiah(pengajuan.total_anggaran)}</strong> ({rincianList.length} Pos)
            </p>
            <p className="text-[11px] text-blue-700 font-semibold pt-1 border-t border-slate-200">
              Pemberi Persetujuan: {currentGuru.nama} ({currentRole})
            </p>
          </div>

          {/* Decision Radio Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">Keputusan Persetujuan:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('disetujui')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'disetujui'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Setujui</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('revisi')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'revisi'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Minta Revisi</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('ditolak')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'ditolak'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs">Tolak</span>
              </button>
            </div>
          </div>

          {/* Catatan Feedback */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Catatan / Disposisi / Alasan:
            </label>
            <textarea
              rows={3}
              placeholder="Berikan instruksi pencairan, catatan revisi pos belanja, atau disposisi resmi..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Keputusan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
