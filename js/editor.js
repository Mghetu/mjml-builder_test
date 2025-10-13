(function(){
  const editor = grapesjs.init({
    container: '#gjs',
    fromElement: false,
    height: '100%',
    storageManager: false,
    plugins: ['grapesjs-mjml'],
    pluginsOpts: { 'grapesjs-mjml': {} },
    canvas: { styles: [], scripts: [] },
    deviceManager: {
      devices: [
        { name: 'Desktop', width: '' },
        { name: 'Tablet', width: '768px' },
        {
          name: 'Mobile portrait',
          width: '375px',
          widthMedia: '480px'
        }
      ]
    }
  });

  editor.on('load', () => {
    const openBlocks = editor.Panels.getButton('views', 'open-blocks');
    if (openBlocks) openBlocks.set('active', 1);
  });

  // Panel buttons
  const pn = editor.Panels;
  pn.addButton('options', [
    { id: 'save',        className: 'fa fa-save',   label: 'Save',        command: 'app-save' },
    { id: 'export-mjml', className: 'fa fa-code',   label: 'Export MJML', command: 'export-mjml' },
    { id: 'export-html', className: 'fa fa-file',   label: 'Export HTML', command: 'export-html' },
    { id: 'import',      className: 'fa fa-upload', label: 'Import',      command: 'app-import' },
    { id: 'preview',     className: 'fa fa-eye',    label: 'Preview',     command: 'core:preview' },
    { id: 'clear',       className: 'fa fa-trash',  label: 'Clear',       command: 'app-clear' }
  ]);

  // Commands
  editor.Commands.add('app-save', {
    async run(ed){
      const json = ed.getProjectData();
      await window.StorageProvider.save({ json, ts: Date.now() });
      console.info('[mjml-builder] Saved locally');
    }
  });

  editor.Commands.add('export-mjml', {
    async run(ed){
      // grapesjs-mjml exposes MJML via componentFirst
      const mjml = ed.getHtml({ componentFirst: true });
      await window.Compiler.downloadMjml(mjml, 'email.mjml');
    }
  });

  editor.Commands.add('export-html', {
    async run(ed){
      const mjml = ed.getHtml({ componentFirst: true });
      const html = await window.Compiler.compileMJML(mjml);
      await window.Compiler.downloadHtml(html, 'email.html');
    }
  });

  editor.Commands.add('app-clear', {
    async run(ed){
      if (confirm('Clear the canvas?')) {
        ed.DomComponents.clear();
        await window.StorageProvider.clear();
      }
    }
  });

  editor.Commands.add('app-import', {
    run(ed){
      const modal = ed.Modal;
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="padding:12px;">
          <h3>Import MJML</h3>
          <textarea id="impMjml" style="width:100%;height:220px;"></textarea>
          <div style="margin-top:8px;">
            <button id="impBtn">Import</button>
          </div>
        </div>`;
      modal.open({ title: 'Import', content: container });
      container.querySelector('#impBtn').onclick = async () => {
        const mjml = container.querySelector('#impMjml').value;
        if (!mjml) return;
        editor.setComponents(mjml);
        editor.render();
        modal.close();
      };
    }
  });

  // Keymaps
  editor.Keymaps.add('core:undo', '⌘+Z, ctrl+Z');
  editor.Keymaps.add('core:redo', '⌘+Shift+Z, ctrl+Shift+Z');
  editor.Keymaps.add('app-save', '⌘+S, ctrl+S');

  // Blocks (brandable presets)
  const bm = editor.BlockManager;

  bm.add('brand-header', {
  label: 'Logo Header',
  category: 'Brand',
  content: `
    <mj-section padding="24px 16px" background-color="#ffffff">
      <mj-column>
        <mj-image src="${Theme.logoUrl}" alt="Logo" width="140px"></mj-image>
      </mj-column>
    </mj-section>
  `.trim()
});

bm.add('hero', {
  label: 'Hero',
  category: 'Content',
  content: `
    <mj-section background-color="#ffffff" padding="0 16px 24px">
      <mj-column>
        <mj-image src="${DATA_HERO}" alt="Hero"></mj-image>
        <mj-text font-size="22px" font-weight="700" padding-top="16px">Headline</mj-text>
        <mj-text>Intro paragraph goes here.</mj-text>
        <mj-button href="#" background-color="${Theme.brandColor}" border-radius="4px">Call to Action</mj-button>
      </mj-column>
    </mj-section>
  `.trim()
});

bm.add('one-col', {
  label: '1 Column',
  category: 'Layout',
  content: `
    <mj-section background-color="#ffffff" padding="0 16px 24px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600">Section title</mj-text>
        <mj-text>Body text...</mj-text>
      </mj-column>
    </mj-section>
  `.trim()
});

bm.add('two-col', {
  label: '2 Columns',
  category: 'Layout',
  content: `
    <mj-section background-color="#ffffff" padding="0 16px 24px">
      <mj-column>
        <mj-text font-size="18px" font-weight="600">Left title</mj-text>
        <mj-text>Left text...</mj-text>
      </mj-column>
      <mj-column>
        <mj-text font-size="18px" font-weight="600">Right title</mj-text>
        <mj-text>Right text...</mj-text>
      </mj-column>
    </mj-section>
  `.trim()
});

bm.add('button', {
  label: 'Button',
  category: 'Content',
  content: `<mj-button href="#" background-color="${Theme.brandColor}" border-radius="4px">Button</mj-button>`
});

bm.add('divider', {
  label: 'Divider',
  category: 'Content',
  content: `<mj-divider border-color="#e5e7eb" padding="12px 0" />`
});

bm.add('spacer', {
  label: 'Spacer',
  category: 'Content',
  content: `<mj-spacer height="16px" />`
});

bm.add('legal-footer', {
  label: 'Legal Footer',
  category: 'Brand',
  content: `
    <mj-section padding="16px">
      <mj-column>
        <mj-text font-size="12px" color="#6b7280">
          You are receiving this email because you subscribed to updates.
          <a href="#" style="color:${Theme.brandColor};">Unsubscribe</a>
          • 123 Example St, City.
        </mj-text>
      </mj-column>
    </mj-section>
  `.trim()
});

  // Autosave every 10s
  setInterval(async ()=>{
    const json = editor.getProjectData();
    await window.StorageProvider.save({ json, ts: Date.now() });
  }, 10000);

  // Boot: load saved or start with sample template
  (async function boot(){
    const saved = await window.StorageProvider.load();
    if (saved && saved.json) {
      editor.loadProjectData(saved.json);
      editor.render();
    } else {
      editor.setComponents(SampleTemplates.productNewsletter.mjml);
      editor.render();
    }
  })();

  // Base64 image assets
  editor.on('asset:upload:add', async (files) => {
    try {
      const dataUrls = await ImageProvider.handleDrop(files);
      dataUrls.forEach(src => editor.AssetManager.add({ src }));
    } catch (e){
      console.error('Image upload failed:', e.message);
    }
  });
})();
