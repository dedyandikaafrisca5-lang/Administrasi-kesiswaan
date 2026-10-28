export const KEPSEK_STORAGE_KEYS = {
  NAME: 'smpn2plg_kepsek_name',
  NIP: 'smpn2plg_kepsek_nip',
  JABATAN: 'smpn2plg_kepsek_jabatan',
  ADDRESS: 'smpn2plg_school_address',
  PHONE: 'smpn2plg_school_phone',
  EMAIL: 'smpn2plg_school_email',
  NPSN: 'smpn2plg_school_npsn',
};

export const DEFAULT_KEPSEK = {
  nama: 'Drs. H. Bambang Suhartono, M.Pd.',
  nip: '19750312 200003 1 001',
  jabatan: 'Kepala SMP Negeri 2 Pulung',
};

export const SCHOOL_CONFIG = {
  name: 'SMP Negeri 2 Pulung',
  shortName: 'SMPN 2 PULUNG',
  kabupaten: 'Pemerintah Kabupaten Ponorogo',
  dinas: 'Dinas Pendidikan',
  address: 'Jln. Kali Asin, Kec. Pulung, Kab. Ponorogo, Jawa Timur 63481',
  phone: '(0352) 531234',
  email: 'info@smpn2pulung.sch.id',
  website: 'www.smpn2pulung.sch.id',
  npsn: '20510528',
  defaultKepsek: DEFAULT_KEPSEK,
  // Google Drive Logo URLs
  logoUrl: 'https://lh3.googleusercontent.com/d/16DeZseKAkZYZvROrFB3dec6qpzlglWTB',
  logoThumbnailUrl: 'https://drive.google.com/thumbnail?id=16DeZseKAkZYZvROrFB3dec6qpzlglWTB&sz=w500',
  logoDriveDirectUrl: 'https://drive.google.com/uc?export=view&id=16DeZseKAkZYZvROrFB3dec6qpzlglWTB',
};

export function getStoredKepsek(): { nama: string; nip: string; jabatan: string } {
  if (typeof window === 'undefined') return DEFAULT_KEPSEK;
  return {
    nama: localStorage.getItem(KEPSEK_STORAGE_KEYS.NAME) || DEFAULT_KEPSEK.nama,
    nip: localStorage.getItem(KEPSEK_STORAGE_KEYS.NIP) || DEFAULT_KEPSEK.nip,
    jabatan: localStorage.getItem(KEPSEK_STORAGE_KEYS.JABATAN) || DEFAULT_KEPSEK.jabatan,
  };
}

export function setStoredKepsek(kepsek: { nama: string; nip: string; jabatan?: string }) {
  if (typeof window === 'undefined') return;
  if (kepsek.nama) localStorage.setItem(KEPSEK_STORAGE_KEYS.NAME, kepsek.nama);
  if (kepsek.nip) localStorage.setItem(KEPSEK_STORAGE_KEYS.NIP, kepsek.nip);
  if (kepsek.jabatan) localStorage.setItem(KEPSEK_STORAGE_KEYS.JABATAN, kepsek.jabatan);
  window.dispatchEvent(new Event('school_config_updated'));
}

