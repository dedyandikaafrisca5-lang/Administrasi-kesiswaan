export interface PanitiaRow {
  jabatan: string;
  nama: string;
  keterangan?: string;
}

export interface AcaraRow {
  waktu: string;
  kegiatan: string;
  pengisi?: string;
}

export const DEFAULT_PANITIA_ROWS: PanitiaRow[] = [
  { jabatan: 'Penanggung Jawab', nama: 'Drs. H. Bambang Suhartono, M.Pd.', keterangan: 'Kepala SMPN 2 Pulung' },
  { jabatan: 'Pengarah / Pembina', nama: 'Waka Kesiswaan & Pembina OSIS', keterangan: 'Pengarah Kegiatan' },
  { jabatan: 'Ketua Pelaksana', nama: 'Rahmat Hidayat, S.Pd', keterangan: 'Guru Pembina' },
  { jabatan: 'Sekretaris', nama: 'Siti Rahmawati, S.Pd', keterangan: 'Guru / Tenaga Pendidik' },
  { jabatan: 'Bendahara', nama: 'Retno Wulandari, S.Pd', keterangan: 'Bendahara Kegiatan' },
  { jabatan: 'Seksi Acara', nama: 'Koordinator Sie Acara & Pengurus OSIS', keterangan: 'Pelaksana Acara' },
  { jabatan: 'Seksi Perlengkapan', nama: 'Tim Sarana & Prasarana Sekolah', keterangan: 'Logistik & Alat' },
  { jabatan: 'Seksi Dokumentasi', nama: 'Tim Jurnalistik Siswa SMPN 2 Pulung', keterangan: 'Dokumentasi & Publikasi' },
  { jabatan: 'Seksi Konsumsi', nama: 'Koordinator Sie Konsumsi', keterangan: 'Konsumsi Peserta & Panitia' },
];

export const DEFAULT_ACARA_ROWS: AcaraRow[] = [
  { waktu: '07.00 - 07.30 WIB', kegiatan: 'Registrasi, briefing panitia, dan presensi peserta', pengisi: 'Sie Kesekretariatan' },
  { waktu: '07.30 - 08.00 WIB', kegiatan: 'Upacara pembukaan resmi kegiatan', pengisi: 'Kepala SMPN 2 Pulung' },
  { waktu: '08.00 - 11.30 WIB', kegiatan: 'Pelaksanaan kegiatan inti (Sesi I)', pengisi: 'Pemateri / Tim Juri' },
  { waktu: '11.30 - 13.00 WIB', kegiatan: 'Istirahat, Sholat Berjamaah, dan Makan Siang (Ishoma)', pengisi: 'Seluruh Peserta' },
  { waktu: '13.00 - 15.00 WIB', kegiatan: 'Pelaksanaan kegiatan lanjutan (Sesi II) & Praktik / Evaluasi', pengisi: 'Panitia Pelaksana' },
  { waktu: '15.00 - 15.30 WIB', kegiatan: 'Upacara penutupan, pengumuman, dan doa bersama', pengisi: 'Sie Acara & Pembina' },
];

export function parsePanitiaFromText(text?: string): PanitiaRow[] {
  if (!text || !text.trim()) {
    return DEFAULT_PANITIA_ROWS;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return DEFAULT_PANITIA_ROWS;

  const parsed: PanitiaRow[] = [];

  for (const line of lines) {
    // Format 1: "Jabatan : Nama (Keterangan)" or "Jabatan - Nama" or "No. Jabatan : Nama"
    const cleaned = line.replace(/^[-*•\d.]+\s*/, '').trim();
    if (!cleaned) continue;

    let jabatan = '';
    let nama = '';
    let keterangan = '';

    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      jabatan = parts[0].trim();
      nama = parts.slice(1).join(':').trim();
    } else if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ');
      jabatan = parts[0].trim();
      nama = parts.slice(1).join(' - ').trim();
    } else if (cleaned.includes('|')) {
      const parts = cleaned.split('|');
      jabatan = parts[0].trim();
      nama = parts[1]?.trim() || '';
      keterangan = parts[2]?.trim() || '';
    } else {
      jabatan = 'Seksi / Panitia';
      nama = cleaned;
    }

    // Extract (Keterangan) if exists at the end of nama
    const ketMatch = nama.match(/\(([^)]+)\)$/);
    if (ketMatch && !keterangan) {
      keterangan = ketMatch[1].trim();
      nama = nama.replace(/\(([^)]+)\)$/, '').trim();
    }

    parsed.push({
      jabatan: jabatan || 'Panitia',
      nama: nama || '-',
      keterangan: keterangan || '',
    });
  }

  return parsed.length > 0 ? parsed : DEFAULT_PANITIA_ROWS;
}

export function formatPanitiaToText(rows: PanitiaRow[]): string {
  if (!rows || rows.length === 0) return '';
  return rows
    .map(r => {
      const ket = r.keterangan && r.keterangan.trim() ? ` (${r.keterangan.trim()})` : '';
      return `${r.jabatan.trim()} : ${r.nama.trim()}${ket}`;
    })
    .join('\n');
}

export function parseAcaraFromText(text?: string): AcaraRow[] {
  if (!text || !text.trim()) {
    return DEFAULT_ACARA_ROWS;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return DEFAULT_ACARA_ROWS;

  const parsed: AcaraRow[] = [];

  for (const line of lines) {
    // Examples:
    // "- 07.00 - 07.30 WIB : Registrasi, briefing panitia (Sie Kesekretariatan)"
    // "07.00 - 08.00 | Pembukaan | Kepala Sekolah"
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (!cleaned) continue;

    let waktu = '';
    let kegiatan = '';
    let pengisi = '';

    if (cleaned.includes('|')) {
      const parts = cleaned.split('|');
      waktu = parts[0]?.trim() || '';
      kegiatan = parts[1]?.trim() || '';
      pengisi = parts[2]?.trim() || '';
    } else if (cleaned.includes(' : ')) {
      const parts = cleaned.split(' : ');
      waktu = parts[0].trim();
      kegiatan = parts.slice(1).join(' : ').trim();
    } else if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      waktu = parts[0].trim();
      kegiatan = parts.slice(1).join(':').trim();
    } else {
      kegiatan = cleaned;
    }

    // Extract pengisi if present in brackets or trailing
    const pengisiMatch = kegiatan.match(/\(([^)]+)\)$/);
    if (pengisiMatch && !pengisi) {
      pengisi = pengisiMatch[1].trim();
      kegiatan = kegiatan.replace(/\(([^)]+)\)$/, '').trim();
    }

    parsed.push({
      waktu: waktu || '-',
      kegiatan: kegiatan || '-',
      pengisi: pengisi || 'Panitia Pelaksana',
    });
  }

  return parsed.length > 0 ? parsed : DEFAULT_ACARA_ROWS;
}

export function formatAcaraToText(rows: AcaraRow[]): string {
  if (!rows || rows.length === 0) return '';
  return rows
    .map(r => {
      const peng = r.pengisi && r.pengisi.trim() ? ` (${r.pengisi.trim()})` : '';
      return `- ${r.waktu.trim()} : ${r.kegiatan.trim()}${peng}`;
    })
    .join('\n');
}

