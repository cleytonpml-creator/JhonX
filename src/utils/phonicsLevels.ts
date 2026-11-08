// London Phonics Difficulty Tiers & Stops Progression

export interface LondonStop {
  id: number;
  word: string;
  location: string;
  phonics: string[];
  emoji: string;
  hint: string;
  phonicsFocus?: string;
  missionContext?: string;
  difficultyScore?: number;
  isAiGenerated?: boolean;
}

export interface AdaptiveMissionSequence {
  missionTitle: string;
  missionGoal: string;
  focusPhonemes: string[];
  stops: LondonStop[];
  suggestedLevel: number;
  encouragement: string;
  adaptiveReason?: string;
}

export interface PhonicsLevel {
  level: number;
  name: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  stops: LondonStop[];
}

export const PHONICS_LEVELS: PhonicsLevel[] = [
  {
    level: 1,
    name: 'Starter CVC',
    badge: 'LEVEL 1 · STARTER CVC',
    color: 'emerald',
    bgGradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-400',
    description: '3-letter simple vowel and consonant words (CVC).',
    stops: [
      { id: 1, word: 'SAT', location: 'Westminster 🏛️', phonics: ['/s/', '/æ/', '/t/'], emoji: '🏛️', hint: 'The child sat on the bench.' },
      { id: 2, word: 'CAT', location: 'Camden Town 🛹', phonics: ['/k/', '/æ/', '/t/'], emoji: '🛹', hint: 'A cute skater cat.' },
      { id: 3, word: 'DOG', location: 'Soho Neon ⚡', phonics: ['/d/', '/ɒ/', '/g/'], emoji: '⚡', hint: 'A cheerful London pup.' },
      { id: 4, word: 'PIG', location: 'Piccadilly 🛍️', phonics: ['/p/', '/ɪ/', '/g/'], emoji: '🛍️', hint: 'A pink pig on shopping spree.' },
      { id: 5, word: 'BUS', location: 'Tower Bridge 🌉', phonics: ['/b/', '/ʌ/', '/s/'], emoji: '🌉', hint: 'The red double-decker bus.' },
      { id: 6, word: 'SUN', location: 'Hyde Park ☀️', phonics: ['/s/', '/ʌ/', '/n/'], emoji: '☀️', hint: 'Golden sunshine in the park.' },
      { id: 7, word: 'HAT', location: 'Notting Hill 🎩', phonics: ['/h/', '/æ/', '/t/'], emoji: '🎩', hint: 'A stylish London top hat.' },
    ],
  },
  {
    level: 2,
    name: 'Blends & Digraphs',
    badge: 'LEVEL 2 · BLENDS & DIGRAPHS',
    color: 'cyan',
    bgGradient: 'from-cyan-400 to-sky-600',
    borderColor: 'border-cyan-400',
    description: '4-letter words with initial/final blends and digraphs (sh, ch, th, ck, ll).',
    stops: [
      { id: 101, word: 'FISH', location: 'Borough Market 🐟', phonics: ['/f/', '/ɪ/', '/ʃ/'], emoji: '🐟', hint: 'Swimming in the River Thames.' },
      { id: 102, word: 'SHIP', location: 'Greenwich Pier 🚢', phonics: ['/ʃ/', '/ɪ/', '/p/'], emoji: '🚢', hint: 'A historic clipper ship.' },
      { id: 103, word: 'FROG', location: "Regent's Canal 🐸", phonics: ['/f/', '/r/', '/ɒ/', '/g/'], emoji: '🐸', hint: 'Hopping along the canal.' },
      { id: 104, word: 'BELL', location: 'Big Ben Tower 🔔', phonics: ['/b/', '/e/', '/l/'], emoji: '🔔', hint: 'Ringing from the clocktower.' },
      { id: 105, word: 'DUCK', location: "St James's Lake 🦆", phonics: ['/d/', '/ʌ/', '/k/'], emoji: '🦆', hint: 'Quacking near the palace.' },
      { id: 106, word: 'STAR', location: 'Planetarium ⭐', phonics: ['/s/', '/t/', '/ɑː/'], emoji: '⭐', hint: 'Shining over London skies.' },
      { id: 107, word: 'DRUM', location: 'Royal Albert Hall 🥁', phonics: ['/d/', '/r/', '/ʌ/', '/m/'], emoji: '🥁', hint: 'Playing a concert rhythm.' },
    ],
  },
  {
    level: 3,
    name: 'Long Vowels & Teams',
    badge: 'LEVEL 3 · LONG VOWELS & TEAMS',
    color: 'amber',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-400',
    description: 'Vowel teams and split digraphs (ee, oa, ai, oo, magic e).',
    stops: [
      { id: 201, word: 'TRAIN', location: "King's Cross Station 🚆", phonics: ['/t/', '/r/', '/eɪ/', '/n/'], emoji: '🚆', hint: 'Catching the express train.' },
      { id: 202, word: 'QUEEN', location: 'Buckingham Palace 👑', phonics: ['/k/', '/w/', '/iː/', '/n/'], emoji: '👑', hint: 'Her Majesty at the palace.' },
      { id: 203, word: 'BOAT', location: 'Little Venice ⛵', phonics: ['/b/', '/əʊ/', '/t/'], emoji: '⛵', hint: 'Cruising along London waterways.' },
      { id: 204, word: 'MOON', location: 'Greenwich Meridian 🌙', phonics: ['/m/', '/uː/', '/n/'], emoji: '🌙', hint: 'Gazing through telescopes.' },
      { id: 205, word: 'CLOCK', location: 'Parliament Square 🕰️', phonics: ['/k/', '/l/', '/ɒ/', '/k/'], emoji: '🕰️', hint: 'Ticking steadily on the hour.' },
      { id: 206, word: 'SNAKE', location: 'London Zoo 🐍', phonics: ['/s/', '/n/', '/eɪ/', '/k/'], emoji: '🐍', hint: 'Slithering gracefully.' },
      { id: 207, word: 'CROWN', location: 'Tower of London 💎', phonics: ['/k/', '/r/', '/aʊ/', '/n/'], emoji: '💎', hint: 'The glittering Royal jewels.' },
    ],
  },
  {
    level: 4,
    name: 'London Master Explorer',
    badge: 'LEVEL 4 · LONDON MASTER',
    color: 'purple',
    bgGradient: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400',
    description: 'Multi-syllable British vocabulary and iconic London landmarks.',
    stops: [
      { id: 301, word: 'BRIDGE', location: 'Tower Bridge 🌉', phonics: ['/b/', '/r/', '/ɪ/', '/dʒ/'], emoji: '🌉', hint: 'Iconic suspension bridge opening.' },
      { id: 302, word: 'CASTLE', location: 'Windsor Royal Castle 🏰', phonics: ['/k/', '/ɑː/', '/s/', '/l/'], emoji: '🏰', hint: 'Grand medieval stone castle.' },
      { id: 303, word: 'LONDON', location: 'City of London 🇬🇧', phonics: ['/l/', '/ʌ/', '/n/', '/d/', '/ə/', '/n/'], emoji: '🇬🇧', hint: 'The vibrant capital city.' },
      { id: 304, word: 'MARKET', location: 'Covent Garden 🍏', phonics: ['/m/', '/ɑː/', '/k/', '/ɪ/', '/t/'], emoji: '🍏', hint: 'Street performers and fresh stalls.' },
      { id: 305, word: 'PALACE', location: "St James's Palace 💂", phonics: ['/p/', '/æ/', '/l/', '/ɪ/', '/s/'], emoji: '💂', hint: 'Royal guards on parade.' },
      { id: 306, word: 'STATION', location: 'Paddington Terminal 🚂', phonics: ['/s/', '/t/', '/eɪ/', '/ʃ/', '/ə/', '/n/'], emoji: '🚂', hint: 'Famous railway platform.' },
    ],
  },
];

export function getLevelData(level: number): PhonicsLevel {
  return PHONICS_LEVELS.find((l) => l.level === level) || PHONICS_LEVELS[0];
}
