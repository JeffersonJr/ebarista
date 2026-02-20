'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CountdownOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function CountdownOverlay({ isVisible, onComplete }: CountdownOverlayProps) {
  const [countdown, setCountdown] = useState(3);

  const playBeep = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Play 3 beeps when reaching 0
          playBeep();
          setTimeout(() => playBeep(), 200);
          setTimeout(() => playBeep(), 400);
          
          // Call onComplete after beeps
          setTimeout(() => {
            onComplete();
          }, 600);
          
          return 0;
        }
        
        // Beep on each number change
        if (prev > 1) {
          playBeep();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, playBeep, onComplete]);

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
