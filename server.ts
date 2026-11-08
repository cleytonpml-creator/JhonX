import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Phonics normalization & Speech-to-Text aliases for British English learning
const PHONETIC_ALIASES: Record<string, string[]> = {
  // Letters
  a: ['a', 'ay', 'eh', 'ey', 'an'],
  b: ['b', 'bee', 'be'],
  c: ['c', 'see', 'sea', 'si', 'k'],
  d: ['d', 'dee'],
  e: ['e', 'ee'],
  f: ['f', 'ef', 'eff'],
  g: ['g', 'gee', 'jee'],
  h: ['h', 'aitch', 'eitch', 'ha'],
  i: ['i', 'eye', 'aye'],
  j: ['j', 'jay'],
  k: ['k', 'kay', 'c'],
  l: ['l', 'el', 'ell'],
  m: ['m', 'em'],
  n: ['n', 'en', 'an'],
  o: ['o', 'oh'],
  p: ['p', 'pee', 'pea', 'pi'],
  q: ['q', 'cue', 'queue'],
  r: ['r', 'are', 'ar'],
  s: ['s', 'es', 'ess', 'is', 'as', 'ass', 'yes'],
  t: ['t', 'tee', 'tea', 'ti'],
  u: ['u', 'you'],
  v: ['v', 'vee'],
  w: ['w', 'double u', 'double you'],
  x: ['x', 'ex'],
  y: ['y', 'why'],
  z: ['z', 'zed', 'zee'],

  // Common phonics words
  cat: ['cat', 'kat', 'katt', 'chat', 'cats'],
  hat: ['hat', 'hatt', 'hot', 'hut', 'hats'],
  sun: ['sun', 'son', 'sunn', 'suns'],
  bus: ['bus', 'buss', 'busses', 'buzz'],
  dog: ['dog', 'dogg', 'dogs'],
  fox: ['fox', 'foxes', 'focks'],
  cup: ['cup', 'cupp', 'cups'],
  bed: ['bed', 'bedd', 'beds'],
  van: ['van', 'vann', 'vans'],
  jam: ['jam', 'jamm', 'jams'],
  pin: ['pin', 'pinn', 'pins'],
  tap: ['tap', 'tapp', 'taps'],
  sit: ['sit', 'sitt', 'sits'],
  sat: ['sat', 'satt'],
  pat: ['pat', 'patt'],
  tin: ['tin', 'tinn'],
  pan: ['pan', 'pann', 'pans'],
  top: ['top', 'topp', 'tops'],
  pot: ['pot', 'pott', 'pots'],
  man: ['man', 'mann'],
  run: ['run', 'runn', 'runs'],
  mud: ['mud', 'mudd'],
  map: ['map', 'mapp', 'maps'],
  leg: ['leg', 'legg', 'legs'],
  red: ['red', 'redd', 'read'],
  big: ['big', 'bigg'],
  pig: ['pig', 'pigg', 'pigs'],
  bat: ['bat', 'batt', 'bats'],
  mat: ['mat', 'matt', 'mats'],
  rat: ['rat', 'ratt', 'rats'],
  fit: ['fit', 'fitt'],
  hit: ['hit', 'hitt'],
  hot: ['hot', 'hott'],
  nut: ['nut', 'nutt', 'nuts'],
  cut: ['cut', 'cutt', 'cuts'],
  hop: ['hop', 'hopp', 'hops'],
  pop: ['pop', 'popp', 'pops'],
  tag: ['tag', 'tagg', 'tags'],
  bag: ['bag', 'bagg', 'bags'],
  tea: ['tea', 'tee'],
  river: ['river', 'rivver'],
  guard: ['guard', 'gard'],
  street: ['street', 'streat'],
  clock: ['clock', 'clok'],
};

