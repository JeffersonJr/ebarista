'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Play, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { Moon, Sun, User, History, LogOut } from 'lucide-react';
import Link from 'next/link';
import CountdownOverlay from '@/components/CountdownOverlay';
import FinalizeButton from '@/components/FinalizeButton';

export default function PreparoV60Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userEmail] = useState('jeffersoncamposbeirajunior@gmail.com');
  const [showCountdown, setShowCountdown] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinalPhase, setIsFinalPhase] = useState(false);
  const [drainageSeconds, setDrainageSeconds] = useState(0);

  const STEP_SECONDS = 50;
  const TOTAL_STEPS = 3;
  const TIMER_MAX_SECONDS = STEP_SECONDS * TOTAL_STEPS;
  const circleRadius = 88;
  const circleCircumference = useMemo(() => 2 * Math.PI * circleRadius, []);

  const lastBeepedSecondRef = useRef<number | null>(null);

  const audioContext = useMemo(() => {
    if (typeof window === 'undefined') return null;

    type WindowWithWebkitAudioContext = Window & {
      webkitAudioContext?: typeof AudioContext;
    };

    const w = window as WindowWithWebkitAudioContext;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  }, []);

  const enableAudio = useCallback(() => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => undefined);
    }
  }, [audioContext]);

  const playTone = useCallback((opts: {
    frequency: number;
    type: OscillatorType;
    durationSeconds: number;
    gain: number;
  }) => {
    if (!audioContext) return;

    // iOS/Safari sometimes requires resume after user gesture
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => undefined);
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = opts.frequency;
    oscillator.type = opts.type;

    gainNode.gain.setValueAtTime(opts.gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + opts.durationSeconds);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + opts.durationSeconds);
  }, [audioContext]);

  const playTickBeep = useCallback(() => {
    playTone({ frequency: 800, type: 'sine', durationSeconds: 0.12, gain: 0.22 });
  }, [playTone]);

  const playStartBeep = useCallback(() => {
    playTone({ frequency: 1200, type: 'triangle', durationSeconds: 0.18, gain: 0.28 });
  }, [playTone]);

  const handleStart = () => {
    enableAudio();
    setShowCountdown(true);
  };

  const handleReset = () => {
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    setShowCountdown(false);
    setIsFinalPhase(false);
    setDrainageSeconds(0);
    lastBeepedSecondRef.current = null;
  };

  const handleFinalize = () => {
    // Aqui você pode adicionar a lógica para finalizar
    // Por exemplo, salvar o tempo, mostrar uma mensagem, etc.
    console.log('Finalizado com tempo extra:', getTimerText());
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    enableAudio();
    playStartBeep();
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    lastBeepedSecondRef.current = null;
  };

  useEffect(() => {
    if (!isTimerRunning) return;

    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= TIMER_MAX_SECONDS) {
          setIsTimerRunning(false);
          setIsFinalPhase(true);
          setDrainageSeconds(0);
          return TIMER_MAX_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isTimerRunning, TIMER_MAX_SECONDS]);

  // Contador progressivo da fase de drenagem
  useEffect(() => {
    if (!isFinalPhase) return;

    const id = window.setInterval(() => {
      setDrainageSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [isFinalPhase]);

  const getTimerText = () => {
    if (isFinalPhase) {
      const mins = Math.floor(drainageSeconds / 60);
      const secs = drainageSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stepLabel = useMemo(() => {
    const step = Math.min(TOTAL_STEPS, Math.floor(elapsedSeconds / STEP_SECONDS) + 1);
    return `Passo ${step} de ${TOTAL_STEPS}`;
  }, [elapsedSeconds, STEP_SECONDS, TOTAL_STEPS]);

  const stepElapsedSeconds = useMemo(() => {
    if (elapsedSeconds === 0) return 0;
    const mod = elapsedSeconds % STEP_SECONDS;
    return mod === 0 ? STEP_SECONDS : mod;
  }, [elapsedSeconds, STEP_SECONDS]);

  useEffect(() => {
    if (!isTimerRunning) return;
    if (lastBeepedSecondRef.current === elapsedSeconds) return;

    if (stepElapsedSeconds >= STEP_SECONDS - 5 && stepElapsedSeconds <= STEP_SECONDS - 1) {
      playTickBeep();
      lastBeepedSecondRef.current = elapsedSeconds;
      return;
    }

    if (stepElapsedSeconds === STEP_SECONDS && elapsedSeconds !== 0) {
      playStartBeep();
      lastBeepedSecondRef.current = elapsedSeconds;
    }
  }, [elapsedSeconds, isTimerRunning, playStartBeep, playTickBeep, stepElapsedSeconds, STEP_SECONDS]);

  const progress = useMemo(() => {
    return Math.min(1, stepElapsedSeconds / STEP_SECONDS);
  }, [stepElapsedSeconds, STEP_SECONDS]);

  const progressDashOffset = useMemo(() => {
    return circleCircumference * (1 - progress);
  }, [circleCircumference, progress]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4 pb-24`}>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link 
            href="/v60"
            className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-center flex-1">
          <h1 className="text-xl font-bold tracking-tight">Preparo V60</h1>
        </div>

        <div className="flex items-center gap-2 relative">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 ${showUserDropdown ? 'border-cyan-500' : 'border-transparent'} transition-all`}
              >
                <Image 
                  src="/avatar.png" 
                  alt="User Avatar" 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </button>

              {showUserDropdown && (
                <div className={`absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl border ${isDarkMode ? 'bg-[#18181b] border-gray-800' : 'bg-white border-gray-200'} z-50 overflow-hidden animate-in fade-in zoom-in duration-200`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm truncate">Jefferson Júnior</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        Conectado
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      href="/?view=profile"
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                    >
                      <User className="w-4 h-4" />
                      Perfil
                    </Link>
                    <Link 
                      href="/?view=history"
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                    >
                      <History className="w-4 h-4" />
                      Histórico de Extrações
                    </Link>
                  </div>

                  <div className={`p-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button 
                      onClick={() => setIsLoggedIn(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 ${isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'} transition-colors`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button 
              onClick={() => setIsLoggedIn(true)}
              className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-cyan-600'} transition-colors`}
            >
              <LogOut className="w-4 h-4 rotate-180" />
              Entrar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Contador Circular Central */}
        <div className="flex items-center justify-center pt-8 mb-6">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#00d2ff"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circleCircumference}
                strokeDashoffset={progressDashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tabular-nums">
                {getTimerText()}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                {isFinalPhase ? 'Drenagem Adicional' : stepLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Card de Informações */}
        <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6 text-center`}>
          <h3 className="text-lg font-medium text-gray-400 mb-4">
            {isFinalPhase ? 'Drenagem Adicional' : 'Fase do Sabor'}
          </h3>
          
          <div className="space-y-3">
            {isFinalPhase ? (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-orange-500">contador progressivo</span>
                <span className="text-lg font-medium">iniciando no 00:00 até o usuário clicar no botão finalizar</span>
                <span className="text-lg font-medium">Toque para finalizar com tempo extra</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold text-orange-500">Adicione <span className="text-5xl font-bold text-orange-500">+60g</span></span>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className="text-lg font-medium">Total na Balança: <span className="text-lg font-bold">60g</span></span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        {isFinalPhase ? (
          <FinalizeButton isDarkMode={isDarkMode} onClick={handleFinalize} />
        ) : (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Reiniciar</span>
            </button>
            
            <button 
              onClick={handleStart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white transition-colors`}
            >
              <Play className="w-5 h-5" fill="white" />
              <span className="font-medium">Iniciar</span>
            </button>
            
            <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <ChevronLeft className="w-5 h-5 rotate-180" />
              <span className="font-medium">Próximo</span>
            </button>
          </div>
        )}

        {/* Cards de Passos */}
        <div className="mt-8 mb-24">
          <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4 text-left">Todos os Passos</h3>
          
          <div className="space-y-3">
            {/* Card 01 - Ativo */}
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-3 border-2 border-cyan-500`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black">01</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-orange-500">+79g</div>
                    <div className="text-lg font-medium">total 79g</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-lg">
                  40%
                </div>
              </div>
            </div>

            {/* Card 02 - Inativo */}
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-3 opacity-60`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black">02</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-400">+79g</div>
                    <div className="text-lg font-medium text-gray-500">total 158g</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                  40%
                </div>
              </div>
            </div>

            {/* Card 03 - Inativo */}
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-3 opacity-60`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black">03</div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-400">+79g</div>
                    <div className="text-lg font-medium text-gray-500">total 237g</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                  60%
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Countdown Overlay */}
      <CountdownOverlay isVisible={showCountdown} onComplete={handleCountdownComplete} />
    </div>
  );
}
