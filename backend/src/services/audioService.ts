export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  vibe: string;
  audioUrl: string;
  license: string;
}

const TAMIL_PUBLIC: AudioTrack[] = [
  {
    id: 'wm-oppaari',
    title: 'Oppaari',
    artist: 'Tamil public recording',
    vibe: 'Tamil',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Oppaari_Song.ogg',
    license: 'Public domain',
  },
  {
    id: 'wm-aasai',
    title: 'Aasai mugam',
    artist: 'Tamil public recording',
    vibe: 'Tamil',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Aasai_mugam.ogg',
    license: 'Public domain',
  },
  {
    id: 'wm-senthamizh',
    title: 'Senthamizh Nadu',
    artist: 'Tamil public recording',
    vibe: 'Tamil',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Ta-Senthamizh_Nadu.ogg',
    license: 'Public domain',
  },
  {
    id: 'wm-suttum',
    title: 'Suttum vizhi',
    artist: 'Subramania Bharati',
    vibe: 'Tamil',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ta-suttum_vizhi.ogg',
    license: 'Public domain',
  },
];

function moodWords(prompt: string): string {
  const text = prompt.toLowerCase();
  if (/(happy|joy|celebrat|welcome|arrived|visit|guest)/.test(text)) return 'happy';
  if (/(sad|rain|miss)/.test(text)) return 'sad';
  if (/(party|dance|energy)/.test(text)) return 'party';
  if (/(love|wedding|couple)/.test(text)) return 'love';
  if (/(cafe|coffee|cake|food|shop)/.test(text)) return 'acoustic';
  return 'happy';
}

export const AudioService = {
  /**
   * Song names and 30-second previews from Apple's free iTunes Search API.
   * Full film recordings stay inside Instagram's music library.
   */
  async search(query: string): Promise<AudioTrack[]> {
    const mood = moodWords(query) || 'happy';
    const terms = [`${mood} tamil songs`, `${mood} english songs`];
    const collected: AudioTrack[] = [];

    for (const term of terms) {
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=6&country=IN&media=music`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!response.ok) continue;
        const data = (await response.json()) as { results?: any[] };
        for (const item of data.results || []) {
          const preview = String(item.previewUrl || '');
          if (!preview.startsWith('https://')) continue;
          const language = term.includes('tamil') ? 'Tamil' : 'English';
          collected.push({
            id: String(item.trackId),
            title: String(item.trackName || 'Song').slice(0, 80),
            artist: String(item.artistName || 'Unknown').slice(0, 80),
            vibe: language,
            audioUrl: preview,
            license: '30s preview',
          });
        }
      } catch (error: any) {
        console.warn('[Audio] iTunes search failed:', error.message);
      }
    }

    const unique = collected.filter((track, index) => collected.findIndex((item) => item.id === track.id) === index);
    return unique.length > 0 ? unique.slice(0, 8) : TAMIL_PUBLIC;
  },

  async pickForPrompt(prompt: string): Promise<AudioTrack> {
    const tracks = await this.search(prompt);
    return tracks[0] || TAMIL_PUBLIC[0];
  },
};
