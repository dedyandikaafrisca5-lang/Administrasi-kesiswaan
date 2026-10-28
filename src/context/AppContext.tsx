import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DatabaseStore, 
  Guru, 
  RoleType, 
  Siswa, 
  OrangTuaWali, 
  Kelas, 
  RiwayatKelas, 
  DokumenSiswa, 
  DokumenAdministrasi, 
  PengajuanAnggaran, 
  RincianAnggaran, 
  RealisasiAnggaran, 
  RiwayatPersetujuan, 
  Prestasi, 
  Mutasi, 
  Alumni, 
  Unit,
  GasConfig,
  PengajuanHonorEkskul,
  ItemHonorEkskul
} from '../types';
import { loadStoredDatabase, saveStoredDatabase, loadGasConfig, saveGasConfig, resetToInitialData } from '../services/storageService';
import { fetchAllGasData, syncAllDataToGas } from '../services/gasApi';

interface AppContextType {
  data: DatabaseStore;
  currentGuru: Guru;
  currentRole: RoleType;
  gasConfig: GasConfig;
  isLoading: boolean;
  isSyncing: boolean;
  syncMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  
  // Role & Session management
  setCurrentGuruId: (id: number) => void;
  updateGasConfig: (config: Partial<GasConfig>) => void;
  triggerManualSyncToGas: () => Promise<boolean>;
  triggerPullFromGas: () => Promise<boolean>;
  resetAllData: () => void;
  clearSyncMessage: () => void;

  // Siswa CRUD & Flow
  saveSiswa: (siswa: Partial<Siswa>, ortuList?: Partial<OrangTuaWali>[]) => void;
  deleteSiswa: (id: number) => void;
  addDokumenSiswa: (dok: Omit<DokumenSiswa, 'id'>) => void;
  deleteDokumenSiswa: (id: number) => void;

  // Kelas CRUD
  saveKelas: (kelas: Partial<Kelas>) => void;
  deleteKelas: (id: number) => void;

  // Dokumen Administrasi CRUD
  saveDokumenAdministrasi: (dok: Partial<DokumenAdministrasi>, isNewRevision?: boolean) => void;
  deleteDokumenAdministrasi: (id: number) => void;
  saveUnit: (unit: Partial<Unit>) => void;

  // Pengajuan Anggaran & Workflow
  savePengajuanAnggaran: (pengajuan: Partial<PengajuanAnggaran>, rincianList?: Partial<RincianAnggaran>[]) => PengajuanAnggaran;
  deletePengajuanAnggaran: (id: number) => void;
  saveLaporanKegiatan: (
    pengajuanId: number,
    laporanData: {
      tanggal_laporan: string;
      jumlah_peserta_hadir: number;
      laporan_evaluasi: string;
      laporan_kendala: string;
      laporan_rekomendasi: string;
      status_lpj: 'selesai' | 'proses';
    },
    realisasiList: Partial<RealisasiAnggaran>[]
  ) => void;
  addRiwayatPersetujuan: (riwayat: Omit<RiwayatPersetujuan, 'id'>, newStatusPengajuan: PengajuanAnggaran['status']) => void;
  saveRealisasiAnggaran: (realisasi: Partial<RealisasiAnggaran>) => void;
  deleteRealisasiAnggaran: (id: number) => void;

  // Pengajuan Honor Ekstrakurikuler
  savePengajuanHonorEkskul: (pengajuan: Partial<PengajuanHonorEkskul>, itemsList: Partial<ItemHonorEkskul>[]) => void;
  deletePengajuanHonorEkskul: (id: number) => void;

  // Prestasi Siswa & Verifikasi
  savePrestasi: (prestasi: Partial<Prestasi>) => void;
  deletePrestasi: (id: number) => void;
  verifikasiPrestasi: (id: number, status: 'terverifikasi' | 'menunggu', catatan?: string) => void;