function normalizeBritishPhonics(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripArticlesAndFillers(text: string): string {
  return text
    .replace(/^(the|a|an|it is|its|it\'s|letter|the letter|sound|the sound)\s+/i, '')
    .trim();
}

function evaluateSpeechPronunciation(target: string, spoken: string, category: 'word' | 'sentence' | 'story') {
  const normTarget = normalizeBritishPhonics(target);
  const normSpoken = normalizeBritishPhonics(spoken);
  const strippedTarget = stripArticlesAndFillers(normTarget);
  const strippedSpoken = stripArticlesAndFillers(normSpoken);

  if (!normSpoken || normSpoken === 'no speech heard' || normSpoken === 'silence') {
    return {
      status: 'needs_practice' as const,
      score: 0,
      isPass: false,
      isExact: false,
      confidence: 1,
    };
  }

  // Exact match after removing punctuation and extra spaces
  if (normTarget === normSpoken || strippedTarget === strippedSpoken || normTarget === strippedSpoken) {
    return {
      status: 'perfect' as const,
      score: 100,
      isPass: true,
      isExact: true,
      confidence: 1,
    };
  }

  // Check phonetic aliases for single words/letters
  const aliases = PHONETIC_ALIASES[strippedTarget] || PHONETIC_ALIASES[normTarget] || [];
  if (aliases.includes(strippedSpoken) || aliases.includes(normSpoken)) {
    return {
      status: 'perfect' as const,
      score: 100,
      isPass: true,
      isExact: true,
      confidence: 1,
    };
  }

  // Category sentence / story: Word overlap analysis
  if (category === 'sentence' || category === 'story' || normTarget.includes(' ')) {
    const targetWords = normTarget.split(' ').filter(Boolean);
    const spokenWords = normSpoken.split(' ').filter(Boolean);

    if (targetWords.length > 0) {
      let matched = 0;
      for (const tw of targetWords) {
        if (spokenWords.includes(tw)) {
          matched++;
        } else {
          const wordAliases = PHONETIC_ALIASES[tw] || [];
          if (wordAliases.some((a) => spokenWords.includes(a))) {
            matched++;
          }
        }
      }

      const ratio = matched / targetWords.length;
      if (ratio >= 0.75) {
        return {
          status: 'perfect' as const,
          score: Math.round(90 + ratio * 10),
          isPass: true,
          isExact: ratio === 1,
          confidence: ratio,
        };
      }
      if (ratio >= 0.5) {
        return {
          status: 'perfect' as const,
          score: 85,
          isPass: true,
          isExact: false,
          confidence: ratio,
        };
      }
    }
  }

  // Partial match: spoken contains target or target contains spoken
  const isContained =
    strippedSpoken.length >= 2 &&
    (strippedSpoken.includes(strippedTarget) || strippedTarget.includes(strippedSpoken));

  if (isContained) {
    return {
      status: 'perfect' as const,
      score: 90,
      isPass: true,
      isExact: false,
      confidence: 0.85,
    };
  }

  // Actual mistake / mismatch
  return {
    status: 'needs_practice' as const,
    score: 55,
    isPass: false,
    isExact: false,
    confidence: 0.5,
  };
}

// Jhonx London AI Phonics Coach Endpoint (Voice Evaluation & Error Diagnostics)
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { targetText, spokenText, category = 'word', phonicsBreakdown } = req.body;

    const safeTarget = (targetText || '').trim();
    const safeSpoken = (spokenText || '').trim();
    const safeCategory = category; // 'word' | 'sentence' | 'story'

    // Handle silence / no speech heard before anything else
    if (!safeSpoken || safeSpoken.toLowerCase() === '(no speech heard)' || safeSpoken.toLowerCase() === '(silence)') {
      return res.json({
        success: true,
        aiGenerated: false,
        evaluation: {
          status: 'needs_practice',
          score: 0,
          celebrationTitle: "WE DIDN'T HEAR YOU! 🎤",
          mascotMood: 'thinking',
          coachTip: `We couldn't hear your voice. Please check that your microphone is unmuted, speak clearly in British English, and try again!`,
          mouthTip: 'Check your microphone and speak loud and clear into your device!',
          errorHighlight: 'No speech detected.',
          soundCorrection: `Listen to "${safeTarget}" using the audio button, then tap Try Again to speak!`,
          canAutoAdvance: false,
          phonemeFeedback: (phonicsBreakdown || []).map((ph: string) => ({
            phoneme: ph,
            status: 'needs_practice',
          })),
          starsEarned: 0,
        },
      });
    }

    const evaluationResult = evaluateSpeechPronunciation(safeTarget, safeSpoken, safeCategory);

    // If verified as accurate by high-precision phonics engine, reward immediately
    if (evaluationResult.isPass) {
      return res.json({
        success: true,
        aiGenerated: false,
        evaluation: {
          status: 'perfect',
          score: evaluationResult.score,
          celebrationTitle: 'BRILLIANT! 🌟',
          mascotMood: 'celebrating',
          coachTip: `Top marks! You pronounced "${safeTarget}" with authentic British English clarity!`,
          mouthTip: 'Your lips and tongue were in the exact right position! Keep it up!',
          errorHighlight: '',
          soundCorrection: 'Super reading! Ready for the next London stop!',
          canAutoAdvance: true,
          phonemeFeedback: (phonicsBreakdown || []).map((ph: string) => ({
            phoneme: ph,
            status: 'correct',
          })),
          starsEarned: 40,
        },
      });
    }

    // If child made an error and Gemini API Key is available, ask Gemini for personalized pedagogical guidance
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are "Jhonx London AI Phonics Coach", an encouraging, world-class British English phonics and pronunciation tutor for children aged 4 to 9.
Your goal is to evaluate what the child was supposed to say (targetText) against what speech recognition captured (spokenText).

CHILD PHONICS EVALUATION RULES (CRITICAL):
1. ACCURACY & FAIRNESS:
   - NEVER penalize for punctuation differences (e.g. "." at the end of a sentence), capitalisation, or speech recognition artifacts.
   - Speech-to-text often prepends "a" or "the" (e.g. child says "cat" and speech engine transcribes "a cat", or child reads "The bus" and engine says "bus"). Treat these as CORRECT!
   - Speech-to-text often spells single letters phonetically (e.g. child says /s/ and engine transcribes "s", "es", "ess", "is"; child says "T" and engine says "tea" or "tee"; child says "C" and engine says "see" or "sea"; child says "cat" and engine says "Kat"). Treat these as 100% CORRECT!
   - For sentences: If the child pronounced all or most (>= 75%) of the words in the sentence correctly, status MUST BE "perfect" or "almost" with score >= 85 and canAutoAdvance: true!
   - If the pronunciation is correct, status MUST BE "perfect", score: 95-100, canAutoAdvance: true, errorHighlight: "", and celebrationTitle: "BRILLIANT! 🌟".
2. WHEN CHILD MAKES A GENUINE MISTAKE (e.g., said completely wrong word like "dog" for "cat", or severe mispronunciation):
   - status: "needs_practice", score: 45-60, canAutoAdvance: false.
   - celebrationTitle: "LET'S TRY AGAIN! 🔄"
   - errorHighlight: Clearly explain WHERE the child made an error in simple words for a 5-year-old (e.g. "We heard 'COT' instead of 'CAT'. Check the middle /æ/ vowel sound!").
   - soundCorrection: Give an actionable physical mouth/tongue shape hint for how to fix that sound (e.g. "Open your jaw wide like a cheerful lion to say /æ/!").
3. NEVER mention any competitor app names or third-party brands under any circumstances.
4. Always be cheerful, motivating, and kind.`;

        const prompt = `Target British English ${safeCategory}: "${safeTarget}"
Phonics sounds breakdown: ${JSON.stringify(phonicsBreakdown || [])}
Child's spoken transcript heard: "${safeSpoken}"

Evaluate pronunciation, identify any mistakes or mispronounced sounds, and provide child-friendly feedback.`;

        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: {
                  type: Type.STRING,
                  description: '"perfect" if pronounced accurately, "almost" if close, "needs_practice" if incorrect.',
                },
                score: {
                  type: Type.INTEGER,
                  description: 'Score from 50 to 100.',
                },
                celebrationTitle: {
                  type: Type.STRING,
                  description: 'Short cheery title with emoji (e.g., "BRILLIANT! 🌟", "LET\'S TRY AGAIN! 🔄", "SPLENDID! 🇬🇧").',
                },
                mascotMood: {
                  type: Type.STRING,
                  description: '"celebrating", "encouraging", or "thinking".',
                },
                coachTip: {
                  type: Type.STRING,
                  description: 'Friendly 1-2 sentence tip explaining how the child pronounced the word in UK English.',
                },
                mouthTip: {
                  type: Type.STRING,
                  description: 'Physical mouth/tongue shape hint for British phonics.',
                },
                errorHighlight: {
                  type: Type.STRING,
                  description: 'Clear statement of where the child erred. Empty if perfect.',
                },
                soundCorrection: {
                  type: Type.STRING,
                  description: 'Encouraging instruction on how to pronounce the tricky part correctly.',
                },
                canAutoAdvance: {
                  type: Type.BOOLEAN,
                  description: 'true if the child passed and should advance; false if they made a mistake and must try again.',
                },
                phonemeFeedback: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phoneme: { type: Type.STRING },
                      status: { type: Type.STRING, description: '"correct" or "needs_practice"' },
                    },
                    required: ['phoneme', 'status'],
                  },
                },
                starsEarned: {
                  type: Type.INTEGER,
                  description: 'Stars awarded to the child (between 15 and 50).',
                },
              },
              required: [
                'status',
                'score',
                'celebrationTitle',
                'mascotMood',
                'coachTip',
                'mouthTip',
                'errorHighlight',
                'soundCorrection',
                'canAutoAdvance',
                'phonemeFeedback',
                'starsEarned',
              ],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 4500)
        );

        const response = (await Promise.race([aiPromise, timeoutPromise])) as any;
        const parsed = JSON.parse(response.text || '{}');

        return res.json({
          success: true,
          aiGenerated: true,
          evaluation: parsed,
        });
      } catch (geminiError) {
        console.warn('Gemini AI evaluation timed out or failed, using local rule fallback:', geminiError);
      }
    }

    // Default pedagogical feedback for genuine mistake
    return res.json({
      success: true,
      aiGenerated: false,
      evaluation: {
        status: 'needs_practice',
        score: 55,
        celebrationTitle: "LET'S TRY AGAIN! 🔄",
        mascotMood: 'thinking',
        coachTip: `We heard "${safeSpoken || 'something else'}". Listen to the British sound and let's try "${safeTarget}" again!`,
        mouthTip: 'Open your mouth nice and wide for the vowel sound and speak clearly!',
        errorHighlight: `We heard "${safeSpoken || 'a different sound'}" instead of "${safeTarget}". Check each sound carefully!`,
        soundCorrection: `Listen to "${safeTarget}" with the native audio button, then press Try Again!`,
        canAutoAdvance: false,
        phonemeFeedback: (phonicsBreakdown || []).map((ph: string, idx: number) => ({
          phoneme: ph,
          status: idx === 1 ? 'needs_practice' : 'correct',
        })),
        starsEarned: 15,
      },
    });
  } catch (error: any) {
    console.error('Error in AI Coach endpoint:', error);
    return res.status(500).json({ error: 'Internal server error in AI coach' });
  }
});

