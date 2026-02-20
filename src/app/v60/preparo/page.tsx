'use client';

import { useState } from 'react';
import { ChevronLeft, Play, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { Moon, Sun, User, History, LogOut } from 'lucide-react';
import Link from 'next/link';
import CountdownOverlay from '@/components/CountdownOverlay';

export default function PreparoV60Page() {
  const [coffeeAmount, setCoffeeAmount] = useState(20);
  const [ratio, setRatio] = useState(15);
  const [selectedProfile, setSelectedProfile] = useState('Equilibrado');
  const [selectedIntensity, setSelectedIntensity] = useState('Médio');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userEmail] = useState('jeffersoncamposbeirajunior@gmail.com');
  const [showCountdown, setShowCountdown] = useState(false);

  const ratios = [13, 15, 17];
  const waterAmount = coffeeAmount * ratio;

  const intensityLevels = [
    { name: 'Leve', pours: 1, level: 1 },
    { name: 'Suave', pours: 2, level: 2 },
    { name: 'Médio', pours: 3, level: 3 },
    { name: 'Forte', pours: 4, level: 4 },
    { name: 'Intenso', pours: 5, level: 5 }
  ];

  const flavorProfiles = [
    { name: 'Vibrante', description: 'Mais acidez', ratio: '66/34', percentage: 66, firstPart: 66, secondPart: 34 },
    { name: 'Brilhante', description: 'Levemente ácido', ratio: '58/42', percentage: 58, firstPart: 58, secondPart: 42 },
    { name: 'Equilibrado', description: 'Balanceado', ratio: '50/50', percentage: 50, firstPart: 50, secondPart: 50 },
    { name: 'Aveludado', description: 'Levemente doce', ratio: '42/58', percentage: 42, firstPart: 42, secondPart: 58 },
    { name: 'Licoroso', description: 'Mais doçura', ratio: '34/66', percentage: 34, firstPart: 34, secondPart: 66 },
  ];

  const handleStart = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    // Here you can start the actual preparation logic
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4`}>
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
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * 0.75}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tabular-nums">0:00</span>
              <span className="text-sm text-gray-500 mt-1">Passo 1 de 3</span>
            </div>
          </div>
        </div>

        {/* Card de Informações */}
        <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6 text-center`}>
          <h3 className="text-lg font-medium text-gray-400 mb-4">Fase do Sabor</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-orange-500">Adicione <span className="text-5xl font-bold text-orange-500">+60g</span></span>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="text-lg font-medium">Total na Balança: <span className="text-lg font-bold">60g</span></span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 mt-6">
          <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
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
