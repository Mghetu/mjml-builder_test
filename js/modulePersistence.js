const MODULES_DB_NAME = 'mjmlBuilder';
const MODULES_STORE_NAME = 'modules';
const MODULES_KEY = 'mjmlModules';
const MODULES_FALLBACK_KEY = 'mjmlModulesFallback';

const DEFAULT_CATEGORY = 'Custom Modules';
export const MODULES_CHANGED_EVENT = 'modules:changed';

function ensureWindow() {
  if (typeof window === 'undefined') {
    throw new Error('Custom block persistence requires a browser environment.');
  }
  return window;
}

function openModulesDb() {
  const { indexedDB } = ensureWindow();

  if (!indexedDB) {
    return Promise.reject(
      new Error('IndexedDB is not available in this environment.')
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MODULES_DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(MODULES_STORE_NAME)) {
        db.createObjectStore(MODULES_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open modules database.'));
  });
}

function broadcastModulesChanged(modules) {
  try {
    const win = ensureWindow();
    const event = new CustomEvent(MODULES_CHANGED_EVENT, {
      detail: { modules: Array.isArray(modules) ? modules : [] }
    });
    win.dispatchEvent(event);
  } catch (error) {
    console.warn('[ModulePersistence] Failed to broadcast module changes', error);
  }
}

function readFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(MODULES_FALLBACK_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[ModulePersistence] Failed to read from localStorage', error);
    return [];
  }
}

function writeToLocalStorage(modules) {
  try {
    window.localStorage.setItem(MODULES_FALLBACK_KEY, JSON.stringify(modules));
    return modules;
  } catch (error) {
    console.error('[ModulePersistence] Failed to write to localStorage', error);
    throw error;
  }
}

function persistToIndexedDb(modules) {
  return openModulesDb().then((db) =>
    new Promise((resolve, reject) => {
      const transaction = db.transaction(MODULES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(MODULES_STORE_NAME);
      const request = store.put(modules, MODULES_KEY);

      transaction.oncomplete = () => resolve(modules);
      transaction.onerror = () => reject(transaction.error || request.error);
      request.onerror = () => reject(request.error);
    })
  );
}

async function persistModules(modules) {
  let persistedModules = modules;

  try {
    await persistToIndexedDb(modules);
  } catch (error) {
    console.warn('[ModulePersistence] Falling back to localStorage.', error);
    persistedModules = writeToLocalStorage(modules);
  }

  broadcastModulesChanged(persistedModules);
  return persistedModules;
}

function fetchFromIndexedDb() {
  return openModulesDb().then((db) =>
    new Promise((resolve, reject) => {
      const transaction = db.transaction(MODULES_STORE_NAME, 'readonly');
      const store = transaction.objectStore(MODULES_STORE_NAME);
      const request = store.get(MODULES_KEY);

      request.onsuccess = () => {
        const result = request.result;
        resolve(Array.isArray(result) ? result : []);
      };

      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    })
  );
}

function sanitizeModuleDefinition(moduleObj = {}) {
  const { id, label, category, markup, thumbnail, metadata = {} } = moduleObj;

  if (!id || !label || !markup) {
    throw new Error('Module definitions require id, label, and markup.');
  }

  const sanitized = {
    id: String(id).trim(),
    label: String(label).trim(),
    category: category ? String(category).trim() : DEFAULT_CATEGORY,
    markup: String(markup).trim(),
    metadata: { ...metadata }
  };

  if (thumbnail) {
    sanitized.thumbnail = String(thumbnail).trim();
  }

  if (!sanitized.metadata.savedAt) {
    sanitized.metadata.savedAt = new Date().toISOString();
  }

  sanitized.metadata.source = sanitized.metadata.source || 'user';

  return sanitized;
}

export async function loadBlocks() {
  try {
    const modules = await fetchFromIndexedDb();
    return Array.isArray(modules) ? modules : [];
  } catch (error) {
    console.warn('[ModulePersistence] Falling back to localStorage for load.', error);
    return readFromLocalStorage();
  }
}

export async function saveBlock(moduleObj) {
  const sanitized = sanitizeModuleDefinition(moduleObj);
  const existingModules = await loadBlocks();

  const modules = existingModules.filter((module) => module && module.id !== sanitized.id);
  modules.push(sanitized);

  return persistModules(modules);
}

export async function updateBlock(moduleObj) {
  const existingModules = await loadBlocks();
  const existingModule = existingModules.find((module) => module && module.id === moduleObj.id);

  if (!existingModule) {
    throw new Error('Cannot update module: definition not found.');
  }

  const sanitized = sanitizeModuleDefinition({
    ...existingModule,
    ...moduleObj,
    metadata: { ...existingModule.metadata, ...(moduleObj.metadata || {}) }
  });

  sanitized.metadata.savedAt = existingModule.metadata?.savedAt || sanitized.metadata.savedAt;
  sanitized.metadata.updatedAt = new Date().toISOString();

  const modules = existingModules.map((module) =>
    module && module.id === sanitized.id ? sanitized : module
  );

  return persistModules(modules);
}

export async function deleteBlock(moduleId) {
  if (!moduleId) {
    throw new Error('Cannot delete module without an identifier.');
  }

  const existingModules = await loadBlocks();
  const modules = existingModules.filter((module) => module && module.id !== moduleId);

  if (modules.length === existingModules.length) {
    throw new Error('Module not found.');
  }

  return persistModules(modules);
}

export default {
  saveBlock,
  loadBlocks,
  updateBlock,
  deleteBlock
};
