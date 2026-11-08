import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ChevronLeft, ChevronRight, Star, Heart, CheckCircle2, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { jhonxDb } from '../../utils/database';
import { getAiCoachEvaluation, AiCoachEvaluation, generateAiContent } from '../../utils/aiCoach';
import { KidsAiCoachModal } from './KidsAiCoachModal';

interface KidsSentencesArenaProps {
  starsCount: number;
  onAddStars: (amount: number) => void;
  onSelectMode: (mode: 'phonics' | 'sentences' | 'stories') => void;
}

export interface ShortSentence {
  id: number;
  sentence: string;
  meaningTip: string;
  location: string;
  emoji: string;
  badge: string;
  audioDuration: number;
  words: {
    text: string;
    phoneticTip?: string;
  }[];
}

const SENTENCES_LIST: ShortSentence[] = [
  {
    id: 1,
    sentence: 'The cat sat on the mat.',
    meaningTip: 'A furry cat sat down comfortably on the mat.',
    location: 'Camden Town 🛹',
    emoji: '🐱🛋️',
    badge: 'LEVEL 1 · STARTER',
    audioDuration: 2200,
    words: [
      { text: 'The', phoneticTip: '/ðə/' },
      { text: 'cat', phoneticTip: '/kæt/' },
      { text: 'sat', phoneticTip: '/sæt/' },
      { text: 'on', phoneticTip: '/ɒn/' },
      { text: 'the', phoneticTip: '/ðə/' },
      { text: 'mat', phoneticTip: '/mæt/' },
    ],
  },
  {
    id: 2,
    sentence: 'A big red bus stops here.',
    meaningTip: 'A double-decker bus stops at the London bus stand.',
    location: 'Westminster 🏛️',
    emoji: '🚌🛑',
    badge: 'LEVEL 1 · LONDON BUS',
    audioDuration: 2400,
    words: [
      { text: 'A', phoneticTip: '/ə/' },
      { text: 'big', phoneticTip: '/bɪɡ/' },
      { text: 'red', phoneticTip: '/red/' },
      { text: 'bus', phoneticTip: '/bʌs/' },
      { text: 'stops', phoneticTip: '/stɒps/' },
      { text: 'here', phoneticTip: '/hɪə/' },
    ],
  },
  {
    id: 3,
    sentence: 'The cool dog has a skateboard.',
    meaningTip: 'The playful bulldog skates around Camden Market.',
    location: 'Camden Market 🐶',
    emoji: '🐶🛹',
    badge: 'LEVEL 2 · SKATE',
    audioDuration: 2600,
    words: [
      { text: 'The', phoneticTip: '/ðə/' },
      { text: 'cool', phoneticTip: '/kuːl/' },
      { text: 'dog', phoneticTip: '/dɒɡ/' },
      { text: 'has', phoneticTip: '/hæz/' },
      { text: 'a', phoneticTip: '/ə/' },
      { text: 'skateboard', phoneticTip: '/ˈskeɪtbɔːd/' },
    ],
  },
  {
    id: 4,
    sentence: 'I can see the tall Big Ben.',
    meaningTip: 'Looking at the famous London clock tower by the river.',
    location: 'River Thames 🌉',
    emoji: '🏛️🕰️',
    badge: 'LEVEL 2 · LANDMARK',
    audioDuration: 2500,
    words: [
      { text: 'I', phoneticTip: '/aɪ/' },
      { text: 'can', phoneticTip: '/kæn/' },
      { text: 'see', phoneticTip: '/siː/' },
      { text: 'the', phoneticTip: '/ðə/' },
      { text: 'tall', phoneticTip: '/tɔːl/' },
      { text: 'Big', phoneticTip: '/bɪɡ/' },
      { text: 'Ben', phoneticTip: '/ben/' },
    ],
  },
  {
    id: 5,
    sentence: 'The fox drinks tea by the river.',
    meaningTip: 'Enjoying a warm cup of British tea by the canal.',
    location: 'Hackney Canal 🦊',
    emoji: '🦊☕',
    badge: 'LEVEL 3 · BRITISH TEA',
    audioDuration: 2800,
    words: [
      { text: 'The', phoneticTip: '/ðə/' },
      { text: 'fox', phoneticTip: '/fɒks/' },
      { text: 'drinks', phoneticTip: '/drɪŋks/' },
      { text: 'tea', phoneticTip: '/tiː/' },
      { text: 'by', phoneticTip: '/baɪ/' },
      { text: 'the', phoneticTip: '/ðə/' },
      { text: 'river', phoneticTip: '/ˈrɪv.ə/' },
    ],
  },
  {
    id: 6,
    sentence: 'The royal guard dances in the street.',
    meaningTip: 'The palace guard dances to the neon boombox beat.',
    location: 'Buckingham Palace 💂',
    emoji: '💂🕺',
    badge: 'LEVEL 3 · ROYAL DANCE',
    audioDuration: 3000,
    words: [
      { text: 'The', phoneticTip: '/ðə/' },
      { text: 'royal', phoneticTip: '/ˈrɔɪəl/' },
      { text: 'guard', phoneticTip: '/ɡɑːd/' },
      { text: 'dances', phoneticTip: '/ˈdɑːnsɪz/' },
      { text: 'in', phoneticTip: '/ɪn/' },
      { text: 'the', phoneticTip: '/ðə/' },
      { text: 'street', phoneticTip: '/striːt/' },
    ],
  },
];

