// Base64 image drop handler with MIME/size checks; pluggable for future providers
(function(){
  const MAX_BYTES = 1024 * 1024 * 1.5; // 1.5MB
  const ALLOWED = ['image/png','image/jpeg','image/gif','image/svg+xml'];

  async function fileToDataUrl(file){
    if (!ALLOWED.includes(file.type)) throw new Error('Unsupported image type');
    if (file.size > MAX_BYTES) throw new Error('Image too large (max 1.5MB)');
    return new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('Read error'));
      r.readAsDataURL(file);
    });
  }

  const ImageProvider = {
    async handleDrop(files){
      const out = [];
      for (const f of files) out.push(await fileToDataUrl(f));
      return out;
    },
    strategy: 'base64'
  };

  window.ImageProvider = ImageProvider;
})();
