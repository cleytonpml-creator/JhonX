import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, ChevronRight, RotateCcw, Star, Award, Heart, Flame, Target } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { jhonxDb, PhonicsChallengeStats } from '../../utils/database';
import { getAiCoachEvaluation, AiCoachEvaluation, generateAiContent, generateAdaptivePhonicsSequence } from '../../utils/aiCoach';
import { PHONICS_LEVELS, getLevelData, PhonicsLevel, LondonStop, AdaptiveMissionSequence } from '../../utils/phonicsLevels';
import { KidsAiCoachModal } from './KidsAiCoachModal';
import { KidsLevelUpModal } from './KidsLevelUpModal';

interface KidsPhonicsArenaProps {
  explorerName?: string;
  onWordComplete: (word: string) => void;
  starsCount: number;
  onAddStars: (amount: number) => void;
  onSelectMode?: (mode: 'phonics' | 'sentences' | 'stories') => void;
}

export const KidsPhonicsArena: React.FC<KidsPhonicsArenaProps> = ({
  explorerName = 'Alex',
  onWordComplete,
  starsCount,
  onAddStars,
  onSelectMode,
}) => {
  // Challenge Stats & Progressive Difficulty Level
  const [challengeStats, setChallengeStats] = useState<PhonicsChallengeStats>(() =>
    jhonxDb.getChallengeStats()
  );
  const [currentLevel, setCurrentLevel] = useState<number>(
    () => jhonxDb.getChallengeStats().currentLevel || 1
  );
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<boolean>(false);
  const [unlockedLevel, setUnlockedLevel] = useState<PhonicsLevel>(() =>
    getLevelData(jhonxDb.getChallengeStats().currentLevel || 1)
  );

  const levelData = getLevelData(currentLevel);

  // Gemini Adaptive Mission Sequence & Dynamic stops pool
  const [activeMission, setActiveMission] = useState<AdaptiveMissionSequence | null>(null);
  const [isGeneratingMission, setIsGeneratingMission] = useState<boolean>(false);
  const [dynamicStops, setDynamicStops] = useState<LondonStop[]>(() => levelData.stops);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [isFetchingMoreAi, setIsFetchingMoreAi] = useState<boolean>(false);

  const [stopIndex, setStopIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [activePhonicIndex, setActivePhonicIndex] = useState<number | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [isBusHonking, setIsBusHonking] = useState<boolean>(false);
  const [mascotMessage, setMascotMessage] = useState<string>(
    'Hello, explorer! Tap the letters to hear their British phonics sounds, and click the big mic to speak!'
  );

  // AI Phonics Coach Evaluation States
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

  const fallbackStop: LondonStop = {
    id: 1,
    location: 'Big Ben 🕰️',
    word: 'CAT',
    phonics: ['C', 'A', 'T'],
    emoji: '🐱',
    hint: 'A furry pet that purrs!',
    phonicsFocus: 'CVC /k/ /æ/ /t/',
    missionContext: 'Westminster Clock Tower',
    difficultyScore: 1,
  };

  const currentStop: LondonStop = dynamicStops[stopIndex] || dynamicStops[0] || levelData.stops[0] || fallbackStop;
  const currentWord = (currentStop?.word || 'CAT').toUpperCase();

  // Initialize Web Speech Recognition with safe fallback
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
              const transcript = event.results[0][0].transcript.trim().toUpperCase();
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
              setMascotMessage("No speech was heard! Make sure your microphone is on and speak clearly. 🐶🔊");
            }
          };

          recognition.onend = () => {
            isRecognizingRef.current = false;
          };

          recognitionRef.current = recognition;
        } catch {
          // ignore if unavailable
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
  }, [currentWord, stopIndex]);

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

  // Click-to-Speak Toggle: Click once to start listening, click again to finish early, or auto-finish after countdown
  const handleToggleClickToSpeak = () => {
    if (isRecording) {
      // Child clicked while recording -> finish early and evaluate whatever was captured
      handleFinishRecording(true, capturedTranscriptRef.current);
    } else {
      // Start recording session
      handleStartRecording();
    }
  };

  const handleStartRecording = () => {
    clearTimers();
    capturedTranscriptRef.current = '';
    isProcessingRecordingRef.current = false;
    setIsRecording(true);
    setCountdown(5);
    sounds.playMicToggle(true);
    setMascotMessage(`Listening! Say "${currentWord}" loud and clear in British English! 🎤✨`);

    // Safely start Web Speech Recognition
    if (recognitionRef.current && !isRecognizingRef.current) {
      try {
        isRecognizingRef.current = true;
        recognitionRef.current.start();
      } catch {
        isRecognizingRef.current = false;
      }
    }

    // Countdown interval (5... 4... 3... 2... 1...)
    let currentCount = 5;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount >= 1) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    // Auto-finish after 5.5 seconds if child hasn't tapped again
    autoFinishTimeoutRef.current = setTimeout(() => {
      handleFinishRecording(true, capturedTranscriptRef.current);
    }, 5500);
  };

  const handleFinishRecording = async (success: boolean = true, transcriptText?: string) => {
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
      const raw = transcriptText !== undefined ? transcriptText : capturedTranscriptRef.current;
      const finalSpoken = (raw || '').trim();
      setLastSpokenTranscript(finalSpoken);
      await evaluateWithAiCoach(finalSpoken);
    } else {
      isProcessingRecordingRef.current = false;
    }
  };

  // Gemini API Adaptive Phonics Sequence Generator
  const loadNextAdaptiveSequence = async (forceLevel?: number) => {
    setIsGeneratingMission(true);
    const targetLvl = forceLevel || currentLevel;
    try {
      const progressList = jhonxDb.getProgress();
      const weak = progressList.filter((p) => p.mastery_percentage < 80).map((p) => p.letter);
      const strong = progressList.filter((p) => p.mastery_percentage >= 85).map((p) => p.letter);

      const mission = await generateAdaptivePhonicsSequence({
        childName: explorerName,
        currentLevel: targetLvl,
        accuracy: challengeStats.accuracy,
        consecutiveCorrect: challengeStats.currentStreak,
        weakLetters: weak,
        strongLetters: strong,
        recentlyCompletedWords: usedWords,
        routeTheme: currentStop?.location || 'London Phonics Adventure',
      });

      if (mission && mission.stops && mission.stops.length > 0) {
        setActiveMission(mission);
        setDynamicStops(mission.stops);
        setStopIndex(0);
        sounds.playSuccess();
        setMascotMessage(`✨ Gemini Quest: "${mission.missionTitle}"! ${mission.missionGoal} 🚌💨`);
      }
    } catch (e) {
      console.warn('Failed to load adaptive sequence:', e);
    } finally {
      setIsGeneratingMission(false);
    }
  };

  // Initial adaptive sequence load on mount
  useEffect(() => {
    if (!activeMission) {
      loadNextAdaptiveSequence();
    }
  }, []);

  // Evaluate child pronunciation with Gemini AI Coach
  const evaluateWithAiCoach = async (spoken: string) => {
    setIsAnalyzingAi(true);
    setMascotMessage('AI Phonics Coach is listening to your British pronunciation... 🤖✨');

    try {
      const evaluation = await getAiCoachEvaluation({
        targetText: currentWord,
        spokenText: spoken,
        category: 'word',
        phonicsBreakdown: currentStop?.phonics || currentWord.split(''),
      });

      setAiEvaluation(evaluation);
      setIsAnalyzingAi(false);

      // Pronunciation accuracy & streak tracking
      const isCorrect = evaluation.status === 'perfect' || evaluation.canAutoAdvance === true || evaluation.score >= 70;
      const attemptResult = jhonxDb.recordChallengeAttempt(isCorrect);
      setChallengeStats(attemptResult.stats);

      // Play audio feedback
      if (isCorrect) {
        sounds.playCorrectWord();
        sounds.playBusHorn();
      } else {
        sounds.playTap();
      }

      // Check if child achieved 5 consecutive correct words -> Automatic Difficulty Level Up!
      if (attemptResult.isLevelUp) {
        const nextLevelData = getLevelData(attemptResult.newLevel);
        setUnlockedLevel(nextLevelData);
        setCurrentLevel(attemptResult.newLevel);
        loadNextAdaptiveSequence(attemptResult.newLevel);
        onAddStars(50);
        sounds.playBusHorn();
        sounds.playSuccess();
        setMascotMessage(`AMAZING! 5 words in a row! Unlocked Level ${attemptResult.newLevel}: ${nextLevelData.name}! 🚀🚌`);
        setIsLevelUpModalOpen(true);
      } else {
        setIsCoachModalOpen(true);
      }

      // Record to SQLite history without saving audio file
      try {
        jhonxDb.saveReadingSuccess(currentWord, undefined, isCorrect);
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
    onAddStars(35);

    const attemptResult = jhonxDb.recordChallengeAttempt(true);
    setChallengeStats(attemptResult.stats);

    if (attemptResult.isLevelUp) {
      const nextLevelData = getLevelData(attemptResult.newLevel);
      setUnlockedLevel(nextLevelData);
      setCurrentLevel(attemptResult.newLevel);
      loadNextAdaptiveSequence(attemptResult.newLevel);
      onAddStars(50);
      sounds.playBusHorn();
      sounds.playSuccess();
      setCelebrationMessage(`🌟 5 IN A ROW! Level ${attemptResult.newLevel} Unlocked! 🚀`);
      setIsLevelUpModalOpen(true);
    } else {
      setCelebrationMessage(`BRILLIANT! You said "${currentWord}" perfectly! 🚌💨`);
    }

    onWordComplete(currentWord);

    setTimeout(() => {
      setCelebrationMessage(null);
      advanceStop();
    }, 2200);
  };

  const advanceStop = () => {
    setUsedWords((prev) => [...prev, currentWord]);
    if (stopIndex < dynamicStops.length - 1) {
      setStopIndex((prev) => prev + 1);
    } else {
      // Completed current adaptive mission sequence! Trigger next Gemini adaptive journey!
      sounds.playSuccess();
      sounds.playBusHorn();
      onAddStars(50);
      setCelebrationMessage(`🎉 MISSION ACCOMPLISHED! Generating next Gemini adaptive sequence... 🚀`);
      setTimeout(() => {
        setCelebrationMessage(null);
        loadNextAdaptiveSequence();
      }, 2200);
    }
  };

  const handleCoachModalClose = () => {
    setIsCoachModalOpen(false);
    if (aiEvaluation) {
      onAddStars(aiEvaluation.starsEarned);
      if (aiEvaluation.status === 'perfect' || aiEvaluation.score >= 85) {
        onWordComplete(currentWord);
        advanceStop();
      }
    }
  };

  const handleCoachModalSkip = () => {
    setIsCoachModalOpen(false);
    onWordComplete(currentWord);
    advanceStop();
  };

  const handleCoachModalRetry = () => {
    setIsCoachModalOpen(false);
    setTimeout(() => {
      handleStartRecording();
    }, 350);
  };

  const handleBusHonk = () => {
    sounds.playBusHorn();
    setIsBusHonking(true);
    setMascotMessage('BEEP-BEEP! The London Double-Decker bus is honking down the street! 🚌💨');
    setTimeout(() => setIsBusHonking(false), 800);
  };

  const handleLetterTap = (letter: string, idx: number) => {
    sounds.playTap();
    setActivePhonicIndex(idx);
    sounds.speakBritish(letter.toLowerCase());
    const phonemeLabel = (currentStop?.phonics && currentStop.phonics[idx]) || letter;
    setMascotMessage(`Phonics sound of letter "${letter}": ${phonemeLabel}!`);
    setTimeout(() => setActivePhonicIndex(null), 600);
  };

  const letterColors = [
    { bg: 'from-pink-500 to-rose-600', border: 'border-pink-300', shadow: 'shadow-pink-500/40' },
    { bg: 'from-cyan-400 to-sky-600', border: 'border-cyan-200', shadow: 'shadow-cyan-500/40' },
    { bg: 'from-amber-400 to-orange-500', border: 'border-amber-200', shadow: 'shadow-orange-500/40' },
    { bg: 'from-emerald-400 to-teal-600', border: 'border-emerald-200', shadow: 'shadow-emerald-500/40' },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden select-none font-['Fredoka']">
      {/* CENÁRIO MÁGICO DE LONDRES ILUSTRADO AO FUNDO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/cartoon_london_backdrop_1793964364409.jpg"
          alt="London City Background"
          className="w-full h-full object-cover object-bottom opacity-35 filter brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-slate-950/80" />
      </div>

      {/* PARTE SUPERIOR: A ESTRADA DO ÔNIBUS DE DOIS ANDARES */}
      <div className="relative z-10 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-3">
        {/* Quick Mode Switcher (Words -> Sentences -> Stories) */}
        {onSelectMode && (
          <div className="flex items-center justify-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-3xl border-3 border-amber-400 max-w-md mx-auto shadow-xl">
            <button
              onClick={() => sounds.playTap()}
              className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-400 to-sky-500 text-white shadow-md scale-105 text-center"
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
              onClick={() => {
                sounds.playTap();
                onSelectMode('stories');
              }}
              className="flex-1 py-1.5 px-3 rounded-2xl font-black text-xs text-slate-300 hover:text-white transition-all text-center"
            >
              📖 Stories
            </button>
          </div>
        )}

        {/* Current Destination & Mission Board */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-3xl border-3 border-amber-400 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin [animation-duration:8s]">🎡</span>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Current Stop</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {currentStop.location}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Level Badge Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-xs shadow-sm">
              <span>{levelData.badge}</span>
            </div>

            {/* Streak Tracker Pill (0 to 5) */}
            <div
              className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-2xl font-black text-xs border border-amber-400/40"
              title="Pronounce 5 words correctly in a row to level up!"
            >
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-bounce" />
                <span>Streak: {challengeStats.currentStreak}/5</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((pip) => (
                  <span
                    key={pip}
                    className={`w-2 h-2 rounded-full transition-all ${
                      pip <= challengeStats.currentStreak
                        ? 'bg-amber-400 scale-125 shadow-sm shadow-amber-400'
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Accuracy Tracker Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-2xl font-black text-xs border border-sky-400/30">
              <Target className="w-3.5 h-3.5" />
              <span>{challengeStats.accuracy}% Accuracy</span>
            </div>

            <div className="text-xs font-bold text-slate-500 hidden sm:inline">
              Stop {stopIndex + 1} of {dynamicStops.length}
            </div>
          </div>
        </div>

        {/* GEMINI ADAPTIVE MISSION HUD BANNER */}
        <div className="bg-gradient-to-r from-purple-950/85 via-indigo-950/85 to-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-purple-400/40 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className={`w-4 h-4 ${isGeneratingMission ? 'animate-spin text-amber-400' : 'animate-pulse'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
                  Adaptive Sequence
                </span>
                {isGeneratingMission ? (
                  <span className="text-xs font-bold text-amber-300 animate-pulse">
                    Crafting personalized London quest...
                  </span>
                ) : (
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {activeMission?.missionTitle || 'London Phonics Quest'}
                  </h4>
                )}
              </div>
              {activeMission?.missionGoal && !isGeneratingMission && (
                <p className="text-[11px] text-purple-200/80 truncate max-w-md">
                  🎯 {activeMission.missionGoal}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Focus Phonemes Chips */}
            {activeMission?.focusPhonemes && activeMission.focusPhonemes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">Target:</span>
                {activeMission.focusPhonemes.slice(0, 3).map((ph, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-black px-1.5 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono"
                  >
                    {ph}
                  </span>
                ))}
              </div>
            )}

            {/* Manual Refresh / Next Quest Trigger */}
            <button
              onClick={() => {
                sounds.playTap();
                loadNextAdaptiveSequence();
              }}
              disabled={isGeneratingMission}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-purple-600/40 hover:bg-purple-600/70 text-purple-200 border border-purple-400/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Generate a new adaptive quest matched to your progress"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{isGeneratingMission ? 'Generating...' : 'New Quest ✨'}</span>
            </button>
          </div>
        </div>

        {/* URBAN STREET WITH MOVING DOUBLE-DECKER BUS */}
        <div className="relative bg-slate-800/90 rounded-3xl p-4 border-4 border-slate-700 shadow-xl overflow-hidden">
          {/* Dashed road line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 border-b-2 border-dashed border-amber-300 opacity-60" />

          {/* London Stop Markers along the route */}
          <div className="flex items-center justify-between relative z-10 px-2 overflow-x-auto no-scrollbar gap-2">
            {dynamicStops.map((stop, idx) => {
              const isPast = idx < stopIndex;
              const isCurrent = idx === stopIndex;
              return (
                <button
                  key={stop.id}
                  onClick={() => {
                    sounds.playTap();
                    setStopIndex(idx);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all transform hover:scale-110 cursor-pointer shrink-0 ${
                    isCurrent ? 'scale-115' : 'opacity-70'
                  }`}
                  title={stop.location}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black transition-all shadow-md ${
                      isCurrent
                        ? 'bg-rose-500 text-white border-3 border-white ring-4 ring-rose-400/50 animate-bounce'
                        : isPast
                        ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : stop.emoji}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : 'text-slate-300'
                    }`}
                  >
                    {stop.word}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Red Bus driving on the road */}
          <div
            onClick={handleBusHonk}
            style={{
              left: `${(stopIndex / Math.max(1, dynamicStops.length - 1)) * 80 + 5}%`,
            }}
            className={`absolute -top-3.5 z-20 cursor-pointer transform -translate-x-1/2 transition-all duration-700 ease-out flex flex-col items-center group ${
              isBusHonking ? 'animate-bounce scale-125' : 'hover:scale-110'
            }`}
            title="Click the Bus to Honk! 🚌💨"
          >
            <div className="relative">
              <span className="text-4xl filter drop-shadow-lg inline-block">🚌</span>
              {isBusHonking && (
                <span className="absolute -top-4 -right-4 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-black animate-ping">
                  HONK!
                </span>
              )}
            </div>
            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full -mt-1 shadow-sm whitespace-nowrap">
              JHONX
            </span>
          </div>
        </div>
      </div>

      {/* CENTRAL AREA: CHUNKY LETTER TILES WITH CARTOON EYES */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        {/* Listen to full word */}
        <button
          onClick={() => {
            sounds.playTap();
            sounds.speakBritish(currentWord);
          }}
          className="mb-6 flex items-center gap-2 px-5 py-2.5 rounded-3xl bg-white/95 dark:bg-slate-900/95 text-sky-600 dark:text-sky-400 font-black text-sm border-3 border-sky-400 shadow-lg hover:bg-sky-50 transition-all transform active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-5 h-5 text-sky-500 animate-pulse" />
          <span>Listen to Word: "{currentWord}" 🇬🇧</span>
        </button>

        {/* Chunky Letter Blocks */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {currentWord.split('').map((letter, idx) => {
            const isPhonicActive = activePhonicIndex === idx;
            const colorScheme = letterColors[idx % letterColors.length];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLetterTap(letter, idx)}
                className={`relative group rounded-3xl p-2 transition-all duration-200 transform cursor-pointer active:scale-90 ${
                  isPhonicActive
                    ? 'scale-120 -translate-y-3'
                    : 'hover:scale-105 hover:-translate-y-1'
                }`}
              >
                {/* 3D Gummy Tile */}
                <div
                  className={`w-24 sm:w-28 h-32 sm:h-36 rounded-3xl bg-gradient-to-b ${colorScheme.bg} border-4 ${colorScheme.border} shadow-2xl flex flex-col items-center justify-between p-3 relative overflow-hidden`}
                  style={{
                    boxShadow: isPhonicActive
                      ? '0 20px 30px rgba(0, 229, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.8)'
                      : '0 12px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Cute cartoon eyes */}
                  <div className="flex items-center gap-2 pt-1 opacity-80">
                    <span className="w-2 h-2 rounded-full bg-white shadow-inner" />
                    <span className="w-2 h-2 rounded-full bg-white shadow-inner" />
                  </div>

                  {/* Letter Symbol (72px) */}
                  <span className="text-6xl sm:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] leading-none select-none">
                    {letter}
                  </span>

                  {/* British Phonics Label */}
                  <span className="text-xs font-black text-slate-900 bg-white/90 px-3 py-0.5 rounded-full shadow-sm">
                    {(currentStop?.phonics && currentStop.phonics[idx]) || `/${letter.toLowerCase()}/`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mission Context & Phonics Focus Metadata */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap max-w-xl">
          {currentStop.phonicsFocus && (
            <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-400/40 shadow-sm flex items-center gap-1">
              <span>🎯 Phonics Focus:</span>
              <strong className="text-white font-mono">{currentStop.phonicsFocus}</strong>
            </span>
          )}
          {currentStop.missionContext && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700 shadow-sm">
              🇬🇧 {currentStop.missionContext}
            </span>
          )}
          {currentStop.difficultyScore && (
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono shadow-sm">
              ★ Diff: {currentStop.difficultyScore}/10
            </span>
          )}
        </div>

        {/* Tip for Child */}
        <p className="mt-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 rounded-full border border-amber-400 shadow-sm">
          💡 Tap each letter to learn its British English phonics sound!
        </p>
      </div>

      {/* BOTTOM SECTION: GIANT BOOMBOX MIC & FRIENDLY MASCOT */}
      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Mascot Speech Bubble */}
        <div className="mb-4 bg-white/95 dark:bg-slate-900/95 border-3 border-sky-400 rounded-3xl p-3.5 px-5 shadow-xl max-w-lg w-full flex items-center gap-3">
          <span className="text-3xl animate-bounce">🐶🛹</span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-sky-500 block">
              Camden Town Bulldog says:
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {mascotMessage}
            </p>
          </div>
        </div>

        {/* GIANT BOOMBOX MICROPHONE BUTTON */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-black tracking-wider text-rose-500 dark:text-rose-400 mb-2 uppercase animate-pulse text-center">
            {isRecording
              ? `LISTENING! SPEAK NOW (${countdown}s) 🎤✨`
              : 'CLICK TO SPEAK IN BRITISH ENGLISH:'}
          </p>

          <button
            type="button"
            onClick={handleToggleClickToSpeak}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 transform active:scale-95 border-4 select-none ${
              isRecording
                ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-white shadow-[0_0_50px_rgba(0,255,102,0.9)] scale-110 ring-4 ring-emerald-300 animate-pulse'
                : 'bg-gradient-to-br from-rose-500 to-pink-600 border-white shadow-[0_10px_25px_rgba(255,0,85,0.5)] hover:scale-105 hover:shadow-[0_12px_30px_rgba(255,0,85,0.7)]'
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
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono text-center">
              {isAnalyzingAi ? (
                <span className="text-amber-400 font-black animate-pulse flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin" /> AI Phonics Coach is evaluating your pronunciation...
                </span>
              ) : isRecording ? (
                <span className="text-emerald-400 font-black">
                  Say <strong className="text-white text-sm bg-emerald-700 px-2 py-0.5 rounded-lg">"{currentWord}"</strong> or click mic to finish!
                </span>
              ) : (
                <span>
                  Click mic & say: <strong className="text-rose-500 text-sm font-black">"{currentWord}"</strong>
                </span>
              )}
            </span>

            {/* Quick Practice / Simulation Tools for testing voice without mic issues */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  handleFinishRecording(true, currentWord);
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Test with accurate voice pronunciation"
              >
                <span>🗣️ Test Pronounce ({currentWord})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playTap();
                  // Test with slight mistake to verify AI diagnosis
                  handleFinishRecording(true, currentWord.slice(0, 1) + 'O' + currentWord.slice(2));
                }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Test with mistake to see AI Coach feedback and mouth tips"
              >
                <span>💡 Test Mistake</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CELEBRATION SNACKBAR */}
      {celebrationMessage && (
        <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 p-4 px-6 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-3">
            <span className="text-3xl">🚌💨</span>
            <div>
              <p className="text-base font-black tracking-tight leading-none">
                {celebrationMessage}
              </p>
              <p className="text-xs font-bold text-emerald-950 mt-1">
                +30 Gold Stars added to your star bank! ⭐
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
        targetText={currentWord}
        spokenText={lastSpokenTranscript}
        evaluation={aiEvaluation}
        category="word"
        streakCount={challengeStats.currentStreak}
        accuracy={challengeStats.accuracy}
      />

      {/* 5 CONSECUTIVE WORDS LEVEL UP CELEBRATION MODAL */}
      <KidsLevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        unlockedLevel={unlockedLevel}
        starsEarnedBonus={50}
      />
    </div>
  );
};

