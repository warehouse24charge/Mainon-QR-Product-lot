import { DEFAULT_PRESETS } from './constants';

const STORAGE_KEYS = {
  TEMPLATES: 'mainon_qr_saved_templates',
  ACTIVE_LAYOUT: 'mainon_qr_active_layout',
  ACTIVE_DATA: 'mainon_qr_active_data',
  HISTORY: 'mainon_qr_history_logs',
};

// --- Templates Storage ---
export function getSavedTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse saved templates:', err);
    return [];
  }
}

export function getAllTemplates() {
  const userTemplates = getSavedTemplates();
  // Return built-in presets followed by user custom templates
  return [...DEFAULT_PRESETS, ...userTemplates];
}

export function saveTemplate(template) {
  try {
    const templates = getSavedTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing
      templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      // Add new
      const newTemplate = {
        ...template,
        id: template.id || `custom-${Date.now()}`,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      templates.push(newTemplate);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return true;
  } catch (err) {
    console.error('Failed to save template:', err);
    return false;
  }
}

export function deleteTemplate(templateId) {
  try {
    const templates = getSavedTemplates().filter(t => t.id !== templateId);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return true;
  } catch (err) {
    console.error('Failed to delete template:', err);
    return false;
  }
}

// --- Active Layout & Data Storage ---
export function saveActiveLayout(layout) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LAYOUT, JSON.stringify(layout));
  } catch (err) {
    console.error('Failed to save active layout:', err);
  }
}

export function getActiveLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_LAYOUT);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function saveActiveDataConfig(dataConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DATA, JSON.stringify(dataConfig));
  } catch (err) {
    console.error('Failed to save active data config:', err);
  }
}

export function getActiveDataConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

// --- History Logs Storage ---
export function getHistoryLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to get history logs:', err);
    return [];
  }
}

export function addHistoryLog(entry) {
  try {
    const logs = getHistoryLogs();
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    // Keep max 100 history items
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return newLog;
  } catch (err) {
    console.error('Failed to add history log:', err);
    return null;
  }
}

export function deleteHistoryLog(logId) {
  try {
    const logs = getHistoryLogs().filter(l => l.id !== logId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(logs));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearHistoryLogs() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (err) {
    return false;
  }
}

// --- Backup & Restore (JSON Export/Import) ---
export function exportAllDataAsJSON() {
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    templates: getSavedTemplates(),
    history: getHistoryLogs(),
    activeLayout: getActiveLayout(),
    activeData: getActiveDataConfig(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mainon-qr-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importAllDataFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.templates && Array.isArray(data.templates)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
    }
    if (data.history && Array.isArray(data.history)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    }
    if (data.activeLayout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LAYOUT, JSON.stringify(data.activeLayout));
    }
    if (data.activeData) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DATA, JSON.stringify(data.activeData));
    }
    return { success: true, countTemplates: data.templates?.length || 0 };
  } catch (err) {
    console.error('Failed to import data:', err);
    return { success: false, error: err.message };
  }
}
