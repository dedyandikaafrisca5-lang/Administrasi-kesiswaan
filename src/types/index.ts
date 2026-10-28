export type RoleType = 
  | 'Admin/TU' 
  | 'Wali Kelas' 
  | 'Pembina OSIS/Ekskul' 
  | 'Waka Kesiswaan' 
  | 'Bendahara' 
  | 'Kepala Sekolah';

export type StatusSiswa = 'aktif' | 'pindah' | 'lulus' | 'nonaktif';
export type JenisKelamin = 'L' | 'P';
export type JenisOrtu = 'ayah' | 'ibu' | 'wali';
export type StatusNaik = 'naik' | 'tinggal_kelas';
export type JenisDokumenSiswa = 'kartu_keluarga' | 'akta_kelahiran' | 'ijazah_sd' | 'ijazah_smp' | 'raport' | 'lainnya';

export type JenisUnit = 'osis' | 'ekskul' | 'panitia';
export type KategoriDokumen = 'program_kerja' | 'osis' | 'ekskul';
export type StatusDokumen = 'draft' | 'diajukan' | 'disetujui' | 'diarsipkan';

export type StatusAnggaran = 'diajukan' | 'direvisi' | 'disetujui' | 'ditolak' | 'dicairkan' | 'selesai_lpj' | 'revisi';
export type StatusPengajuan = 'diajukan' | 'disetujui' | 'revisi' | 'ditolak' | 'dicairkan' | 'selesai_lpj';
export type StatusPersetujuan = 'disetujui' | 'revisi' | 'ditolak';

export type JenisPrestasi = 'akademik' | 'non-akademik' | 'non_akademik';
export type TingkatPrestasi = 'sekolah' | 'kecamatan' | 'kabupaten_kota' | 'provinsi' | 'nasional' | 'internasional';
export type StatusVerifikasi = 'menunggu' | 'terverifikasi';

export type JenisMutasi = 'masuk' | 'keluar';
export type StatusMutasi = 'diajukan' | 'disetujui' | 'ditolak';
export type StatusAlumni = 'sma' | 'smk' | 'ma' | 'pesantren' | 'kuliah' | 'kerja' | 'wirausaha' | 'mencari_kerja' | 'lainnya';
export type MelanjutkanKe = 'sma' | 'smk' | 'ma' | 'pesantren' | 'kuliah' | 'kerja' | 'wirausaha' | 'mencari_kerja' | 'lainnya';

export interface Siswa {
  id: number;
  nisn: string;
  nis: string;
  nama_lengkap: string;
  jenis_kelamin: JenisKelamin;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  alamat: string;
  no_hp: string;
  foto: string;
  kelas_id: number;
  tahun_masuk: number;
  status: StatusSiswa;
}

export interface OrangTuaWali {
  id: number;
  siswa_id: number;
  jenis: JenisOrtu;
  nama: string;
  pekerjaan: string;
  no_hp: string;
  alamat: string;
}

export interface Kelas {
  id: number;
  nama: string;
  tingkat: 'X' | 'XI' | 'XII' | 'VII' | 'VIII' | 'IX';
  tahun_ajaran: string;
  wali_kelas_id: number;
}

export interface RiwayatKelas {
  id: number;
  siswa_id: number;
  kelas_id: number;
  tahun_ajaran: string;
  status_naik: StatusNaik;
  wali_kelas_id: number;
}

export interface DokumenSiswa {
  id: number;
  siswa_id: number;
  jenis_dokumen: JenisDokumenSiswa;
  judul?: string;
  file_path: string;
  tanggal_upload: string;
}

export interface Guru {
  id: number;
  nip?: string;
  nama: string;
  jabatan: string;
  role: RoleType;
  email?: string;
  no_hp?: string;
  avatar?: string;
}

export interface Unit {
  id: number;
  nama: string;
  jenis: JenisUnit;
  pembina_id?: number;
}

export interface DokumenAdministrasi {
  id: number;
  kategori: KategoriDokumen;
  sub_kategori: string;
  judul: string;
  file_path: string;
  versi: number;
  tahun_ajaran: string;
  unit_id: number;
  penanggung_jawab_id: number;
  status: StatusDokumen;
  tanggal_upload: string;
  catatan?: string;
}

export interface PengajuanAnggaran {
  id: number;
  nomor_surat: string;
  unit_id: number;
  nama_kegiatan: string;
  waktu_pelaksanaan: string;
  tempat: string;
  latar_belakang: string;
  total_anggaran: number;
  status: StatusAnggaran;
  diajukan_oleh_id: number;
  disetujui_oleh_id?: number;
  tanggal_pengajuan: string;
  tanggal_disetujui?: string;
  // Bagian Tambahan untuk Naskah Proposal Lengkap
  tujuan?: string;
  sasaran?: string;
  sumber_dana?: string;
  susunan_panitia?: string;
  susunan_acara?: string;
  // Bagian Laporan Pertanggungjawaban (LPJ Kegiatan)
  status_lpj?: 'belum' | 'proses' | 'selesai';
  tanggal_laporan?: string;
  jumlah_peserta_hadir?: number;
  laporan_evaluasi?: string;
  laporan_kendala?: string;
  laporan_rekomendasi?: string;
  total_realisasi?: number;
  foto_dokumentasi_urls?: string[];
}