// Dynamic AI Content Generator Endpoint (Prevents repetitive loops as children advance)
app.post('/api/ai/generate-content', async (req, res) => {
  try {
    const { type, level = 1, excludeList = [] } = req.body;
    const safeType = type || 'phonics'; // 'phonics' | 'sentences' | 'stories'
    const safeLevel = Math.min(4, Math.max(1, Number(level) || 1));

    if (!process.env.GEMINI_API_KEY) {
      // Fallback generator when offline
      return res.json({
        success: true,
        aiGenerated: false,
        content: getOfflineDynamicContent(safeType, safeLevel, excludeList),
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    if (safeType === 'phonics') {
      const prompt = `Generate 5 brand new, exciting British English phonics words for Level ${safeLevel} children.
Do NOT use any of these already used words: ${JSON.stringify(excludeList.slice(-20))}.
Level definitions:
- Level 1: 3-letter CVC starter words (e.g. FAN, CUP, BAT, BED, HOP, RUN).
- Level 2: 4-letter blends and digraphs sh, ch, th, ck, ll (e.g. CHIP, MOTH, CRAB, NEST, KING, PLUM).
- Level 3: Long vowels and vowel teams (e.g. RAIN, GOAT, SHEET, TOAD, BIKE, SKATE).
- Level 4: Multi-syllable British vocabulary and London landmarks (e.g. MUSEUM, THAMES, GARDEN, GUARDS, ABBEY).

For each word, assign a charming London landmark or location, emoji, phonetic IPA breakdown array (e.g. ["/k/", "/æ/", "/t/"]), and a short 1-sentence kid hint.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 4000)
      );

      const aiRes = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an expert British English phonics curriculum designer for young learners in London.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                stops: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      word: { type: Type.STRING },
                      location: { type: Type.STRING },
                      phonics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      emoji: { type: Type.STRING },
                      hint: { type: Type.STRING },
                    },
                    required: ['id', 'word', 'location', 'phonics', 'emoji', 'hint'],
                  },
                },
              },
              required: ['stops'],
            },
          },
        }),
        timeoutPromise,
      ])) as any;

      const parsed = JSON.parse(aiRes.text || '{}');
      return res.json({
        success: true,
        aiGenerated: true,
        content: parsed.stops || [],
      });
    }

    if (safeType === 'sentences') {
      const prompt = `Generate 4 brand new UK English sentences for children aged 5 to 8 at difficulty level ${safeLevel}.
Do NOT use sentences with these words: ${JSON.stringify(excludeList.slice(-15))}.
Ensure authentic British vocabulary (e.g. "double-decker bus", "underground train", "cuppa tea", "puddles in the park", "Big Ben").
Include location, emoji, wordCount, and phonicsHighlights.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 4000)
      );

      const aiRes = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sentences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      sentence: { type: Type.STRING },
                      location: { type: Type.STRING },
                      wordsCount: { type: Type.INTEGER },
                      emoji: { type: Type.STRING },
                      theme: { type: Type.STRING },
                      phonicsHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['id', 'sentence', 'location', 'wordsCount', 'emoji', 'theme', 'phonicsHighlights'],
                  },
                },
              },
              required: ['sentences'],
            },
          },
        }),
        timeoutPromise,
      ])) as any;

      const parsed = JSON.parse(aiRes.text || '{}');
      return res.json({
        success: true,
        aiGenerated: true,
        content: parsed.sentences || [],
      });
    }

    // Default: Stories
    const prompt = `Generate 3 new London micro-adventure stories (each 3 to 4 sentences long) for Level ${safeLevel} young learners.
Focus on fun adventures in London (e.g. visiting Hamleys, crossing Tower Bridge, meeting the Queen's Corgis, finding a dinosaur at the Natural History Museum).
Return title, location, paragraphs array, emoji, and targetWords array.`;

    const timeoutPromiseStory = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout')), 4000)
    );

    const aiRes = (await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    location: { type: Type.STRING },
                    paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    emoji: { type: Type.STRING },
                    targetWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['id', 'title', 'location', 'paragraphs', 'emoji', 'targetWords'],
                },
              },
            },
            required: ['stories'],
          },
        },
      }),
      timeoutPromiseStory,
    ])) as any;

    const parsed = JSON.parse(aiRes.text || '{}');
    return res.json({
      success: true,
      aiGenerated: true,
      content: parsed.stories || [],
    });
  } catch (error: any) {
    console.error('Error in AI generate-content endpoint:', error);
    const safeType = req.body?.type || 'phonics';
    const safeLevel = Number(req.body?.level) || 1;
    const excludeList = req.body?.excludeList || [];

    return res.json({
      success: true,
      aiGenerated: false,
      content: getOfflineDynamicContent(safeType, safeLevel, excludeList),
    });
  }
});

