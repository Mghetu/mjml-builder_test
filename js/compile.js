import StorageProvider from './storage.js';

const TOAST_ID = 'compile-error-toast';

function ensureToast() {
  let toast = document.getElementById(TOAST_ID);
  if (!toast) {
    toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.className = 'toast toast--error';
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);
  }
  return toast;
}

function showCompileError(message) {
  const toast = ensureToast();
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(showCompileError.timeoutId);
  showCompileError.timeoutId = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 5000);
}

function getMjmlRuntime() {
  if (typeof window.mjml !== 'function') {
    throw new Error(
      'The MJML runtime is not available. Please verify that mjml-browser is loaded before the editor scripts.'
    );
  }
  return window.mjml;
}

export async function compileMJML(mjml) {
  if (!mjml || !mjml.trim()) throw new Error('Empty MJML');

  try {
    const runtime = getMjmlRuntime();
    const { html, errors } = runtime(mjml, { validationLevel: 'soft' });
    if (errors && errors.length) console.warn('MJML warnings/errors:', errors);
    return html;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showCompileError(message);
    throw error;
  }
}

export async function downloadHtml(html, filename = 'email.html') {
  await StorageProvider.export('text/html;charset=utf-8', html, filename);
}

export async function downloadMjml(mjml, filename = 'email.mjml') {
  await StorageProvider.export('application/xml', mjml, filename);
}

export default { compileMJML, downloadHtml, downloadMjml };
