import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { jhonxDb } from '../../utils/database';

interface PhonicsChallengeScreenProps {
  onWordComplete?: (word: string) => void;
}

export const PhonicsChallengeScreen: React.FC<PhonicsChallengeScreenProps> = ({
  onWordComplete,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentWord, setCurrentWord] = useState<string>('CAT'); // Atualizado para a fase de Camden!
  const [score, setScore] = useState<number>(120);
  const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
  const [pulseValue, setPulseValue] = useState<number>(0);
  const [activePhonicIndex, setActivePhonicIndex] = useState<number | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const recognitionRef = useRef<any>(null);

  // AnimationController simulation for 1000ms repeat(reverse: true) neon pulse
  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      const elapsed = Date.now() - startTimeRef.current;
      // Oscillate 0 -> 1 -> 0 over 1000ms
      const cycle = (elapsed % 1000) / 1000;
      const val = Math.sin(cycle * Math.PI);
      setPulseValue(val);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Web Speech Recognition for live voice reading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-GB';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.trim().toUpperCase();
          if (transcript.includes('CAT') || transcript === 'CAT') {
            showSuccessFeedback();
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleStartRecording = () => {
    if (isRecording) return;
    setIsRecording(true);
    sounds.playMicToggle(true);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch {
      // ignore
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    sounds.playMicToggle(false);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch {
      // ignore
    }

    // Trigger exact success feedback from Flutter code
    showSuccessFeedback();
  };

  const showSuccessFeedback = () => {
    sounds.playCorrectWord();
    sounds.playBusHorn();
    setScore((s) => s + 30);
    setSnackBarVisible(true);

    // Save reading record to JhonxDatabaseHelper (table_history & table_progress)
    try {
      jhonxDb.saveReadingSuccess(currentWord, undefined, true);
    } catch {
      // ignore
    }

    onWordComplete?.(currentWord);
  };

  // Auto-hide snackbar after 2.5 seconds (duration: Duration(seconds: 2))
  useEffect(() => {
    if (snackBarVisible) {
      const timer = setTimeout(() => {
        setSnackBarVisible(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [snackBarVisible]);

  const speakLetter = (letter: string, idx: number) => {
    setActivePhonicIndex(idx);
    sounds.speakBritish(letter.toLowerCase());
    setTimeout(() => setActivePhonicIndex(null), 500);
  };

  const speakFullWord = () => {
    sounds.speakBritish(currentWord);
  };

  const handleBusClick = () => {
    sounds.playBusHorn();
  };

  const phonicsLabels: Record<string, string> = {
    C: '/k/',
    A: '/æ/',
    T: '/t/',
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#121212] text-white select-none overflow-hidden font-sans">
      {/* BARRA DE PROGRESSO (O ônibus correndo para a meta) */}
      <div className="p-6 w-full shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="font-bold text-base tracking-tight"
            style={{ color: '#00e5ff' }}
          >
            ⚡ Score: {score}
          </span>
          <span className="font-bold text-xs text-slate-400">
            Level 2: Camden 🛹
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBusClick}
            className="text-[28px] hover:scale-125 transition-transform active:scale-95 cursor-pointer shrink-0"
            title="Tap to honk London Bus!"
          >
            🚌
          </button>

          {/* Progress track with 0.65 widthFactor and pink-to-orange gradient */}
          <div className="flex-1 mx-3 h-3.5 bg-[#262626] rounded-full relative overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: '65%', // widthFactor: 0.65
                background: 'linear-gradient(to right, #ff0055, #ff5500)',
                boxShadow: '0 0 12px rgba(255, 0, 85, 0.6)',
              }}
            />
          </div>

          <span className="text-[22px] shrink-0" title="Goal">
            🏁
          </span>
        </div>
      </div>

      {/* LETRAS GRANDES ESTILO GRAFITE NEON */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 my-auto">
        <div className="mb-4">
          <button
            onClick={speakFullWord}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1e1e] border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-slate-800 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear: "{currentWord}"</span>
          </button>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-3">
          {currentWord.split('').map((letter, idx) => {
            const isPhonicActive = activePhonicIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => speakLetter(letter, idx)}
                className={`relative group rounded-[20px] transition-all duration-200 transform active:scale-95 cursor-pointer ${
                  isPhonicActive ? 'scale-110 -translate-y-1' : ''
                }`}
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '3px solid #00e5ff', // Azul Elétrico
                  boxShadow: isPhonicActive
                    ? '0 0 25px rgba(0, 229, 255, 0.8)'
                    : '0 0 15px 1px rgba(0, 229, 255, 0.2)',
                }}
              >
                <div className="px-7 py-5 flex flex-col items-center justify-center min-w-[80px]">
                  <span className="text-7xl font-black text-white tracking-widest select-none font-mono leading-none">
                    {letter}
                  </span>
                  <span className="text-[11px] text-cyan-300 font-mono mt-1 opacity-75">
                    {phonicsLabels[letter] || `/${letter.toLowerCase()}/`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 font-mono mt-4">
          Camden Phonics: <span className="text-cyan-400 font-semibold">/k/ · /æ/ · /t/</span>
        </p>
      </div>

      {/* AREA DO MICROFONE COM ANIMAÇÃO DE PULSO NEON */}
      <div className="pb-12 flex flex-col items-center justify-center shrink-0">
        <p
          className="text-base font-bold tracking-wider transition-colors mb-5"
          style={{
            color: isRecording ? '#00ff66' : '#9ca3af',
            letterSpacing: '1.2px',
          }}
        >
          {isRecording ? 'SAY IT NOW! 🎤' : 'HOLD & READ ALOUD'}
        </p>

        {/* 100x100 Neon Pulse Boombox Circle (GestureDetector with onTapDown and onTapUp) */}
        <div
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
          onClick={() => {
            // Also supports direct toggle click
            if (!isRecording) {
              handleStartRecording();
              setTimeout(() => {
                handleStopRecording();
              }, 1200);
            }
          }}
          className="relative transition-all duration-150 transform active:scale-95 flex items-center justify-center cursor-pointer select-none"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '9999px',
            backgroundColor: isRecording ? '#00ff66' : '#ff0055',
            boxShadow: isRecording
              ? `0 0 25px ${pulseValue * 8}px rgba(0, 255, 102, ${0.3 + pulseValue * 0.4})`
              : '0 0 15px 2px rgba(255, 0, 85, 0.3)',
          }}
          title="Hold & Read Aloud or Click to Trigger"
        >
          {isRecording ? (
            <Mic className="w-12 h-12 text-black transition-transform duration-150 scale-110" />
          ) : (
            <MicOff className="w-12 h-12 text-white transition-transform duration-150" />
          )}

          {isRecording && (
            <span
              className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping pointer-events-none"
              style={{ animationDuration: '1s' }}
            />
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono mt-3">
          Press & hold to record or tap to speak
        </span>
      </div>

      {/* Flutter ScaffoldMessenger SnackBar (Verde Neon de Sucesso) */}
      {snackBarVisible && (
        <div className="absolute bottom-5 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className="p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-2 border border-emerald-300"
            style={{ backgroundColor: '#00ff66' }} // Verde Neon de Sucesso
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚌💨</span>
              <span className="text-xs font-bold text-black tracking-tight">
                BRILL! You said CAT perfectly!
              </span>
            </div>
            <button
              onClick={() => setSnackBarVisible(false)}
              className="text-black/70 hover:text-black font-bold text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
