import { create } from 'zustand';
import type { MMKV } from 'react-native-mmkv';
import { default as MMKVStorage } from 'react-native-mmkv';

let logStorage: any = null;
try {
  logStorage = new (MMKVStorage as any)({ id: 'app-logs' });
} catch (e) {
  console.warn('MMKV storage unavailable, using memory only');
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'nav';
  message: string;
  data?: any;
}

interface LoggerStore {
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], message: string, data?: any) => void;
  clearLogs: () => void;
  getLogs: () => LogEntry[];
  exportLogs: () => string;
}

export const useLogger = create<LoggerStore>((set, get) => ({
  logs: [],

  addLog: (level, message, data) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data,
    };

    set((state) => {
      const updated = [...state.logs, entry].slice(-50); // Keep last 50 logs
      if (logStorage) {
        logStorage.set('logs', JSON.stringify(updated));
      }
      return { logs: updated };
    });

    // Also console log
    const prefix = `[${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  },

  clearLogs: () => {
    set({ logs: [] });
    if (logStorage) {
      logStorage.delete('logs');
    }
  },

  getLogs: () => get().logs,

  exportLogs: () => {
    const logs = get().logs;
    return logs.map(l => `${l.timestamp} [${l.level.toUpperCase()}] ${l.message}${l.data ? ' ' + JSON.stringify(l.data) : ''}`).join('\n');
  },
}));

// Init logs from storage
export const initLogger = () => {
  try {
    if (logStorage) {
      const stored = logStorage.getString('logs');
      if (stored) {
        const logs = JSON.parse(stored);
        useLogger.setState({ logs });
      }
    }
  } catch (e) {
    console.error('Failed to init logger', e);
  }
};
