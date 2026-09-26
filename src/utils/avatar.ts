/**
 * FOTO DE PERFIL — processamento 100% local.
 * ------------------------------------------------------------------
 * A imagem nunca sai do dispositivo: é lida, redimensionada num canvas
 * e convertida em dataURL antes de ser guardada. Sem uploads externos,
 * sem serviços de terceiros, sem fabricar avatares.
 */

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAX_SOURCE_BYTES = 5 * 1024 * 1024; // 5 MB
export const AVATAR_OUTPUT_SIZE = 256; // px (quadrado)

export const SUPPORTED_AVATAR_EMOJIS = [
  '⚡', '🛡️', '🏛️', '🧠', '📚', '🎯', '⚔️', '🔥', '🌱', '🧭',
  '🦉', '⚙️', '📐', '🗿', '🜂', '✍️'
];

export interface AvatarValidation {
  ok: boolean;
  error?: string;
}

export const validateAvatarFile = (file: File): AvatarValidation => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: 'Formato não suportado. Usa PNG, JPEG, WEBP ou GIF.' };
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      error: 'Imagem demasiado grande (máx. 5 MB). O rigor do sistema exige perfis leves.'
    };
  }
  return { ok: true };
};

/** Lê o ficheiro, corta ao centro e reduz para 256×256 (dataURL JPEG/PNG). */
export const fileToAvatarDataUrl = (
  file: File,
  size: number = AVATAR_OUTPUT_SIZE
): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Não foi possível ler o ficheiro de imagem.'));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Ficheiro de imagem inválido ou corrompido.'));

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('O navegador não disponibilizou canvas 2D para processar a imagem.'));
          return;
        }

        // Recorte quadrado centrado — evita imagens esticadas.
        const side = Math.min(image.width, image.height);
        const sx = (image.width - side) / 2;
        const sy = (image.height - side) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);

        const hasNoTransparency = file.type === 'image/jpeg';
        resolve(canvas.toDataURL(hasNoTransparency ? 'image/jpeg' : 'image/png', 0.9));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });

export const dataUrlKilobytes = (dataUrl: string): number =>
  Math.round(((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 3) / 4 / 1024);
