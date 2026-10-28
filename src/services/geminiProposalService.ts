// Client-side service to communicate with /api/generate-proposal

export interface ProposalAIData {
  latar_belakang: string;
  tujuan: string;
  sasaran: string;
  sumber_dana: string;
  susunan_panitia: string;
  susunan_acara: string;
  suggested_rab?: Array<{
    uraian: string;
    volume: number;
    satuan: string;
    harga_satuan: number;
  }>;
}

export async function generateProposalWithAI(params: {
  nama_kegiatan: string;
  unit_nama?: string;
  waktu_pelaksanaan?: string;
  tempat?: string;
  catatan_tambahan?: string;
  rincian_rab?: any[];
}): Promise<{ data: ProposalAIData; isAI: boolean }> {
  try {
    const res = await fetch('/api/generate-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return { data: json.data, isAI: !json.is_fallback };
    }
  } catch (error) {
    console.warn('Gagal memanggil AI server, beralih ke engine template kesiswaan:', error);
  }

  // Client-side instant fallback generator
  const fallback = generateClientFallback(
    params.nama_kegiatan,
    params.unit_nama || 'Kesiswaan & OSIS',
    params.waktu_pelaksanaan || '',
    params.tempat || 'SMP Negeri 2 Pulung',
    params.catatan_tambahan || ''
  );

  return { data: fallback, isAI: false };
}

function generateClientFallback(
  namaKegiatan: string,
  unitNama: string,
  waktu: string,
  tempat: string,
  catatan: string
): ProposalAIData {
  const cleanNama = namaKegiatan.trim() || 'Kegiatan Kesiswaan';
  const tempatKegiatan = tempat.trim() || 'SMP Negeri 2 Pulung';

  return {
    latar_belakang: `Pendidikan tingkat Sekolah Menengah Pertama tidak hanya berfokus pada ranah kognitif di dalam kelas, melainkan juga menuntut pembinaan karakter, keterampilan sosial, kepemimpinan, dan penyaluran minat bakat secara terarah. Sejalan dengan program kerja kesiswaan dan visi misi SMP Negeri 2 Pulung, penyelenggaraan kegiatan "${cleanNama}" dipandang sangat penting dan strategis.\n\nKegiatan ini dirancang untuk memberikan ruang aktualisasi positif bagi peserta didik, memperkuat rasa persatuan dan sportivitas, serta menumbuhkan budaya disiplin dan tanggung jawab sosial.\n\nSebagai dasar pijakan dan pedoman operasional pelaksanaan di lapangan serta pertanggungjawaban alokasi anggaran, maka panitia menyusun naskah proposal kegiatan ini untuk diajukan kepada Kepala Sekolah guna memperoleh persetujuan dan pengesahan resmi.`,
    tujuan: `1. Menumbuhkan jiwa kepemimpinan, kemandirian, dan kedisiplinan pada diri peserta didik SMP Negeri 2 Pulung.\n2. Memberikan wadah penyaluran bakat, minat, kreativitas, dan potensi positif siswa.\n3. Mempererat tali persaudaraan, solidaritas, dan kerjasama antar warga sekolah.\n4. Merealisasikan program kerja ${unitNama} SMP Negeri 2 Pulung Tahun Pelajaran 2025/2026.`,
    sasaran: `Seluruh Peserta Didik SMP Negeri 2 Pulung, Guru Pembina, serta Pengurus Panitia Pelaksana ${unitNama} (Estimasi 80-150 peserta).`,
    sumber_dana: `Dana BOS Kesiswaan SMP Negeri 2 Pulung & Alokasi Kegiatan Pembinaan Kesiswaan TP 2025/2026`,
    susunan_panitia: `Penanggung Jawab  : Drs. H. Bambang Suhartono, M.Pd. (Kepala SMPN 2 Pulung)\nPengarah/Pembina  : Waka Kesiswaan & Pembina ${unitNama}\nKetua Pelaksana   : Rahmat Hidayat, S.Pd\nSekretaris        : Siti Rahmawati, S.Pd\nBendahara         : Retno Wulandari, S.Pd\nSeksi Acara       : Koordinator Sie Acara OSIS/Kesiswaan\nSeksi Perlengkapan: Tim Sarana Prasarana Sekolah\nSeksi Dokumentasi : Tim Jurnalistik Kesiswaan SMPN 2 Pulung\nSeksi Konsumsi    : Koordinator Sie Konsumsi`,
    susunan_acara: `- 07.00 - 07.30 WIB : Registrasi, briefing panitia, dan presensi peserta di ${tempatKegiatan}\n- 07.30 - 08.00 WIB : Upacara pembukaan resmi oleh Kepala SMP Negeri 2 Pulung\n- 08.00 - 11.30 WIB : Pelaksanaan kegiatan inti "${cleanNama}" (Sesi I)\n- 11.30 - 13.00 WIB : Istirahat, Sholat Berjamaah, dan Makan Siang (Ishoma)\n- 13.00 - 15.00 WIB : Pelaksanaan kegiatan lanjutan (Sesi II) & Penjurian / Praktik Lapangan\n- 15.00 - 15.30 WIB : Upacara penutupan, pengumuman/penyerahan piagam penghargaan, dan doa bersama`,
    suggested_rab: [
      {
        uraian: `Banner Backdrop Panggung & Publikasi (${cleanNama})`,
        volume: 1,
        satuan: 'Paket',
        harga_satuan: 350000,
      },
      {
        uraian: 'Konsumsi & Snack Panitia, Tamu Undangan, dan Peserta',
        volume: 60,
        satuan: 'Porsi',
        harga_satuan: 20000,
      },
      {
        uraian: 'ATK, ID Card Tanda Panitia & Cetak Piagam Penghargaan',
        volume: 1,
        satuan: 'Paket',
        harga_satuan: 300000,
      },
      {
        uraian: 'Perlengkapan Teknis, Sound System & Kebersihan',
        volume: 1,
        satuan: 'Paket',
        harga_satuan: 250000,
      },
    ],
  };
}
