(function(){
  async function compileMJML(mjml){
    if (!mjml || !mjml.trim()) throw new Error('Empty MJML');
    if (typeof window.mjml !== 'function') {
      throw new Error('MJML runtime not loaded (check mjml-browser @ /lib/index.js script and order)');
    }
    const { html, errors } = window.mjml(mjml, { validationLevel: 'soft' });
    if (errors && errors.length) console.warn('MJML warnings/errors:', errors);
    return html;
  }

  async function downloadHtml(html, filename='email.html'){
    await window.StorageProvider.export('text/html;charset=utf-8', html, filename);
  }

  async function downloadMjml(mjml, filename='email.mjml'){
    await window.StorageProvider.export('application/xml', mjml, filename);
  }

  window.Compiler = { compileMJML, downloadHtml, downloadMjml };
})();
