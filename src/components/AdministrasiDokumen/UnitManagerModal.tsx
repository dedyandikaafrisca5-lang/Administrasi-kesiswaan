import React, { useState } from 'react';
import { Unit } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Building2, Plus, Edit2, Trash2, Save, Users } from 'lucide-react';

interface UnitManagerModalProps {
  onClose: () => void;
}

export const UnitManagerModal: React.FC<UnitManagerModalProps> = ({ onClose }) => {
  const { data, saveUnit } = useApp();

  const [editingUnit, setEditingUnit] = useState<Partial<Unit> | null>(null);
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<'osis' | 'ekskul' | 'panitia'>('ekskul');
  const [pembinaId, setPembinaId] = useState<number>(data.guru[0]?.id || 1);

  const startEdit = (u: Unit) => {
    setEditingUnit(u);
    setNama(u.nama);
    setJenis(u.jenis);
    setPembinaId(u.pembina_id || data.guru[0]?.id || 1);
  };

  const cancelEdit = () => {
    setEditingUnit(null);
    setNama('');
    setJenis('ekskul');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    saveUnit({
      id: editingUnit?.id,
      nama: nama.trim(),
      jenis: jenis,
      pembina_id: pembinaId,
    });

    cancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Kelola Unit (OSIS, Ekskul & Panitia)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-blue-700">
              {editingUnit ? 'Edit Unit Organisasi' : 'Tambah Unit Baru'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jenis Unit</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as 'osis' | 'ekskul' | 'panitia')}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white uppercase font-bold text-xs"
                >
                  <option value="osis">OSIS / MPK</option>
                  <option value="ekskul">Ekstrakurikuler</option>
                  <option value="panitia">Kepanitiaan Khusus</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Unit / Organisasi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pramuka Gudep 01-02 / Paskibra"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Guru Pembina Penanggung Jawab</label>
                <select
                  value={pembinaId}
                  onChange={(e) => setPembinaId(Number(e.target.value))}
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
              {editingUnit && (
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
                <span>{editingUnit ? 'Perbarui Unit' : 'Simpan Unit'}</span>
              </button>
            </div>
          </form>

          {/* List Unit */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Daftar Unit Kesiswaan ({data.unit.length})</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Unit</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Pembina</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.unit.map((u) => {
                    const pembina = data.guru.find((g) => g.id === u.pembina_id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{u.nama}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                            {u.jenis}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{pembina?.nama || '-'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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
