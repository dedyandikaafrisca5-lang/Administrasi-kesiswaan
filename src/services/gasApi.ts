import { DatabaseStore } from '../types';

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export interface GasPingResponse {
  success: boolean;
  message: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  folderId?: string;
  folderName?: string;
}

export const testGasConnection = async (webAppUrl: string): Promise<GasPingResponse> => {
  try {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      return { success: false, message: 'URL Google Apps Script tidak valid. Pastikan dimulai dengan https://' };
    }
    const cleanUrl = webAppUrl.trim();
    const testUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      return { success: false, message: `Server mengembalikan status HTTP ${response.status}` };
    }

    const json = await response.json();
    if (json.status === 'success') {
      return { 
        success: true, 
        message: json.message || 'Koneksi ke Google Apps Script Berhasil!',
        spreadsheetId: json.spreadsheetId,
        spreadsheetName: json.spreadsheetName,
        spreadsheetUrl: json.spreadsheetUrl,
        folderId: json.folderId,
        folderName: json.folderName
      };
    }
    return { success: false, message: json.message || 'Respons tidak sesuai format' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { 
      success: false, 
      message: `Gagal terhubung: ${errorMsg}. Pastikan Apps Script di-deploy dengan hak akses 'Anyone' (Siapa saja).` 
    };
  }
};

export const fetchAllGasData = async (webAppUrl: string): Promise<{ success: boolean; data?: DatabaseStore; message?: string }> => {
  try {
    const cleanUrl = webAppUrl.trim();
    const url = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=getAllData`;
    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    const json = await response.json();

    if (json.status === 'success' && json.data) {
      return { success: true, data: json.data as DatabaseStore };
    }
    return { success: false, message: json.message || 'Gagal mengambil data dari Google Sheets' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
};

export const syncAllDataToGas = async (webAppUrl: string, data: DatabaseStore): Promise<{ success: boolean; message: string }> => {
  try {
    const cleanUrl = webAppUrl.trim();
    const payload = {
      action: 'syncAllData',
      data: data,
    };

    const response = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Data berhasil disinkronkan ke Google Sheets' };
    }
    return { success: false, message: json.message || 'Gagal sinkronisasi data' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
};

export const uploadFileToDrive = async (
  webAppUrl: string, 
  file: File, 
  subFolder: string = 'Berkas_Kesiswaan'
): Promise<{ success: boolean; fileUrl: string; fileName: string; message?: string }> => {
  try {
    const base64Data = await convertFileToBase64(file);

    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      return {
        success: true,
        fileUrl: base64Data,
        fileName: file.name,
        message: 'File disimpan dalam penyimpanan lokal (Mode Demo). Hubungkan GAS untuk upload ke Google Drive.',
      };
    }

    const cleanUrl = webAppUrl.trim();
    const payload = {
      action: 'uploadFile',
      fileData: base64Data,
      fileName: file.name,
      mimeType: file.type,
      subFolder: subFolder,
    };

    const response = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.status === 'success' && json.fileUrl) {
      return {
        success: true,
        fileUrl: json.fileUrl,
        fileName: json.fileName || file.name,
      };
    }

    return {
      success: true,
      fileUrl: base64Data,
      fileName: file.name,
      message: 'Upload ke Drive gagal, file disimpan secara lokal.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('File upload error:', errorMsg);
    const base64Data = await convertFileToBase64(file);
    return {
      success: true,
      fileUrl: base64Data,
      fileName: file.name,
      message: 'File tersimpan dalam cache lokal.',
    };
  }
};

export const initSpreadsheetTables = async (webAppUrl: string): Promise<{ success: boolean; message: string }> => {
  try {
    const cleanUrl = webAppUrl.trim();
    const payload = {
      action: 'init',
    };

    const response = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Sheet database berhasil diinisialisasi' };
    }
    return { success: false, message: json.message || 'Gagal inisialisasi sheet' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
};
