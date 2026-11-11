import { execFile } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import { config } from '../config/env.js';
import { AiImageService } from './aiImageService.js';
import { AudioService } from './audioService.js';
import { CaptionRagService, CaptionOption } from './captionRagService.js';

const FFMPEG_BIN: string = (ffmpegStatic as unknown as string) || 'ffmpeg';
const MAX_CONCURRENT_RENDERS = 1;
const MAX_QUEUE_LENGTH = 15;
const JOB_TTL_MS = 2 * 60 * 60 * 1000;
const RENDER_TIMEOUT_MS = 120_000;

export type VideoJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface VideoScene {
  sceneNumber: number;
  title: string;
  subtitle: string;
  duration: number;
  imageUrl: string;
  onScreenText: string;
  transition: 'zoom' | 'pan' | 'fade';
}

export interface GeneratedAiVideo {
  title: string;
  caption: string;
  hashtags: string[];
  postType: 'reel';
  videoUrl: string;
  thumbnailUrl: string;
  images: string[];
  publicMediaUrls: string[];
  durationSeconds: number;
  resolution: string;
  aspectRatio: '9:16';
  engine: 'motion-graphics-reel' | 'external-ai-video';
  engineLabel: string;
  scenes: VideoScene[];
  recommendedSong: {
    title: string;
    artist: string;
    vibe: string;
    audioUrl: string;
  };
  captionOptions: CaptionOption[];
  detectedConcept?: string;
  contentCategory?: string;
}

export interface VideoJobRecord {
  jobId: string;
  userId: string | null;
  prompt: string;
  brandName: string;
  instagramHandle: string;
  status: VideoJobStatus;
  progress: number;
  stage: string;
  createdAt: number;
  updatedAt: number;
  result?: GeneratedAiVideo;
  error?: string;
}

/**
 * Runs an FFmpeg command in a child process with timeout protection.
 */
function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      FFMPEG_BIN,
      args,
      { timeout: RENDER_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.trim() || error.message || 'FFmpeg render failed.'));
          return;
        }
        resolve();
      }
    );
  });
}

/**
 * Downloads an audio preview clip into the isolated job temp folder if reachable.
 */