// Helper for rich offline dynamic content generation to avoid repetition
function getOfflineDynamicContent(type: string, level: number, excludeList: string[]) {
  const timestamp = Date.now();
  const excludeSet = new Set(excludeList.map((w: string) => w.toUpperCase()));

  if (type === 'phonics') {
    const candidatesByLevel: Record<number, any[]> = {
      1: [
        { word: 'BAT', location: 'London Eye 🎡', phonics: ['/b/', '/æ/', '/t/'], emoji: '🦇', hint: 'Flapping above the Thames.' },
        { word: 'CUP', location: 'Covent Garden ☕', phonics: ['/k/', '/ʌ/', '/p/'], emoji: '☕', hint: 'A warm British cup of tea.' },
        { word: 'BED', location: 'Kensington Hotel 🛏️', phonics: ['/b/', '/e/', '/d/'], emoji: '🛏️', hint: 'Resting after a day in London.' },
        { word: 'HOP', location: 'Regent Park 🐰', phonics: ['/h/', '/ɒ/', '/p/'], emoji: '🐰', hint: 'Rabbits hopping on the grass.' },
        { word: 'RUN', location: 'Marathon Path 🏃', phonics: ['/r/', '/ʌ/', '/n/'], emoji: '🏃', hint: 'Running past Big Ben.' },
        { word: 'NET', location: 'Wimbledon Lawn 🎾', phonics: ['/n/', '/e/', '/t/'], emoji: '🎾', hint: 'Tennis court net in London.' },
        { word: 'PIN', location: 'Savile Row 🪡', phonics: ['/p/', '/ɪ/', '/n/'], emoji: '🪡', hint: 'Sewing a fine London coat.' },
        { word: 'MAP', location: 'Underground Tube 🗺️', phonics: ['/m/', '/æ/', '/p/'], emoji: '🗺️', hint: 'Guiding you through London.' },
      ],
      2: [
        { word: 'CRAB', location: 'Thames Estuary 🦀', phonics: ['/k/', '/r/', '/æ/', '/b/'], emoji: '🦀', hint: 'Crawling on river pebbles.' },
        { word: 'CHIP', location: 'Fish & Chips Shop 🍟', phonics: ['/tʃ/', '/ɪ/', '/p/'], emoji: '🍟', hint: 'Crispy golden potato chips.' },
        { word: 'PLUM', location: 'Spitalfields Market 🫐', phonics: ['/p/', '/l/', '/ʌ/', '/m/'], emoji: '🫐', hint: 'Sweet fruit from the market stall.' },
        { word: 'MOTH', location: 'Natural History Museum 🦋', phonics: ['/m/', '/ɒ/', '/θ/'], emoji: '🦋', hint: 'Fluttering near old lanterns.' },
        { word: 'FLAG', location: 'Parliament Roof 🇬🇧', phonics: ['/f/', '/l/', '/æ/', '/g/'], emoji: '🇬🇧', hint: 'The Union Jack waving high.' },
        { word: 'KING', location: 'Windsor Hall 👑', phonics: ['/k/', '/ɪ/', '/ŋ/'], emoji: '👑', hint: 'Wearing a shining gold crown.' },
      ],
      3: [
        { word: 'RAIN', location: 'London Drizzle 🌧️', phonics: ['/r/', '/eɪ/', '/n/'], emoji: '🌧️', hint: 'Pitter-patter puddles in London.' },
        { word: 'GOAT', location: 'City Farm 🐐', phonics: ['/g/', '/əʊ/', '/t/'], emoji: '🐐', hint: 'Munching green clover.' },
        { word: 'SHEET', location: 'London Hotel 🛏️', phonics: ['/ʃ/', '/iː/', '/t/'], emoji: '🛏️', hint: 'Clean crisp bed sheet.' },
        { word: 'BIKE', location: 'Hyde Park Cycle 🚲', phonics: ['/b/', '/aɪ/', '/k/'], emoji: '🚲', hint: 'Renting a red city bicycle.' },
        { word: 'SKATE', location: 'Southbank Undercroft 🛹', phonics: ['/s/', '/k/', '/eɪ/', '/t/'], emoji: '🛹', hint: 'Skateboarding along the river.' },
      ],
      4: [
        { word: 'MUSEUM', location: 'British Museum 🏛️', phonics: ['/m/', '/j/', '/uː/', '/z/', '/iː/', '/ə/', '/m/'], emoji: '🏛️', hint: 'Ancient treasures and mummies.' },
        { word: 'GUARDS', location: 'Buckingham Gate 💂', phonics: ['/g/', '/ɑː/', '/d/', '/z/'], emoji: '💂', hint: 'Red tunics and tall bearskin hats.' },
        { word: 'ABBEY', location: 'Westminster Abbey ⛪', phonics: ['/æ/', '/b/', '/i/'], emoji: '⛪', hint: 'Historic coronation cathedral.' },
        { word: 'THAMES', location: 'River Walkway 🌊', phonics: ['/t/', '/e/', '/m/', '/z/'], emoji: '🌊', hint: 'The great winding river.' },
        { word: 'LONDON', location: 'City Skyline 🇬🇧', phonics: ['/l/', '/ʌ/', '/n/', '/d/', '/ə/', '/n/'], emoji: '🇬🇧', hint: 'The magical capital city.' },
      ],
    };

    const pool = candidatesByLevel[level] || candidatesByLevel[1];
    const fresh = pool.filter((c) => !excludeSet.has(c.word));
    const selected = (fresh.length >= 4 ? fresh : pool).slice(0, 5);

    return selected.map((item, idx) => ({
      id: timestamp + idx,
      ...item,
    }));
  }

  if (type === 'sentences') {
    return [
      {
        id: timestamp + 1,
        sentence: 'The big red bus crossed the bridge.',
        location: 'Tower Bridge 🌉',
        wordsCount: 7,
        emoji: '🚌',
        theme: 'London Transport',
        phonicsHighlights: ['/b/', '/e/', '/dʒ/'],
      },
      {
        id: timestamp + 2,
        sentence: 'A clever cat sat on the mat.',
        location: 'Camden Town 🛹',
        wordsCount: 7,
        emoji: '🐱',
        theme: 'CVC Phonics',
        phonicsHighlights: ['/k/', '/æ/', '/t/'],
      },
      {
        id: timestamp + 3,
        sentence: 'Look at the golden clock on the tower.',
        location: 'Big Ben 🕰️',
        wordsCount: 8,
        emoji: '🕰️',
        theme: 'London Sights',
        phonicsHighlights: ['/l/', '/ʊ/', '/k/'],
      },
    ];
  }

  // Stories
  return [
    {
      id: timestamp + 1,
      title: 'The Secret River Thames Adventure',
      location: 'Southbank Pier ⚓',
      paragraphs: [
        'Alex saw a friendly duck swimming near London Bridge.',
        'The duck had a tiny red backpack and quacked a cheerful tune.',
        'Together they sailed on a yellow clipper boat down the River Thames!',
      ],
      emoji: '🦆',
      targetWords: ['DUCK', 'BOAT', 'RIVER', 'BRIDGE'],
    },
    {
      id: timestamp + 2,
      title: 'The Clocktower Mystery',
      location: 'Westminster Bell 🔔',
      paragraphs: [
        'A fluffy owl landed right beside the giant clock face of Big Ben.',
        'It held an old brass key that clicked inside a secret door.',
        'Inside was a treasure chest filled with shiny golden reading stars!',
      ],
      emoji: '🦉',
      targetWords: ['BELL', 'CLOCK', 'STAR', 'KEY'],
    },
  ];
}

