'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Moon, Sun, User, History, LogOut, ChevronLeft, Minus, Plus as PlusIcon, Play } from 'lucide-react';
import Link from 'next/link';

export default function V60Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userEmail] = useState('jeffersoncamposbeirajunior@gmail.com');
  const [coffeeAmount, setCoffeeAmount] = useState(20);
  const [ratio, setRatio] = useState(15);
  const [selectedProfile, setSelectedProfile] = useState('Equilibrado');
  const [selectedIntensity, setSelectedIntensity] = useState('Médio');

  const ratios = [13, 15, 17];
  const waterAmount = coffeeAmount * ratio;

  const intensityLevels = [
    { name: 'Leve', pours: 1, level: 1 },
    { name: 'Suave', pours: 2, level: 2 },
    { name: 'Médio', pours: 3, level: 3 },
    { name: 'Forte', pours: 4, level: 4 },
    { name: 'Intenso', pours: 5, level: 5 },
  ];

  const flavorProfiles = [
    { name: 'Vibrante', description: 'Mais acidez', ratio: '66/34', percentage: 66, firstPart: 66, secondPart: 34 },
    { name: 'Brilhante', description: 'Levemente ácido', ratio: '58/42', percentage: 58, firstPart: 58, secondPart: 42 },
    { name: 'Equilibrado', description: 'Balanceado', ratio: '50/50', percentage: 50, firstPart: 50, secondPart: 50 },
    { name: 'Aveludado', description: 'Levemente doce', ratio: '42/58', percentage: 42, firstPart: 42, secondPart: 58 },
    { name: 'Licoroso', description: 'Mais doçura', ratio: '34/66', percentage: 34, firstPart: 34, secondPart: 66 },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4 pb-24`}>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link 
            href="/"
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
          <h1 className="text-xl font-bold tracking-tight">Hario V60</h1>
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
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4">Café</h3>
            
            <div className="flex items-center justify-center gap-8">
              <button 
                onClick={() => setCoffeeAmount(Math.max(0, coffeeAmount - 1))}
                className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <Minus className="w-8 h-8" />
              </button>
              
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tabular-nums leading-none">{coffeeAmount}</span>
                <span className="text-2xl font-bold text-gray-400">g</span>
              </div>

              <button 
                onClick={() => setCoffeeAmount(coffeeAmount + 1)}
                className={`p-3 rounded-full ${isDarkMode ? 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20' : 'bg-cyan-500 text-white hover:bg-cyan-600'} transition-colors`}
              >
                <PlusIcon className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider">Proporção</h3>
              <span className="text-sm font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">1:{ratio}</span>
            </div>
            
            <div className="space-y-8">
              <div className="relative px-2">
                <input
                  type="range"
                  min="13"
                  max="17"
                  step="1"
                  value={ratio}
                  onChange={(e) => setRatio(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="absolute top-6 left-0 w-full flex justify-between px-2">
                  {ratios.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`text-xs font-bold transition-colors ${
                        ratio === r ? 'text-cyan-500' : 'text-gray-400'
                      }`}
                    >
                      1:{r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tabular-nums leading-none">{waterAmount}</span>
                  <span className="text-xl font-bold text-gray-400">ml de água</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider">Perfil de Sabor</h3>
              <span className="text-sm font-bold text-gray-400">Fase 40%</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {flavorProfiles.map((profile) => (
                <button
                  key={profile.name}
                  onClick={() => setSelectedProfile(profile.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-full ${
                    selectedProfile === profile.name
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-800 border-transparent text-gray-400 hover:border-gray-700'
                      : 'bg-white border-transparent text-gray-500 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <span className={`text-sm font-bold mb-1 ${selectedProfile === profile.name ? 'text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {profile.name}
                  </span>
                  <span className={`text-[10px] leading-tight mb-2 opacity-80 text-center`}>
                    {profile.description}
                  </span>
                  
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        selectedProfile === profile.name ? 'bg-white' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${profile.firstPart}%` }}
                    />
                    <div 
                      className={`h-full transition-all duration-500 ${
                        selectedProfile === profile.name ? 'bg-white' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${profile.secondPart}%`, marginLeft: '2px' }}
                    />
                  </div>

                  <span className={`text-xs font-black mt-auto ${selectedProfile === profile.name ? 'text-white/90' : 'text-cyan-500'}`}>
                    {profile.ratio}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider">Intensidade</h3>
              <span className="text-sm font-bold text-gray-400">Fase 60%</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {intensityLevels.map((intensity) => (
                <button
                  key={intensity.name}
                  onClick={() => setSelectedIntensity(intensity.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-full ${
                    selectedIntensity === intensity.name
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-800 border-transparent text-gray-400 hover:border-gray-700'
                      : 'bg-white border-transparent text-gray-500 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <span className={`text-sm font-bold mb-2 ${selectedIntensity === intensity.name ? 'text-white' : isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {intensity.name}
                  </span>
                  
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((circle) => (
                      <div
                        key={circle}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          circle <= intensity.level
                            ? selectedIntensity === intensity.name
                              ? 'bg-white'
                              : 'bg-cyan-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <span className={`text-[10px] leading-tight opacity-80 text-center`}>
                    {intensity.pours} {intensity.pours === 1 ? 'despejo' : 'despejos'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6"></div>
        </div>
      </main>

      <div className="max-w-4xl mx-auto mb-6">
        <div className={`${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4 flex items-start gap-3`}>
          <div className="flex-shrink-0">
            <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-200'} flex items-center justify-center`}>
              <span className="text-yellow-600 text-xs font-bold">!</span>
            </div>
          </div>
          <div>
            <p className={`${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'} text-sm font-medium`}>
              Lembre-se: Moagem grossa como Sal de Parrilha
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Link href="/v60/preparo">
          <button className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white font-bold transition-colors shadow-lg`}>
            <Play className="w-5 h-5" fill="white" />
            Iniciar Preparo
          </button>
        </Link>
      </div>

    </div>
  );
}
