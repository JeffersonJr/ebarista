'use client';

import { Check } from 'lucide-react';

interface FinalizeButtonProps {
  isDarkMode: boolean;
  onClick: () => void;
}

export default function FinalizeButton({ isDarkMode, onClick }: FinalizeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${
        isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
      } text-white transition-colors`}
    >
      <Check className="w-5 h-5" />
      <span className="font-medium">Finalizar</span>
    </button>
  );
}
