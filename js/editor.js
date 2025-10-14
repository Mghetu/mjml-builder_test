import { showToast } from './toast.js';

const STORAGE_TOAST_ID = 'storage-status-toast';
const STORE_TOAST_INTERVAL = 15000;
let lastStoreToastAt = 0;

function configureStorageEvents(editor) {
  const logEvent = (eventName) => (...payload) => {
    console.info(`[StorageManager] ${eventName}`, ...payload);
  };

  editor.on('storage:start', logEvent('storage:start'));
  editor.on('storage:end', logEvent('storage:end'));

  editor.on('storage:store', (data) => {
    console.info('[StorageManager] storage:store', data);
    const now = Date.now();
    if (now - lastStoreToastAt >= STORE_TOAST_INTERVAL) {
      showToast({
        id: STORAGE_TOAST_ID,
        message: 'Project autosaved to IndexedDB.',
        variant: 'success',
        duration: 2500,
      });
      lastStoreToastAt = now;
    }
  });

  editor.on('storage:load', (data) => {
    console.info('[StorageManager] storage:load', data);
    showToast({
      id: STORAGE_TOAST_ID,
      message: 'Project loaded from IndexedDB.',
      variant: 'success',
      duration: 3000,
    });
  });

  editor.on('storage:error', (error) => {
    console.error('[StorageManager] storage:error', error);
    showToast({
      id: STORAGE_TOAST_ID,
      message: 'Storage error. Check console for details.',
      variant: 'error',
      duration: 6000,
      role: 'alert',
    });
  });
}

export function initEditor() {
  window.editor = grapesjs.init({
    height: '100%',
    noticeOnUnload: false,
    storageManager: {
      type: 'indexeddb',
      id: 'mjml-project',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
      options: {
        indexeddb: {
          dbName: 'mjmlBuilder',
          objectStoreName: 'projects',
        },
      },
    },
    fromElement: true,
    container: '#gjs',
    blockManager: {
      appendTo: '#custom-blocks-container',
    },
    layerManager: {
      appendTo: '#custom-layers-container',
    },
    plugins: ['grapesjs-mjml'],
    pluginsOpts: {
      'grapesjs-mjml': {}
    }
  });

  configureStorageEvents(window.editor);

  window.editor.on('load', function () {
    window.editor.BlockManager.render();
    window.editor.LayerManager.render();

    // Close the default GrapesJS block panel opened by the `open-blocks` command
    // so only the custom blocks sidebar remains visible. Explicitly deactivate the
    // panel button as stopping the command alone leaves the view docked open.
    var panels = window.editor.Panels;
    var openBlocksBtn = panels && panels.getButton('views', 'open-blocks');
    if (openBlocksBtn) {
      openBlocksBtn.set('active', false);
    }

    window.editor.Commands.stop('open-blocks');
  });
}

export default initEditor;
