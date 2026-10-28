export const gasScriptTemplate = `/**
 * ==============================================================================
 * BACKEND GOOGLE APPS SCRIPT (GAS) - SISTEM INFORMASI KESISWAAN (SIM KESISWAAN)
 * SMP NEGERI 2 PULUNG
 * ==============================================================================
 * 100% OTOMATIS & ZERO MANUAL CONFIGURATION:
 * 1. Otomatis mengenali Spreadsheet aktif (SpreadsheetApp.getActiveSpreadsheet()).
 * 2. Otomatis mengenali Folder Drive tempat file berada untuk upload berkas dokumen.
 * 3. Otomatis MEMBUAT SELURUH TAB / SHEET & HEADER KOLOM lengkap saat pertama kali dijalankan.
 * 4. Dilengkapi menu khusus "⚡ SIM Kesiswaan" di bilah menu Google Sheets.
 * ==============================================================================
 */

// SKEMA LENGKAP STRUKTUR TABEL & KOLOM DATABASE SIM KESISWAAN
const SHEET_SCHEMAS = {
  siswa: [
    'id', 'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 
    'agama', 'alamat', 'desa_kelurahan', 'kecamatan', 'kabupaten_kota', 'provinsi', 
    'kode_pos', 'no_telepon_hp', 'email', 'status', 'foto_profil_url', 'created_at', 'updated_at'
  ],
  orang_tua_wali: [
    'id', 'siswa_id', 'nama_ayah', 'nik_ayah', 'pekerjaan_ayah', 'penghasilan_ayah',
    'nama_ibu', 'nik_ibu', 'pekerjaan_ibu', 'penghasilan_ibu',
    'nama_wali', 'nik_wali', 'pekerjaan_wali', 'penghasilan_wali',
    'alamat_orang_tua', 'no_telepon_orang_tua'
  ],
  kelas: [
    'id', 'nama', 'tingkat', 'tahun_ajaran', 'wali_kelas_id'
  ],
  riwayat_kelas: [
    'id', 'siswa_id', 'kelas_id', 'tahun_ajaran', 'semester', 'status_siswa'
  ],
  dokumen_siswa: [
    'id', 'siswa_id', 'jenis_dokumen', 'nama_dokumen', 'file_url', 'tanggal_upload', 'keterangan'
  ],
  guru: [
    'id', 'nip', 'nama', 'jabatan', 'role', 'email', 'no_hp'
  ],
  unit: [
    'id', 'nama', 'jenis', 'pembina_id'
  ],
  dokumen_administrasi: [
    'id', 'judul', 'kategori', 'file_url', 'tanggal_upload', 'diunggah_oleh', 'keterangan'
  ],
  pengajuan_anggaran: [
    'id', 'nomor_surat', 'unit_id', 'nama_kegiatan', 'tanggal_pengajuan', 'tanggal_mulai', 
    'tanggal_selesai', 'tempat_kegiatan', 'latar_belakang', 'tujuan', 'sasaran', 
    'susunan_panitia', 'susunan_acara', 'total_anggaran', 'status', 'lampiran_proposal_url', 'created_by'
  ],
  rincian_anggaran: [
    'id', 'pengajuan_id', 'kategori', 'uraian', 'volume', 'satuan', 'harga_satuan', 'total_harga', 'keterangan'
  ],
  realisasi_anggaran: [
    'id', 'pengajuan_id', 'rincian_id', 'uraian', 'volume_realisasi', 'satuan', 
    'harga_satuan_realisasi', 'total_realisasi', 'bukti_nota_url', 'tanggal_transaksi', 'keterangan', 'sisa_anggaran'
  ],
  riwayat_persetujuan: [
    'id', 'pengajuan_id', 'oleh_user_id', 'role_penyetuju', 'status', 'catatan', 'tanggal_persetujuan'
  ],
  prestasi: [
    'id', 'siswa_id', 'jenis_prestasi', 'nama_kegiatan', 'peringkat', 'tingkat', 
    'penyelenggara', 'tanggal_perolehan', 'sertifikat_url', 'foto_kegiatan_url', 'poin', 'status_verifikasi', 'diverifikasi_oleh'
  ],
  mutasi: [
    'id', 'siswa_id', 'jenis', 'tanggal_mutasi', 'alasan', 'asal_sekolah', 
    'tujuan_sekolah', 'nomor_surat', 'dokumen_mutasi_url', 'keterangan'
  ],
  alumni: [
    'id', 'siswa_id', 'tahun_lulus', 'melanjutkan_ke', 'nama_institusi', 
    'status_alumni', 'no_telepon_terbaru', 'email_terbaru', 'alamat_terbaru', 'catatan'
  ],
  pengajuan_honor_ekskul: [
    'id', 'unit_id', 'nama_ekskul', 'nama_pembina', 'bulan', 'tahun', 
    'jumlah_pertemuan', 'honor_per_pertemuan', 'total_honor', 'status', 'tanggal_pengajuan', 'bukti_kehadiran_url'
  ]
};

const TABLES = Object.keys(SHEET_SCHEMAS);

/**
 * Menu Otomatis pada Google Sheets saat file dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ SIM Kesiswaan')
    .addItem('🔄 Inisialisasi / Buat Seluruh Sheet Otomatis', 'menuAutoInitSheets')
    .addItem('📊 Info Status Koneksi Database', 'menuShowStatus')
    .addToUi();
}

function menuAutoInitSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const createdCount = autoCreateAllSheetsAndHeaders(ss);
  SpreadsheetApp.getUi().alert('Berhasil! Seluruh ' + TABLES.length + ' sheet database siap digunakan.');
}

function menuShowStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folderInfo = getParentFolderInfo(ss);
  SpreadsheetApp.getUi().alert(
    'Status SIM Kesiswaan SMPN 2 Pulung:\\n\\n' +
    '• Spreadsheet: ' + ss.getName() + '\\n' +
    '• Folder Berkas: ' + folderInfo.name + '\\n' +
    '• Jumlah Sheet Aktif: ' + ss.getSheets().length + '\\n' +
    '• Siap terhubung ke aplikasi web.'
  );
}

/**
 * Handle GET Request (Ping, Auto Init, & Fetch All Data)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Otomatis buat semua tab dan header jika belum ada
    autoCreateAllSheetsAndHeaders(ss);

    if (action === 'getAllData') {
      const data = getAllDataFromSheets(ss);
      return createJsonResponse({ 
        status: 'success', 
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        data: data 
      });
    }

    if (action === 'ping') {
      const folderInfo = getParentFolderInfo(ss);
      return createJsonResponse({ 
        status: 'success', 
        message: 'Google Apps Script SIM Kesiswaan SMPN 2 Pulung Online & Seluruh Sheet Otomatis Terbuat!',
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        folderId: folderInfo.id,
        folderName: folderInfo.name,
        tablesCount: TABLES.length,
        timestamp: new Date().toISOString() 
      });
    }

    return createJsonResponse({ status: 'error', message: 'Action not recognized' }, 400);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * Handle POST Request (Sync, Upload File, Save/Delete Record)
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Otomatis pastikan semua sheet & kolom tersedia
    autoCreateAllSheetsAndHeaders(ss);

    // 1. Sync All Data (Bulk update)
    if (action === 'syncAllData') {
      const payload = contents.data || {};
      for (const table of TABLES) {
        if (payload[table] && Array.isArray(payload[table])) {
          writeTableData(ss, table, payload[table]);
        }
      }
      return createJsonResponse({ 
        status: 'success', 
        message: 'Seluruh data berhasil disinkronkan ke Google Sheets!',
        spreadsheetUrl: ss.getUrl()
      });
    }

    // 2. Upload file ke Google Drive (Otomatis di folder yang sama)
    if (action === 'uploadFile') {
      const base64Data = contents.fileData;
      const fileName = contents.fileName || 'berkas_' + Date.now();
      const mimeType = contents.mimeType || 'application/pdf';
      const subFolder = contents.subFolder || 'Berkas_Kesiswaan';

      const fileResult = saveFileToConnectedDrive(ss, base64Data, fileName, mimeType, subFolder);
      return createJsonResponse({ 
        status: 'success', 
        fileUrl: fileResult.url,
        fileId: fileResult.id,
        fileName: fileName 
      });
    }

    // 3. Save Single Entity
    if (action === 'saveRecord') {
      const table = contents.table;
      const record = contents.record;
      if (!SHEET_SCHEMAS[table]) throw new Error('Tabel tidak valid: ' + table);
      
      const updatedList = upsertRecord(ss, table, record);
      return createJsonResponse({ status: 'success', table: table, data: updatedList });
    }

    // 4. Delete Single Entity
    if (action === 'deleteRecord') {
      const table = contents.table;
      const id = contents.id;
      if (!SHEET_SCHEMAS[table]) throw new Error('Tabel tidak valid: ' + table);

      deleteRecordById(ss, table, id);
      return createJsonResponse({ status: 'success', message: 'Data id ' + id + ' berhasil dihapus' });
    }

    return createJsonResponse({ status: 'error', message: 'Aksi tidak valid: ' + action }, 400);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * FUNGSI UTAMA: OTOMATIS MEMBUAT SEMUA SHEET DAN MENERAPKAN HEADER & STYLING
 */
function autoCreateAllSheetsAndHeaders(ss) {
  let createdCount = 0;
  
  for (const table of TABLES) {
    const expectedHeaders = SHEET_SCHEMAS[table];
    let sheet = ss.getSheetByName(table);
    
    if (!sheet) {
      sheet = ss.insertSheet(table);
      createdCount++;
    }

    // Jika sheet masih kosong (belum ada baris data/header)
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow === 0 || lastCol === 0) {
      // Tulis baris header
      const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
      headerRange.setValues([expectedHeaders]);
      
      // Styling Header Modern & Profesional
      headerRange.setBackground('#0f172a'); // Navy Dark Slate
      headerRange.setFontColor('#ffffff'); // Teks Putih
      headerRange.setFontWeight('bold');
      headerRange.setFontFamily('Arial');
      headerRange.setFontSize(10);
      headerRange.setVerticalAlignment('middle');
      
      sheet.setRowHeight(1, 32);
      sheet.setFrozenRows(1);
    }
  }

  // Hapus "Sheet1" default bawaan Google Spreadsheet jika kosong
  try {
    const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
    if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet);
    }
  } catch (e) {}

  return createdCount;
}

/**
 * Deteksi Folder Tempat Spreadsheet Berada
 */
function getParentFolderInfo(ss) {
  try {
    const file = DriveApp.getFileById(ss.getId());
    const parents = file.getParents();
    if (parents.hasNext()) {
      const folder = parents.next();
      return { id: folder.getId(), name: folder.getName(), folder: folder };
    }
  } catch (e) {}
  
  const root = DriveApp.getRootFolder();
  return { id: root.getId(), name: 'My Drive', folder: root };
}

/**
 * Ambil semua data dari seluruh sheet
 */
function getAllDataFromSheets(ss) {
  const result = {};
  for (const table of TABLES) {
    const sheet = ss.getSheetByName(table);
    if (!sheet) {
      result[table] = [];
      continue;
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      result[table] = [];
      continue;
    }
    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const rowObj = {};
      let hasData = false;
      for (let j = 0; j < headers.length; j++) {
        let val = data[i][j];
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { val = JSON.parse(val); } catch(e) {}
        }
        rowObj[headers[j]] = val;
        if (val !== '' && val !== null && val !== undefined) hasData = true;
      }
      if (hasData) rows.push(rowObj);
    }
    result[table] = rows;
  }
  return result;
}

/**
 * Tulis ulang seluruh data tabel dengan format header rapi
 */
function writeTableData(ss, tableName, items) {
  let sheet = ss.getSheetByName(tableName);
  if (!sheet) {
    sheet = ss.insertSheet(tableName);
  }
  sheet.clear();

  const headers = SHEET_SCHEMAS[tableName] || (items && items.length > 0 ? Object.keys(items[0]) : []);
  if (!headers || headers.length === 0) return;

  const rows = [headers];

  if (items && items.length > 0) {
    for (const item of items) {
      const row = headers.map(key => {
        const val = item[key];
        if (typeof val === 'object' && val !== null) {
          return JSON.stringify(val);
        }
        return val === undefined ? '' : val;
      });
      rows.push(row);
    }
  }

  const range = sheet.getRange(1, 1, rows.length, headers.length);
  range.setValues(rows);

  // Format Header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setFontSize(10);
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
}

/**
 * Simpan atau perbarui 1 baris record
 */
function upsertRecord(ss, tableName, record) {
  let sheet = ss.getSheetByName(tableName);
  if (!sheet) {
    autoCreateAllSheetsAndHeaders(ss);
    sheet = ss.getSheetByName(tableName);
  }

  const data = sheet.getDataRange().getValues();
  const headers = SHEET_SCHEMAS[tableName] || data[0];

  if (data.length <= 1) {
    writeTableData(ss, tableName, [record]);
    return [record];
  }

  const idIndex = headers.indexOf('id');
  let foundRow = -1;

  if (idIndex !== -1 && record.id) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === String(record.id)) {
        foundRow = i + 1;
        break;
      }
    }
  }

  const rowValues = headers.map(key => {
    const val = record[key];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val === undefined ? '' : val;
  });

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return getAllDataFromSheets(ss)[tableName];
}

/**
 * Hapus record berdasarkan ID
 */
function deleteRecordById(ss, tableName, id) {
  const sheet = ss.getSheetByName(tableName);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  if (idIndex === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

/**
 * Simpan File Base64 ke Google Drive Otomatis di Folder Spreadsheet
 */
function saveFileToConnectedDrive(ss, base64Data, fileName, mimeType, subFolderName) {
  const folderInfo = getParentFolderInfo(ss);
  let parentFolder = folderInfo.folder;

  let targetFolder = parentFolder;
  if (subFolderName) {
    const existing = parentFolder.getFoldersByName(subFolderName);
    targetFolder = existing.hasNext() ? existing.next() : parentFolder.createFolder(subFolderName);
  }

  let cleanBase64 = base64Data;
  if (cleanBase64.indexOf('base64,') > -1) {
    cleanBase64 = cleanBase64.split('base64,')[1];
  }

  const decoded = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = targetFolder.createFile(blob);
  
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}

  return {
    id: file.getId(),
    url: file.getUrl()
  };
}

/**
 * Helper JSON Response
 */
function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;

export const GAS_CODE_GS = gasScriptTemplate;
