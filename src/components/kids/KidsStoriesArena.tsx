import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ChevronLeft, ChevronRight, Star, BookOpen, Award, CheckCircle2, Play, Pause, HelpCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { jhonxDb } from '../../utils/database';
import { getAiCoachEvaluation, AiCoachEvaluation, generateAiContent } from '../../utils/aiCoach';
import { KidsAiCoachModal } from './KidsAiCoachModal';

interface KidsStoriesArenaProps {
  starsCount: number;
  onAddStars: (amount: number) => void;
  onSelectMode: (mode: 'phonics' | 'sentences' | 'stories') => void;
}

export interface MiniStory {
  id: number;
  title: string;
  subtitleEn: string;
  location: string;
  emoji: string;
  coverColor: string;
  lines: {
    en: string;
    vocabNote?: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const STORIES_LIST: MiniStory[] = [
  {
    id: 1,
    title: 'The Red Bus in Camden',
    subtitleEn: 'A London Double-Decker Adventure',
    location: 'Camden Town 🛹',
    emoji: '🚌🐱✨',
    coverColor: 'from-rose-500 to-red-600',
    lines: [
      { en: 'The red bus drives through London.', vocabNote: 'Iconic double-decker bus' },
      { en: 'A cute cat with a cap sits on top.', vocabNote: 'Cat wearing a stylish cap' },
      { en: 'Honk honk! The bus goes very fast!', vocabNote: 'Loud British bus horn' },
      { en: 'We love our happy London adventure!', vocabNote: 'Exploring London streets' },
    ],
    quiz: {
      question: 'Who was sitting on top of the red bus?',
      options: ['A cute cat with a cap 🐱', 'A blue elephant 🐘', 'An alligator 🐊'],
      correctIndex: 0,
      explanation: 'Spot on! "A cute cat with a cap sits on top!"',
    },
  },
  {
    id: 2,
    title: 'The Pigeon and the Fox',
    subtitleEn: 'Canal Friends Having British Tea',
    location: 'Hackney Canal 🦊',
    emoji: '🐦🦊🎵',
    coverColor: 'from-amber-500 to-orange-600',
    lines: [
      { en: 'A cool pigeon wears a blue cap.', vocabNote: 'Fashionable London bird' },
      { en: 'He meets a smart fox by the canal.', vocabNote: 'Clever friend by the water' },
      { en: 'They drink warm tea and listen to music.', vocabNote: 'Classic cup of British tea' },
      { en: 'London is full of wonderful friends!', vocabNote: 'Kind friends in the city' },
    ],
    quiz: {
      question: 'What did the pigeon and fox drink together?',
      options: ['Fizzy cold drink 🥤', 'Warm British tea ☕', 'Stone soup 🥣'],
      correctIndex: 1,
      explanation: 'Cheerio! "They drink warm tea and listen to music!"',
    },
  },
  {
    id: 3,
    title: 'The Dancing Royal Guard',
    subtitleEn: 'Palace Beat and Breakdance',
    location: 'Buckingham Palace 💂',
    emoji: '💂📻🕺',
    coverColor: 'from-purple-500 to-indigo-600',
    lines: [
      { en: 'The guard stands tall at the palace gate.', vocabNote: 'Famous tall bearskin hat' },
      { en: 'A neon boombox starts to play a beat.', vocabNote: 'Funky hip-hop rhythm' },
      { en: 'The guard spins and does a breakdance!', vocabNote: 'Spinning on the pavement' },
      { en: 'Everyone claps and smiles with joy!', vocabNote: 'Big cheers from the crowd' },
    ],
    quiz: {
      question: 'Which dance did the royal guard do at the palace?',
      options: ['Breakdance 🕺', 'Classical ballet 🩰', 'Slow waltz 💃'],
      correctIndex: 0,
      explanation: 'Brilliant! "The guard spins and does a breakdance!"',
    },
  },
  {
    id: 4,
    title: 'Mango DJ at Brixton Market',
    subtitleEn: 'Street Beats and Neon Lights',
    location: 'Brixton Market 🥭',
    emoji: '🥭🎧🎉',
    coverColor: 'from-emerald-500 to-teal-600',
    lines: [
      { en: 'Mango DJ puts on his shiny headphones.', vocabNote: 'Gold sound gear' },
      { en: 'The market lights turn neon and bright.', vocabNote: 'Glowing London market' },
      { en: 'Kids sing short words in British English.', vocabNote: 'Phonics rhymes & beats' },
      { en: 'Music makes everyone dance and play!', vocabNote: 'Big street party' },
    ],
    quiz: {
      question: 'What did Mango DJ put on his head?',
      options: ['Shiny headphones 🎧', 'A golden crown 👑', 'A pirate hat 🏴‍☠️'],
      correctIndex: 0,
      explanation: 'Splendid! "Mango DJ puts on his shiny headphones!"',
    },
  },
];

export const KidsStoriesArena: React.FC<KidsStoriesArenaProps> = ({
  starsCount,
  onAddStars,
  onSelectMode,
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isPlayingFullStory, setIsPlayingFullStory] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [dynamicStories, setDynamicStories] = useState<MiniStory[]>(() => STORIES_LIST);
  const [isFetchingMoreAi, setIsFetchingMoreAi] = useState<boolean>(false);
  const [mascotMessage, setMascotMessage] = useState<string>(
    'Welcome to Short Stories! Click "Listen to Full Story" to hear the British narrator, or click the mic to read!'
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
  const narrationTimeoutsRef = useRef<any[]>([]);

  const stopStoryNarration = () => {
    narrationTimeoutsRef.current.forEach((t) => clearTimeout(t));
    narrationTimeoutsRef.current = [];
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingFullStory(false);
    setActiveLineIndex(null);
  };

  const currentStory = dynamicStories[currentStoryIndex] || dynamicStories[0] || STORIES_LIST[0];

  useEffect(() => {
    setShowQuiz(false);
    setSelectedQuizOption(null);
    setQuizFeedback(null);
    stopStoryNarration();
    clearTimers();
  }, [currentStoryIndex]);

  // Web Speech Recognition
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
              const transcript = event.results[0][0].transcript.trim();
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
              setMascotMessage("No speech heard! Speak clearly into the microphone and try again! 🐶🔊");
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
  }, [currentStoryIndex]);

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
    setCountdown(10);
    sounds.playMicToggle(true);
    setMascotMessage(`Recording! Read the story or your favourite line in British English! 🎤✨`);

    if (recognitionRef.current && !isRecognizingRef.current) {
      try {
        isRecognizingRef.current = true;
        recognitionRef.current.start();
      } catch {
        isRecognizingRef.current = false;
      }
    }

    let currentCount = 10;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount >= 1) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    // Auto-finish after 10.5 seconds
    autoFinishTimeoutRef.current = setTimeout(() => {
      handleFinishRecording(true, capturedTranscriptRef.current);
    }, 10500);
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