export interface RincianAnggaran {
  id: number;
  pengajuan_id: number;
  no_urut?: number;
  uraian: string;
  volume: number;
  satuan: string;
  harga_satuan: number;
  subtotal: number;
}

export interface RealisasiAnggaran {
  id: number;
  pengajuan_id: number;
  uraian: string;
  jumlah_realisasi: number;
  harga_realisasi: number;
  subtotal_realisasi: number;
  bukti_file?: string;
  bukti_nota_url?: string;
  tanggal_realisasi?: string;
}

export interface RiwayatPersetujuan {
  id: number;
  pengajuan_id: number;
  tahap?: string;
  jabatan?: string;
  disetujui_oleh_id: number;
  status: StatusPersetujuan | StatusAnggaran;
  catatan: string;
  tanggal: string;
}

export interface Prestasi {
  id: number;
  siswa_id: number;
  nama_prestasi?: string;
  nama_kegiatan?: string;
  jenis: JenisPrestasi;
  tingkat: TingkatPrestasi;
  peringkat: string;
  penyelenggara: string;
  tanggal_perolehan?: string;
  tanggal?: string;
  tahun?: number;
  tahun_ajaran?: string;
  sertifikat_url?: string;
  file_bukti?: string;
  guru_pembimbing_id?: number;
  dicatat_oleh_id?: number;
  status_verifikasi: StatusVerifikasi;
  catatan?: string;
  catatan_verifikasi?: string;
}


export interface Mutasi {
  id: number;
  siswa_id: number;
  jenis: JenisMutasi;
  sekolah_asal?: string;
  asal_sekolah?: string;
  sekolah_tujuan?: string;
  tujuan_sekolah?: string;
  alasan: string;
  tanggal_mutasi: string;
  nomor_surat?: string;
  no_surat_mutasi?: string;
  file_surat_url?: string;
  file_surat?: string;
  status?: StatusMutasi;
  disetujui_oleh_id?: number;
  tahun_ajaran?: string;
}

export interface Alumni {
  id: number;
  siswa_id: number;
  tahun_lulus: number;
  kelas_terakhir?: string;
  status_setelah_lulus?: StatusAlumni;
  melanjutkan_ke?: MelanjutkanKe;
  nama_instansi?: string;
  jurusan_posisi?: string;
  detail_tujuan?: string;
  no_hp_terbaru?: string;
  kontak_alumni?: string;
  email?: string;
  alamat_terbaru?: string;
  catatan?: string;
}

export interface ItemHonorEkskul {
  id: number;
  nama_ekstrakurikuler: string;
  nama_pembina_pelatih: string;
  status_penerima?: 'Guru Pembina' | 'Pelatih Eksternal';
  honor_per_pertemuan: number;
  jumlah_pertemuan: number;
  total_honor: number;
  keterangan?: string;
}

export interface PengajuanHonorEkskul {
  id: number;
  nomor_surat: string;
  tahun_ajaran: string;
  bulan_mulai: string;
  bulan_selesai: string;
  tanggal_pengajuan: string;
  sumber_dana: string;
  keterangan?: string;
  items: ItemHonorEkskul[];
  total_pertemuan_semua: number;
  total_honor_dibayarkan: number;
  status: 'draft' | 'disetujui' | 'dicairkan';
  diajukan_oleh_id?: number;
}

export interface GasConfig {
  webAppUrl: string;
  isLiveConnected: boolean;
  folderIdDrive?: string;
  folderId?: string;
  spreadsheetId: string;
  lastSync?: string;
  autoSync?: boolean;
}

export interface DatabaseStore {
  siswa: Siswa[];
  orang_tua_wali: OrangTuaWali[];
  kelas: Kelas[];
  riwayat_kelas: RiwayatKelas[];
  dokumen_siswa: DokumenSiswa[];
  guru: Guru[];
  unit: Unit[];
  dokumen_administrasi: DokumenAdministrasi[];
  pengajuan_anggaran: PengajuanAnggaran[];
  rincian_anggaran: RincianAnggaran[];
  realisasi_anggaran: RealisasiAnggaran[];
  riwayat_persetujuan: RiwayatPersetujuan[];
  prestasi: Prestasi[];
  mutasi: Mutasi[];
  alumni: Alumni[];
  pengajuan_honor_ekskul: PengajuanHonorEkskul[];
}
