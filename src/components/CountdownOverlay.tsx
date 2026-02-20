'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface CountdownOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function CountdownOverlay({ isVisible, onComplete }: CountdownOverlayProps) {
  const [countdown, setCountdown] = useState(3);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const audioContext = useMemo(() => {
    if (typeof window === 'undefined') return null;

    type WindowWithWebkitAudioContext = Window & {
      webkitAudioContext?: typeof AudioContext;
    };

    const w = window as WindowWithWebkitAudioContext;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  }, []);

  const playBeep = (frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);
  };

  useEffect(() => {
    if (!isVisible) return;

    setCountdown(3);
    // 1 bip no "3"
    playBeep(800);

    let cancelled = false;

    const tick = (next: number) => {
      if (cancelled) return;
      setCountdown(next);

      if (next === 2) {
        // 1 bip no "2"
        playBeep(800);
        setTimeout(() => tick(1), 1000);
        return;
      }

      if (next === 1) {
        // 1 bip no "1"
        playBeep(800);
        // Fecha o overlay e inicia o preparo logo após o último bip
        setTimeout(() => {
          if (cancelled) return;
          setCountdown(0);
          onCompleteRef.current();
        }, 500);
        return;
      }
    };

    const timeoutId = setTimeout(() => tick(2), 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-9xl font-bold text-white mb-8">{countdown}</div>
        <div className="text-4xl text-orange-400 mb-4">Prepare-se...</div>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-400 transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>
        
        <div className="text-white/60 text-sm mt-4">
          {countdown === 3 && "3..."}
          {countdown === 2 && "2..."}
          {countdown === 1 && "1..."}
        </div>
      </div>
    </div>
  );
}
