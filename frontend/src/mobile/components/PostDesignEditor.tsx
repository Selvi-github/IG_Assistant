import React, { useRef, useState } from 'react';

interface DesignLayer {
  id: string;
  kind: 'text' | 'sticker' | 'avatar';
  content: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

const BACKGROUNDS = [
  '#fb2175', '#e11d48', '#fb7185', '#fda4af', '#fff1f2',
  '#111111', '#27272a', '#ffffff', '#faf7f2', '#fde68a',
  '#f59e0b', '#f97316', '#0ea5e9', '#1d4ed8', '#312e81',
  '#16a34a', '#86efac', '#14b8a6', '#7c3aed', '#c4b5fd',
  '#78350f', '#44403c',
];
const TEXT_COLORS = ['#ffffff', '#111111', '#fb2175', '#f59e0b', '#0ea5e9', '#16a34a'];
const toAvatar = (style: string, seed: string) =>
  `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}&size=160`;

const AVATARS = [
  ['lorelei', 'Meera'],
  ['lorelei', 'Aisha'],
  ['lorelei', 'Luna'],
  ['adventurer', 'Amina'],
  ['adventurer', 'Leo'],
  ['adventurer', 'Nila'],
  ['big-smile', 'Kavya'],
  ['big-smile', 'Bunny'],
  ['big-ears', 'Hari'],
  ['big-ears', 'Mochi'],
  ['micah', 'Priya'],
  ['micah', 'Kabir'],
  ['avataaars', 'Diya'],
  ['avataaars', 'Ravi'],
  ['personas', 'Selvi'],
  ['personas', 'Noah'],
  ['open-peeps', 'Anu'],
  ['open-peeps', 'Dev'],
].map(([style, seed]) => toAvatar(style, seed));

const CUTE_THINGS = [
  ['bottts', 'Cupcake'],
  ['bottts', 'BunnyBot'],
  ['croodles', 'Coffee'],
  ['croodles', 'Flower'],
  ['pixel-art', 'Cat'],
  ['pixel-art', 'Dog'],
  ['pixel-art', 'Cake'],
  ['icons', 'Star'],
  ['icons', 'Heart'],
  ['icons', 'Gift'],
  ['shapes', 'Blob'],
  ['thumbs', 'Okay'],
].map(([style, seed]) => toAvatar(style, seed));

const stickerSvg = (body: string) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">' + body + '</' + 'svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const GRAPHIC_STICKERS = [
  stickerSvg('<circle cx="80" cy="80" r="58" fill="#fb2175" stroke="#fff" stroke-width="10"/><path d="M80 112c-22-14-40-28-40-46a18 18 0 0 1 32-12 18 18 0 0 1 32 12c0 18-18 32-24 46z" fill="#fff"/>'),
  stickerSvg('<polygon points="80,22 96,62 140,66 106,94 116,138 80,114 44,138 54,94 20,66 64,62" fill="#f59e0b" stroke="#fff" stroke-width="8"/>'),
  stickerSvg('<rect x="48" y="58" width="64" height="48" rx="8" fill="#fff" stroke="#111" stroke-width="6"/><path d="M48 78h64M70 58c0-16 20-16 20 0" fill="none" stroke="#111" stroke-width="6"/><ellipse cx="80" cy="106" rx="36" ry="10" fill="#fb2175"/>'),
  stickerSvg('<circle cx="80" cy="92" r="28" fill="#fb7185" stroke="#fff" stroke-width="8"/><circle cx="80" cy="48" r="16" fill="#f59e0b" stroke="#fff" stroke-width="6"/><circle cx="48" cy="70" r="14" fill="#0ea5e9" stroke="#fff" stroke-width="6"/><circle cx="112" cy="70" r="14" fill="#16a34a" stroke="#fff" stroke-width="6"/>'),
  stickerSvg('<defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#67e8f9"/><stop offset=".35" stop-color="#c4b5fd"/><stop offset=".7" stop-color="#fb7185"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs><polygon points="80,18 98,58 142,62 108,92 118,136 80,112 42,136 52,92 18,62 62,58" fill="url(#h)" stroke="#fff" stroke-width="8"/>'),
  stickerSvg('<circle cx="80" cy="80" r="58" fill="#111"/><circle cx="46" cy="52" r="4" fill="#fff"/><circle cx="70" cy="40" r="3" fill="#fde68a"/><circle cx="100" cy="48" r="5" fill="#fff"/><circle cx="118" cy="74" r="3" fill="#fb7185"/><circle cx="40" cy="90" r="3" fill="#67e8f9"/><circle cx="88" cy="100" r="4" fill="#fff"/><circle cx="112" cy="108" r="3" fill="#fde68a"/><path d="M80 58l6 16 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z" fill="#fde68a"/>'),
  stickerSvg('<path d="M80 122c-26-16-46-34-46-56a22 22 0 0 1 40-14 22 22 0 0 1 40 14c0 22-20 40-34 56z" fill="none" stroke="#fff" stroke-width="10"/>'),
  stickerSvg('<circle cx="80" cy="80" r="56" fill="#e11d48" stroke="#fff" stroke-width="8"/><text x="80" y="90" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#fff">SALE</text>'),
  stickerSvg('<path d="M28 48h104l-14 32H42z" fill="#7c3aed" stroke="#fff" stroke-width="8"/><text x="80" y="72" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#fff">NEW</text>'),
  stickerSvg('<path d="M30 78l18-36 16 24 16-40 16 40 16-24 18 36z" fill="#f59e0b" stroke="#fff" stroke-width="7"/><rect x="40" y="78" width="80" height="28" rx="6" fill="#f59e0b" stroke="#fff" stroke-width="7"/>'),
  stickerSvg('<path d="M40 100c8-28 20-40 40-40s32 12 40 40" fill="none" stroke="#fb2175" stroke-width="8" stroke-linecap="round"/><circle cx="48" cy="58" r="8" fill="#f59e0b"/><circle cx="80" cy="42" r="8" fill="#0ea5e9"/><circle cx="112" cy="58" r="8" fill="#16a34a"/>'),
  stickerSvg('<circle cx="80" cy="80" r="56" fill="#fde68a" stroke="#fff" stroke-width="8"/><circle cx="60" cy="70" r="6" fill="#111"/><circle cx="100" cy="70" r="6" fill="#111"/><path d="M58 98c8 10 36 10 44 0" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round"/>'),
  stickerSvg('<polygon points="88,18 70,70 22,78 62,108 50,154 88,126 130,150 116,104 152,72 104,68" fill="#facc15" stroke="#fff" stroke-width="8"/>'),
  stickerSvg('<circle cx="58" cy="92" r="24" fill="none" stroke="#111" stroke-width="8"/><circle cx="102" cy="92" r="24" fill="none" stroke="#111" stroke-width="8"/><path d="M82 92V40l36-12" fill="none" stroke="#111" stroke-width="8" stroke-linecap="round"/>'),
  stickerSvg('<rect x="40" y="62" width="80" height="58" rx="8" fill="#0ea5e9" stroke="#fff" stroke-width="8"/><path d="M40 78h80M80 62v58M40 78l40-28 40 28" fill="none" stroke="#fff" stroke-width="6"/>'),
  stickerSvg('<path d="M80 128c-8-20-36-28-36-58 0-20 16-32 36-18 20-14 36-2 36 18 0 30-28 38-36 58z" fill="#16a34a" stroke="#fff" stroke-width="8"/>'),
  stickerSvg('<path d="M24 100a56 56 0 0 1 112 0" fill="none" stroke="#e11d48" stroke-width="10" stroke-linecap="round"/><path d="M36 100a44 44 0 0 1 88 0" fill="none" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/><path d="M48 100a32 32 0 0 1 64 0" fill="none" stroke="#16a34a" stroke-width="10" stroke-linecap="round"/><path d="M60 100a20 20 0 0 1 40 0" fill="none" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round"/>'),
  stickerSvg('<path d="M36 78c0-22 20-36 44-28 18-16 48-4 44 22 18 6 22 32 6 42H42c-18-6-22-28-6-36z" fill="#fff" stroke="#0ea5e9" stroke-width="6"/><text x="80" y="96" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#0ea5e9">Hi</text>'),
];

