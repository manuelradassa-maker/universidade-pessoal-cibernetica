import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCcw, AlertTriangle } from 'lucide-react';

export const Avatar: React.FC<{
  avatar: string;
  avatarType: 'image' | 'emoji';
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}> = ({ avatar, avatarType, name, size = 'md', ring = true }) => {
  const dims =
    size === 'sm'
      ? 'w-7 h-7 text-xs'
      : size === 'md'
        ? 'w-10 h-10 text-lg'
        : size === 'lg'
          ? 'w-14 h-14 text-2xl'
          : 'w-20 h-20 text-3xl';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`${dims} rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 font-bold ${
        ring ? 'border border-red-600/50 bg-red-950/60' : 'bg-zinc-800'
      }`}
      title={name}
      aria-label={`Foto de perfil de ${name}`}
      role="img"
    >
      {avatarType === 'image' && avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : avatar ? (
        <span aria-hidden="true">{avatar}</span>
      ) : (
        <span className="text-red-300">{initials || '?'}</span>
      )}
    </div>
  );
};

const EMOJI_CHOICES = ['⚡', '🛡️', '🧠', '📚', '🎯', '🔥', '🌱', '🦉', '🏛️', '🧭', '💎', '🚀'];

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_DIM = 256;

const processImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O ficheiro tem de ser uma imagem.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Imagem demasiado grande (máximo 3 MB).'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('O navegador não suporta processamento de imagem.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });

export const AvatarPicker: React.FC<{
  name: string;
  avatar: string;
  avatarType: 'image' | 'emoji';
  onChange: (avatar: string, avatarType: 'image' | 'emoji') => void;
}> = ({ name, avatar, avatarType, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl, 'image');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao processar a imagem.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar avatar={avatar} avatarType={avatarType} name={name} size="xl" />
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Carregar foto de perfil"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-600/60 text-red-200 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {busy ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {busy ? 'A processar...' : 'Carregar foto de perfil'}
          </button>
          <p className="text-[11px] font-mono text-zinc-500">
            <Camera className="w-3 h-3 inline mr-1" />
            Imagem real, máx. 3 MB (redimensionada para 256px)
          </p>
        </div>
      </div>
      {error && (
        <div
          className="p-2.5 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs font-mono flex items-center gap-2"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <div>
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
          Ou escolher um símbolo:
        </div>
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji, 'emoji')}
              aria-label={'Escolher simbolo ' + emoji}
              className={'h-11 rounded-lg border text-xl transition-all cursor-pointer ' + (avatar === emoji && avatarType === 'emoji'
                ? 'bg-red-950 border-red-500 shadow-md shadow-red-900/50'
                : 'bg-black/60 border-zinc-800 hover:border-zinc-600')}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
