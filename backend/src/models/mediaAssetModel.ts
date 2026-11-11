import { execute, queryOne } from '../db/index.js';

const MAX_PERSIST_BYTES = 4 * 1024 * 1024;

export interface MediaAssetRecord {
  filename: string;
  mime_type: string;
  data_base64: string;
  created_at: string;
}

export function mimeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export const MediaAssetModel = {
  /**
   * Persists a generated image or MP4 asset in the database so ephemeral Render restarts never 404.
   */
  async saveAsset(filename: string, buffer: Buffer): Promise<void> {
    if (!filename || buffer.byteLength === 0 || buffer.byteLength > MAX_PERSIST_BYTES) {
      return;
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const mimeType = mimeForFilename(safeName);
    const dataBase64 = buffer.toString('base64');
    const now = new Date().toISOString();

    try {
      await execute(
        `
        INSERT INTO media_assets (filename, mime_type, data_base64, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (filename) DO UPDATE SET
          mime_type = EXCLUDED.mime_type,
          data_base64 = EXCLUDED.data_base64,
          created_at = EXCLUDED.created_at
        `,
        [safeName, mimeType, dataBase64, now]
      );
    } catch (err: any) {
      console.warn('[MediaAsset] Persistence note:', err?.message);
    }
  },

  /**
   * Fetches a persisted generated asset from database by filename.
   */
  async getAsset(filename: string): Promise<{ mimeType: string; buffer: Buffer } | null> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safeName) return null;

    try {
      const row = await queryOne<MediaAssetRecord>(
        'SELECT filename, mime_type, data_base64 FROM media_assets WHERE filename = ?',
        [safeName]
      );
      if (!row?.data_base64) return null;
      return {
        mimeType: row.mime_type || mimeForFilename(safeName),
        buffer: Buffer.from(row.data_base64, 'base64'),
      };
    } catch {
      return null;
    }
  },
};