async function downloadAudioClip(audioUrl: string, destPath: string): Promise<boolean> {
  if (!audioUrl || !audioUrl.startsWith('http')) return false;
  try {
    const res = await fetch(audioUrl, { signal: AbortSignal.timeout(7000) });
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 2000 || buffer.byteLength > 8 * 1024 * 1024) return false;
    fs.writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds the 9:16 vertical camera-motion filter graph for 1, 2, or 3 scenes.
 */
function buildFilterComplex(
  sceneCount: number,
  includeAudio: boolean,
  audioInputIndex: number
): { filter: string; totalDuration: number; mapAudio: boolean } {
  const fps = 25;
  const sceneSeconds = sceneCount === 1 ? 5.0 : 3.0;
  const framesPerScene = Math.round(fps * sceneSeconds);
  const fadeSeconds = 0.4;

  const zoomExpressions = [
    `scale=864:1536:force_original_aspect_ratio=increase,crop=864:1536,format=yuv420p,zoompan=z='min(zoom+0.0014,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${framesPerScene}:fps=${fps}:s=720x1280,setsar=1`,
    `scale=864:1536:force_original_aspect_ratio=increase,crop=864:1536,format=yuv420p,zoompan=z='if(lte(zoom,1.0),1.12,max(1.001,zoom-0.0014))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${framesPerScene}:fps=${fps}:s=720x1280,setsar=1`,
    `scale=864:1536:force_original_aspect_ratio=increase,crop=864:1536,format=yuv420p,zoompan=z='min(zoom+0.0014,1.12)':x='iw/2-(iw/zoom/2)':y='ih*0.55-(ih/zoom/2)':d=${framesPerScene}:fps=${fps}:s=720x1280,setsar=1`,
  ];

  const chains: string[] = [];
  for (let i = 0; i < sceneCount; i++) {
    chains.push(`[${i}:v]${zoomExpressions[i % zoomExpressions.length]}[v${i}]`);
  }

  let totalDuration = sceneSeconds;
  if (sceneCount === 1) {
    chains.push('[v0]null[vout]');
  } else if (sceneCount === 2) {
    const offset1 = sceneSeconds - fadeSeconds;
    totalDuration = sceneSeconds * 2 - fadeSeconds;
    chains.push(`[v0][v1]xfade=transition=fade:duration=${fadeSeconds}:offset=${offset1.toFixed(1)}[vout]`);
  } else {
    const offset1 = sceneSeconds - fadeSeconds;
    const offset2 = offset1 + sceneSeconds - fadeSeconds;
    totalDuration = sceneSeconds * 3 - fadeSeconds * 2;
    chains.push(`[v0][v1]xfade=transition=fade:duration=${fadeSeconds}:offset=${offset1.toFixed(1)}[v01]`);
    chains.push(`[v01][v2]xfade=transition=fade:duration=${fadeSeconds}:offset=${offset2.toFixed(1)}[vout]`);
  }

  if (includeAudio) {
    const fadeOutStart = Math.max(0.5, totalDuration - 1.0).toFixed(1);
    chains.push(
      `[${audioInputIndex}:a]atrim=0:${totalDuration.toFixed(1)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=${fadeOutStart}:d=1.0,volume=0.8[aout]`
    );
  }

  return {
    filter: chains.join(';'),
    totalDuration: Number(totalDuration.toFixed(1)),
    mapAudio: includeAudio,
  };
}

/**
 * Fetches one scene buffer quickly (bounded timeout so Render requests never stall),
 * trying live AI diffusion on Scene 1 and falling back to distinct category visuals per scene.
 */
async function fetchSceneBuffer(
  cleanPrompt: string,
  enrichedPrompt: string,
  sceneIndex: number
): Promise<ArrayBuffer | null> {
  if (sceneIndex === 0 && config.COLAB_IMAGE_API_URL) {
    const colab = await AiImageService.fetchFromColab(enrichedPrompt, 100);
    if (colab) return colab;
  }

  if (sceneIndex === 0) {
    try {
      const seed = Math.floor(Math.random() * 900000 + 100000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enrichedPrompt.slice(0, 320))}?width=720&height=1280&seed=${seed}&model=flux&nologo=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const type = res.headers.get('content-type') || '';
      if (res.ok && (type.includes('image') || type.includes('octet-stream'))) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 2000 && AiImageService.imageIsSharpEnough(buf)) {
          return buf;
        }
      }
    } catch {
      // Fall through to instant category photography
    }
  }

  return (
    (await AiImageService.fetchFallbackStockImage(cleanPrompt, sceneIndex)) ||
    (await AiImageService.fetchFallbackStockImage('modern boutique cafe', sceneIndex))
  );
}
async function tryExternalVideoProvider(prompt: string): Promise<ArrayBuffer | null> {
  if (!config.VIDEO_API_URL) return null;
  try {
    const res = await fetch(`${config.VIDEO_API_URL}/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspect_ratio: '9:16', duration: 6 }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.includes('video') && !type.includes('octet-stream')) return null;
    const buffer = await res.arrayBuffer();
    return buffer.byteLength > 10_000 ? buffer : null;
  } catch (err: any) {
    console.warn('[AI Video] External GPU provider unavailable, using FFmpeg motion engine:', err.message);
    return null;
  }
}

const jobs = new Map<string, VideoJobRecord>();
const waitQueue: string[] = [];
let activeWorkers = 0;

function pruneOldJobs(): void {
  const cutoff = Date.now() - JOB_TTL_MS;
  for (const [id, job] of jobs.entries()) {
    if (job.updatedAt < cutoff && job.status !== 'running' && job.status !== 'queued') {
      jobs.delete(id);
    }
  }
}

function updateJob(jobId: string, patch: Partial<VideoJobRecord>): void {
  const current = jobs.get(jobId);
  if (!current) return;
  jobs.set(jobId, { ...current, ...patch, updatedAt: Date.now() });
}

/**
 * Renders a 9:16 vertical promotional Reel MP4 from the user's text prompt on CPU using FFmpeg.
 */
async function renderJobVideo(job: VideoJobRecord): Promise<GeneratedAiVideo> {
  const cleanPrompt = job.prompt.trim();
  const timestamp = Date.now();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `ig_video_${job.jobId}_`));

  const imagesDir = path.join(process.cwd(), 'data', 'generated_images');
  const videosDir = path.join(process.cwd(), 'data', 'generated_videos');
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });

  try {
    updateJob(job.jobId, { progress: 12, stage: 'Writing script & scene storyboard...' });

    const [ragResult, track] = await Promise.all([
      CaptionRagService.generateCaptions({
        prompt: cleanPrompt,
        brandName: job.brandName,
      }),
      AudioService.pickForPrompt(cleanPrompt),
    ]);

    const baseTitle = cleanPrompt
      .split(' ')
      .slice(0, 7)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const title = baseTitle || 'Instagram Reel';
    const primaryOption = ragResult.captions[0];
    const caption = primaryOption?.caption || cleanPrompt;
    const hashtags = primaryOption?.hashtags || ['#Reels', '#InstagramReels', '#Trending'];

    const videoFileName = `reel_${timestamp}_${job.jobId.slice(0, 8)}.mp4`;
    const videoFilePath = path.join(videosDir, videoFileName);
    const servedVideoUrl = `/api/ai/videos/${videoFileName}`;

    // Check optional external generative video worker first
    const externalBuffer = await tryExternalVideoProvider(cleanPrompt);

    updateJob(job.jobId, { progress: 35, stage: 'Generating visual scenes for your description...' });

    const sceneDirectives = [
      { label: 'Opening Hook', angle: 'wide cinematic establishing shot of this exact scene', transition: 'zoom' as const },
      { label: 'Product Spotlight', angle: 'close-up commercial detail of the same subject', transition: 'pan' as const },
      { label: 'Story Finale', angle: 'warm aesthetic hero view of the same scene', transition: 'fade' as const },
    ];

    const scenePaths: string[] = [];
    const sceneUrls: string[] = [];
    const scenes: VideoScene[] = [];

    const fetchedBuffers = await Promise.all(
      sceneDirectives.map(async (directive, i) => {
        const promptToUse = `${cleanPrompt}. Scene ${i + 1}: ${directive.angle}`;
        const enriched = AiImageService.enhancePrompt(promptToUse, i === 0 ? 'cover' : 'insight');
        return fetchSceneBuffer(cleanPrompt, enriched, i);
      })
    );

    for (let i = 0; i < sceneDirectives.length; i++) {
      const directive = sceneDirectives[i];
      const buffer = fetchedBuffers[i];
      if (!buffer) continue;

      const header = new Uint8Array(buffer);
      const ext = header[0] === 0x89 && header[1] === 0x50
        ? 'png'
        : header[0] === 0x52 && header[1] === 0x49 && header[8] === 0x57
          ? 'webp'
          : 'jpg';

      const sceneImageName = `reel_${timestamp}_scene_${i + 1}.${ext}`;
      const publicImagePath = path.join(imagesDir, sceneImageName);
      const tempScenePath = path.join(tempDir, `scene_${i + 1}.${ext}`);

      const rawBuf = Buffer.from(buffer);
      fs.writeFileSync(publicImagePath, rawBuf);
      fs.writeFileSync(tempScenePath, rawBuf);

      const publicSceneUrl = `/api/ai/images/${sceneImageName}`;
      scenePaths.push(tempScenePath);
      sceneUrls.push(publicSceneUrl);
      scenes.push({
        sceneNumber: i + 1,
        title: directive.label,
        subtitle: cleanPrompt.slice(0, 90),
        duration: 3,
        imageUrl: publicSceneUrl,
        onScreenText: i === 0 ? baseTitle.toUpperCase() : directive.label.toUpperCase(),
        transition: directive.transition,
      });
    }

    if (scenePaths.length === 0) {
      throw new Error('Could not prepare visual scenes for the video. Please try again.');
    }

    if (externalBuffer) {
      fs.writeFileSync(videoFilePath, Buffer.from(externalBuffer));
      return {
        title,
        caption,
        hashtags,
        postType: 'reel',
        videoUrl: servedVideoUrl,
        thumbnailUrl: sceneUrls[0],
        images: [servedVideoUrl],
        publicMediaUrls: [servedVideoUrl],
        durationSeconds: 6,
        resolution: '720x1280',
        aspectRatio: '9:16',
        engine: 'external-ai-video',
        engineLabel: 'AI Generative Video',
        scenes,
        recommendedSong: track,
        captionOptions: ragResult.captions,
        detectedConcept: ragResult.detected_concept,
        contentCategory: ragResult.content_category,
      };
    }

    updateJob(job.jobId, { progress: 65, stage: 'Rendering 9:16 vertical Reel with camera motion...' });

    const audioTempPath = path.join(tempDir, 'track.audio');
    const hasAudio = await downloadAudioClip(track.audioUrl, audioTempPath);

    let totalDuration = 8.2;
    let renderedWithAudio = false;

    if (hasAudio) {
      try {
        const graph = buildFilterComplex(scenePaths.length, true, scenePaths.length);
        totalDuration = graph.totalDuration;
        const inputArgs = scenePaths.flatMap((p) => ['-i', p]);
        inputArgs.push('-i', audioTempPath);

        await runFfmpeg([
          '-y',
          '-hide_banner',
          '-loglevel',
          'error',
          ...inputArgs,
          '-filter_complex',
          graph.filter,
          '-map',
          '[vout]',
          '-map',
          '[aout]',
          '-c:v',
          'libx264',
          '-preset',
          'veryfast',
          '-crf',
          '24',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-shortest',
          '-threads',
          '2',
          '-movflags',
          '+faststart',
          videoFilePath,
        ]);
        renderedWithAudio = fs.existsSync(videoFilePath) && fs.statSync(videoFilePath).size > 5000;
      } catch (audioErr: any) {
        console.warn('[AI Video] Audio muxing fallback to video-only:', audioErr.message);
      }
    }

    if (!renderedWithAudio) {
      const graph = buildFilterComplex(scenePaths.length, false, 0);
      totalDuration = graph.totalDuration;
      const inputArgs = scenePaths.flatMap((p) => ['-i', p]);

      await runFfmpeg([
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        ...inputArgs,
        '-filter_complex',
        graph.filter,
        '-map',
        '[vout]',
        '-an',
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '24',
        '-threads',
        '2',
        '-movflags',
        '+faststart',
        videoFilePath,
      ]);
    }

    if (!fs.existsSync(videoFilePath) || fs.statSync(videoFilePath).size < 2000) {
      throw new Error('Video rendering produced an empty file.');
    }

    updateJob(job.jobId, { progress: 96, stage: 'Finalizing MP4 reel...' });

    return {
      title,
      caption,
      hashtags,
      postType: 'reel',
      videoUrl: servedVideoUrl,
      thumbnailUrl: sceneUrls[0],
      images: [servedVideoUrl],
      publicMediaUrls: [servedVideoUrl],
      durationSeconds: totalDuration,
      resolution: '720x1280',
      aspectRatio: '9:16',
      engine: 'motion-graphics-reel',
      engineLabel: '9:16 Motion Reel (FFmpeg)',
      scenes,
      recommendedSong: track,
      captionOptions: ragResult.captions,
      detectedConcept: ragResult.detected_concept,
      contentCategory: ragResult.content_category,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Best-effort temp folder cleanup
    }
  }
}

function drainQueue(): void {
  while (activeWorkers < MAX_CONCURRENT_RENDERS && waitQueue.length > 0) {
    const nextJobId = waitQueue.shift()!;
    const job = jobs.get(nextJobId);
    if (!job || job.status !== 'queued') continue;

    activeWorkers++;
    updateJob(nextJobId, { status: 'running', progress: 8, stage: 'Starting video worker...' });

    renderJobVideo(job)
      .then((result) => {
        const latest = jobs.get(nextJobId);
        if (latest && latest.status !== 'cancelled') {
          updateJob(nextJobId, {
            status: 'succeeded',
            progress: 100,
            stage: 'Reel video ready!',
            result,
          });
        }
      })
      .catch((err: any) => {
        console.error(`[AI Video Job ${nextJobId}] Failed:`, err);
        const latest = jobs.get(nextJobId);
        if (latest && latest.status !== 'cancelled') {
          updateJob(nextJobId, {
            status: 'failed',
            error: err?.message || 'Could not generate video.',
          });
        }
      })
      .finally(() => {
        activeWorkers = Math.max(0, activeWorkers - 1);
        pruneOldJobs();
        drainQueue();
      });
  }
}

export const AiVideoService = {
  /**
   * Queues an async video generation job and returns immediately with jobId.
   */
  submitJob(params: {
    userId?: string | null;
    prompt: string;
    brandName?: string;
    instagramHandle?: string;
  }): VideoJobRecord {
    const cleanPrompt = (params.prompt || '').trim();
    if (!cleanPrompt) {
      throw new Error('Please enter a description or topic for the video.');
    }

    if (waitQueue.length >= MAX_QUEUE_LENGTH) {
      throw new Error('Video studio queue is busy right now. Please try again in a few seconds.');
    }

    pruneOldJobs();
    const jobId = `vjob_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`;
    const now = Date.now();
    const job: VideoJobRecord = {
      jobId,
      userId: params.userId || null,
      prompt: cleanPrompt,
      brandName: params.brandName || 'My Brand',
      instagramHandle: params.instagramHandle || '@creator',
      status: 'queued',
      progress: 4,
      stage: waitQueue.length > 0 ? `Queued (${waitQueue.length} ahead)...` : 'Preparing video render...',
      createdAt: now,
      updatedAt: now,
    };

    jobs.set(jobId, job);
    waitQueue.push(jobId);
    drainQueue();
    return jobs.get(jobId)!;
  },

  /**
   * Fetches status and optional completed result for a video job, enforcing owner access when authenticated.
   */
  getJob(jobId: string, requesterUserId?: string | null): VideoJobRecord | null {
    const job = jobs.get(jobId) || null;
    if (!job) return null;
    if (job.userId && requesterUserId && job.userId !== requesterUserId) {
      return null;
    }
    if (job.userId && !requesterUserId) {
      return null;
    }
    return job;
  },

  /**
   * Cancels a queued video job before worker execution starts.
   */
  cancelJob(jobId: string, requesterUserId?: string | null): boolean {
    const job = this.getJob(jobId, requesterUserId);
    if (!job) return false;
    if (job.status === 'queued') {
      const idx = waitQueue.indexOf(jobId);
      if (idx !== -1) waitQueue.splice(idx, 1);
      updateJob(jobId, { status: 'cancelled', stage: 'Cancelled by user' });
      return true;
    }
    return false;
  },

  /**
   * Runs a video job through the bounded queue and resolves when the MP4 is ready.
   */
  async generateVideoPost(params: {
    userId?: string | null;
    prompt: string;
    brandName?: string;
    instagramHandle?: string;
  }): Promise<GeneratedAiVideo> {
    const job = this.submitJob(params);
    const started = Date.now();
    while (Date.now() - started < RENDER_TIMEOUT_MS + 30_000) {
      const current = jobs.get(job.jobId);
      if (!current) throw new Error('Video job disappeared.');
      if (current.status === 'succeeded' && current.result) return current.result;
      if (current.status === 'failed') throw new Error(current.error || 'Video generation failed.');
      if (current.status === 'cancelled') throw new Error('Video generation was cancelled.');
      await new Promise((r) => setTimeout(r, 400));
    }
    throw new Error('Video generation timed out. Please try a shorter prompt.');
  },
};
