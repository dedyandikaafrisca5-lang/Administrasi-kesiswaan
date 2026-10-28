import React, { useState } from 'react';
import { Kelas } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, Trash2, Edit2, BookOpen, UserCheck, Save } from 'lucide-react';

interface KelolaKelasModalProps {
  onClose: () => void;
}

export const KelolaKelasModal: React.FC<KelolaKelasModalProps> = ({ onClose }) => {
  const { data, saveKelas, deleteKelas } = useApp();

  const [editingKelas, setEditingKelas] = useState<Partial<Kelas> | null>(null);
  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState<'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII'>('VII');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [waliKelasId, setWaliKelasId] = useState<number>(data.guru[0]?.id || 1);

  const startEdit = (k: Kelas) => {
    setEditingKelas(k);
    setNama(k.nama);
    setTingkat(k.tingkat as 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII');
    setTahunAjaran(k.tahun_ajaran);
    setWaliKelasId(k.wali_kelas_id);
  };

  const cancelEdit = () => {
    setEditingKelas(null);
    setNama('');
    setTingkat('VII');
    setTahunAjaran('2025/2026');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    saveKelas({
      id: editingKelas?.id,
      nama: nama.trim(),
      tingkat: tingkat,
      tahun_ajaran: tahunAjaran,
      wali_kelas_id: waliKelasId,
    });

    cancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Kelola Data Master Kelas & Wali Kelas</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Add / Edit Form */}
          <form onSubmit={handleSave} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-blue-700">
              {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: X MIPA 1 / XII IPS 2"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tingkat Jenjang</label>
                <select
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value as 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII')}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="VII">Tingkat VII (Tujuh - SMP)</option>
                  <option value="VIII">Tingkat VIII (Delapan - SMP)</option>
                  <option value="IX">Tingkat IX (Sembilan - SMP)</option>
                  <option value="X">Tingkat X (Sepuluh)</option>
                  <option value="XI">Tingkat XI (Sebelas)</option>
                  <option value="XII">Tingkat XII (Dua Belas)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  placeholder="2025/2026"
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Wali Kelas</label>
                <select
                  value={waliKelasId}
                  onChange={(e) => setWaliKelasId(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {data.guru.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama} ({g.jabatan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingKelas && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingKelas ? 'Perbarui Kelas' : 'Simpan Kelas'}</span>
              </button>
            </div>
          </form>

          {/* List Kelas */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Daftar Kelas Terdaftar ({data.kelas.length})</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Kelas</th>
                    <th className="p-3">Tingkat</th>
                    <th className="p-3">Wali Kelas</th>
                    <th className="p-3 text-center">Jumlah Siswa</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.kelas.map((k) => {
                    const wk = data.guru.find((g) => g.id === k.wali_kelas_id);
                    const jumlahSiswa = data.siswa.filter((s) => s.kelas_id === k.id && s.status === 'aktif').length;
                    return (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{k.nama}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                            {k.tingkat}
                          </span>
                        </td>
                        <td className="p-3">{wk?.nama || '-'}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{jumlahSiswa} Siswa</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(k)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (jumlahSiswa > 0) {
                                  alert(`Tidak dapat menghapus kelas ini karena masih berisi ${jumlahSiswa} siswa aktif.`);
                                  return;
                                }
                                if (confirm(`Hapus kelas ${k.nama}?`)) {
                                  deleteKelas(k.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
