import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface RetrievedPhoto {
  id: string;
  title: string;
  thumbnailUrl: string;
  sourcePage: string;
  creator: string;
  license: string;
  provider: string;
  score: number;
}

interface StoredPhoto extends RetrievedPhoto {
  imageUrl: string;
}

const MATCH_PORT = 8001;
const cache = new Map<string, StoredPhoto>();
let starting: Promise<void> | null = null;

const ALLOWED_LICENSES = new Set(['cc0', 'pdm', 'by', 'by-sa']);

function licenseAllowsUse(code: string): boolean {
  const normalized = code.toLowerCase();
  if (normalized.includes('nc') || normalized.includes('nd')) return false;
  return ALLOWED_LICENSES.has(normalized);
}

function publicHttps(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return false;
    return true;
  } catch {
    return false;
  }
}

async function matcherIsUp(): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${MATCH_PORT}/health`, { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureMatcher(): Promise<void> {
  if (await matcherIsUp()) return;
  if (!starting) {
    starting = new Promise((resolve, reject) => {
      const child = spawn(
        'py',
        ['-3', '-m', 'uvicorn', 'image_match_api:app', '--host', '127.0.0.1', '--port', String(MATCH_PORT)],
        {
          cwd: path.join(process.cwd(), 'scripts'),
          windowsHide: true,
          stdio: 'ignore',
          detached: true,
        }
      );
      child.unref();
      const started = Date.now();
      const timer = setInterval(async () => {
        if (await matcherIsUp()) {
          clearInterval(timer);
          resolve();
          return;
        }
        if (Date.now() - started > 60000) {
          clearInterval(timer);
          starting = null;
          reject(new Error('Photo matching did not start. Install fastapi and uvicorn for Python.'));
        }
      }, 600);
    });
  }
  await starting;
}

export const ImageRetrievalService = {
  async search(prompt: string): Promise<{ query: string; images: RetrievedPhoto[] }> {
    await ensureMatcher();
    const response = await fetch(`http://127.0.0.1:${MATCH_PORT}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await response.json() as { query?: string; images?: Array<Omit<StoredPhoto, 'id'>>; detail?: string };
    if (!response.ok) {
      throw new Error(data.detail || 'Could not search licensed photos.');
    }
    const images = (data.images || []).map((item) => {
      const id = randomUUID();
      const stored: StoredPhoto = { ...item, id };
      cache.set(id, stored);
      return {
        id,
        title: stored.title,
        thumbnailUrl: stored.thumbnailUrl,
        sourcePage: stored.sourcePage,
        creator: stored.creator,
        license: stored.license,
        provider: stored.provider,
        score: stored.score,
      };
    });
    return { query: data.query || '', images };
  },

  async saveSelected(id: string): Promise<{ imageUrl: string; attribution: string; license: string }> {
    const photo = cache.get(id);
    if (!photo) throw new Error('Choose a photo from the latest search.');
    if (!licenseAllowsUse(photo.license) || !publicHttps(photo.imageUrl)) {
      throw new Error('That photo cannot be used. Its license does not allow commercial editing.');
    }

    const response = await fetch(photo.imageUrl, {
      headers: { 'User-Agent': 'SocialCraft/1.0 (licensed image search)' },
      signal: AbortSignal.timeout(20000),
    });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.includes('image')) {
      throw new Error('The photo file could not be downloaded.');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 2000 || buffer.length > 8_000_000) {
      throw new Error('The photo file was not a usable image.');
    }
    const extension = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    const imagesDir = path.join(process.cwd(), 'data', 'generated_images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    const fileName = `retrieved_${Date.now()}.${extension}`;
    fs.writeFileSync(path.join(imagesDir, fileName), buffer);
    const credit = `${photo.title} by ${photo.creator} · ${photo.license.toUpperCase()} · ${photo.provider}`;
    return {
      imageUrl: `/api/ai/images/${fileName}`,
      attribution: credit,
      license: photo.license,
    };
  },
};
