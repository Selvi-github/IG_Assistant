export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  vibe: string;
  audioUrl: string;
  license: string;
}

const ENGLISH_PUBLIC: AudioTrack[] = [
  {
    id: 'en-lofi-chill',
    title: 'Midnight Chill Beats',
    artist: 'Lofi Dreamers',
    vibe: 'Lo-Fi',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    license: 'Royalty Free',
  },
  {
    id: 'en-upbeat-pop',
    title: 'Summer Sunlight Pop',
    artist: 'Nova Soundwave',
    vibe: 'Pop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    license: 'Royalty Free',
  },
  {
    id: 'en-indie-acoustic',
    title: 'Golden Horizon Acoustic',
    artist: 'Coastal Drift',
    vibe: 'Acoustic',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cf6.mp3',
    license: 'Royalty Free',
  },
  {
    id: 'en-synthwave-groove',
    title: 'Neon Nights Retro',
    artist: 'Cyber Pulse',
    vibe: 'Electronic',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3',
    license: 'Royalty Free',
  },
];

function moodWords(prompt: string): string {
  const text = prompt.toLowerCase();
  if (/(happy|joy|celebrat|welcome|arrived|visit|guest)/.test(text)) return 'happy';
  if (/(sad|rain|miss)/.test(text)) return 'chill';
  if (/(party|dance|energy)/.test(text)) return 'dance';
  if (/(love|wedding|couple)/.test(text)) return 'romantic';
  if (/(cafe|coffee|cake|food|shop)/.test(text)) return 'acoustic';
  return 'pop';
}

export const AudioService = {
  /**
   * Song names and 30-second previews from Apple's free iTunes Search API.
   * Exclusively searches English and international trending tracks.
   */
  async search(query: string): Promise<AudioTrack[]> {
    const mood = moodWords(query) || 'pop';
    const terms = [`trending ${mood} english`, `${mood} pop hits`, `lofi chill beats`];
    const collected: AudioTrack[] = [];

    for (const term of terms) {
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=6&media=music`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (!response.ok) continue;
        const data = (await response.json()) as { results?: any[] };
        for (const item of data.results || []) {
          const preview = String(item.previewUrl || '');
          if (!preview.startsWith('https://')) continue;
          collected.push({
            id: String(item.trackId),
            title: String(item.trackName || 'Song').slice(0, 80),
            artist: String(item.artistName || 'Unknown').slice(0, 80),
            vibe: 'English',
            audioUrl: preview,
            license: '30s preview',
          });
        }
      } catch (error: any) {
        console.warn('[Audio] iTunes search note:', error.message);
      }
    }

    const unique = collected.filter((track, index) => collected.findIndex((item) => item.id === track.id) === index);
    return unique.length > 0 ? unique.slice(0, 8) : ENGLISH_PUBLIC;
  },

  async pickForPrompt(prompt: string): Promise<AudioTrack> {
    const tracks = await this.search(prompt);
    return tracks[0] || ENGLISH_PUBLIC[0];
  },
};
