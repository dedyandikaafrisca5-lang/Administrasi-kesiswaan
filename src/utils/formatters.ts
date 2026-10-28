export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatTanggalIndo = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getStatusSiswaBadge = (status: string) => {
  switch (status) {
    case 'aktif':
      return { label: 'Aktif', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'lulus':
      return { label: 'Lulus (Alumni)', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'pindah':
      return { label: 'Mutasi Keluar', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'nonaktif':
      return { label: 'Non-Aktif', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusAnggaranBadge = (status: string) => {
  switch (status) {
    case 'diajukan':
      return { label: 'Diajukan (Menunggu Review)', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'direvisi':
    case 'revisi':
      return { label: 'Perlu Revisi', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'disetujui':
      return { label: 'Disetujui', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'ditolak':
      return { label: 'Ditolak', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'dicairkan':
      return { label: 'Dana Dicairkan', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'selesai_lpj':
      return { label: 'Selesai LPJ', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusPengajuanBadge = getStatusAnggaranBadge;

export const getStatusDokumenBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'diajukan':
      return { label: 'Diajukan', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'disetujui':
      return { label: 'Disetujui', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'diarsipkan':
      return { label: 'Diarsipkan', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getTingkatPrestasiLabel = (tingkat: string) => {
  switch (tingkat) {
    case 'sekolah': return 'Tingkat Sekolah';
    case 'kecamatan': return 'Tingkat Kecamatan';
    case 'kabupaten_kota': return 'Tingkat Kab / Kota';
    case 'provinsi': return 'Tingkat Provinsi';
    case 'nasional': return 'Tingkat Nasional';
    case 'internasional': return 'Tingkat Internasional';
    default: return tingkat;
  }
};

export const getTingkatPrestasiBadge = (tingkat: string) => {
  switch (tingkat) {
    case 'internasional':
      return { label: 'Internasional', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'nasional':
      return { label: 'Nasional', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'provinsi':
      return { label: 'Provinsi', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'kabupaten_kota':
      return { label: 'Kabupaten/Kota', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'kecamatan':
      return { label: 'Kecamatan', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'sekolah':
      return { label: 'Sekolah', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    default:
      return { label: tingkat, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusMutasiBadge = (status?: string) => {
  switch (status) {
    case 'disetujui':
      return { label: 'Disetujui Resmi', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'diajukan':
      return { label: 'Diajukan', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'ditolak':
      return { label: 'Ditolak', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status || 'Diajukan', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusAlumniBadge = (status?: string) => {
  switch (status) {
    case 'sma':
      return { label: 'Lanjut SMA', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'smk':
      return { label: 'Lanjut SMK', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'ma':
      return { label: 'Lanjut MA', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'pesantren':
      return { label: 'Pondok Pesantren', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'kuliah':
      return { label: 'Melanjutkan Kuliah', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'kerja':
      return { label: 'Bekerja / Magang', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'wirausaha':
      return { label: 'Wirausaha Mandiri', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'mencari_kerja':
      return { label: 'Persiapan / Kursus', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return { label: status || 'Lainnya', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getStatusHonorBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft Pengajuan', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'diajukan':
      return { label: 'Diajukan', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'disetujui':
      return { label: 'Disetujui Kepsek', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'dicairkan':
      return { label: 'Honor Dicairkan', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const angkaTerbilang = (nilai: number): string => {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const angka = Math.floor(Math.abs(nilai));

  if (angka < 12) {
    return bilangan[angka];
  } else if (angka < 20) {
    return bilangan[angka - 10] + ' Belas';
  } else if (angka < 100) {
    return bilangan[Math.floor(angka / 10)] + ' Puluh ' + (angka % 10 !== 0 ? bilangan[angka % 10] : '');
  } else if (angka < 200) {
    return 'Seratus ' + (angka % 100 !== 0 ? angkaTerbilang(angka % 100) : '');
  } else if (angka < 1000) {
    return bilangan[Math.floor(angka / 100)] + ' Ratus ' + (angka % 100 !== 0 ? angkaTerbilang(angka % 100) : '');
  } else if (angka < 2000) {
    return 'Seribu ' + (angka % 1000 !== 0 ? angkaTerbilang(angka % 1000) : '');
  } else if (angka < 1000000) {
    return angkaTerbilang(Math.floor(angka / 1000)) + ' Ribu ' + (angka % 1000 !== 0 ? angkaTerbilang(angka % 1000) : '');
  } else if (angka < 1000000000) {
    return angkaTerbilang(Math.floor(angka / 1000000)) + ' Juta ' + (angka % 1000000 !== 0 ? angkaTerbilang(angka % 1000000) : '');
  } else if (angka < 1000000000000) {
    return angkaTerbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + (angka % 1000000000 !== 0 ? angkaTerbilang(angka % 1000000000) : '');
  }
  return '';
};

