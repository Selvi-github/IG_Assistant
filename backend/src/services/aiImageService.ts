import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';
import { CaptionRagService, CaptionOption } from './captionRagService.js';
import { AudioService } from './audioService.js';

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  publicUrl?: string;
}

export interface GeneratedAiPost {
  title: string;
  caption: string;
  hashtags: string[];
  postType: 'image' | 'carousel';
  images: string[];
  publicMediaUrls: string[];
  slides: CarouselSlide[];
  recommendedSong: {
    title: string;
    artist: string;
    vibe: string;
    audioUrl?: string;
  };
  captionOptions?: CaptionOption[];
  detectedConcept?: string;
  contentCategory?: string;
}

export const AiImageService = {
  /**
   * ChatGPT & Gemini-grade Prompt Expander.
   * ALWAYS preserves the user's exact subjects, actions, and objects verbatim,
   * while adding high-aesthetic photographic art direction, lighting, and camera tokens.
   */
  /**
   * High-Aesthetic Commercial Art Direction for ANY business:
   * School, College, Dress shop, Vehicle showroom, Cafe, Bakery, Tech, Fitness, Festivals & Offers.
   */
  enhancePrompt(userPrompt: string, _slideType: string = 'cover'): string {
    const raw = userPrompt.trim();
    const lower = raw.toLowerCase();

    // 1. Festival / Mega Offer Detection (Diwali, Deepavali, Pongal, Eid, Christmas, etc.)
    const isFestival =
      lower.includes('diwali') ||
      lower.includes('dewali') ||
      lower.includes('deepavali') ||
      lower.includes('pongal') ||
      lower.includes('eid') ||
      lower.includes('ramzan') ||
      lower.includes('christmas') ||
      lower.includes('new year') ||
      lower.includes('festival') ||
      lower.includes('festive') ||
      lower.includes('mega offer') ||
      lower.includes('puja') ||
      lower.includes('pooja');

    // 2. Education: School, College, Coaching, Tuition, Campus
    const isEducation =
      lower.includes('school') ||
      lower.includes('college') ||
      lower.includes('clg') ||
      lower.includes('campus') ||
      lower.includes('student') ||
      lower.includes('classroom') ||
      lower.includes('admission') ||
      lower.includes('academy') ||
      lower.includes('university') ||
      lower.includes('tuition') ||
      lower.includes('education');

    // 3. Clothing / Dress Shop / Boutique / Fashion / Sarees
    const isFashion =
      lower.includes('dress') ||
      lower.includes('clothing') ||
      lower.includes('boutique') ||
      lower.includes('fashion') ||
      lower.includes('saree') ||
      lower.includes('sari') ||
      lower.includes('textile') ||
      lower.includes('garment') ||
      lower.includes('apparel') ||
      lower.includes('outfit') ||
      lower.includes('tailor');

    // 4. Vehicles / Automobiles / Bikes / Cars / Dealerships
    const isAutomotive =
      lower.includes('vehicle') ||
      lower.includes('bike') ||
      lower.includes('motorcycle') ||
      lower.includes('car') ||
      lower.includes('scooter') ||
      lower.includes('showroom') ||
      lower.includes('automobile') ||
      lower.includes('dealership') ||
      lower.includes('garage');

    // 5. Food, Bakery, Cafe, Sweets & Restaurants
    const isFood =
      lower.includes('sweet') ||
      lower.includes('cake') ||
      lower.includes('coffee') ||
      lower.includes('tea') ||
      lower.includes('cafe') ||
      lower.includes('drink') ||
      lower.includes('food') ||
      lower.includes('restaurant') ||
      lower.includes('pastry') ||
      lower.includes('dessert') ||
      lower.includes('bakery') ||
      lower.includes('snack') ||
      lower.includes('dish') ||
      lower.includes('dining');

    // 6. Electronics / Mobile Store
    const isTech =
      lower.includes('mobile') ||
      lower.includes('phone') ||
      lower.includes('electronic') ||
      lower.includes('gadget') ||
      lower.includes('laptop') ||
      lower.includes('computer');

    // 7. Fitness / Gym / Sports
    const isFitness =
      lower.includes('gym') ||
      lower.includes('fitness') ||
      lower.includes('workout') ||
      lower.includes('yoga') ||
      lower.includes('sports');

    // 8. Person / Model / Portrait
    const isPerson =
      lower.includes('boy') ||
      lower.includes('girl') ||
      lower.includes('man') ||
      lower.includes('woman') ||
      lower.includes('person') ||
      lower.includes('model') ||
      lower.includes('founder') ||
      lower.includes('creator');

    // 9. Split Cards / Diptych
    const isSplit =
      lower.includes('separate card') ||
      lower.includes('split card') ||
      lower.includes('cards') ||
      lower.includes('side by side') ||
      lower.includes('diptych');

    const hasSamePose =
      lower.includes('same pose') ||
      lower.includes('matching pose') ||
      lower.includes('identical pose');

    let compositionMod = '';
    if (isSplit && hasSamePose) {
      compositionMod = ', creative diptych layout, two vertical cards side by side, matching symmetrical pose, clean borders';
    } else if (isSplit) {
      compositionMod = ', modern diptych layout, two vertical aesthetic cards side by side';
    }

    let artDirection = '';

    if (isFestival && isFood) {
      artDirection = 'vibrant celebratory festival atmosphere, golden glowing traditional oil lamps diyas, festive sweets and delicacies in beautiful brass trays, sparkling golden lights, rich festive colors, commercial festival advertising photography, photorealistic 8k, tack-sharp focus';
    } else if (isFestival && isFashion) {
      artDirection = 'festive celebration boutique, stunning traditional festive dresses and rich silk sarees on elegant display, golden diya lighting, warm festive glow, luxury fashion showroom, high-end commercial fashion photography, razor-sharp focus, 8k resolution';
    } else if (isFestival) {
      artDirection = 'vibrant celebratory Indian festival scene, golden glowing traditional oil lamps diyas, colorful artistic rangoli patterns, festive gift boxes, warm sparkling golden lights, commercial holiday promotion, rich vibrant colors, high-key commercial lighting, photorealistic 8k, tack-sharp focus';
    } else if (isEducation) {
      artDirection = 'bright modern educational campus, happy engaged students with books, sunny collegiate atmosphere, modern bright clean architecture, inspiring learning environment, sharp foreground focus, vibrant natural daylight, professional educational promotional photography, 8k resolution';
    } else if (isFashion) {
      artDirection = 'luxury fashion boutique interior, stylish modern mannequin and elegant clothing display, colorful vibrant fabrics and dresses on clean brass hangers, bright warm studio lighting, chic retail showroom, sharp focus on fabric textures, high-end commercial fashion photography, 8k resolution';
    } else if (isAutomotive) {
      artDirection = 'sleek modern automobile showroom, polished gleaming vehicle hero shot, bright clean LED showroom ceiling lights, reflections on polished chrome and metallic paint, high-end automotive commercial photography, razor-sharp focus, dynamic angle, 8k resolution';
    } else if (isTech) {
      artDirection = 'sleek modern tech showroom, gleaming cutting-edge electronic devices and smartphone displays, clean bright ambient lighting, high-tech retail interior, sharp commercial product photography, 8k resolution';
    } else if (isFitness) {
      artDirection = 'modern high-end fitness center, clean bright gym with state-of-the-art equipment, inspiring energetic workout atmosphere, bright natural daylight, crisp focus, dynamic fitness commercial photography, 8k';
    } else if (isFood && !isPerson) {
      artDirection = 'bright appetizing commercial food photography, mouthwatering close-up hero shot, clean studio daylight fill light, vivid crisp textures, photorealistic 8k, professional food styling, vibrant modern aesthetic';
    } else if (isPerson) {
      artDirection = 'bright natural daylight portrait photography, shot on 35mm lens, f/1.8, clear well-lit face, soft natural fill light, vivid colors, crisp focus, photorealistic 8k resolution, modern cheerful aesthetic';
    } else {
      artDirection = 'bright vibrant commercial storefront and product presentation, well-lit modern business interior, crisp clear foreground focus, professional commercial advertisement photography, bright natural daylight, vivid colors, photorealistic 8k resolution';
    }

    const quality = 'tack-sharp focus on the subject, vibrant rich colors, bright natural illumination, photorealistic 8k commercial quality, no blur, no text, no watermark, no logo';
    return `${raw}${compositionMod}, ${artDirection}, ${quality}`;
  },

  /**
   * Generates cloud diffusion AI image URL with zero local GPU requirement.
   * Uses unrestricted high-throughput SANA linear diffusion in 1080x1350 (Instagram portrait 4:5).
   */
  getDiffusionImageUrl(prompt: string, seed: number, width = 1080, height = 1350, model = 'flux'): string {
    const encoded = encodeURIComponent(prompt);
    const key = config.POLLINATIONS_API_KEY;
    if (key) {
      return `https://gen.pollinations.ai/image/${encoded}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&nologo=true&seed=${seed}&key=${encodeURIComponent(key)}`;
    }
    return `https://image.pollinations.ai/prompt/${encoded}?model=${encodeURIComponent(model)}&width=${width}&height=${height}&nologo=true&seed=${seed}`;
  },

  imageIsSharpEnough(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 8000) return false;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    if (!isPng && !isJpeg) return false;
    if (isPng && bytes.length > 24) {
      const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      return width >= 512;
    }
    return true;
  },

  async fetchFromGradio(base: string, prompt: string): Promise<ArrayBuffer | null> {
    try {
      const post = await fetch(`${base}/gradio_api/call/gradio_generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            prompt.slice(0, 900),
            'blurry, low quality, distorted, watermark',
            1024,
            1024,
            30,
            7.5,
            -1,
          ],
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!post.ok) {
        console.warn(`[AI Image] Gradio endpoint not reachable (${post.status}).`);
        return null;
      }
      const started = (await post.json()) as { event_id?: string };
      if (!started.event_id) return null;

      const result = await fetch(`${base}/gradio_api/call/gradio_generate/${started.event_id}`, {
        signal: AbortSignal.timeout(120000),
      });
      const text = await result.text();
      if (text.includes('event: error')) {
        console.warn('[AI Image] Gradio event error encountered.');
        return null;
      }

      const dataLine = text.split('\n').filter((line) => line.startsWith('data: ')).pop() || '';
      const payload = JSON.parse(dataLine.replace(/^data: /, ''));
      const image = Array.isArray(payload) ? payload[0] : payload;
      let url = typeof image?.url === 'string' ? image.url : '';
      if (url.startsWith('data:image')) {
        const encoded = url.split(',')[1] || '';
        const buffer = Buffer.from(encoded, 'base64');
        if (buffer.byteLength < 2000) return null;
        const copy = new Uint8Array(buffer.byteLength);
        copy.set(buffer);
        return copy.buffer;
      }
      if (url.startsWith('/')) url = `${base}${url}`;
      if (!url && image?.path) url = `${base}/gradio_api/file=${image.path}`;
      if (!url) return null;

      const file = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!file.ok) return null;
      const bytes = await file.arrayBuffer();
      if (bytes.byteLength < 2000) return null;
      console.log('[AI Image] Gradio SDXL produced the photo');
      return bytes;
    } catch (err: any) {
      console.warn('[AI Image] Gradio error:', err.message);
      return null;
    }
  },

  /**
   * Generates ultra-high-definition, commercial-grade photorealistic visuals
   * using Black Forest Labs FLUX.1 [dev] on Hugging Face ZeroGPU.
   */
  async fetchFromFluxDevSpace(prompt: string, seed: number): Promise<ArrayBuffer | null> {
    const token = (config.HF_TOKEN || process.env.HF_TOKEN || '').trim();
    if (!token) return null;

    const base = 'https://black-forest-labs-flux-1-dev.hf.space';
    try {
      console.log('[AI Image] Requesting FLUX.1 [dev] on Hugging Face ZeroGPU...');
      const postRes = await fetch(`${base}/gradio_api/call/infer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: [
            prompt.slice(0, 900),
            seed > 0 ? seed : 0,
            true, // randomize seed
            1024,
            1024,
            3.5, // guidance scale
            28, // inference steps
          ],
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!postRes.ok) {
        console.warn('[AI Image] FLUX.1 [dev] space status:', postRes.status);
        return null;
      }

      const postData = (await postRes.json()) as { event_id?: string };
      if (!postData.event_id) return null;

      const resultRes = await fetch(`${base}/gradio_api/call/infer/${postData.event_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(18000),
      });

      if (!resultRes.ok) return null;
      const text = await resultRes.text();
      const lines = text.split('\n');
      const completeLine = lines.filter((l) => l.startsWith('data: ')).pop();
      if (!completeLine) return null;

      const rawJson = completeLine.replace(/^data:\s*/, '').trim();
      const payload = JSON.parse(rawJson);
      const fileInfo = Array.isArray(payload) ? payload[0] : payload;
      let fileUrl = fileInfo?.url || '';
      if (!fileUrl && fileInfo?.path) {
        fileUrl = `${base}/gradio_api/file=${fileInfo.path}`;
      }
      if (!fileUrl) return null;

      const imageRes = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!imageRes.ok) return null;
      const bytes = await imageRes.arrayBuffer();
      if (bytes.byteLength > 5000) {
        console.log(`[AI Image] FLUX.1 [dev] produced master visual (${bytes.byteLength} bytes)`);
        return bytes;
      }
    } catch (err: any) {
      console.warn('[AI Image] FLUX.1 [dev] ZeroGPU note:', err.message);
    }
    return null;
  },

  /**
   * Generates ultra-fast high-res images via Z-Image-Turbo on Hugging Face ZeroGPU.
   */
  async fetchFromZImageTurboSpace(prompt: string, seed: number): Promise<ArrayBuffer | null> {
    const token = (config.HF_TOKEN || process.env.HF_TOKEN || '').trim();
    if (!token) return null;

    const base = 'https://mrfakename-z-image-turbo.hf.space';
    try {
      console.log('[AI Image] Requesting Z-Image-Turbo on Hugging Face ZeroGPU...');
      const postRes = await fetch(`${base}/gradio_api/call/generate_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: [
            prompt.slice(0, 900),
            1024,
            1024,
            9,
            seed > 0 ? seed : 42,
            true,
          ],
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!postRes.ok) {
        console.warn('[AI Image] Z-Image-Turbo space status:', postRes.status);
        return null;
      }

      const postData = (await postRes.json()) as { event_id?: string };
      if (!postData.event_id) return null;

      const resultRes = await fetch(`${base}/gradio_api/call/generate_image/${postData.event_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!resultRes.ok) return null;
      const text = await resultRes.text();
      const lines = text.split('\n');
      const completeLine = lines.filter((l) => l.startsWith('data: ')).pop();
      if (!completeLine) return null;

      const rawJson = completeLine.replace(/^data:\s*/, '').trim();
      const payload = JSON.parse(rawJson);
      const fileInfo = Array.isArray(payload) ? payload[0] : payload;
      let fileUrl = fileInfo?.url || '';
      if (!fileUrl && fileInfo?.path) {
        fileUrl = `${base}/gradio_api/file=${fileInfo.path}`;
      }
      if (!fileUrl) return null;

      const imageRes = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(20000),
      });

      if (!imageRes.ok) return null;
      const bytes = await imageRes.arrayBuffer();
      if (bytes.byteLength > 5000) {
        console.log(`[AI Image] Z-Image-Turbo produced master visual (${bytes.byteLength} bytes)`);
        return bytes;
      }
    } catch (err: any) {
      console.warn('[AI Image] Z-Image-Turbo ZeroGPU note:', err.message);
    }
    return null;
  },

  /**
   * Generates high-resolution commercial images via Gen.Pollinations.ai using the user's secret key.
   * Directly accesses FLUX 1.1 Pro and FLUX 1 Schnell with zero logos.
   */
  async fetchFromPollinationsPro(prompt: string, seed: number): Promise<ArrayBuffer | null> {
    const key = (config.POLLINATIONS_API_KEY || process.env.POLLINATIONS_API_KEY || '').trim();
    if (!key) return null;

    const models = ['black-forest-labs/flux.1.1-pro', 'black-forest-labs/flux.1-schnell', 'flux'];
    const encoded = encodeURIComponent(prompt.slice(0, 900));

    for (const model of models) {
      try {
        console.log(`[AI Image] Requesting Pollinations Pro (${model})...`);
        const url = `https://gen.pollinations.ai/image/${encoded}?model=${encodeURIComponent(model)}&width=1024&height=1024&nologo=true&seed=${seed}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${key}`,
          },
          signal: AbortSignal.timeout(18000),
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength > 8000 && this.imageIsSharpEnough(buffer)) {
            console.log(`[AI Image] Pollinations Pro (${model}) produced master visual (${buffer.byteLength} bytes)`);
            return buffer;
          }
        } else {
          console.warn(`[AI Image] Pollinations Pro (${model}) status:`, response.status);
        }
      } catch (err: any) {
        console.warn(`[AI Image] Pollinations Pro (${model}) note:`, err.message);
      }
    }
    return null;
  },

  async fetchFromColab(prompt: string, seed: number): Promise<ArrayBuffer | null> {
    const base = (config.COLAB_IMAGE_API_URL || '').trim();
    if (!base) return null;

    try {
      if (base.includes('gradio.live') || base.includes('hf.space')) {
        return await this.fetchFromGradio(base, prompt);
      }

      const response = await fetch(`${base}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1',
        },
        body: JSON.stringify({
          prompt: prompt.slice(0, 900),
          negative_prompt: 'blurry, low quality, distorted, watermark',
          width: 1024,
          height: 1024,
          steps: 30,
          guidance_scale: 7.5,
          seed: seed > 0 ? seed : -1,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn('[AI Image] Colab status', response.status);
        return null;
      }

      const data = (await response.json()) as { image_base64?: string };
      if (!data.image_base64) return null;
      const buffer = Buffer.from(data.image_base64, 'base64');
      if (buffer.byteLength < 2000) return null;
      console.log('[AI Image] Colab SDXL produced the photo');
      const copy = new Uint8Array(buffer.byteLength);
      copy.set(buffer);
      return copy.buffer;
    } catch (error: any) {
      console.warn('[AI Image] Colab/Gradio note:', error.message, 'Falling back seamlessly to cloud diffusion.');
      return null;
    }
  },

  async fetchImageBuffer(prompt: string, seed: number): Promise<ArrayBuffer | null> {
    const clipped = prompt.slice(0, 900);

    // 1. Pollinations Pro with User Secret Key (FLUX 1.1 Pro / FLUX 1 Schnell - Instant Master Quality)
    const pollinationsPro = await this.fetchFromPollinationsPro(clipped, seed);
    if (pollinationsPro) return pollinationsPro;

    // 2. Master Quality: Official Black Forest Labs FLUX.1 [dev] on Hugging Face ZeroGPU
    const fluxDev = await this.fetchFromFluxDevSpace(clipped, seed);
    if (fluxDev) return fluxDev;

    // 3. High-Speed Master Quality: Z-Image-Turbo on Hugging Face ZeroGPU
    const zTurbo = await this.fetchFromZImageTurboSpace(clipped, seed);
    if (zTurbo) return zTurbo;

    // 4. Colab / User custom space
    const colab = await this.fetchFromColab(clipped, seed);
    if (colab) return colab;

    // 5. Resilient fallback models (Fast timeouts to never hit Render 60s gateway timeout)
    const models = ['turbo', 'flux', 'sana'];

    for (const model of models) {
      const url = this.getDiffusionImageUrl(clipped, seed, 1080, 1350, model);
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(14000) });
        const type = response.headers.get('content-type') || '';
        if (response.ok && (type.includes('image') || type.includes('octet-stream'))) {
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength > 2000 && this.imageIsSharpEnough(buffer)) {
            console.log(`[AI Image] ${model} produced the photo`);
            return buffer;
          }
          console.warn(`[AI Image] ${model} picture was too small or soft`);
        } else {
          console.warn(`[AI Image] ${model} status`, response.status);
        }
      } catch (error: any) {
        console.warn(`[AI Image] ${model} note:`, error.message);
      }
    }

    if (config.HF_TOKEN) {
      const hfModels = ['Tongyi-MAI/Z-Image-Turbo', 'black-forest-labs/FLUX.1-schnell'];
      for (const model of hfModels) {
        try {
          const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.HF_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'image/jpeg',
            },
            body: JSON.stringify({ inputs: clipped }),
            signal: AbortSignal.timeout(45000),
          });
          const type = response.headers.get('content-type') || '';
          if (response.ok && type.includes('image')) {
            const buffer = await response.arrayBuffer();
            if (buffer.byteLength > 2000) return buffer;
          }
        } catch (error: any) {
          console.warn(`[AI Image] ${model} note:`, error.message);
        }
      }
    }

    return null;
  },

  /**
   * Downloads image buffer from cloud diffusion and caches it locally
   * to eliminate any browser 402 rate-limit errors.
   */
  async cacheDiffusionImage(publicUrl: string, fileName: string): Promise<string> {
    const imagesDir = path.join(process.cwd(), 'data', 'generated_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const localFilePath = path.join(imagesDir, fileName);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      let resp = await fetch(publicUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      // If needed, retry with sanitized direct url
      if (!resp.ok) {
        const fallbackUrl = publicUrl.replace('&model=flux', '').replace('model=flux', '');
        console.log(`[AI Cache] Retrying with SANA linear diffusion for ${fileName}...`);
        const retryController = new AbortController();
        const retryTimeout = setTimeout(() => retryController.abort(), 15000);
        resp = await fetch(fallbackUrl, { signal: retryController.signal });
        clearTimeout(retryTimeout);
      }

      if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        if (buffer.byteLength > 2000) {
          fs.writeFileSync(localFilePath, Buffer.from(buffer));
          console.log(`[AI Cache] Saved ${fileName} locally (${buffer.byteLength} bytes)`);
          return `/api/ai/images/${fileName}`;
        }
      }
    } catch (err: any) {
      console.warn(`[AI Cache] Note on local caching for ${fileName}:`, err.message);
    }

    return publicUrl;
  },

  /**
   * Generates a complete Instagram post (Single Image or Multi-Slide Carousel)
   * tailored to the user's prompt using the restored, proven model algorithm.
   */
  async generatePost(params: {
    prompt: string;
    postType?: 'image' | 'carousel';
    slidesCount?: number;
    brandName?: string;
    instagramHandle?: string;
  }): Promise<GeneratedAiPost> {
    const { prompt, postType = 'image', slidesCount = 4, brandName = 'Aura Studio' } = params;

    if (!prompt || !prompt.trim()) {
      throw new Error('Please enter a description or topic for the post.');
    }

    const cleanPrompt = prompt.trim();
    const isCarousel = postType === 'carousel';
    const totalSlides = isCarousel ? Math.max(2, Math.min(slidesCount || 3, 3)) : 1;

    // 1. Generate Concept-Accurate Captions via RAG Engine (Zero Corporate Boilerplate)
    const ragResult = await CaptionRagService.generateCaptions({
      prompt: cleanPrompt,
      brandName,
    });

    const baseTitle = cleanPrompt
      .split(' ')
      .slice(0, 7)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const title = isCarousel ? `${baseTitle} (Swipe ->)` : baseTitle;

    // Select the best initial caption and tags from the 3 RAG options
    const primaryOption = isCarousel
      ? ragResult.captions[1] || ragResult.captions[0]
      : ragResult.captions[0];

    const caption = primaryOption?.caption || cleanPrompt;
    const hashtags = primaryOption?.hashtags || ['#VisualStorytelling', '#InstagramAesthetic', '#CreativeDirection'];

    // 2. Generate Real AI Visuals (Parallel generation for zero timeouts)
    const slides: CarouselSlide[] = [];
    const localImages: string[] = [];
    const publicMediaUrls: string[] = [];
    const timestamp = Date.now();
    const baseSeed = Math.floor(Math.random() * 900000 + 100000);

    const angles = [
      'wide photograph of this exact scene',
      'close-up photograph of the same subject',
      'three-quarter angle of the same scene',
      'detail photograph of the same scene',
      'another finished photograph of the same scene',
      'final photograph of the same scene',
    ];

    const slideIndices = Array.from({ length: totalSlides }, (_, idx) => idx);
    const generatedSlides: (CarouselSlide | null)[] = await Promise.all(
      slideIndices.map(async (i): Promise<CarouselSlide | null> => {
        const angle = angles[i] || angles[0];
        const promptToUse = totalSlides === 1
          ? cleanPrompt
          : `${cleanPrompt}. Slide ${i + 1}: ${angle}`;
        const enrichedPrompt = this.enhancePrompt(promptToUse, i === 0 ? 'cover' : 'insight');
        const slideSeed = baseSeed + i * 29;
        let buffer = await this.fetchImageBuffer(enrichedPrompt, slideSeed);

        if (!buffer) {
          // Fast guaranteed fallback so carousel never fails
          const fallbackUrl = this.getDiffusionImageUrl(enrichedPrompt.slice(0, 800), slideSeed, 1080, 1350, 'turbo');
          try {
            const resp = await fetch(fallbackUrl, { signal: AbortSignal.timeout(12000) });
            if (resp.ok) buffer = await resp.arrayBuffer();
          } catch {}
        }

        if (!buffer) {
          return null;
        }

        const header = new Uint8Array(buffer);
        const extension = header[0] === 0x89 && header[1] === 0x50
          ? 'png'
          : header[0] === 0x52 && header[1] === 0x49 && header[8] === 0x57
            ? 'webp'
            : 'jpg';
        const fileName = `post_${timestamp}_slide_${i + 1}.${extension}`;

        const imagesDir = path.join(process.cwd(), 'data', 'generated_images');
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
        fs.writeFileSync(path.join(imagesDir, fileName), Buffer.from(buffer));
        const servedUrl = `/api/ai/images/${fileName}`;

        const slide: CarouselSlide = {
          slideNumber: i + 1,
          title: i === 0 ? baseTitle : `${baseTitle} ${i + 1}`,
          subtitle: cleanPrompt.slice(0, 90),
          imageUrl: servedUrl,
          publicUrl: servedUrl,
        };
        return slide;
      })
    );

    const validSlides: CarouselSlide[] = generatedSlides.filter((s): s is CarouselSlide => Boolean(s));

    if (validSlides.length === 0) {
      throw new Error('Could not create an image for that description. Please try again.');
    }

    for (const s of validSlides) {
      slides.push(s);
      localImages.push(s.imageUrl);
      publicMediaUrls.push(s.publicUrl || s.imageUrl);
    }

    const track = await AudioService.pickForPrompt(cleanPrompt);
    const randomSong = {
      title: track.title,
      artist: track.artist,
      vibe: track.vibe,
      audioUrl: track.audioUrl,
    };

    return {
      title,
      caption,
      hashtags,
      postType,
      images: localImages,
      publicMediaUrls,
      slides,
      recommendedSong: randomSong,
      captionOptions: ragResult.captions,
      detectedConcept: ragResult.detected_concept,
      contentCategory: ragResult.content_category,
    };
  },
};
