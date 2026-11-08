// Client-side helper for calling server-side Jhonx London AI Phonics Coach & Content Generator

export interface AiCoachEvaluation {
  status: 'perfect' | 'almost' | 'needs_practice';
  score: number;
  celebrationTitle: string;
  mascotMood: 'celebrating' | 'encouraging' | 'thinking';
  coachTip: string;
  mouthTip: string;
  errorHighlight?: string;
  soundCorrection?: string;
  canAutoAdvance?: boolean;
  phonemeFeedback: {
    phoneme: string;
    status: 'correct' | 'needs_practice' | 'practicing';
    heard?: string;
  }[];
  starsEarned: number;
}

export interface AiCoachRequest {
  targetText: string;
  spokenText: string;
  category: 'word' | 'sentence' | 'story';
  phonicsBreakdown?: string[];
}

export async function getAiCoachEvaluation(req: AiCoachRequest): Promise<AiCoachEvaluation> {
  const target = req.targetText.trim();
  const spoken = req.spokenText.trim();

  try {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.evaluation) {
        return data.evaluation;
      }
    }
  } catch (err) {
    console.warn('AI Coach server endpoint unavailable, using smart local phonics rule engine:', err);
  }

  // Resilient local phonics engine fallback if offline or server disconnected
  if (!spoken || spoken.toLowerCase() === '(no speech heard)' || spoken.toLowerCase() === '(silence)') {
    return {
      status: 'needs_practice',
      score: 0,
      celebrationTitle: "WE DIDN'T HEAR YOU! 🎤",
      mascotMood: 'thinking',
      coachTip: `We couldn't hear your voice. Please check that your microphone is unmuted, speak clearly in British English, and try again!`,
      mouthTip: 'Check your microphone and speak loud and clear into your device!',
      errorHighlight: 'No speech was detected.',
      soundCorrection: `Listen to "${target}" using the audio button, then tap Try Again to speak!`,
      canAutoAdvance: false,
      phonemeFeedback: (req.phonicsBreakdown || []).map((ph) => ({
        phoneme: ph,
        status: 'needs_practice' as const,
      })),
      starsEarned: 0,
    };
  }

  const normTarget = target
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normSpoken = spoken
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stripFillers = (t: string) =>
    t.replace(/^(the|a|an|it is|its|it\'s|letter|the letter|sound|the sound)\s+/i, '').trim();

  const strippedTarget = stripFillers(normTarget);
  const strippedSpoken = stripFillers(normSpoken);

  // Common aliases for British speech-to-text
  const aliases: Record<string, string[]> = {
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
    s: ['s', 'es', 'ess', 'is', 'as', 'ass', 'yes'],
    t: ['t', 'tee', 'tea', 'ti'],
    c: ['c', 'see', 'sea', 'si', 'k'],
    a: ['a', 'ay', 'eh', 'ey', 'an'],
    p: ['p', 'pee', 'pea', 'pi'],
    r: ['r', 'are', 'ar'],
  };

  const isExact =
    normTarget === normSpoken ||
    strippedTarget === strippedSpoken ||
    normTarget === strippedSpoken ||
    (aliases[strippedTarget] && (aliases[strippedTarget].includes(strippedSpoken) || aliases[strippedTarget].includes(normSpoken)));

  // Sentence / Story word overlap calculation
  let sentencePassed = false;
  if (req.category === 'sentence' || req.category === 'story' || normTarget.includes(' ')) {
    const tws = normTarget.split(' ').filter(Boolean);
    const sws = normSpoken.split(' ').filter(Boolean);
    if (tws.length > 0) {
      let matched = 0;
      for (const tw of tws) {
        if (sws.includes(tw) || (aliases[tw] && aliases[tw].some((a) => sws.includes(a)))) {
          matched++;
        }
      }
      if (matched / tws.length >= 0.7) {
        sentencePassed = true;
      }
    }
  }

  const isPassed = isExact || sentencePassed || (strippedSpoken.length >= 2 && (strippedSpoken.includes(strippedTarget) || strippedTarget.includes(strippedSpoken)));

  const breakdown = (req.phonicsBreakdown || []).map((ph) => ({
    phoneme: ph,
    status: isPassed ? ('correct' as const) : ('needs_practice' as const),
  }));

  if (isPassed) {
    return {
      status: 'perfect',
      score: 100,
      celebrationTitle: 'BRILLIANT! 🌟',
      mascotMood: 'celebrating',
      coachTip: `Top marks! You pronounced "${target}" with authentic British English fluency!`,
      mouthTip: 'Your lips and tongue were in the exact right position! Keep it up!',
      errorHighlight: '',
      soundCorrection: 'Super pronunciation! Ready for the next London stop!',
      canAutoAdvance: true,
      phonemeFeedback: breakdown,
      starsEarned: 40,
    };
  }

  return {
    status: 'needs_practice',
    score: 55,
    celebrationTitle: "LET'S TRY AGAIN! 🔄",
    mascotMood: 'thinking',
    coachTip: `We heard "${spoken || 'a different sound'}". Listen to how British explorers pronounce "${target}" and try again!`,
    mouthTip: 'Take a gentle breath, listen to the letter sounds, and speak clearly into the mic!',
    errorHighlight: `We heard "${spoken || 'something else'}" instead of "${target}". Check each letter sound carefully!`,
    soundCorrection: `Tap the speaker to hear "${target}", then press Try Again to master it!`,
    canAutoAdvance: false,
    phonemeFeedback: breakdown,
    starsEarned: 15,
  };
}

export async function generateAiContent(
  type: 'phonics' | 'sentences' | 'stories',
  level: number,
  excludeList: string[] = []
): Promise<any[]> {
  try {
    const res = await fetch('/api/ai/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, level, excludeList }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.content) && data.content.length > 0) {
        return data.content;
      }
    }
  } catch (err) {
    console.warn('AI Content Generator server error, fallback will be used:', err);
  }
  return [];
}

export interface AdaptiveSequenceRequest {
  childName?: string;
  currentLevel?: number;
  accuracy?: number;
  consecutiveCorrect?: number;
  weakLetters?: string[];
  strongLetters?: string[];
  recentlyCompletedWords?: string[];
  routeTheme?: string;
}

export async function generateAdaptivePhonicsSequence(
  req: AdaptiveSequenceRequest
): Promise<any | null> {
  try {
    const res = await fetch('/api/ai/adaptive-sequence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.mission) {
        return data.mission;
      }
    }
  } catch (err) {
    console.warn('Adaptive sequence server endpoint unavailable:', err);
  }
  return null;
}