const STICKERS = [
  '😀', '😁', '😂', '🥰', '😍', '😘', '😎', '🤩', '🥳', '😊', '😉', '😋',
  '❤️', '💛', '💖', '💕', '💯', '✨', '⭐', '🌟', '🔥', '💥', '🎉', '🎊',
  '☕', '🍰', '🧁', '🍩', '🍪', '🍕', '🍔', '🍟', '🥗', '🍜', '🍵', '🥤',
  '🌸', '🌺', '🌹', '🌷', '🍀', '🌿', '☀️', '🌈', '🌙', '⛅', '🌧️', '❄️',
  '🙏', '👍', '👏', '🙌', '💪', '🤝', '👋', '✌️', '📍', '📸', '🎁', '🛍️',
  '🏪', '🏠', '🚗', '🎵', '🎶', '📣', '🏆', '👑', '💎', '🧸', '🐶', '🐱',
];

export const PostDesignEditor: React.FC<{
  backgroundImage?: string;
  onApply: (dataUrl: string) => void;
}> = ({ backgroundImage, onApply }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('Your text');
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const selected = layers.find((layer) => layer.id === selectedId) || null;

  const addLayer = (kind: DesignLayer['kind'], content: string) => {
    const layer: DesignLayer = {
      id: `layer-${Date.now()}`,
      kind,
      content,
      x: kind === 'avatar' ? 78 : 50,
      y: kind === 'text' ? 46 : 24 + (layers.length % 4) * 12,
      color: '#ffffff',
      size: kind === 'text' ? 28 : kind === 'avatar' ? 64 : 42,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const updateSelected = (patch: Partial<DesignLayer>) => {
    if (!selectedId) return;
    setLayers((prev) => prev.map((layer) => (layer.id === selectedId ? { ...layer, ...patch } : layer)));
  };

  const pointFromEvent = (event: React.PointerEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onPointerDown = (event: React.PointerEvent, layer: DesignLayer) => {
    event.stopPropagation();
    const point = pointFromEvent(event);
    if (!point) return;
    setSelectedId(layer.id);
    dragRef.current = { id: layer.id, dx: point.x - layer.x, dy: point.y - layer.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const point = pointFromEvent(event);
    if (!drag || !point) return;
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === drag.id
          ? {
              ...layer,
              x: Math.min(92, Math.max(8, point.x - drag.dx)),
              y: Math.min(92, Math.max(8, point.y - drag.dy)),
            }
          : layer
      )
    );
  };

  const exportDesign = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      await new Promise<void>((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
          resolve();
        };
        image.onerror = () => resolve();
        image.src = backgroundImage;
      });
    }

    for (const layer of layers) {
      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;
      if (layer.kind === 'avatar' || layer.content.startsWith('data:image')) {
        await new Promise<void>((resolve) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            const side = layer.size * 2.6;
            ctx.save();
            if (layer.kind === 'avatar') {
              ctx.beginPath();
              ctx.arc(x, y, side / 2, 0, Math.PI * 2);
              ctx.clip();
            }
            ctx.drawImage(image, x - side / 2, y - side / 2, side, side);
            ctx.restore();
            resolve();
          };
          image.onerror = () => resolve();
          image.src = layer.content;
        });
        continue;
      }
      ctx.fillStyle = layer.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${layer.kind === 'sticker' ? layer.size * 2.2 : layer.size * 2}px sans-serif`;
      if (layer.kind === 'text') {
        ctx.lineWidth = 8;
        ctx.strokeStyle = layer.color === '#111111' ? '#ffffff' : 'rgba(0,0,0,0.45)';
        ctx.strokeText(layer.content, x, y);
      }
      ctx.fillText(layer.content, x, y);
    }

    onApply(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div className="p-4 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
      <span className="text-xs font-bold text-zinc-900 dark:text-white">Design your post</span>

      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 touch-none"
        style={{ background }}
      >
        {backgroundImage && (
          <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onPointerDown={(event) => onPointerDown(event, layer)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 max-w-[80%] cursor-grab ${
              selectedId === layer.id ? 'outline outline-2 outline-white' : ''
            }`}
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              color: layer.color,
              fontSize: layer.size,
              fontWeight: 800,
              textShadow: '0 1px 4px rgba(0,0,0,0.45)',
            }}
          >
            {layer.kind === 'avatar' || layer.content.startsWith('data:image') ? (
              <img
                src={layer.content}
                alt=""
                className={layer.kind === 'avatar' ? 'rounded-full object-cover' : 'object-contain'}
                style={{ width: layer.size, height: layer.size }}
              />
            ) : (
              layer.content
            )}
          </button>
        ))}
      </div>

      <div>
        <span className="text-[10px] font-semibold text-zinc-500">Background</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {BACKGROUNDS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBackground(color)}
              className="w-7 h-7 rounded-full border border-zinc-200 dark:border-white/20 cursor-pointer"
              style={{ background: color }}
              title="Background color"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
        />
        <button
          type="button"
          onClick={() => addLayer('text', draftText || 'Your text')}
          className="px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-100 cursor-pointer"
        >
          Add text
        </button>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-zinc-500">Avatar stickers</span>
        <div className="grid grid-cols-6 gap-1.5 mt-1.5 max-h-36 overflow-y-auto pr-1">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => addLayer('avatar', avatar)}
              className="h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 cursor-pointer bg-zinc-100"
            >
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-zinc-500">Cute things</span>
        <div className="grid grid-cols-6 gap-1.5 mt-1.5">
          {CUTE_THINGS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => addLayer('avatar', avatar)}
              className="h-10 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 cursor-pointer bg-zinc-100"
            >
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {(selected?.kind === 'text' || selected?.kind === 'avatar' || selected?.kind === 'sticker') && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-8">Size</span>
            <input
              type="range"
              min={16}
              max={64}
              value={selected.size}
              onChange={(event) => updateSelected({ size: Number(event.target.value) })}
              className="flex-1 accent-rose-500"
            />
          </div>
          <div className="flex gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateSelected({ color })}
                className="w-6 h-6 rounded-full border border-zinc-200 dark:border-white/20 cursor-pointer"
                style={{ background: color }}
                title="Text color"
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="text-[10px] font-semibold text-zinc-500">Stickers</span>
        <div className="grid grid-cols-6 gap-1.5 mt-1.5">
          {GRAPHIC_STICKERS.map((sticker) => (
            <button
              key={sticker}
              type="button"
              onClick={() => addLayer('sticker', sticker)}
              className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 cursor-pointer p-1"
            >
              <img src={sticker} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      <span className="text-[10px] font-semibold text-zinc-500">Emojis</span>
      <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto pr-1">
        {STICKERS.map((sticker) => (
          <button
            key={sticker}
            type="button"
            onClick={() => addLayer('sticker', sticker)}
            className="h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-lg cursor-pointer"
          >
            {sticker}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={exportDesign}
        className="w-full py-3 rounded-2xl ig-gradient text-white text-xs font-bold cursor-pointer"
      >
        Use this design
      </button>
    </div>
  );
};
