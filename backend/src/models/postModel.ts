import crypto from 'crypto';
import { query, queryOne, execute } from '../db/index.js';

export interface PostRecord {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  hashtags: string | null;
  post_type: 'reel' | 'carousel' | 'image' | 'story';
  status: 'draft' | 'scheduled' | 'published';
  scheduled_for: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
  media_urls: string | null;
  instagram_media_id: string | null;
  instagram_permalink: string | null;
  publish_error: string | null;
  created_at: string;
  updated_at: string;
}

export const PostModel = {
  async getPostById(id: string, userId: string): Promise<PostRecord | null> {
    return queryOne<PostRecord>('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, userId]);
  },

  async getPostsByUserId(userId: string): Promise<PostRecord[]> {
    return query<PostRecord>('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },

  async getStatsByUserId(userId: string): Promise<{ scheduled: number; published: number; total: number }> {
    const scheduled = await queryOne<{ count: string | number }>("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'scheduled'", [userId]);
    const published = await queryOne<{ count: string | number }>("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'published'", [userId]);
    const total = await queryOne<{ count: string | number }>('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [userId]);

    return {
      scheduled: Number(scheduled?.count || 0),
      published: Number(published?.count || 0),
      total: Number(total?.count || 0),
    };
  },

  async createPost(userId: string, data: {
    title: string;
    caption: string;
    hashtags?: string;
    postType?: 'reel' | 'carousel' | 'image' | 'story';
    status?: 'draft' | 'scheduled' | 'published';
    scheduledFor?: string | null;
    thumbnailUrl?: string | null;
    mediaUrls?: string | null;
  }): Promise<PostRecord> {
    const id = `pst_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await execute(`
      INSERT INTO posts (
        id, user_id, title, caption, hashtags, post_type, status,
        scheduled_for, published_at, thumbnail_url, media_urls, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      id,
      userId,
      data.title.trim(),
      data.caption.trim(),
      data.hashtags || null,
      data.postType || 'reel',
      data.status || 'draft',
      data.scheduledFor || null,
      data.status === 'published' ? now : null,
      data.thumbnailUrl || null,
      data.mediaUrls || null,
      now,
      now
    ]);

    const created = await queryOne<PostRecord>('SELECT * FROM posts WHERE id = ?', [id]);
    return created!;
  },

  async deletePost(id: string, userId: string): Promise<void> {
    await execute('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, userId]);
  },

  async updatePost(
    id: string,
    userId: string,
    updates: {
      status?: 'draft' | 'scheduled' | 'published';
      scheduledFor?: string | null;
      publishedAt?: string | null;
      thumbnailUrl?: string | null;
      instagramMediaId?: string | null;
      instagramPermalink?: string | null;
      publishError?: string | null;
    }
  ): Promise<void> {
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [new Date().toISOString()];

    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.scheduledFor !== undefined) {
      fields.push('scheduled_for = ?');
      values.push(updates.scheduledFor);
    }
    if (updates.publishedAt !== undefined) {
      fields.push('published_at = ?');
      values.push(updates.publishedAt);
    }
    if (updates.thumbnailUrl !== undefined) {
      fields.push('thumbnail_url = ?');
      values.push(updates.thumbnailUrl);
    }
    if (updates.instagramMediaId !== undefined) {
      fields.push('instagram_media_id = ?');
      values.push(updates.instagramMediaId);
    }
    if (updates.instagramPermalink !== undefined) {
      fields.push('instagram_permalink = ?');
      values.push(updates.instagramPermalink);
    }
    if (updates.publishError !== undefined) {
      fields.push('publish_error = ?');
      values.push(updates.publishError);
    }

    values.push(id, userId);
    await execute(`UPDATE posts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
  },
};
