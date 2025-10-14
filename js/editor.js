(function(){
  window.addEventListener('load', function(){
    window.editor = grapesjs.init({
      height: '100%',
      noticeOnUnload: false,
      storageManager: false,
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

    window.editor.on('load', function() {
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
  });
})();