// Adaptive Phonics Sequence Generator (Adapts dynamically to child progress profile)
app.post('/api/ai/adaptive-sequence', async (req, res) => {
  try {
    const {
      childName = 'Explorer',
      currentLevel = 1,
      accuracy = 80,
      consecutiveCorrect = 0,
      weakLetters = [],
      strongLetters = [],
      recentlyCompletedWords = [],
      routeTheme = 'London Thames Adventure',
    } = req.body;

    const safeLevel = Math.min(4, Math.max(1, Number(currentLevel) || 1));
    const safeAccuracy = Math.min(100, Math.max(0, Number(accuracy) || 80));

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        aiGenerated: false,
        mission: getOfflineAdaptiveSequence(
          childName,
          safeLevel,
          safeAccuracy,
          consecutiveCorrect,
          weakLetters,
          recentlyCompletedWords
        ),
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the adaptive curriculum director for Jhonx London Phonics Adventure, a British English learning game for kids aged 4 to 9.
Your job is to examine the child's learning journey metrics and generate an adaptive 5-stop Phonics Mission Sequence.
Rules:
1. ZERO REPETITION: Do NOT use any words from recentlyCompletedWords: ${JSON.stringify(recentlyCompletedWords.slice(-30))}.
2. CONTEXTUAL LONDON NARRATIVE: Tie all 5 stops together in a coherent mini-mission quest across famous London landmarks.
3. ADAPTIVE DIFFICULTY:
   - If accuracy is high (>=85%) or consecutiveCorrect >= 3, stretch the child slightly with richer consonant blends or slightly longer words.
   - If the child has weakLetters or struggles (accuracy < 75%), prioritize words that gently reinforce those sounds.
4. UK ENGLISH ONLY: All phonics must reflect authentic British English pronunciations in IPA format (e.g. ["/k/", "/æ/", "/t/"]).
5. Return JSON matching the schema.`;

    const prompt = `Child Profile:
Name: ${childName}
Current Level: Level ${safeLevel} (1=Starter CVC, 2=Blends & Digraphs, 3=Long Vowels/Teams, 4=London Master)
Overall Accuracy: ${safeAccuracy}%
Consecutive Correct Streak: ${consecutiveCorrect}
Letters/Sounds needing practice: ${JSON.stringify(weakLetters)}
Mastered letters: ${JSON.stringify(strongLetters)}
Theme/Route: ${routeTheme}

Generate an adaptive 5-stop mission sequence.`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Adaptive sequence AI timeout')), 4500)
    );

    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missionTitle: {
              type: Type.STRING,
              description: 'Exciting London quest title with emoji (e.g. "The Royal Westminster Vowel Quest 🏛️").',
            },
            missionGoal: {
              type: Type.STRING,
              description: 'Clear, child-friendly goal explaining what sounds or words the child is mastering.',
            },
            focusPhonemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of target IPA phonemes featured in this sequence (e.g. ["/æ/", "/k/", "/t/"]).',
            },
            suggestedLevel: {
              type: Type.INTEGER,
              description: 'The difficulty level (1-4).',
            },
            adaptiveReason: {
              type: Type.STRING,
              description: 'Pedagogical note on why these words were chosen for the child.',
            },
            encouragement: {
              type: Type.STRING,
              description: 'Warm, British encouragement message for the child.',
            },
            stops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  word: { type: Type.STRING },
                  location: { type: Type.STRING },
                  phonics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  emoji: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  phonicsFocus: { type: Type.STRING },
                  missionContext: { type: Type.STRING },
                  difficultyScore: { type: Type.INTEGER },
                },
                required: [
                  'id',
                  'word',
                  'location',
                  'phonics',
                  'emoji',
                  'hint',
                  'phonicsFocus',
                  'missionContext',
                  'difficultyScore',
                ],
              },
            },
          },
          required: [
            'missionTitle',
            'missionGoal',
            'focusPhonemes',
            'suggestedLevel',
            'adaptiveReason',
            'encouragement',
            'stops',
          ],
        },
      },
    });

    const aiRes = (await Promise.race([aiPromise, timeoutPromise])) as any;
    const parsed = JSON.parse(aiRes.text || '{}');

    return res.json({
      success: true,
      aiGenerated: true,
      mission: parsed,
    });
  } catch (error: any) {
    console.error('Error in adaptive-sequence endpoint:', error);
    const {
      childName = 'Explorer',
      currentLevel = 1,
      accuracy = 80,
      consecutiveCorrect = 0,
      weakLetters = [],
      recentlyCompletedWords = [],
    } = req.body || {};

    return res.json({
      success: true,
      aiGenerated: false,
      mission: getOfflineAdaptiveSequence(
        childName,
        Number(currentLevel) || 1,
        Number(accuracy) || 80,
        Number(consecutiveCorrect) || 0,
        weakLetters,
        recentlyCompletedWords
      ),
    });
  }
});

// Helper for rich offline adaptive sequences based on progress metrics
function getOfflineAdaptiveSequence(
  childName: string,
  level: number,
  accuracy: number,
  consecutiveCorrect: number,
  weakLetters: string[],
  excludeWords: string[]
) {
  const timestamp = Date.now();
  const excludeSet = new Set((excludeWords || []).map((w) => w.toUpperCase()));

  const adaptivePools: Record<number, any[]> = {
    1: [
      { word: 'BAT', location: 'London Eye 🎡', phonics: ['/b/', '/æ/', '/t/'], emoji: '🦇', hint: 'Flying past the big wheel.', phonicsFocus: 'CVC · /æ/ sound', missionContext: 'Look high above the River Thames!', difficultyScore: 2 },
      { word: 'CAT', location: 'Camden Lock 🛹', phonics: ['/k/', '/æ/', '/t/'], emoji: '🛹', hint: 'A skater cat on the boardwalk.', phonicsFocus: 'CVC · Initial /k/', missionContext: 'Find the cool skater pup and cat!', difficultyScore: 2 },
      { word: 'SUN', location: 'Hyde Park ☀️', phonics: ['/s/', '/ʌ/', '/n/'], emoji: '☀️', hint: 'Warm golden British sunshine.', phonicsFocus: 'CVC · /ʌ/ short vowel', missionContext: 'Bright rays beaming on the grass.', difficultyScore: 3 },
      { word: 'CUP', location: 'Covent Garden ☕', phonics: ['/k/', '/ʌ/', '/p/'], emoji: '☕', hint: 'A hot cup of afternoon tea.', phonicsFocus: 'CVC · Final /p/', missionContext: 'Stop for a tea break in the market!', difficultyScore: 3 },
      { word: 'BED', location: 'Kensington Hotel 🛏️', phonics: ['/b/', '/e/', '/d/'], emoji: '🛏️', hint: 'Cozy bed for a weary explorer.', phonicsFocus: 'CVC · /e/ vowel', missionContext: 'Resting before the grand museum tour.', difficultyScore: 3 },
      { word: 'HOP', location: 'Regent Park 🐰', phonics: ['/h/', '/ɒ/', '/p/'], emoji: '🐰', hint: 'Hop like a London rabbit.', phonicsFocus: 'CVC · /ɒ/ short vowel', missionContext: 'Watch the bunnies leap near the roses.', difficultyScore: 3 },
      { word: 'RUN', location: 'London Marathon 🏃', phonics: ['/r/', '/ʌ/', '/n/'], emoji: '🏃', hint: 'Racing across Westminster Bridge.', phonicsFocus: 'CVC · /r/ onset', missionContext: 'Cheer on the runners by Big Ben!', difficultyScore: 4 },
      { word: 'NET', location: 'Wimbledon Lawn 🎾', phonics: ['/n/', '/e/', '/t/'], emoji: '🎾', hint: 'Tennis net on the green grass.', phonicsFocus: 'CVC · Final /t/', missionContext: 'Ready for match point on court!', difficultyScore: 4 },
    ],
    2: [
      { word: 'FISH', location: 'Borough Market 🐟', phonics: ['/f/', '/ɪ/', '/ʃ/'], emoji: '🐟', hint: 'Fresh fish in market ice.', phonicsFocus: 'Digraph /ʃ/', missionContext: 'Browse the famous foodie stalls!', difficultyScore: 4 },
      { word: 'SHIP', location: 'Greenwich Pier 🚢', phonics: ['/ʃ/', '/ɪ/', '/p/'], emoji: '🚢', hint: 'Tall clipper ship in the docks.', phonicsFocus: 'Initial /ʃ/ digraph', missionContext: 'Climb aboard the historic vessel!', difficultyScore: 5 },
      { word: 'CRAB', location: 'Thames Bank 🦀', phonics: ['/k/', '/r/', '/æ/', '/b/'], emoji: '🦀', hint: 'Little crab on the gravel.', phonicsFocus: 'Consonant blend /kr/', missionContext: 'Beachcombing at low tide.', difficultyScore: 5 },
      { word: 'BELL', location: 'Big Ben Clocktower 🔔', phonics: ['/b/', '/e/', '/l/'], emoji: '🔔', hint: 'Chiming bell every hour.', phonicsFocus: 'Double consonant /ll/', missionContext: 'Hear the deep gong ring out!', difficultyScore: 5 },
      { word: 'FROG', location: 'Kew Botanical Garden 🐸', phonics: ['/f/', '/r/', '/ɒ/', '/g/'], emoji: '🐸', hint: 'Green frog on a giant lilypad.', phonicsFocus: 'Initial /fr/ blend', missionContext: 'Explore the tropical glasshouse!', difficultyScore: 5 },
      { word: 'CHIP', location: 'Fish & Chips Shop 🍟', phonics: ['/tʃ/', '/ɪ/', '/p/'], emoji: '🍟', hint: 'Hot chips with salt and vinegar.', phonicsFocus: 'Digraph /tʃ/', missionContext: 'A true London seaside treat.', difficultyScore: 5 },
    ],
    3: [
      { word: 'TRAIN', location: "King's Cross Station 🚆", phonics: ['/t/', '/r/', '/eɪ/', '/n/'], emoji: '🚆', hint: 'High-speed train to the North.', phonicsFocus: 'Vowel team /ai/', missionContext: 'Platform 9¾ awaits the train!', difficultyScore: 6 },
      { word: 'QUEEN', location: 'Buckingham Palace 👑', phonics: ['/k/', '/w/', '/iː/', '/n/'], emoji: '👑', hint: 'The Queen wearing her royal crown.', phonicsFocus: 'Vowel team /ee/', missionContext: 'Wave to the royal balcony!', difficultyScore: 6 },
      { word: 'BOAT', location: 'Little Venice Canal ⛵', phonics: ['/b/', '/əʊ/', '/t/'], emoji: '⛵', hint: 'Floating barge painted with roses.', phonicsFocus: 'Vowel team /oa/', missionContext: 'Cruise along the calm waters.', difficultyScore: 6 },
      { word: 'MOON', location: 'Royal Observatory 🌙', phonics: ['/m/', '/uː/', '/n/'], emoji: '🌙', hint: 'Gazing at the moon through telescope.', phonicsFocus: 'Long vowel /oo/', missionContext: 'Stand on the Prime Meridian line!', difficultyScore: 6 },
      { word: 'SNAKE', location: 'London Reptile House 🐍', phonics: ['/s/', '/n/', '/eɪ/', '/k/'], emoji: '🐍', hint: 'Slithering friendly python.', phonicsFocus: 'Split digraph a_e', missionContext: 'Peer into the ancient glass vivarium.', difficultyScore: 7 },
    ],
    4: [
      { word: 'BRIDGE', location: 'Tower Bridge 🌉', phonics: ['/b/', '/r/', '/ɪ/', '/dʒ/'], emoji: '🌉', hint: 'The bridge opening for boats.', phonicsFocus: 'Trigraph /dge/', missionContext: 'Watch the bascules rise into the sky!', difficultyScore: 7 },
      { word: 'CASTLE', location: 'Windsor Fortress 🏰', phonics: ['/k/', '/ɑː/', '/s/', '/l/'], emoji: '🏰', hint: 'Ancient stone royal fortress.', phonicsFocus: 'Silent letter /t/', missionContext: 'Walk along the medieval battlements.', difficultyScore: 8 },
      { word: 'MUSEUM', location: 'British Museum 🏛️', phonics: ['/m/', '/j/', '/uː/', '/z/', '/iː/', '/ə/', '/m/'], emoji: '🏛️', hint: 'Glass rotunda of history.', phonicsFocus: 'Multi-syllable British word', missionContext: 'Discover the Rosetta Stone!', difficultyScore: 8 },
      { word: 'LONDON', location: 'Capital City 🇬🇧', phonics: ['/l/', '/ʌ/', '/n/', '/d/', '/ə/', '/n/'], emoji: '🇬🇧', hint: 'The beating heart of Britain.', phonicsFocus: 'Schwa vowel /ə/', missionContext: 'Celebrate mastering London phonics!', difficultyScore: 8 },
      { word: 'PALACE', location: "St James's Palace 💂", phonics: ['/p/', '/æ/', '/l/', '/ɪ/', '/s/'], emoji: '💂', hint: 'Home of royal ceremonies.', phonicsFocus: 'Soft c /s/ sound', missionContext: 'Salute the guards in their red coats.', difficultyScore: 8 },
    ],
  };

  const pool = adaptivePools[level] || adaptivePools[1];
  const fresh = pool.filter((item) => !excludeSet.has(item.word));
  const chosen = (fresh.length >= 5 ? fresh : pool).slice(0, 5);

  const titles = [
    `The London Thames Phonics Quest 🌊`,
    `The Royal Westminster Adventure 🏛️`,
    `The Camden Explorer Discovery 🛹`,
    `The Golden Tower Bridge Expedition 🌉`,
  ];

  return {
    missionTitle: titles[(level - 1) % titles.length],
    missionGoal: `Master 5 tailored British phonics stops customized for ${childName}!`,
    focusPhonemes: ['/æ/', '/k/', '/s/', '/t/'],
    suggestedLevel: level,
    adaptiveReason: `Tailored based on ${accuracy}% overall accuracy and active streak.`,
    encouragement: `Splendid effort, ${childName}! Each word brings you closer to the London Phonics Medal! 🏅`,
    stops: chosen.map((item, idx) => ({
      id: timestamp + idx,
      ...item,
      isAiGenerated: false,
    })),
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Vite or serve static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jhonx London Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
