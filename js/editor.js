(function(){
  window.addEventListener('load', function(){
    window.editor = grapesjs.init({
      height: '100%',
      noticeOnUnload: false,
      storageManager: false,
      fromElement: true,
      container: '#gjs',
      plugins: ['grapesjs-mjml'],
      pluginsOpts: {
        'grapesjs-mjml': {}
      }
    });
  });
})();
