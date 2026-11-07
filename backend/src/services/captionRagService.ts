import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface CaptionOption {
  style: string;
  caption: string;
  hashtags: string[];
}

export interface GeneratedCaptionsResult {
  detected_concept: string;
  content_category: string;
  captions: CaptionOption[];
}

export interface GenerateCaptionsParams {
  prompt: string;
  brandName?: string;
  brandCategory?: string;
  brandBio?: string;
  tone?: string;
}

export const CaptionRagService = {
  /**
   * Generates 3 concept-specific Instagram captions using a live free instruction-following LLM,
   * with Python RAG and local semantic fallback.
   */
  async generateCaptions(params: GenerateCaptionsParams): Promise<GeneratedCaptionsResult> {
    const {
      prompt,
      brandName = '',
      brandCategory = '',
      brandBio = '',
      tone = 'creative',
    } = params;

    if (!prompt || !prompt.trim()) {
      throw new Error('Please enter a description for the post.');
    }

    // 1. Free instruction models: Hugging Face when a token is configured, then Pollinations.
    try {
      const hfResult = await this.generateViaHuggingFace(params);
      if (hfResult && hfResult.captions.length >= 3) {
        console.log('[CaptionRagService] Hugging Face wrote 3 captions for:', prompt.slice(0, 40));
        return hfResult;
      }
    } catch (hfErr: any) {
      console.warn('[CaptionRagService] Hugging Face note:', hfErr.message);
    }

    try {
      const llmResult = await this.generateViaLiveLLM(params);
      if (llmResult && Array.isArray(llmResult.captions) && llmResult.captions.length >= 3) {
        console.log('[CaptionRagService] Live LLM successfully generated 3 dynamic captions for prompt:', prompt.slice(0, 40));
        return llmResult;
      }
    } catch (llmErr: any) {
      console.warn('[CaptionRagService] Live LLM note:', llmErr.message, 'Falling back to RAG pipeline.');
    }

    // 2. Try Local Python RAG Script
    const scriptPath = fs.existsSync(path.join(process.cwd(), 'backend', 'scripts', 'caption_rag_engine.py'))
      ? path.join(process.cwd(), 'backend', 'scripts', 'caption_rag_engine.py')
      : path.join(process.cwd(), 'scripts', 'caption_rag_engine.py');
    const inputPayload = JSON.stringify({
      prompt: prompt.trim(),
      brandName: brandName.trim(),
      brandCategory: brandCategory.trim(),
      brandBio: brandBio.trim(),
      tone: tone.trim(),
    });

    try {
      const pythonResult = await new Promise<string>((resolve, reject) => {
        const pyProcess = spawn('python', [scriptPath, '--input-json', inputPayload], {
          timeout: 6000,
        });

        let stdout = '';
        let stderr = '';

        pyProcess.stdout.on('data', (chunk) => {
          stdout += chunk.toString();
        });

        pyProcess.stderr.on('data', (chunk) => {
          stderr += chunk.toString();
        });

        pyProcess.on('close', (code) => {
          if (code === 0 && stdout.trim()) {
            resolve(stdout.trim());
          } else {
            reject(new Error(stderr || `Python engine exited with code ${code}`));
          }
        });

        pyProcess.on('error', (err) => {
          reject(err);
        });
      });

      const jsonMatch = pythonResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedCaptionsResult;
        if (parsed.captions && parsed.captions.length === 3) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn('[CaptionRagService] Python RAG note:', err.message, 'Using resilient semantic generator.');
    }

    // 3. Resilient semantic fallback in TypeScript matching the exact visual concept
    return this.fallbackSemanticCaptions(params);
  },

  stripEmoji(value: string): string {
    return String(value || '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  },

  parseCaptionPayload(raw: unknown, prompt: string): GeneratedCaptionsResult | null {
    let data = raw as any;
    if (typeof raw === 'string') {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        data = JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    if (data?.choices?.[0]?.message?.content) {
      return this.parseCaptionPayload(data.choices[0].message.content, prompt);
    }
    if (!data || !Array.isArray(data.captions) || data.captions.length < 3) return null;

    const styles = ['Short & Catchy', 'Creative & Aesthetic', 'Engaging & Relatable'];
    return {
      detected_concept: this.stripEmoji(data.detected_concept || prompt.slice(0, 80)),
      content_category: String(data.content_category || 'creative_visual'),
      captions: data.captions.slice(0, 3).map((caption: any, index: number) => ({
        style: styles[index],
        caption: this.stripEmoji(caption.caption || caption.text || ''),
        hashtags: Array.isArray(caption.hashtags)
          ? caption.hashtags
              .map((tag: any) => this.stripEmoji(String(tag)).trim())
              .filter(Boolean)
              .map((tag: string) => (tag.startsWith('#') ? tag : `#${tag}`))
          : [],
      })),
    };
  },

  captionInstruction(params: GenerateCaptionsParams): string {
    const brand = params.brandName?.trim() || 'the brand';
    return `You write Instagram captions. The post is exactly about this description: "${params.prompt}".
Brand name: "${brand}".
Return ONLY JSON:
{"detected_concept":"short summary using the user's own subject","content_category":"lifestyle","captions":[{"style":"Short & Catchy","caption":"...","hashtags":["#One","#Two","#Three","#Four","#Five"]},{"style":"Creative & Aesthetic","caption":"...","hashtags":["#One","#Two","#Three","#Four","#Five"]},{"style":"Engaging & Relatable","caption":"...","hashtags":["#One","#Two","#Three","#Four","#Five"]}]}
Rules:
- Each caption must mention the concrete subjects, place, action, and offer from the description. Do not replace them with a generic cafe, portrait, or business template.
- The three captions must be different: one short line, one sensory story, one question.
- Hashtags must come from words in the description.
- No emojis, no hashtags inside the caption text.`;
  },

  async generateViaHuggingFace(params: GenerateCaptionsParams): Promise<GeneratedCaptionsResult | null> {
    const token = (process.env.HF_TOKEN || '').trim();
    if (!token) return null;

    const models = [
      'Qwen/Qwen3-VL-8B-Instruct',
      'Qwen/Qwen3-VL-2B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
    ];

    for (const model of models) {
      try {
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(18000),
          body: JSON.stringify({
            model,
            temperature: 0.7,
            messages: [
              { role: 'system', content: 'You return only valid JSON for Instagram captions.' },
              { role: 'user', content: this.captionInstruction(params) },
            ],
          }),
        });
        if (!response.ok) {
          console.warn(`[Caption] ${model} status`, response.status);
          continue;
        }
        const parsed = this.parseCaptionPayload(await response.json(), params.prompt);
        if (parsed && parsed.captions.every((caption) => caption.caption.length >= 12)) {
          console.log(`[Caption] ${model} wrote the captions`);
          return parsed;
        }
      } catch (error: any) {
        console.warn(`[Caption] ${model} note:`, error.message);
      }
    }
    return null;
  },

  /**
   * Generates tailored captions via free serverless instruction LLM with zero emojis.
   */
  async generateViaLiveLLM(params: GenerateCaptionsParams): Promise<GeneratedCaptionsResult | null> {
    const { prompt } = params;
    const key = (process.env.POLLINATIONS_API_KEY || '').trim();

    // 1. If user provided Pollinations secret key, use fast, smart LLM (gpt-5.4-nano)
    if (key) {
      try {
        console.log('[Caption] Generating via Pollinations Pro LLM...');
        const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            model: 'openai/gpt-5.4-nano',
            messages: [
              {
                role: 'system',
                content:
                  'You write high-converting Instagram captions for any business. Return ONLY valid JSON with key "captions" array of 3 objects with keys: "style" ("Short & Catchy", "Creative & Aesthetic", "Engaging & Relatable"), "caption" (string, 2-3 sentences, concept-accurate, engaging), "hashtags" (array of 4-6 strings with # symbol). STRICT RULE: Do not use any emojis anywhere.',
              },
              { role: 'user', content: this.captionInstruction(params) },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const parsed = this.parseCaptionPayload(await response.json(), prompt);
          if (parsed && parsed.captions.length >= 3 && parsed.captions.every((c) => c.caption.length >= 12)) {
            console.log('[Caption] Pollinations Pro LLM generated 3 unique captions');
            return parsed;
          }
        }
      } catch (err: any) {
        console.warn('[Caption] Pollinations Pro LLM note:', err.message);
      }
    }

    // 2. Fallback to free public endpoint
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You write Instagram captions for any business. Return ONLY valid JSON.' },
            { role: 'user', content: this.captionInstruction(params) },
          ],
          jsonMode: true,
          seed: Math.floor(Math.random() * 900000 + 100000),
        }),
      });
      if (!response.ok) return null;
      const parsed = this.parseCaptionPayload(await response.json(), prompt);
      if (!parsed || parsed.captions.some((caption) => caption.caption.length < 12)) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  captionsFromDescription(params: GenerateCaptionsParams): GeneratedCaptionsResult {
    const prompt = params.prompt.trim().replace(/\s+/g, ' ');
    const brand = params.brandName?.trim();
    const lower = prompt.toLowerCase();
    const place = brand || 'our place';
    const sentence = prompt.charAt(0).toUpperCase() + prompt.slice(1).replace(/[.?!]+$/, '');
    const tags = new Set<string>();
    if (brand) tags.add(`#${brand.replace(/[^\p{L}\p{N}]/gu, '')}`);
    if (/cafe|coffee|tea/.test(lower)) tags.add('#CafeMoments');
    if (/minister|guest|visit|arrived/.test(lower)) tags.add('#SpecialVisit');
    if (/happy|joy|smile|love/.test(lower)) tags.add('#HappyDay');
    if (/food|cake|sweet|bakery/.test(lower)) tags.add('#FreshlyMade');
    if (/shop|store|opening/.test(lower)) tags.add('#ShopUpdate');
    const skip = new Set(['today', 'the', 'and', 'with', 'for', 'our', 'are', 'was', 'very', 'you', 'we', 'so', 'to', 'arrived']);
    const words = prompt
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !skip.has(word.toLowerCase()));
    if (words[0]) {
      const joined = words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
      tags.add(`#${joined}`);
    }
    const hashtags = [...tags].filter(Boolean).slice(0, 6);

    return {
      detected_concept: sentence.slice(0, 80),
      content_category: 'creative_visual',
      captions: [
        {
          style: 'Short & Catchy',
          caption: `${sentence}. ${place} is still smiling.`,
          hashtags,
        },
        {
          style: 'Creative & Aesthetic',
          caption: `Some moments change the whole room.\n\n${sentence}. At ${place}, that is a welcome we will remember.`,
          hashtags,
        },
        {
          style: 'Engaging & Relatable',
          caption: `${sentence}.\n\nWere you here for it? Tell ${place} how the moment felt.`,
          hashtags,
        },
      ],
    };
  },

  async generateViaLiveLLMUnused(params: GenerateCaptionsParams): Promise<GeneratedCaptionsResult | null> {
    const { prompt, brandName = '' } = params;

    // Generous timeout (25s) to allow LLM sufficient time to generate full structured JSON
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const brandContext = brandName ? ` for "${brandName}"` : '';
    const systemPrompt = `You are an elite Instagram copywriter and social media content strategist${brandContext}.
The user wants to publish an Instagram post based on this description: "${prompt}".
Analyze the specific subject, mood, and concept of "${prompt}".
Create exactly 3 distinct, high-converting caption options tailored specifically to what the user requested.
Do NOT output repetitive or generic corporate text.
Every option MUST be unique, creative, and directly talk about "${prompt}".
If the user mentions sweets, food, cafe, products, announcements, people, or events, write engaging copy specifically about that topic!
Return ONLY valid JSON matching this schema:
{
  "detected_concept": "3-5 word concept summary",
  "content_category": "promotional_offer | cafe_beverage | creative_visual | lifestyle | announcement | retail_food",
  "captions": [
    {
      "style": "Short & Catchy",
      "caption": "Punchy hook and direct message about ${prompt}",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    },
    {
      "style": "Creative & Aesthetic",
      "caption": "Story-driven, sensory details, and inviting atmosphere about ${prompt}",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    },
    {
      "style": "Engaging & Relatable",
      "caption": "Conversational, relatable moment, and a question or call to action to boost comments about ${prompt}",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }
  ]
}
CRITICAL RULES:
- NEVER use unicode emojis anywhere in text, captions, or hashtags.
- Do NOT repeat phrases like 'Framed with intention' or generic boilerplate.
- Ensure all 3 captions are vibrant, engaging, and directly centered on "${prompt}".`;

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate captions for: "${prompt}"` },
          ],
          jsonMode: true,
          seed: Math.floor(Math.random() * 900000 + 100000),
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as any;
      if (data && Array.isArray(data.captions) && data.captions.length >= 3) {
        // Strip any accidental emojis or non-ASCII symbols
        const cleanText = (str: string) =>
          String(str || '')
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '')
            .trim();

        return {
          detected_concept: cleanText(data.detected_concept || prompt.slice(0, 40)),
          content_category: data.content_category || 'creative_visual',
          captions: data.captions.slice(0, 3).map((c: any, idx: number) => ({
            style: idx === 0 ? 'Short & Catchy' : idx === 1 ? 'Creative & Aesthetic' : 'Engaging & Relatable',
            caption: cleanText(c.caption),
            hashtags: Array.isArray(c.hashtags)
              ? c.hashtags.map((h: any) => cleanText(h)).filter(Boolean)
              : ['#InstagramAesthetic', '#VisualStory', '#TrendingPost'],
          })),
        };
      }
    } catch {
      // Abort or network error handled by caller
    }

    return null;
  },

  /**
   * Resilient zero-latency semantic fallback generator in TypeScript.
   * Strictly adheres to visual concept and eliminates corporate fluff.
   */
  fallbackSemanticCaptions(params: GenerateCaptionsParams): GeneratedCaptionsResult {
    const prompt = params.prompt.trim();
    const lower = prompt.toLowerCase();
    const brandName = params.brandName || '';
    const brandPrefix = brandName ? ` at ${brandName}` : '';

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

    const isAnnouncement =
      lower.includes('coming soon') ||
      lower.includes('stall') ||
      lower.includes('opening') ||
      lower.includes('new store') ||
      lower.includes('launch') ||
      lower.includes('grand opening') ||
      lower.includes('introduce') ||
      lower.includes('introducing') ||
      lower.includes('announcement');

    const isSweetOrBakery =
      lower.includes('sweet') ||
      lower.includes('cake') ||
      lower.includes('dessert') ||
      lower.includes('pastry') ||
      lower.includes('bakery') ||
      lower.includes('mithai') ||
      lower.includes('confection') ||
      lower.includes('treat') ||
      lower.includes('chocolate');

    const isOffer =
      lower.includes('offer') ||
      lower.includes('special') ||
      lower.includes('discount') ||
      lower.includes('deal') ||
      lower.includes('sale') ||
      lower.includes('combo') ||
      lower.includes('50%');

    const isCoffee =
      lower.includes('coffee') ||
      lower.includes('latte') ||
      lower.includes('espresso') ||
      lower.includes('cappuccino') ||
      lower.includes('cafe') ||
      lower.includes('brew') ||
      lower.includes('tea') ||
      lower.includes('chai');

    const isSplit =
      lower.includes('separate cards') ||
      lower.includes('split card') ||
      lower.includes('cards') ||
      lower.includes('split screen') ||
      lower.includes('two cards') ||
      lower.includes('side by side');

    const hasSamePose =
      lower.includes('same pose') ||
      lower.includes('matching pose') ||
      lower.includes('identical pose');

    const isPerson =
      lower.includes('boy') ||
      lower.includes('girl') ||
      lower.includes('man') ||
      lower.includes('woman') ||
      lower.includes('person') ||
      lower.includes('people') ||
      lower.includes('model');

    let detectedConcept = 'Creative visual concept';
    let contentCategory = 'lifestyle';

    let capA = '';
    let tagsA: string[] = [];
    let capB = '';
    let tagsB: string[] = [];
    let capC = '';
    let tagsC: string[] = [];

    // Case 1: Festival & Mega Offers (Diwali, New Year, Pongal, Eid, etc.)
    if (isFestival) {
      detectedConcept = 'Festive Celebration & Mega Offer';
      contentCategory = 'promotional_offer';

      capA = `Festive vibes and mega celebrations${brandPrefix}! Celebrate this season with our special festive offers and joyful moments.`;
      tagsA = ['#FestiveSeason', '#MegaOffer', '#FestivalVibes', '#SpecialDeals', '#CelebrationTime', '#JoyAndLight'];

      capB = `Light, joy, and unforgettable celebrations.\n\nMay this festive season bring prosperity, happiness, and special memories to you and your family. Explore our festive specials${brandPrefix} and celebrate in style.\n\nWishing everyone a joyous and blessed celebration!`;
      tagsB = ['#FestiveVibes', '#CelebrationVibes', '#FestiveOffers', '#SpecialCollection', '#JoyfulMoments'];

      capC = `How are you celebrating this festival season?\n\nDrop a comment below with your favorite festival tradition, and do not miss our festive offers${brandPrefix}!`;
      tagsC = ['#FestiveCheer', '#CelebrateTogether', '#SpecialOffer', '#FestivalMoments', '#CommunityLove'];
    }
    // Case 2: Education (School, College, Admissions, Academy)
    else if (isEducation) {
      detectedConcept = 'Education & Campus Life';
      contentCategory = 'announcement';

      capA = `Shape your future with excellence${brandPrefix}! Admissions and enrollments are now open for passionate learners.`;
      tagsA = ['#EducationMatters', '#AdmissionsOpen', '#CampusLife', '#FutureLeaders', '#QualityEducation', '#LearningJourney'];

      capB = `Where curiosity meets opportunity.\n\nEmpowering students with knowledge, modern skills, and an inspiring learning community${brandPrefix}. Join a campus that prepares you for tomorrow.\n\nInquire today and start your journey!`;
      tagsB = ['#StudentLife', '#CollegeAdmissions', '#AcademicExcellence', '#CampusVibes', '#InspiringTomorrow'];

      capC = `What is your biggest educational or career goal for this year?\n\nShare your aspirations in the comments below! Inquiries and admissions are open${brandPrefix}.`;
      tagsC = ['#StudentCommunity', '#GoalGetter', '#StudyInspo', '#FutureReady', '#EducationGoals'];
    }
    // Case 3: Fashion, Clothing, Saree & Dress Shop
    else if (isFashion) {
      detectedConcept = 'Fashion & Boutique Collection';
      contentCategory = 'retail_fashion';

      capA = `Elevate your style with our newest fashion arrivals${brandPrefix}! Premium fabrics and timeless elegance.`;
      tagsA = ['#FashionBoutique', '#DressShop', '#SareeLove', '#StyleInspiration', '#OOTD', '#EthnicWear'];

      capB = `Crafted for elegance, designed to turn heads.\n\nFrom vibrant festive sarees to modern chic wear, explore our handpicked collection${brandPrefix}. Every piece tells a story of craftsmanship and poise.\n\nVisit our boutique today!`;
      tagsB = ['#BoutiqueStyle', '#SareeDraping', '#FashionLovers', '#NewArrivals', '#TraditionalWear'];

      capC = `Which style speaks to your personality: classic traditional elegance or modern chic?\n\nDrop your vote in the comments below! Tag someone who loves fashion!`;
      tagsC = ['#FashionDebate', '#StyleCheck', '#OutfitGoals', '#BoutiqueCollection', '#ChicVibes'];
    }
    // Case 4: Automotive, Vehicles, Bikes & Cars
    else if (isAutomotive) {
      detectedConcept = 'Automotive & Vehicle Showcase';
      contentCategory = 'automotive';

      capA = `Feel the thrill of the ride${brandPrefix}! Experience power, performance, and cutting-edge engineering.`;
      tagsA = ['#BikeShowroom', '#CarShowroom', '#RideInStyle', '#AutomotiveDaily', '#MotorcycleLife', '#DrivePower'];

      capB = `Engineered for those who live life in the fast lane.\n\nSleek aerodynamics, uncompromising performance, and pure thrill on every turn. Book your test ride or visit our showroom${brandPrefix} today.\n\nYour next journey starts here.`;
      tagsB = ['#TestRideToday', '#AutomotiveLovers', '#BikeLife', '#ShowroomLaunch', '#RideMore'];

      capC = `Dream machine status: where would you take this on your first road trip?\n\nComment your dream destination below! Bookings open${brandPrefix}.`;
      tagsC = ['#RoadTripReady', '#DreamRide', '#MotorcycleLovers', '#AutoEnthusiasts', '#RideFree'];
    }
    // Case 5: Announcements, Launches, Coming Soon, New Stalls / Stores
    else if (isAnnouncement) {
      const subject = isSweetOrBakery
        ? 'sweet stall'
        : isCoffee
        ? 'cafe corner'
        : prompt.replace(/coming soon/gi, '').trim() || 'new opening';

      detectedConcept = `Grand Opening & ${subject} Announcement`;
      contentCategory = 'announcement';
      const venuePrefix = brandName ? ` by ${brandName}` : '';

      capA = `Big announcement: Something special is on the way! Our brand-new ${subject}${venuePrefix} is opening soon.`;
      tagsA = ['#ComingSoon', '#GrandOpening', '#NewLaunch', '#StayTuned', '#ExcitingNews', '#CountdownBegins'];

      capB = `Crafted with passion, made for moments worth celebrating.\n\nWe have been working behind the scenes to bring you the freshest ${subject}${venuePrefix}. Doors are opening very soon.\n\nSave this post and stay tuned for the official launch date!`;
      tagsB = ['#NewStoreAlert', '#GrandOpeningSoon', '#FreshExperience', '#LocalFavorites', '#CelebrateWithUs'];

      capC = `The countdown officially starts now!\n\nWho is the first person you are bringing along to check out our ${subject}? Tag your crew in the comments below!`;
      tagsC = ['#CommunityFirst', '#OpeningSoon', '#TagYourFriends', '#MustVisit', '#FoodieCommunity'];
    }
    // Case 2: Sweet Stall / Bakery / Desserts
    else if (isSweetOrBakery) {
      detectedConcept = 'Artisan Sweets & Confections';
      contentCategory = 'retail_food';
      const cafePrefix = brandName ? ` at ${brandName}` : '';

      capA = `Fresh sweetness made to brighten every single moment. Treat yourself to our signature confections${cafePrefix}!`;
      tagsA = ['#SweetCravings', '#ArtisanSweets', '#DessertGram', '#SweetTreats', '#FreshBakes', '#SweetTooth'];

      capB = `There is nothing quite like freshly prepared, traditional sweets crafted to perfection.\n\nRich flavors, authentic recipes, and pure happiness in every bite${cafePrefix}. Made fresh daily.\n\nWhich sweet is your absolute go-to?`;
      tagsB = ['#TraditionalSweets', '#DessertLovers', '#FreshDaily', '#SweetIndulgence', '#TasteTheTradition'];

      capC = `A little sweetness makes everything better.\n\nDrop a comment below: are you team traditional sweets, warm bakery bakes, or chocolate cravings today?`;
      tagsC = ['#SweetDebate', '#DessertTime', '#SweetMoments', '#TreatYourself', '#FoodieLovers'];
    }
    // Case 3: Special Offers, Discounts & Combos
    else if (isOffer) {
      detectedConcept = 'Exclusive Special Offer';
      contentCategory = 'promotional_offer';
      const cafePrefix = brandName ? ` at ${brandName}` : '';

      capA = `Special treat alert: Enjoy our limited-time offer${cafePrefix} today! Upgrade your day with unbeatable value.`;
      tagsA = ['#SpecialOffer', '#LimitedTimeDeal', '#ExclusiveDeal', '#DailySavings', '#TreatYourself'];

      capB = `Your favorites, now at a special price.\n\nHandcrafted with the highest quality standards${cafePrefix}. Available for a limited time only, so do not miss out on this deal.\n\nTag someone who loves a great offer!`;
      tagsB = ['#DealOfTheDay', '#LimitedTime', '#BestDeals', '#OfferAlert', '#SaveMore'];

      capC = `Who said you cannot have top quality and a great deal at the same time?\n\nAvailable today${cafePrefix}. Comment below if you are grabbing this offer before it ends!`;
      tagsC = ['#SpecialDeal', '#MustTry', '#WeekendSpecial', '#CommunityOffer', '#DontMissOut'];
    }
    // Case 4: Split Cards / Duo Poses
    else if (isSplit && hasSamePose) {
      detectedConcept = 'Split-card visual with matching poses';
      contentCategory = 'creative_visual';

      capA = 'Mirroring energy across the frame. Two perspectives, one matching frequency.';
      tagsA = ['#CreativePortraits', '#SplitVisual', '#MatchingEnergy', '#VisualAesthetic', '#CleanComposition'];

      capB = `Separated by the frame, connected by the posture.\n\nClean borders, balanced light, and identical postures. Sometimes the strongest connection is visual harmony.\n\nSwipe through to see both cards up close.`;
      tagsB = ['#VisualStorytelling', '#PortraitsInSync', '#AestheticLayout', '#CreativeConcept', '#EditorialVisuals'];

      capC = `Proof that you can be in completely separate frames and still channel the exact same energy.\n\nBe honest in the comments: which frame pulled off the pose better, left or right?`;
      tagsC = ['#RelatableMoments', '#BestieEnergy', '#MatchingPoses', '#DuoConcept', '#CommunityVibes'];
    }
    // Case 5: Coffee & Cafe Craft
    else if (isCoffee) {
      detectedConcept = 'Artisan coffee craft and cafe atmosphere';
      contentCategory = 'cafe_beverage';
      const cafePrefix = brandName ? ` at ${brandName}` : '';

      capA = `First sip of the morning hits different. Perfectly pulled, freshly poured${cafePrefix}.`;
      tagsA = ['#CoffeeCulture', '#LatteArtDaily', '#CafeVibes', '#SpecialtyRoast', '#CoffeeLovers'];

      capB = `The quiet craft of brewing something meant to be savored slowly.\n\nVelvety microfoam over rich espresso${cafePrefix}. Protecting the first hour of your day.\n\nTake a pause and enjoy the brew.`;
      tagsB = ['#CoffeeLovers', '#SpecialtyCoffee', '#ArtisanBrew', '#MorningRitual', '#CozyMoments'];

      capC = `That first morning brew before the rush begins.\n\nAre you team hot espresso or iced coffee regardless of the weather? Drop your vote below!`;
      tagsC = ['#CoffeeDebate', '#DailyBrew', '#CafeCommunity', '#CoffeeAddict', '#MorningRoutine'];
    }
    // Case 6: Portraits & People
    else if (isPerson) {
      detectedConcept = 'Bright candid lifestyle portrait';
      contentCategory = 'lifestyle';

      capA = `Natural light, authentic mood, and effortless confidence. Making today count.`;
      tagsA = ['#CandidPortrait', '#NaturalLight', '#DailyLifestyle', '#EffortlessVibes', '#Confidence'];

      capB = `Golden natural light and genuine moments.\n\nNo forced angles, just clear vibrant energy and candid details.\n\nSwipe through for the full frame.`;
      tagsB = ['#PortraitPerfection', '#BrightAesthetic', '#GoldenLight', '#AuthenticMood', '#CleanVisuals'];

      capC = `A bright day and a clear mindset.\n\nHow is your day shaping up? Share your energy in the comments below!`;
      tagsC = ['#GoodVibesOnly', '#DailyInspo', '#PositiveEnergy', '#LifeInMotion', '#CommunityVibes'];
    }
    // Case 7: General Subject-Specific Dynamic Generation
    else {
      const cleanWords = prompt
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2);

      const capitalizedTopic = cleanWords
        .slice(0, 4)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const promptTags = cleanWords.slice(0, 4).map((w) => `#${w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}`);

      detectedConcept = `${capitalizedTopic || 'Creative Visual'} Presentation`;
      contentCategory = 'creative_visual';

      capA = `Spotlight on ${prompt}. Curated with precision, vibrant energy, and intention.`;
      tagsA = [...promptTags, '#InstaCreative', '#ModernVisuals', '#CleanDesign'];

      capB = `Taking inspiration from ${prompt}.\n\nBright, vivid composition where every element has its place. Designed to stop the scroll and inspire.\n\nSave this post for your visual inspiration board!`;
      tagsB = [...promptTags, '#VisualInspiration', '#CreativePerspective', '#DesignFeed', '#VibrantAesthetic'];

      capC = `What catches your eye first about ${prompt}?\n\nDrop your thoughts and reactions in the comments below!`;
      tagsC = [...promptTags, '#CommunityThoughts', '#InteractivePost', '#DailyInspiration', '#CreativeMinds'];
    }

    return {
      detected_concept: detectedConcept,
      content_category: contentCategory,
      captions: [
        {
          style: 'Short & Catchy',
          caption: capA,
          hashtags: tagsA,
        },
        {
          style: 'Creative & Aesthetic',
          caption: capB,
          hashtags: tagsB,
        },
        {
          style: 'Engaging & Relatable',
          caption: capC,
          hashtags: tagsC,
        },
      ],
    };
  },
};


