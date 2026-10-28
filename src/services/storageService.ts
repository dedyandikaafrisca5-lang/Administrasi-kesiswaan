import { DatabaseStore, GasConfig } from '../types';
import { initialData, initialGasConfig } from '../data/initialData';

const STORAGE_KEY = 'SIM_KESISWAAN_SMPN2_PULUNG_PROD_V3';
const GAS_CONFIG_KEY = 'SIM_KESISWAAN_GAS_CONFIG_SMPN2_V2';

// Purge legacy demo keys if existing
try {
  localStorage.removeItem('SIM_KESISWAAN_SMPN2_PULUNG_V2');
  localStorage.removeItem('SIM_KESISWAAN_SMPN2_PULUNG_V1');
  localStorage.removeItem('SIM_KESISWAAN_STORE_V1');
} catch (e) {
  // ignore in non-browser env
}

export const loadStoredDatabase = (): DatabaseStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw);
    return {
      ...initialData,
      ...parsed,
      pengajuan_honor_ekskul: parsed.pengajuan_honor_ekskul || initialData.pengajuan_honor_ekskul || [],
    };
  } catch (e) {
    console.error('Error loading stored database:', e);
    return initialData;
  }
};

export const saveStoredDatabase = (data: DatabaseStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving database to localStorage:', e);
  }
};

export const loadGasConfig = (): GasConfig => {
  try {
    const raw = localStorage.getItem(GAS_CONFIG_KEY);
    if (!raw) return initialGasConfig;
    return JSON.parse(raw);
  } catch {
    return initialGasConfig;
  }
};

export const saveGasConfig = (config: GasConfig): void => {
  try {
    localStorage.setItem(GAS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving GAS config:', e);
  }
};

export const resetToInitialData = (): DatabaseStore => {
  saveStoredDatabase(initialData);
  return initialData;
};
