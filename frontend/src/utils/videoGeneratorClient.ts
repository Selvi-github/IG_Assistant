export interface VideoGenerationProgress {
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
}

export interface GeneratedVideoScene {
  sceneNumber: number;
  title: string;
  subtitle: string;
  duration: number;
  imageUrl: string;
  onScreenText: string;
  transition: 'zoom' | 'pan' | 'fade';
}

export interface GeneratedVideoResult {
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
  scenes: GeneratedVideoScene[];
  recommendedSong: {
    title: string;
    artist: string;
    vibe: string;
    audioUrl: string;
  };
  captionOptions: Array<{
    style: string;
    caption: string;
    hashtags: string[];
  }>;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('ig_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Retries transient socket/502/503 drops (e.g., Render server wake-up or rollover).
 */
export async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 2): Promise<Response> {
  let lastErr: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1800 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err: any) {
      lastErr = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1800 * (attempt + 1)));
        continue;
      }
    }
  }
  throw new Error(
    lastErr?.message === 'Failed to fetch'
      ? 'Server is waking up or restarting — please wait a second and try again.'
      : lastErr?.message || 'Network connection lost. Please try again.'
  );
}

/**
 * Submits an async 9:16 vertical Reel video render job and polls until complete.
 */
export async function generateVideoWithPolling(
  params: {
    prompt: string;
    brandName?: string;
    instagramHandle?: string;
  },
  onProgress?: (info: VideoGenerationProgress) => void
): Promise<GeneratedVideoResult> {
  const headers = getAuthHeaders();
  const submitRes = await fetchWithRetry('/api/ai/video-jobs', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(params),
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.success || !submitData.jobId) {
    throw new Error(submitData.error || 'Could not start video generation.');
  }

  const jobId: string = submitData.jobId;
  onProgress?.({
    status: submitData.status || 'queued',
    progress: submitData.progress ?? 8,
    stage: submitData.stage || 'Preparing video render...',
  });

  const startedAt = Date.now();
  const maxWaitMs = 180_000;

  while (Date.now() - startedAt < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const statusRes = await fetchWithRetry(`/api/ai/video-jobs/${encodeURIComponent(jobId)}`, {
      headers,
      credentials: 'include',
    });
    const statusData = await statusRes.json();

    if (!statusRes.ok || !statusData.success) {
      throw new Error(statusData.error || 'Lost track of video render job.');
    }

    onProgress?.({
      status: statusData.status,
      progress: typeof statusData.progress === 'number' ? statusData.progress : 20,
      stage: statusData.stage || 'Rendering video...',
    });

    if (statusData.status === 'succeeded' && statusData.result) {
      return statusData.result as GeneratedVideoResult;
    }

    if (statusData.status === 'failed') {
      throw new Error(statusData.error || 'Video generation failed.');
    }

    if (statusData.status === 'cancelled') {
      throw new Error('Video generation was cancelled.');
    }
  }

  throw new Error('Video rendering timed out. Please try a shorter description.');
}

/**
 * Triggers browser download of a remote image or MP4 URL.
 */
export async function downloadRemoteAsset(url: string, fallbackFileName: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not download file.');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
}

