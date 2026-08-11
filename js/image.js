/* ============================================================
   image.js: compressão de imagem no navegador, via canvas.

   Usada pelo painel (admin.js) e pelo importador em lote
   (supabase/importar.html). Ficava só no painel; virou módulo para
   as duas não divergirem no dia em que a qualidade mudar.
   ============================================================ */

/** Lado maior da imagem depois da compressão, em pixels. */
export const MAX_LADO = 1000;

/** Qualidade do JPEG. 0.82 equilibra peso e nitidez em foto de produto. */
export const QUALIDADE = 0.82;

/**
 * Redimensiona e comprime, devolvendo uma dataURL JPEG.
 * Aceita File ou Blob.
 * @param {Blob} file
 * @param {number} maxSize lado maior resultante
 * @param {number} quality 0 a 1
 * @returns {Promise<string>} dataURL
 */
export function compressImage(file, maxSize = MAX_LADO, quality = QUALIDADE) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // Fundo branco: JPEG não tem transparência, e sem isto um PNG
      // transparente vira fundo preto.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };

    img.src = url;
  });
}