  // Proactively fetch more AI stories to avoid repetitive story loops
  const fetchMoreStories = async () => {
    if (isFetchingMoreAi) return;
    setIsFetchingMoreAi(true);
    try {
      const generated = await generateAiContent(
        'stories',
        3,
        dynamicStories.map((s) => s.title)
      );
      if (generated && generated.length > 0) {
        const formatted: MiniStory[] = generated.map((g, idx) => ({
          id: Date.now() + idx,
          title: g.title,
          subtitleEn: `A London Adventure at ${g.location}`,
          location: g.location || 'London Sights 🇬🇧',
          emoji: g.emoji || '📖',
          coverColor: 'from-amber-400 to-rose-500',
          lines: (g.paragraphs || []).map((p: string) => ({ en: p })),
          quiz: {
            question: `What was the highlight of this London story?`,
            options: [
              `Finding the special adventure at ${g.location}!`,
              `Taking the wrong train home.`,
              `Sleeping in all day.`,
            ],
            correctIndex: 0,
            explanation: `Spot on! The explorer had a grand adventure at ${g.location}!`,
          },
        }));
        setDynamicStories((prev) => [...prev, ...formatted]);
      }
    } catch (e) {
      console.warn('Could not fetch more AI stories:', e);
    } finally {
      setIsFetchingMoreAi(false);
    }
  };