  // Mutasi & Alumni
  saveMutasi: (mutasi: Partial<Mutasi>, dataSiswaBaru?: Partial<Siswa>) => void;
  deleteMutasi: (id: number) => void;
  saveAlumni: (alumni: Partial<Alumni>) => void;
  deleteAlumni: (id: number) => void;
  luluskanSiswa: (siswaId: number, alumniData: Partial<Alumni>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DatabaseStore>(loadStoredDatabase);
  const [gasConfig, setGasConfigState] = useState<GasConfig>(loadGasConfig);
  const [currentGuruId, setCurrentGuruIdState] = useState<number>(4); // Default to Admin/TU for full access, easily switchable
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    saveStoredDatabase(data);
  }, [data]);

  const adminGuru = data.guru.find((g) => g.role === 'Admin/TU') || {
    id: 4,
    nip: '19890520 201403 1 002',
    nama: 'Administrator Kesiswaan',
    jabatan: 'Admin SIM Kesiswaan & IT',
    role: 'Admin/TU',
    email: 'admin@smpn2pulung.sch.id',
    no_hp: '081234567804',
  };
  const currentGuru = adminGuru;
  const currentRole: RoleType = 'Admin/TU';

  const updateGasConfig = (newConfig: Partial<GasConfig>) => {
    const updated = { ...gasConfig, ...newConfig };
    setGasConfigState(updated);
    saveGasConfig(updated);
  };

  const clearSyncMessage = () => setSyncMessage(null);

  const setCurrentGuruId = (id: number) => {
    setCurrentGuruIdState(id);
  };

  const resetAllData = () => {
    const reset = resetToInitialData();
    setData(reset);
    setSyncMessage({ type: 'info', text: 'Data sistem berhasil dikembalikan ke data bawaan (Demo Seed).' });
  };

  // Sync to GAS
  const triggerManualSyncToGas = async (): Promise<boolean> => {
    if (!gasConfig.webAppUrl) {
      setSyncMessage({ type: 'error', text: 'URL Google Apps Script belum dikonfigurasi!' });
      return false;
    }
    setIsSyncing(true);
    try {
      const res = await syncAllDataToGas(gasConfig.webAppUrl, data);
      if (res.success) {
        updateGasConfig({ lastSync: new Date().toISOString(), isLiveConnected: true });
        setSyncMessage({ type: 'success', text: 'Sinkronisasi berhasil! Data terupdate di Google Sheets.' });
        setIsSyncing(false);
        return true;
      } else {
        setSyncMessage({ type: 'error', text: res.message || 'Gagal sinkronisasi data' });
        setIsSyncing(false);
        return false;
      }
    } catch {
      setSyncMessage({ type: 'error', text: 'Terjadi kendala jaringan saat sinkronisasi.' });
      setIsSyncing(false);
      return false;
    }
  };

  // Pull from GAS
  const triggerPullFromGas = async (): Promise<boolean> => {
    if (!gasConfig.webAppUrl) {
      setSyncMessage({ type: 'error', text: 'URL Google Apps Script belum dikonfigurasi!' });
      return false;
    }
    setIsLoading(true);
    try {
      const res = await fetchAllGasData(gasConfig.webAppUrl);
      if (res.success && res.data) {
        setData(res.data);
        updateGasConfig({ lastSync: new Date().toISOString(), isLiveConnected: true });
        setSyncMessage({ type: 'success', text: 'Data berhasil ditarik dari Google Sheets!' });
        setIsLoading(false);
        return true;
      } else {
        setSyncMessage({ type: 'error', text: res.message || 'Gagal menarik data dari Google Sheets' });
        setIsLoading(false);
        return false;
      }
    } catch {
      setSyncMessage({ type: 'error', text: 'Terjadi kendala jaringan saat menarik data.' });
      setIsLoading(false);
      return false;
    }
  };

  // ==========================================
  // SISWA & ORTU MANAGEMENT
  // ==========================================
  const saveSiswa = (siswaInput: Partial<Siswa>, ortuList?: Partial<OrangTuaWali>[]) => {
    setData((prev) => {
      let updatedSiswaList = [...prev.siswa];
      let siswaId = siswaInput.id;

      if (siswaId) {
        // Edit existing
        updatedSiswaList = updatedSiswaList.map((s) => (s.id === siswaId ? { ...s, ...siswaInput } as Siswa : s));
      } else {
        // Create new
        const newId = prev.siswa.length > 0 ? Math.max(...prev.siswa.map((s) => s.id)) + 1 : 1;
        siswaId = newId;
        const newSiswa: Siswa = {
          id: newId,
          nisn: siswaInput.nisn || '',
          nis: siswaInput.nis || '',
          nama_lengkap: siswaInput.nama_lengkap || '',
          jenis_kelamin: siswaInput.jenis_kelamin || 'L',
          tempat_lahir: siswaInput.tempat_lahir || '',
          tanggal_lahir: siswaInput.tanggal_lahir || '',
          agama: siswaInput.agama || 'Islam',
          alamat: siswaInput.alamat || '',
          no_hp: siswaInput.no_hp || '',
          foto: siswaInput.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          kelas_id: siswaInput.kelas_id || prev.kelas[0]?.id || 1,
          tahun_masuk: siswaInput.tahun_masuk || new Date().getFullYear(),
          status: siswaInput.status || 'aktif',
        };
        updatedSiswaList.push(newSiswa);

        // Record initial riwayat kelas
        const newRiwayatId = prev.riwayat_kelas.length > 0 ? Math.max(...prev.riwayat_kelas.map((r) => r.id)) + 1 : 1;
        const targetKelas = prev.kelas.find((k) => k.id === newSiswa.kelas_id);
        const newRiwayat: RiwayatKelas = {
          id: newRiwayatId,
          siswa_id: newId,
          kelas_id: newSiswa.kelas_id,
          tahun_ajaran: targetKelas?.tahun_ajaran || '2025/2026',
          status_naik: 'naik',
          wali_kelas_id: targetKelas?.wali_kelas_id || 5,
        };
        prev.riwayat_kelas.push(newRiwayat);
      }

      // Handle Ortu list if provided
      let updatedOrtuList = [...prev.orang_tua_wali];
      if (ortuList && siswaId) {
        // Remove existing for this siswa if replacing or updating
        updatedOrtuList = updatedOrtuList.filter((o) => o.siswa_id !== siswaId);
        ortuList.forEach((item) => {
          if (item.nama && item.nama.trim() !== '') {
            const nextOrtuId = updatedOrtuList.length > 0 ? Math.max(...updatedOrtuList.map((o) => o.id)) + 1 : 1;
            updatedOrtuList.push({
              id: item.id || nextOrtuId,
              siswa_id: siswaId!,
              jenis: item.jenis || 'ayah',
              nama: item.nama,
              pekerjaan: item.pekerjaan || '',
              no_hp: item.no_hp || '',
              alamat: item.alamat || siswaInput.alamat || '',
            });
          }
        });
      }

      return {
        ...prev,
        siswa: updatedSiswaList,
        orang_tua_wali: updatedOrtuList,
      };
    });
  };

  const deleteSiswa = (id: number) => {
    setData((prev) => ({
      ...prev,
      siswa: prev.siswa.filter((s) => s.id !== id),
      orang_tua_wali: prev.orang_tua_wali.filter((o) => o.siswa_id !== id),
      riwayat_kelas: prev.riwayat_kelas.filter((r) => r.siswa_id !== id),
      dokumen_siswa: prev.dokumen_siswa.filter((d) => d.siswa_id !== id),
      prestasi: prev.prestasi.filter((p) => p.siswa_id !== id),
    }));
  };

  const addDokumenSiswa = (dok: Omit<DokumenSiswa, 'id'>) => {
    setData((prev) => {
      const newId = prev.dokumen_siswa.length > 0 ? Math.max(...prev.dokumen_siswa.map((d) => d.id)) + 1 : 1;
      return {
        ...prev,
        dokumen_siswa: [...prev.dokumen_siswa, { ...dok, id: newId }],
      };
    });
  };

  const deleteDokumenSiswa = (id: number) => {
    setData((prev) => ({
      ...prev,
      dokumen_siswa: prev.dokumen_siswa.filter((d) => d.id !== id),
    }));
  };

  // ==========================================
  // KELAS MANAGEMENT
  // ==========================================
  const saveKelas = (kelasInput: Partial<Kelas>) => {
    setData((prev) => {
      let updatedKelas = [...prev.kelas];
      if (kelasInput.id) {
        updatedKelas = updatedKelas.map((k) => (k.id === kelasInput.id ? { ...k, ...kelasInput } as Kelas : k));
      } else {
        const newId = prev.kelas.length > 0 ? Math.max(...prev.kelas.map((k) => k.id)) + 1 : 1;
        updatedKelas.push({
          id: newId,
          nama: kelasInput.nama || 'Kelas Baru',
          tingkat: kelasInput.tingkat || 'X',
          tahun_ajaran: kelasInput.tahun_ajaran || '2025/2026',
          wali_kelas_id: kelasInput.wali_kelas_id || prev.guru[0]?.id || 1,
        });
      }
      return { ...prev, kelas: updatedKelas };
    });
  };

  const deleteKelas = (id: number) => {
    setData((prev) => ({
      ...prev,
      kelas: prev.kelas.filter((k) => k.id !== id),
    }));
  };

  // ==========================================
  // DOKUMEN ADMINISTRASI & UNIT
  // ==========================================
  const saveDokumenAdministrasi = (dokInput: Partial<DokumenAdministrasi>, isNewRevision: boolean = false) => {
    setData((prev) => {
      let updatedDok = [...prev.dokumen_administrasi];
      if (dokInput.id && !isNewRevision) {
        updatedDok = updatedDok.map((d) => (d.id === dokInput.id ? { ...d, ...dokInput } as DokumenAdministrasi : d));
      } else {
        const newId = prev.dokumen_administrasi.length > 0 ? Math.max(...prev.dokumen_administrasi.map((d) => d.id)) + 1 : 1;
        const newDoc: DokumenAdministrasi = {
          id: newId,
          kategori: dokInput.kategori || 'program_kerja',
          sub_kategori: dokInput.sub_kategori || '',
          judul: dokInput.judul || '',
          file_path: dokInput.file_path || '',
          versi: isNewRevision ? ((dokInput.versi || 1) + 1) : (dokInput.versi || 1),
          tahun_ajaran: dokInput.tahun_ajaran || '2025/2026',
          unit_id: dokInput.unit_id || 1,
          penanggung_jawab_id: dokInput.penanggung_jawab_id || currentGuruId,
          status: dokInput.status || 'draft',
          tanggal_upload: dokInput.tanggal_upload || new Date().toISOString().split('T')[0],
          catatan: dokInput.catatan,
        };
        updatedDok.push(newDoc);
      }
      return { ...prev, dokumen_administrasi: updatedDok };
    });
  };

  const deleteDokumenAdministrasi = (id: number) => {
    setData((prev) => ({
      ...prev,
      dokumen_administrasi: prev.dokumen_administrasi.filter((d) => d.id !== id),
    }));
  };

  const saveUnit = (unitInput: Partial<Unit>) => {
    setData((prev) => {
      let updatedUnits = [...prev.unit];
      if (unitInput.id) {
        updatedUnits = updatedUnits.map((u) => (u.id === unitInput.id ? { ...u, ...unitInput } as Unit : u));
      } else {
        const newId = prev.unit.length > 0 ? Math.max(...prev.unit.map((u) => u.id)) + 1 : 1;
        updatedUnits.push({
          id: newId,
          nama: unitInput.nama || 'Unit Baru',
          jenis: unitInput.jenis || 'ekskul',
          pembina_id: unitInput.pembina_id || currentGuruId,
        });
      }
      return { ...prev, unit: updatedUnits };
    });
  };

  // ==========================================
  // PENGAJUAN ANGGARAN & WORKFLOW
  // ==========================================
  const savePengajuanAnggaran = (
    pengajuanInput: Partial<PengajuanAnggaran>, 
    rincianList?: Partial<RincianAnggaran>[]
  ): PengajuanAnggaran => {
    let savedItem: PengajuanAnggaran;

    setData((prev) => {
      let updatedPengajuan = [...prev.pengajuan_anggaran];
      let pengajuanId = pengajuanInput.id;

      // Calculate total from rincian if provided
      let computedTotal = pengajuanInput.total_anggaran;
      if (rincianList && rincianList.length > 0) {
        computedTotal = rincianList.reduce((acc, curr) => {
          const vol = Number(curr.volume) || 1;
          const harga = Number(curr.harga_satuan) || 0;
          return acc + (vol * harga);
        }, 0);
      } else if (computedTotal === undefined && pengajuanId) {
        computedTotal = prev.pengajuan_anggaran.find((p) => p.id === pengajuanId)?.total_anggaran || 0;
      }

      if (pengajuanId) {
        const existing = prev.pengajuan_anggaran.find((p) => p.id === pengajuanId);
        savedItem = {
          ...(existing || {}),
          ...pengajuanInput,
          total_anggaran: computedTotal ?? existing?.total_anggaran ?? 0,
        } as PengajuanAnggaran;
        updatedPengajuan = updatedPengajuan.map((p) => (p.id === pengajuanId ? savedItem : p));
      } else {
        const newId = prev.pengajuan_anggaran.length > 0 ? Math.max(...prev.pengajuan_anggaran.map((p) => p.id)) + 1 : 1;
        pengajuanId = newId;
        savedItem = {
          id: newId,
          nomor_surat: pengajuanInput.nomor_surat || `ANGG/${new Date().getFullYear()}/${String(newId).padStart(3, '0')}`,
          unit_id: pengajuanInput.unit_id || 1,
          nama_kegiatan: pengajuanInput.nama_kegiatan || '',
          waktu_pelaksanaan: pengajuanInput.waktu_pelaksanaan || '',
          tempat: pengajuanInput.tempat || 'SMP Negeri 2 Pulung',
          latar_belakang: pengajuanInput.latar_belakang || '',
          tujuan: pengajuanInput.tujuan,
          sasaran: pengajuanInput.sasaran,
          sumber_dana: pengajuanInput.sumber_dana,
          susunan_panitia: pengajuanInput.susunan_panitia,
          susunan_acara: pengajuanInput.susunan_acara,
          total_anggaran: computedTotal || 0,
          status: pengajuanInput.status || 'disetujui',
          diajukan_oleh_id: pengajuanInput.diajukan_oleh_id || currentGuruId,
          tanggal_pengajuan: pengajuanInput.tanggal_pengajuan || new Date().toISOString().split('T')[0],
        };
        updatedPengajuan.push(savedItem);
      }

      // Replace or insert rincian ONLY IF rincianList was explicitly provided
      let updatedRincian = prev.rincian_anggaran;
      if (rincianList) {
        updatedRincian = prev.rincian_anggaran.filter((r) => r.pengajuan_id !== pengajuanId);
        rincianList.forEach((item, idx) => {
          const nextId = updatedRincian.length > 0 ? Math.max(...updatedRincian.map((r) => r.id)) + 1 : 1;
          const vol = Number(item.volume) || 1;
          const harga = Number(item.harga_satuan) || 0;
          updatedRincian.push({
            id: item.id || nextId,
            pengajuan_id: pengajuanId!,
            no_urut: idx + 1,
            uraian: item.uraian || '',
            volume: vol,
            satuan: item.satuan || 'Paket',
            harga_satuan: harga,
            subtotal: vol * harga,
          });
        });
      }

      return {
        ...prev,
        pengajuan_anggaran: updatedPengajuan,
        rincian_anggaran: updatedRincian,
      };
    });

    return savedItem!;
  };

  const deletePengajuanAnggaran = (id: number) => {
    setData((prev) => ({
      ...prev,
      pengajuan_anggaran: prev.pengajuan_anggaran.filter((p) => p.id !== id),
      rincian_anggaran: prev.rincian_anggaran.filter((r) => r.pengajuan_id !== id),
      realisasi_anggaran: prev.realisasi_anggaran.filter((re) => re.pengajuan_id !== id),
      riwayat_persetujuan: prev.riwayat_persetujuan.filter((rw) => rw.pengajuan_id !== id),
    }));
  };

  const saveLaporanKegiatan = (
    pengajuanId: number,
    laporanData: {
      tanggal_laporan: string;
      jumlah_peserta_hadir: number;
      laporan_evaluasi: string;
      laporan_kendala: string;
      laporan_rekomendasi: string;
      status_lpj: 'selesai' | 'proses';
    },
    realisasiList: Partial<RealisasiAnggaran>[]
  ) => {
    setData((prev) => {
      // Hitung total realisasi
      const totalRealisasi = realisasiList.reduce((acc, curr) => {
        const vol = curr.jumlah_realisasi || 1;
        const harga = curr.harga_realisasi || 0;
        return acc + (vol * harga);
      }, 0);

      const updatedPengajuan = prev.pengajuan_anggaran.map((p) => {
        if (p.id === pengajuanId) {
          return {
            ...p,
            ...laporanData,
            total_realisasi: totalRealisasi,
            status: 'selesai_lpj' as const,
          };
        }
        return p;
      });

      // Update daftar realisasi anggaran
      let updatedRealisasi = prev.realisasi_anggaran.filter((r) => r.pengajuan_id !== pengajuanId);
      realisasiList.forEach((item) => {
        const nextId = updatedRealisasi.length > 0 ? Math.max(...updatedRealisasi.map((r) => r.id)) + 1 : 1;
        const vol = item.jumlah_realisasi || 1;
        const harga = item.harga_realisasi || 0;
        updatedRealisasi.push({
          id: item.id || nextId,
          pengajuan_id: pengajuanId,
          uraian: item.uraian || '',
          jumlah_realisasi: vol,
          harga_realisasi: harga,
          subtotal_realisasi: vol * harga,
          bukti_file: item.bukti_file || '',
          tanggal_realisasi: item.tanggal_realisasi || laporanData.tanggal_laporan || new Date().toISOString().split('T')[0],
        });
      });

      return {
        ...prev,
        pengajuan_anggaran: updatedPengajuan,
        realisasi_anggaran: updatedRealisasi,
      };
    });
  };

  const addRiwayatPersetujuan = (
    riwayat: Omit<RiwayatPersetujuan, 'id'>, 
    newStatusPengajuan: PengajuanAnggaran['status']
  ) => {
    setData((prev) => {
      const nextId = prev.riwayat_persetujuan.length > 0 ? Math.max(...prev.riwayat_persetujuan.map((r) => r.id)) + 1 : 1;
      const updatedRiwayat = [...prev.riwayat_persetujuan, { ...riwayat, id: nextId }];
      
      const updatedPengajuan = prev.pengajuan_anggaran.map((p) => {
        if (p.id === riwayat.pengajuan_id) {
          return {
            ...p,
            status: newStatusPengajuan,
            disetujui_oleh_id: riwayat.disetujui_oleh_id,
            tanggal_disetujui: newStatusPengajuan === 'disetujui' || newStatusPengajuan === 'dicairkan' 
              ? new Date().toISOString().split('T')[0] 
              : p.tanggal_disetujui,
          };
        }
        return p;
      });

      return {
        ...prev,
        riwayat_persetujuan: updatedRiwayat,
        pengajuan_anggaran: updatedPengajuan,
      };
    });
  };

  const saveRealisasiAnggaran = (realisasiInput: Partial<RealisasiAnggaran>) => {
    setData((prev) => {
      let updatedRealisasi = [...prev.realisasi_anggaran];
      const jumlah = realisasiInput.jumlah_realisasi || 1;
      const harga = realisasiInput.harga_realisasi || 0;
      const subtotal = jumlah * harga;

      if (realisasiInput.id) {
        updatedRealisasi = updatedRealisasi.map((r) => 
          r.id === realisasiInput.id ? { ...r, ...realisasiInput, subtotal_realisasi: subtotal } as RealisasiAnggaran : r
        );
      } else {
        const newId = prev.realisasi_anggaran.length > 0 ? Math.max(...prev.realisasi_anggaran.map((r) => r.id)) + 1 : 1;
        updatedRealisasi.push({
          id: newId,
          pengajuan_id: realisasiInput.pengajuan_id || 1,
          uraian: realisasiInput.uraian || '',
          jumlah_realisasi: jumlah,
          harga_realisasi: harga,
          subtotal_realisasi: subtotal,
          bukti_file: realisasiInput.bukti_file || '',
          tanggal_realisasi: realisasiInput.tanggal_realisasi || new Date().toISOString().split('T')[0],
        });
      }
      return { ...prev, realisasi_anggaran: updatedRealisasi };
    });
  };

  const deleteRealisasiAnggaran = (id: number) => {
    setData((prev) => ({
      ...prev,
      realisasi_anggaran: prev.realisasi_anggaran.filter((r) => r.id !== id),
    }));
  };

  // ==========================================
  // PRESTASI SISWA & VERIFIKASI
  // ==========================================
  const savePrestasi = (prestasiInput: Partial<Prestasi>) => {
    setData((prev) => {
      let updatedPrestasi = [...prev.prestasi];
      if (prestasiInput.id) {
        updatedPrestasi = updatedPrestasi.map((p) => 
          p.id === prestasiInput.id ? { ...p, ...prestasiInput } as Prestasi : p
        );
      } else {
        const newId = prev.prestasi.length > 0 ? Math.max(...prev.prestasi.map((p) => p.id)) + 1 : 1;
        updatedPrestasi.push({
          id: newId,
          siswa_id: prestasiInput.siswa_id || prev.siswa[0]?.id || 1,
          nama_kegiatan: prestasiInput.nama_kegiatan || '',
          jenis: prestasiInput.jenis || 'akademik',
          tingkat: prestasiInput.tingkat || 'kabupaten_kota',
          peringkat: prestasiInput.peringkat || 'Juara 1',
          penyelenggara: prestasiInput.penyelenggara || '',
          tanggal: prestasiInput.tanggal || new Date().toISOString().split('T')[0],
          tahun_ajaran: prestasiInput.tahun_ajaran || '2025/2026',
          file_bukti: prestasiInput.file_bukti || '',
          dicatat_oleh_id: prestasiInput.dicatat_oleh_id || currentGuruId,
          status_verifikasi: prestasiInput.status_verifikasi || 'menunggu',
          catatan_verifikasi: prestasiInput.catatan_verifikasi,
        });
      }
      return { ...prev, prestasi: updatedPrestasi };
    });
  };

  const deletePrestasi = (id: number) => {
    setData((prev) => ({
      ...prev,
      prestasi: prev.prestasi.filter((p) => p.id !== id),
    }));
  };

  const verifikasiPrestasi = (id: number, status: 'terverifikasi' | 'menunggu', catatan?: string) => {
    setData((prev) => ({
      ...prev,
      prestasi: prev.prestasi.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status_verifikasi: status,
            catatan_verifikasi: catatan || (status === 'terverifikasi' ? `Diverifikasi oleh ${currentGuru.nama}` : undefined),
          };
        }
        return p;
      }),
    }));
  };

  // ==========================================
  // MUTASI & ALUMNI (Business Rules Enforced)
  // ==========================================
  const saveMutasi = (mutasiInput: Partial<Mutasi>, dataSiswaBaru?: Partial<Siswa>) => {
    setData((prev) => {
      let updatedMutasi = [...prev.mutasi];
      let updatedSiswa = [...prev.siswa];
      let targetSiswaId = mutasiInput.siswa_id;

      // Business Rule: Mutasi Masuk creates a new active Siswa if provided
      if (mutasiInput.jenis === 'masuk' && !targetSiswaId && dataSiswaBaru) {
        const nextSiswaId = updatedSiswa.length > 0 ? Math.max(...updatedSiswa.map((s) => s.id)) + 1 : 1;
        targetSiswaId = nextSiswaId;
        const newSiswa: Siswa = {
          id: nextSiswaId,
          nisn: dataSiswaBaru.nisn || '',
          nis: dataSiswaBaru.nis || '',
          nama_lengkap: dataSiswaBaru.nama_lengkap || 'Siswa Pindahan Baru',
          jenis_kelamin: dataSiswaBaru.jenis_kelamin || 'L',
          tempat_lahir: dataSiswaBaru.tempat_lahir || '',
          tanggal_lahir: dataSiswaBaru.tanggal_lahir || '',
          agama: dataSiswaBaru.agama || 'Islam',
          alamat: dataSiswaBaru.alamat || '',
          no_hp: dataSiswaBaru.no_hp || '',
          foto: dataSiswaBaru.foto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
          kelas_id: dataSiswaBaru.kelas_id || prev.kelas[0]?.id || 1,
          tahun_masuk: dataSiswaBaru.tahun_masuk || new Date().getFullYear(),
          status: 'aktif',
        };
        updatedSiswa.push(newSiswa);
      } else if (mutasiInput.jenis === 'keluar' && targetSiswaId) {
        // Business Rule: Mutasi Keluar switches Siswa status to 'pindah'
        updatedSiswa = updatedSiswa.map((s) => s.id === targetSiswaId ? { ...s, status: 'pindah' as const } : s);
      }

      if (mutasiInput.id) {
        updatedMutasi = updatedMutasi.map((m) => m.id === mutasiInput.id ? { ...m, ...mutasiInput, siswa_id: targetSiswaId || m.siswa_id } as Mutasi : m);
      } else {
        const newId = prev.mutasi.length > 0 ? Math.max(...prev.mutasi.map((m) => m.id)) + 1 : 1;
        updatedMutasi.push({
          id: newId,
          siswa_id: targetSiswaId || 1,
          jenis: mutasiInput.jenis || 'keluar',
          asal_sekolah: mutasiInput.asal_sekolah || '',
          tujuan_sekolah: mutasiInput.tujuan_sekolah || '',
          alasan: mutasiInput.alasan || '',
          tanggal_mutasi: mutasiInput.tanggal_mutasi || new Date().toISOString().split('T')[0],
          no_surat_mutasi: mutasiInput.no_surat_mutasi || `421.3/${String(newId).padStart(3, '0')}/SMAN-MUTASI/${new Date().getFullYear()}`,
          file_surat: mutasiInput.file_surat || '',
          disetujui_oleh_id: mutasiInput.disetujui_oleh_id || currentGuruId,
          tahun_ajaran: mutasiInput.tahun_ajaran || '2025/2026',
        });
      }

      return {
        ...prev,
        mutasi: updatedMutasi,
        siswa: updatedSiswa,
      };
    });
  };

  const deleteMutasi = (id: number) => {
    setData((prev) => ({
      ...prev,
      mutasi: prev.mutasi.filter((m) => m.id !== id),
    }));
  };

  // Business Rule: Luluskan Siswa -> status becomes 'lulus' & creates alumni row
  const luluskanSiswa = (siswaId: number, alumniData: Partial<Alumni>) => {
    setData((prev) => {
      const targetSiswa = prev.siswa.find((s) => s.id === siswaId);
      const targetKelas = prev.kelas.find((k) => k.id === targetSiswa?.kelas_id);

      const updatedSiswa = prev.siswa.map((s) => s.id === siswaId ? { ...s, status: 'lulus' as const } : s);
      
      const nextAlumniId = prev.alumni.length > 0 ? Math.max(...prev.alumni.map((a) => a.id)) + 1 : 1;
      const existingAlumni = prev.alumni.find((a) => a.siswa_id === siswaId);

      let updatedAlumni = [...prev.alumni];
      if (existingAlumni) {
        updatedAlumni = updatedAlumni.map((a) => a.siswa_id === siswaId ? { ...a, ...alumniData } as Alumni : a);
      } else {
        updatedAlumni.push({
          id: nextAlumniId,
          siswa_id: siswaId,
          tahun_lulus: alumniData.tahun_lulus || new Date().getFullYear(),
          kelas_terakhir: alumniData.kelas_terakhir || targetKelas?.nama || 'XII MIPA 1',
          melanjutkan_ke: alumniData.melanjutkan_ke || 'kuliah',
          detail_tujuan: alumniData.detail_tujuan || '',
          kontak_alumni: alumniData.kontak_alumni || targetSiswa?.no_hp || '',
        });
      }

      return {
        ...prev,
        siswa: updatedSiswa,
        alumni: updatedAlumni,
      };
    });
  };

  const saveAlumni = (alumniInput: Partial<Alumni>) => {
    setData((prev) => {
      let updatedAlumni = [...prev.alumni];
      if (alumniInput.id) {
        updatedAlumni = updatedAlumni.map((a) => a.id === alumniInput.id ? { ...a, ...alumniInput } as Alumni : a);
      } else {
        const newId = prev.alumni.length > 0 ? Math.max(...prev.alumni.map((a) => a.id)) + 1 : 1;
        updatedAlumni.push({
          id: newId,
          siswa_id: alumniInput.siswa_id || 1,
          tahun_lulus: alumniInput.tahun_lulus || new Date().getFullYear(),
          kelas_terakhir: alumniInput.kelas_terakhir || 'XII MIPA 1',
          melanjutkan_ke: alumniInput.melanjutkan_ke || 'kuliah',
          detail_tujuan: alumniInput.detail_tujuan || '',
          kontak_alumni: alumniInput.kontak_alumni || '',
        });
      }
      return { ...prev, alumni: updatedAlumni };
    });
  };

  const deleteAlumni = (id: number) => {
    setData((prev) => ({
      ...prev,
      alumni: prev.alumni.filter((a) => a.id !== id),
    }));
  };

  // ==========================================
  // PENGAJUAN HONOR EKSTRAKURIKULER
  // ==========================================
  const savePengajuanHonorEkskul = (
    pengajuanInput: Partial<PengajuanHonorEkskul>,
    itemsList: Partial<ItemHonorEkskul>[]
  ) => {
    setData((prev) => {
      let updatedPengajuan = [...(prev.pengajuan_honor_ekskul || [])];
      let pengajuanId = pengajuanInput.id;

      // Calculate totals for items
      const processedItems: ItemHonorEkskul[] = itemsList.map((item, idx) => {
        const honorPerPertemuan = Number(item.honor_per_pertemuan) || 0;
        const jumlahPertemuan = Number(item.jumlah_pertemuan) || 0;
        const totalHonor = honorPerPertemuan * jumlahPertemuan;
        return {
          id: item.id || idx + 1,
          nama_ekstrakurikuler: item.nama_ekstrakurikuler || 'Ekstrakurikuler',
          nama_pembina_pelatih: item.nama_pembina_pelatih || '',
          status_penerima: item.status_penerima || 'Guru Pembina',
          honor_per_pertemuan: honorPerPertemuan,
          jumlah_pertemuan: jumlahPertemuan,
          total_honor: totalHonor,
          keterangan: item.keterangan || '',
        };
      });

      const totalPertemuanSemua = processedItems.reduce((sum, it) => sum + it.jumlah_pertemuan, 0);
      const totalHonorDibayarkan = processedItems.reduce((sum, it) => sum + it.total_honor, 0);

      if (pengajuanId) {
        updatedPengajuan = updatedPengajuan.map((p) =>
          p.id === pengajuanId
            ? ({
                ...p,
                ...pengajuanInput,
                items: processedItems,
                total_pertemuan_semua: totalPertemuanSemua,
                total_honor_dibayarkan: totalHonorDibayarkan,
              } as PengajuanHonorEkskul)
            : p
        );
      } else {
        const newId = updatedPengajuan.length > 0 ? Math.max(...updatedPengajuan.map((p) => p.id)) + 1 : 1;
        const newDoc: PengajuanHonorEkskul = {
          id: newId,
          nomor_surat: pengajuanInput.nomor_surat || `${String(newId).padStart(3, '0')}/HONOR-EKSKUL/SMPN2/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
          tahun_ajaran: pengajuanInput.tahun_ajaran || '2025/2026',
          bulan_mulai: pengajuanInput.bulan_mulai || 'Juli 2025',
          bulan_selesai: pengajuanInput.bulan_selesai || 'September 2025',
          tanggal_pengajuan: pengajuanInput.tanggal_pengajuan || new Date().toISOString().split('T')[0],
          sumber_dana: pengajuanInput.sumber_dana || 'Dana BOS Kesiswaan SMP Negeri 2 Pulung',
          keterangan: pengajuanInput.keterangan || `Pengajuan Honorarium Pembina & Pelatih Ekstrakurikuler Periode ${pengajuanInput.bulan_mulai || 'Juli'} s.d. ${pengajuanInput.bulan_selesai || 'September'}`,
          status: pengajuanInput.status || 'disetujui',
          diajukan_oleh_id: currentGuruId,
          items: processedItems,
          total_pertemuan_semua: totalPertemuanSemua,
          total_honor_dibayarkan: totalHonorDibayarkan,
        };
        updatedPengajuan.unshift(newDoc);
      }

      return {
        ...prev,
        pengajuan_honor_ekskul: updatedPengajuan,
      };
    });
  };

  const deletePengajuanHonorEkskul = (id: number) => {
    setData((prev) => ({
      ...prev,
      pengajuan_honor_ekskul: (prev.pengajuan_honor_ekskul || []).filter((p) => p.id !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        currentGuru,
        currentRole,
        gasConfig,
        isLoading,
        isSyncing,
        syncMessage,
        setCurrentGuruId,
        updateGasConfig,
        triggerManualSyncToGas,
        triggerPullFromGas,
        resetAllData,
        clearSyncMessage,
        saveSiswa,
        deleteSiswa,
        addDokumenSiswa,
        deleteDokumenSiswa,
        saveKelas,
        deleteKelas,
        saveDokumenAdministrasi,
        deleteDokumenAdministrasi,
        saveUnit,
        savePengajuanAnggaran,
        deletePengajuanAnggaran,
        saveLaporanKegiatan,
        addRiwayatPersetujuan,
        saveRealisasiAnggaran,
        deleteRealisasiAnggaran,
        savePrestasi,
        deletePrestasi,
        verifikasiPrestasi,
        saveMutasi,
        deleteMutasi,
        saveAlumni,
        deleteAlumni,
        luluskanSiswa,
        savePengajuanHonorEkskul,
        deletePengajuanHonorEkskul,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
