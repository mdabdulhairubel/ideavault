
const KEYS = {
  IDEAS: 'cf_ideas',
  CHANNELS: 'cf_channels',
  STATUSES: 'cf_statuses',
  USER: 'cf_user'
};

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T,>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  keys: KEYS
};
