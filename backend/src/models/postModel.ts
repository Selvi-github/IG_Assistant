import crypto from 'crypto';
import { db } from '../db/index.js';

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
  getPostById(id: string, userId: string): PostRecord | null {
    const stmt = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?');
    return (stmt.get(id, userId) as PostRecord) || null;
  },

  getPostsByUserId(userId: string): PostRecord[] {
    const stmt = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC');
    return (stmt.all(userId) as PostRecord[]) || [];
  },

  getStatsByUserId(userId: string): { scheduled: number; published: number; total: number } {
    const scheduled = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'scheduled'").get(userId) as { count: number };
    const published = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = 'published'").get(userId) as { count: number };
    const total = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(userId) as { count: number };

    return {
      scheduled: scheduled?.count || 0,
      published: published?.count || 0,
      total: total?.count || 0,
    };
  },

  createPost(userId: string, data: {
    title: string;
    caption: string;
    hashtags?: string;
    postType?: 'reel' | 'carousel' | 'image' | 'story';
    status?: 'draft' | 'scheduled' | 'published';
    scheduledFor?: string | null;
    thumbnailUrl?: string | null;
    mediaUrls?: string | null;
  }): PostRecord {
    const id = `pst_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO posts (
        id, user_id, title, caption, hashtags, post_type, status,
        scheduled_for, published_at, thumbnail_url, media_urls, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
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
    );

    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as PostRecord;
  },

  deletePost(id: string, userId: string): void {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  },

  updatePost(
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
  ): void {
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
    const stmt = db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`);
    stmt.run(...values);
  },
};