export const KidsSentencesArena: React.FC<KidsSentencesArenaProps> = ({
  starsCount,
  onAddStars,
  onSelectMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(4);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [dynamicSentences, setDynamicSentences] = useState<ShortSentence[]>(() => SENTENCES_LIST);
  const [isFetchingMoreAi, setIsFetchingMoreAi] = useState<boolean>(false);
  const [isKaraokePlaying, setIsKaraokePlaying] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [mascotMessage, setMascotMessage] = useState<string>(
    'Tap on each word to hear its British sound, or click the big mic to read the sentence!'
  );

  // AI Phonics Coach States
  const [isCoachModalOpen, setIsCoachModalOpen] = useState<boolean>(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiEvaluation, setAiEvaluation] = useState<AiCoachEvaluation | null>(null);
  const [lastSpokenTranscript, setLastSpokenTranscript] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const isRecognizingRef = useRef<boolean>(false);
  const isProcessingRecordingRef = useRef<boolean>(false);
  const countdownIntervalRef = useRef<any>(null);
  const autoFinishTimeoutRef = useRef<any>(null);
  const capturedTranscriptRef = useRef<string>('');

  const currentItem = dynamicSentences[currentIndex] || dynamicSentences[0] || SENTENCES_LIST[0];

  // Configuração segura do Web Speech Recognition em inglês britânico
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-GB';

          recognition.onresult = (event: any) => {
            if (event.results && event.results[0] && event.results[0][0]) {
              const transcript = event.results[0][0].transcript.toLowerCase();
              capturedTranscriptRef.current = transcript;
              setLastSpokenTranscript(transcript);
              handleFinishRecording(true, transcript);
            }
          };

          recognition.onerror = (event: any) => {
            isRecognizingRef.current = false;
            const err = event?.error;
            if (err === 'not-allowed' || err === 'service-not-allowed') {
              setMascotMessage('Microphone access blocked! Please click the lock or camera icon in your address bar to allow microphone access. 🎤🔒');
            } else if (err === 'no-speech') {
              setMascotMessage("No speech heard! Speak nice and clearly into your microphone! 🐶🔊");
            }
          };

          recognition.onend = () => {
            isRecognizingRef.current = false;
          };

          recognitionRef.current = recognition;
        } catch {
          // ignore
        }
      }
    }

    return () => {
      clearTimers();
      if (recognitionRef.current && isRecognizingRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        isRecognizingRef.current = false;
      }
    };
  }, [currentIndex]);

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoFinishTimeoutRef.current) {
      clearTimeout(autoFinishTimeoutRef.current);
      autoFinishTimeoutRef.current = null;
    }
  };

  // Click-to-Speak Toggle: Click to start, click again to finish early, or auto-finish after countdown
  const handleToggleClickToSpeak = () => {
    if (isRecording) {
      handleFinishRecording(true, capturedTranscriptRef.current);
    } else {
      handleStartRecording();
    }
  };

  const handleStartRecording = () => {
    clearTimers();
    capturedTranscriptRef.current = '';
    isProcessingRecordingRef.current = false;
    setIsRecording(true);
    setCountdown(8);
    sounds.playMicToggle(true);
    setMascotMessage(`Recording! Read aloud in British English: "${currentItem.sentence}" 🎤✨`);

    if (recognitionRef.current && !isRecognizingRef.current) {
      try {
        isRecognizingRef.current = true;
        recognitionRef.current.start();
      } catch {
        isRecognizingRef.current = false;
      }
    }

    let currentCount = 8;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount >= 1) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    // Auto-finish after 8.5 seconds
    autoFinishTimeoutRef.current = setTimeout(() => {
      handleFinishRecording(true, capturedTranscriptRef.current);
    }, 8500);
  };

  const handleFinishRecording = async (success: boolean = true, transcript?: string) => {
    if (isProcessingRecordingRef.current) return;
    isProcessingRecordingRef.current = true;

    clearTimers();
    setIsRecording(false);
    sounds.playMicToggle(false);

    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      isRecognizingRef.current = false;
    }

    if (success) {
      const raw = transcript !== undefined ? transcript : capturedTranscriptRef.current;
      const finalSpoken = (raw || '').trim();
      setLastSpokenTranscript(finalSpoken);
      await evaluateWithAiCoach(finalSpoken);
    } else {
      isProcessingRecordingRef.current = false;
    }
  };

  // Proactively fetch more AI sentences to avoid repeating the same ones
  const fetchMoreSentences = async () => {
    if (isFetchingMoreAi) return;
    setIsFetchingMoreAi(true);
    try {
      const generated = await generateAiContent(
        'sentences',
        2,
        dynamicSentences.map((s) => s.sentence)
      );
      if (generated && generated.length > 0) {
        const formatted: ShortSentence[] = generated.map((g, idx) => ({
          id: Date.now() + idx,
          sentence: g.sentence,
          meaningTip: g.theme || 'London adventure reading',
          location: g.location || 'London Sights 🇬🇧',
          emoji: g.emoji || '🚌',
          badge: `LEVEL 2 · SENTENCE`,
          audioDuration: Math.max(2600, g.sentence.split(' ').length * 480),
          words: g.sentence.split(' ').map((w: string) => ({ text: w })),
        }));
        setDynamicSentences((prev) => [...prev, ...formatted]);
      }
    } catch (e) {
      console.warn('Could not fetch more AI sentences:', e);
    } finally {
      setIsFetchingMoreAi(false);
    }
  };

  // Evaluate sentence reading with Gemini AI Coach
  const evaluateWithAiCoach = async (spoken: string) => {
    setIsAnalyzingAi(true);
    setMascotMessage('AI Phonics Coach is reviewing your British sentence reading... 🦁✨');

    try {
      const evaluation = await getAiCoachEvaluation({
        targetText: currentItem.sentence,
        spokenText: spoken,
        category: 'sentence',
        phonicsBreakdown: currentItem.words.map((w) => w.text),
      });

      setAiEvaluation(evaluation);
      setIsAnalyzingAi(false);
      setIsCoachModalOpen(true);

      const isPass = evaluation.status === 'perfect' || evaluation.canAutoAdvance === true || evaluation.score >= 70;

      if (isPass) {
        sounds.playCorrectWord();
        sounds.playBusHorn();
      } else {
        sounds.playTap();
      }

      // Record to SQLite history without saving audio files
      try {
        jhonxDb.saveReadingSuccess(currentItem.sentence, undefined, isPass);
      } catch {
        // ignore
      }
    } catch {
      setIsAnalyzingAi(false);
      handleStandardSuccess();
    } finally {
      setIsAnalyzingAi(false);
      isProcessingRecordingRef.current = false;
    }
  };

  const handleStandardSuccess = () => {
    sounds.playCorrectWord();
    sounds.playBusHorn();
    onAddStars(40);
    setCelebrationMessage(`FANTASTIC! You read the sentence brilliantly! 🚌🎉`);

    setTimeout(() => {
      setCelebrationMessage(null);
      advanceSentence();
    }, 2800);
  };

  const advanceSentence = () => {
    if (currentIndex < dynamicSentences.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (nextIdx >= dynamicSentences.length - 2) {
        fetchMoreSentences();
      }
    } else {
      fetchMoreSentences();
      setCurrentIndex(0);
    }
  };

  const handleCoachModalClose = () => {
    setIsCoachModalOpen(false);
    if (aiEvaluation) {
      onAddStars(aiEvaluation.starsEarned);
      if (aiEvaluation.status === 'perfect' || aiEvaluation.score >= 80) {
        advanceSentence();
      }
    }
  };

  const handleCoachModalSkip = () => {
    setIsCoachModalOpen(false);
    advanceSentence();
  };

  const handleCoachModalRetry = () => {
    setIsCoachModalOpen(false);
    setTimeout(() => {
      handleStartRecording();
    }, 350);
  };

  // Tap individual word
  const handleWordTap = (word: { text: string; phoneticTip?: string }, idx: number) => {
    sounds.playTap();
    setActiveWordIndex(idx);
    sounds.speakBritish(word.text);
    setMascotMessage(`Word: "${word.text}" · British phonics sound: ${word.phoneticTip || ''}`);
    setTimeout(() => setActiveWordIndex(null), 800);
  };

  // Full sentence Karaoke playback
  const handlePlayFullSentence = () => {
    if (isKaraokePlaying) return;
    sounds.playTap();
    setIsKaraokePlaying(true);
    sounds.speakBritish(currentItem.sentence);

    const wordDuration = currentItem.audioDuration / currentItem.words.length;
    currentItem.words.forEach((_, idx) => {
      setTimeout(() => {
        setActiveWordIndex(idx);
      }, idx * wordDuration);
    });

    setTimeout(() => {
      setActiveWordIndex(null);
      setIsKaraokePlaying(false);
      setMascotMessage('Now it is your turn! Press the big mic and read the sentence!');
    }, currentItem.audioDuration + 200);
  };

  // Fun colors for each word
  const wordColors = [
    'from-cyan-400 to-sky-500 border-cyan-200 text-white',
    'from-pink-500 to-rose-500 border-pink-200 text-white',
    'from-amber-400 to-orange-500 border-amber-200 text-slate-950',
    'from-emerald-400 to-teal-500 border-emerald-200 text-slate-950',
    'from-purple-400 to-indigo-500 border-purple-200 text-white',
    'from-yellow-300 to-amber-400 border-yellow-100 text-slate-950',
    'from-blue-400 to-cyan-500 border-blue-200 text-white',
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden select-none font-['Fredoka']">
      {/* MAGICAL LONDON BACKDROP */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/cartoon_london_backdrop_1793964364409.jpg"
          alt="London City Background"
          className="w-full h-full object-cover object-bottom opacity-35 filter brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-slate-950/80" />
      </div>

      {/* TOP SECTION: MODE SELECTOR & MISSION CARD */}
      <div className="relative z-10 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-3">
        {/* Quick Mode Switcher (Words -> Sentences -> Stories) */}
        <div className="flex items-center justify-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-3xl border-3 border-amber-400 max-w-md mx-auto shadow-xl">
          <button
            onClick={() => {
              sounds.playTap();
              onSelectMode('phonics');
            }}
            className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs text-slate-300 hover:text-white transition-all text-center"
          >
            🔤 Words
          </button>
          <button
            onClick={() => sounds.playTap()}
            className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md scale-105 text-center"
          >
            💬 Sentences
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              onSelectMode('stories');
            }}
            className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs text-slate-300 hover:text-white transition-all text-center"
          >
            📖 Stories
          </button>
        </div>

        {/* Destination Header & Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-3xl border-3 border-sky-400 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentItem.emoji}</span>
            <div>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-wider block">
                {currentItem.badge} · {currentItem.location}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Sentence {currentIndex + 1} of {SENTENCES_LIST.length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                if (currentIndex > 0) setCurrentIndex((p) => p - 1);
                else setCurrentIndex(SENTENCES_LIST.length - 1);
              }}
              className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Previous sentence"
            >
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>

            <span className="text-xs font-black text-amber-500 bg-amber-400/20 px-3 py-1.5 rounded-2xl border border-amber-400/40">
              +{40} ⭐ BONUS
            </span>

            <button
              onClick={() => {
                sounds.playTap();
                if (currentIndex < SENTENCES_LIST.length - 1) setCurrentIndex((p) => p + 1);
                else setCurrentIndex(0);
              }}
              className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Next sentence"
            >
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* CENTRAL AREA: INTERACTIVE CHUNKY WORD BLOCKS */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {/* Listen to Full Sentence (Karaoke) */}
        <button
          onClick={handlePlayFullSentence}
          disabled={isKaraokePlaying}
          className={`mb-6 flex items-center gap-2.5 px-6 py-3 rounded-3xl font-black text-base border-3 shadow-xl transition-all transform active:scale-95 cursor-pointer ${
            isKaraokePlaying
              ? 'bg-amber-400 text-slate-950 border-white scale-105 shadow-amber-400/50'
              : 'bg-white/95 dark:bg-slate-900/95 text-sky-500 border-sky-400 hover:bg-sky-50'
          }`}
        >
          <Volume2 className={`w-6 h-6 ${isKaraokePlaying ? 'animate-bounce' : 'text-sky-500'}`} />
          <span>{isKaraokePlaying ? 'Listening in British English... 🇬🇧' : 'Listen to Full Sentence (Karaoke) 🇬🇧'}</span>
        </button>

        {/* SENTENCE CARD (Clickable Word Badges) */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-3xl w-full flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {currentItem.words.map((w, idx) => {
              const isWordActive = activeWordIndex === idx;
              const colorClass = wordColors[idx % wordColors.length];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleWordTap(w, idx)}
                  className={`group relative rounded-2xl p-1 transition-all duration-200 transform cursor-pointer active:scale-90 ${
                    isWordActive
                      ? 'scale-120 -translate-y-2 ring-4 ring-white z-20'
                      : 'hover:scale-108 hover:-translate-y-1'
                  }`}
                >
                  <div
                    className={`px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-b ${colorClass} border-3 shadow-lg flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px]`}
                  >
                    <span className="text-2xl sm:text-3xl font-black tracking-wide leading-none drop-shadow-sm">
                      {w.text}
                    </span>
                    {w.phoneticTip && (
                      <span className="text-[10px] font-bold opacity-80 mt-1 font-mono">
                        {w.phoneticTip}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Meaning tip in UK English */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-sm sm:text-base font-bold text-amber-300">
              🇬🇧 Meaning: "{currentItem.meaningTip}"
            </p>
            <span className="text-[11px] font-semibold text-slate-400">
              💡 Tip: Tap on any word to practice its British sound!
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: GIANT BOOMBOX MIC & FRIENDLY MASCOT */}
      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Mascot Speech Bubble */}
        <div className="mb-4 bg-white/95 dark:bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-3.5 px-5 shadow-xl max-w-lg w-full flex items-center gap-3">
          <span className="text-3xl animate-bounce">🦁🇬🇧</span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-500 block">
              British Lion says:
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {mascotMessage}
            </p>
          </div>
        </div>

        {/* GIANT BOOMBOX MICROPHONE BUTTON */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-black tracking-wider text-amber-400 mb-2 uppercase animate-pulse text-center">
            {isRecording
              ? `LISTENING! SPEAK THE SENTENCE (${countdown}s) 🎤✨`
              : 'CLICK TO READ SENTENCE IN BRITISH ENGLISH:'}
          </p>

          <button
            type="button"
            onClick={handleToggleClickToSpeak}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 transform active:scale-95 border-4 select-none ${
              isRecording
                ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-white shadow-[0_0_50px_rgba(0,255,102,0.9)] scale-110 ring-4 ring-emerald-300 animate-pulse'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 border-white shadow-[0_10px_25px_rgba(255,170,0,0.5)] hover:scale-105 hover:shadow-[0_12px_30px_rgba(255,170,0,0.7)]'
            }`}
            title={isRecording ? 'Click to finish speaking!' : 'Click to start speaking!'}
          >
            {isRecording ? (
              <>
                <Mic className="w-11 h-11 text-slate-950 animate-bounce" />
                {/* Audio wave bars */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1 h-3 bg-slate-950 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1 h-5 bg-slate-950 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-4 bg-slate-950 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-6 bg-slate-950 rounded-full animate-bounce [animation-delay:0.15s]" />
                </div>
              </>
            ) : (
              <>
                <Mic className="w-12 h-12 text-slate-950" />
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider mt-1">
                  Click to Speak
                </span>
              </>
            )}
          </button>

          {/* Subtitle helper */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-xs font-bold text-slate-300 font-mono text-center max-w-sm">
              {isAnalyzingAi ? (
                <span className="text-amber-400 font-black animate-pulse flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin" /> AI Coach is reviewing your sentence reading...
                </span>
              ) : isRecording ? (
                <span className="text-emerald-400 font-black">
                  Read aloud or click mic to finish!
                </span>
              ) : (
                <span>
                  Read aloud: <strong className="text-amber-400 text-sm font-black">"{currentItem.sentence}"</strong>
                </span>
              )}
            </span>

            {/* Quick Practice / Simulation Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  handleFinishRecording(true, currentItem.sentence);
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Test with accurate sentence reading"
              >
                <span>🗣️ Test Read Sentence</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CELEBRATION SNACKBAR */}
      {celebrationMessage && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 p-4 px-6 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3">
            <span className="text-3xl">🎉⭐</span>
            <div>
              <p className="text-base font-black tracking-tight leading-none">
                {celebrationMessage}
              </p>
              <p className="text-xs font-bold text-amber-950 mt-1">
                +40 Explorer Stars added to your star bank! 🏆
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI PHONICS COACH MODAL */}
      <KidsAiCoachModal
        isOpen={isCoachModalOpen}
        onClose={handleCoachModalClose}
        onRetry={handleCoachModalRetry}
        onSkip={handleCoachModalSkip}
        targetText={currentItem.sentence}
        spokenText={lastSpokenTranscript}
        evaluation={aiEvaluation}
        category="sentence"
      />
    </div>
  );
};