  // Evaluate story reading with Gemini AI Coach
  const evaluateWithAiCoach = async (spoken: string) => {
    setIsAnalyzingAi(true);
    setMascotMessage('AI Phonics Coach is listening to your British story reading... 🦊✨');

    try {
      const evaluation = await getAiCoachEvaluation({
        targetText: currentStory.title,
        spokenText: spoken,
        category: 'story',
        phonicsBreakdown: currentStory.lines.slice(0, 3).map((l) => l.en),
      });

      setAiEvaluation(evaluation);
      setIsAnalyzingAi(false);
      setIsCoachModalOpen(true);

      const isPass = evaluation.status === 'perfect' || evaluation.canAutoAdvance === true || evaluation.score >= 70;

      if (isPass) {
        sounds.playCorrectWord();
        sounds.playSuccess();
      } else {
        sounds.playTap();
      }

      // Record to SQLite history without saving audio files
      try {
        jhonxDb.saveReadingSuccess(currentStory.title, undefined, isPass);
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
    sounds.playSuccess();
    onAddStars(50);
    setCelebrationMessage(`EXCELLENT! You read the story in British English! 📖🎉`);

    setTimeout(() => {
      setCelebrationMessage(null);
      setShowQuiz(true);
    }, 2500);
  };

  const advanceStory = () => {
    stopStoryNarration();
    if (currentStoryIndex < dynamicStories.length - 1) {
      const nextIdx = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIdx);
      if (nextIdx >= dynamicStories.length - 2) {
        fetchMoreStories();
      }
    } else {
      fetchMoreStories();
      setCurrentStoryIndex(0);
    }
  };

  const handleCoachModalClose = () => {
    setIsCoachModalOpen(false);
    if (aiEvaluation) {
      onAddStars(aiEvaluation.starsEarned);
    }
    setShowQuiz(true);
  };

  const handleCoachModalSkip = () => {
    setIsCoachModalOpen(false);
    setShowQuiz(true);
  };

  const handleCoachModalRetry = () => {
    setIsCoachModalOpen(false);
    setTimeout(() => {
      handleStartRecording();
    }, 350);
  };

  // Read full story sequentially with British narration
  const handlePlayFullStory = () => {
    if (isPlayingFullStory) {
      stopStoryNarration();
      return;
    }

    sounds.playTap();
    stopStoryNarration();
    setIsPlayingFullStory(true);
    setMascotMessage('Listening to the complete story in British English! Follow along with the highlighted lines! 📖✨');

    let delay = 300;
    currentStory.lines.forEach((line, idx) => {
      const t = setTimeout(() => {
        setActiveLineIndex(idx);
        sounds.speakBritish(line.en);
      }, delay);
      narrationTimeoutsRef.current.push(t);
      delay += 3200;
    });

    const finalT = setTimeout(() => {
      setActiveLineIndex(null);
      setIsPlayingFullStory(false);
      setMascotMessage('Story finished! Now you can read into the microphone or try the Fun Challenge! 🏆');
    }, delay + 500);
    narrationTimeoutsRef.current.push(finalT);
  };

  // Tap a specific line
  const handleLineTap = (line: { en: string; vocabNote?: string }, idx: number) => {
    sounds.playTap();
    setActiveLineIndex(idx);
    sounds.speakBritish(line.en);
    setMascotMessage(`Line ${idx + 1}: "${line.en}"`);
    setTimeout(() => setActiveLineIndex(null), 3000);
  };

  const handleStoryVoiceSuccess = () => {
    sounds.playCorrectWord();
    sounds.playSuccess();
    onAddStars(50);

    setCelebrationMessage(`EXCELLENT! You read the story in British English! 📖🎉`);
    setMascotMessage(`Brilliant reading! You completed the London story! +50 Stars! ⭐`);

    // Save to SQLite
    try {
      jhonxDb.saveReadingSuccess(currentStory.title, undefined, true);
    } catch {
      // ignore
    }

    setTimeout(() => {
      setCelebrationMessage(null);
      setShowQuiz(true);
    }, 2500);
  };

  // Answer story quiz
  const handleSelectQuizOption = (optIdx: number) => {
    sounds.playTap();
    setSelectedQuizOption(optIdx);

    if (optIdx === currentStory.quiz.correctIndex) {
      sounds.playCorrectWord();
      sounds.playBusHorn();
      onAddStars(30);
      setQuizFeedback(`🎉 CORRECT! ${currentStory.quiz.explanation} (+30 ⭐)`);
    } else {
      sounds.playTap();
      setQuizFeedback('Nearly there! Have another go! 🤔');
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-x-hidden select-none font-['Fredoka']">
      {/* CENÁRIO MÁGICO DE LONDRES ILUSTRADO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/cartoon_london_backdrop_1793964364409.jpg"
          alt="London City Background"
          className="w-full h-full object-cover object-bottom opacity-35 filter brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-slate-950/80 to-slate-950" />
      </div>

      {/* TOP SECTION: MODE SELECTOR & BOOK HEADER */}
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
            onClick={() => {
              sounds.playTap();
              onSelectMode('sentences');
            }}
            className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs text-slate-300 hover:text-white transition-all text-center"
          >
            💬 Sentences
          </button>
          <button
            onClick={() => sounds.playTap()}
            className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md scale-105 text-center"
          >
            📖 Stories
          </button>
        </div>

        {/* Current Story Board */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-3xl border-3 border-purple-400 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentStory.emoji}</span>
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                ILLUSTRATED SHORT STORIES · {currentStory.location}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {currentStory.title} ({currentStoryIndex + 1}/{STORIES_LIST.length})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                if (currentStoryIndex > 0) setCurrentStoryIndex((p) => p - 1);
                else setCurrentStoryIndex(STORIES_LIST.length - 1);
              }}
              className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Previous story"
            >
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>

            <span className="text-xs font-black text-amber-400 bg-amber-400/20 px-3 py-1.5 rounded-2xl border border-amber-400/40">
              +{50} ⭐ BONUS
            </span>

            <button
              onClick={() => {
                sounds.playTap();
                if (currentStoryIndex < STORIES_LIST.length - 1) setCurrentStoryIndex((p) => p + 1);
                else setCurrentStoryIndex(0);
              }}
              className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Next story"
            >
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* CENTRAL AREA: THE OPEN STORYBOOK */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {/* Full Story Audio Playback & Quiz Trigger */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handlePlayFullStory}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-3xl font-black text-sm border-3 shadow-xl transition-all transform active:scale-95 cursor-pointer ${
              isPlayingFullStory
                ? 'bg-purple-500 text-white border-white scale-105 shadow-purple-500/50'
                : 'bg-white/95 dark:bg-slate-900/95 text-purple-400 border-purple-400 hover:bg-purple-50'
            }`}
          >
            {isPlayingFullStory ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>{isPlayingFullStory ? 'Pause Narration 🇬🇧' : 'Listen to Full Story 🎧'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowQuiz(!showQuiz);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-3xl bg-amber-400 text-slate-950 font-black text-sm border-2 border-amber-300 shadow-md hover:bg-amber-300 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Fun Challenge</span>
          </button>
        </div>

        {/* STORYBOOK CARD */}
        <div className="bg-slate-900/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border-4 border-purple-400 shadow-2xl max-w-3xl w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{currentStory.title}</span>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  {currentStory.subtitleEn}
                </span>
              </h2>
            </div>
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>

          {/* Story Lines (Clickable & Highlighted) */}
          <div className="space-y-3">
            {currentStory.lines.map((line, idx) => {
              const isLineActive = activeLineIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => handleLineTap(line, idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-3 transition-all duration-300 cursor-pointer flex flex-col gap-1 transform active:scale-98 ${
                    isLineActive
                      ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-102'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-base sm:text-lg font-black tracking-wide ${
                      isLineActive ? 'text-amber-300' : 'text-white'
                    }`}>
                      {line.en}
                    </p>
                    <Volume2 className={`w-4 h-4 shrink-0 ml-2 ${
                      isLineActive ? 'text-amber-300 animate-pulse' : 'text-slate-500'
                    }`} />
                  </div>
                  {line.vocabNote && (
                    <p className="text-xs font-semibold text-slate-400">
                      🇬🇧 {line.vocabNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Child Tip */}
          <p className="text-xs text-center font-bold text-slate-400 pt-1">
            💡 Tip: Tap on any sentence to hear it spoken, or use the big mic to read!
          </p>
        </div>

        {/* FUN CHALLENGE QUIZ MODAL */}
        {showQuiz && (
          <div className="mt-4 bg-slate-900/95 border-3 border-amber-400 rounded-3xl p-5 shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h4 className="text-base font-black text-amber-400 uppercase tracking-wide">
                  Story Challenge
                </h4>
              </div>
              <button
                onClick={() => setShowQuiz(false)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <p className="text-sm font-black text-white">
              {currentStory.quiz.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStory.quiz.options.map((opt, optIdx) => {
                const isSelected = selectedQuizOption === optIdx;
                const isCorrect = optIdx === currentStory.quiz.correctIndex;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectQuizOption(optIdx)}
                    className={`p-3 rounded-2xl font-black text-xs transition-all border-2 text-center transform active:scale-95 cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-500 text-slate-950 border-white shadow-lg'
                          : 'bg-rose-500 text-white border-white'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizFeedback && (
              <p className="text-xs font-bold text-center text-amber-300 mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {quizFeedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: GIANT BOOMBOX MIC & FRIENDLY MASCOT */}
      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Mascot Speech Bubble */}
        <div className="mb-4 bg-white/95 dark:bg-slate-900/95 border-3 border-purple-400 rounded-3xl p-3.5 px-5 shadow-xl max-w-lg w-full flex items-center gap-3">
          <span className="text-3xl animate-bounce">🦊🕶️</span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-purple-400 block">
              Narrator Fox says:
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {mascotMessage}
            </p>
          </div>
        </div>

        {/* GIANT BOOMBOX MICROPHONE BUTTON */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-black tracking-wider text-purple-400 mb-2 uppercase animate-pulse text-center">
            {isRecording
              ? `LISTENING! READ THE STORY (${countdown}s) 📖🎤`
              : 'CLICK TO READ STORY IN BRITISH ENGLISH:'}
          </p>

          <button
            type="button"
            onClick={handleToggleClickToSpeak}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 transform active:scale-95 border-4 select-none ${
              isRecording
                ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-white shadow-[0_0_50px_rgba(0,255,102,0.9)] scale-110 ring-4 ring-emerald-300 animate-pulse'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 border-white shadow-[0_10px_25px_rgba(168,85,247,0.5)] hover:scale-105 hover:shadow-[0_12px_30px_rgba(168,85,247,0.7)]'
            }`}
            title={isRecording ? 'Click to finish speaking!' : 'Click to start speaking!'}
          >
            {isRecording ? (
              <>
                <Mic className="w-11 h-11 text-white animate-bounce" />
                {/* Audio wave bars */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                </div>
              </>
            ) : (
              <>
                <Mic className="w-12 h-12 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider mt-1">
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
                  <Sparkles className="w-4 h-4 animate-spin" /> AI Coach is listening to your story reading...
                </span>
              ) : isRecording ? (
                <span className="text-emerald-400 font-black">
                  Read aloud or click mic to finish!
                </span>
              ) : (
                <span>
                  Current story: <strong className="text-purple-400 text-sm font-black">"{currentStory.title}"</strong>
                </span>
              )}
            </span>

            {/* Quick Practice / Simulation Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  handleFinishRecording(true, currentStory.title);
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Test reading current story"
              >
                <span>📖 Test Read Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CELEBRATION SNACKBAR */}
      {celebrationMessage && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500 text-white p-4 px-6 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3">
            <span className="text-3xl">📖⭐</span>
            <div>
              <p className="text-base font-black tracking-tight leading-none">
                {celebrationMessage}
              </p>
              <p className="text-xs font-bold text-purple-200 mt-1">
                +50 Master Storyteller Stars added to your star bank! 🏆
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
        targetText={currentStory.title}
        spokenText={lastSpokenTranscript}
        evaluation={aiEvaluation}
        category="story"
      />
    </div>
  );
};
