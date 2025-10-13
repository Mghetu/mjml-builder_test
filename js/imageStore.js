// Base64 image handler with size/MIME checks
(function(){
  const MAX_BYTES = 1024 * 1024 * 1.5; // 1.5MB
  const ALLOWED = ['image/png','image/jpeg','image/gif','image/svg+xml'];

  async function fileToDataUrl(file){
    if (!ALLOWED.includes(file.type)) throw new Error('Unsupported image type');
    if (file.size > MAX_BYTES) throw new Error('Image too large (max 1.5MB)');
    return new Promise((res, rej)=>{
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error('Read error'));
      r.readAsDataURL(file);
    });
  }

  const ImageProvider = {
    async handleDrop(files){
      const out = [];
      for(const f of files) out.push(await fileToDataUrl(f));
      return out;
    },
    strategy: 'base64'
  };

  window.ImageProvider = ImageProvider;
})();
