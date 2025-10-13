// StorageProvider interface and LocalProvider implementation
(function(){
  const KEY = 'mjml_studio_project_v1';

  const LocalProvider = {
    async save(json){
      try {
        localStorage.setItem(KEY, JSON.stringify(json));
        return { ok: true };
      } catch(e){
        if (window.idbKeyval){
          await idbKeyval.set(KEY, json);
          return { ok: true, where: 'indexeddb' };
        }
        return { ok:false, error: e.message };
      }
    },
    async load(){
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      if (window.idbKeyval){
        const v = await idbKeyval.get(KEY);
        if (v) return v;
      }
      return null;
    },
    async clear(){
      localStorage.removeItem(KEY);
      if (window.idbKeyval) await idbKeyval.del(KEY);
    },
    async export(type, dataStr, filename){
      const blob = new Blob([dataStr], { type });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    async importText(text){ return text; }
  };

  window.StorageProvider = LocalProvider;
})();
