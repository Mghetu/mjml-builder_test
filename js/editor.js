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
    });
  });
})();
