export const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures so the UI still works in restricted modes.
  }
};

export const readJsonStorage = (key, fallback = []) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

