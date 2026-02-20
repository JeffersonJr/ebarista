'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Coffee, History, Sun, Moon, LogIn, User } from 'lucide-react';

interface CoffeeMethod {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  ratio: number;
  defaultSteps: TimerStep[];
  color: string;
  borderColor: string;
  iconColor: string;
}

interface TimerStep {
  id: string;
  name: string;
  duration: number;
  waterAmount: number;
  type: 'bloom' | 'pour' | 'wait' | 'stir';
}

interface Recipe {
  id: string;
  name: string;
  methodId: string;
  coffeeAmount: number;
  waterAmount: number;
  ratio: number;
  steps: TimerStep[];
  createdAt: Date;
}

interface BrewingSession {
  id: string;
  recipeId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const coffeeMethods: CoffeeMethod[] = [
  {
    id: 'v60',
    name: 'Hario V60',
    description: 'Controle preciso de sabor e intensidade utilizando o método 4:6',
    subtitle: 'Tetsu Kasuya',
    ratio: 15,
    color: 'bg-orange-100',
    borderColor: 'border-orange-400',
    iconColor: 'text-orange-600',
    defaultSteps: [
      { id: '1', name: 'Bloom', duration: 30, waterAmount: 60, type: 'bloom' },
      { id: '2', name: '1º Ataque', duration: 45, waterAmount: 150, type: 'pour' },
      { id: '3', name: '2º Ataque', duration: 45, waterAmount: 90, type: 'pour' },
      { id: '4', name: 'Finalização', duration: 30, waterAmount: 0, type: 'wait' }
    ]
  },
  {
    id: 'french-press',
    name: 'Prensa Francesa',
    description: 'Café encorpado, limpo e sem resíduos',
    subtitle: 'James Hoffmann',
    ratio: 17,
    color: 'bg-green-100',
    borderColor: 'border-[#00C389]',
    iconColor: 'text-[#00C389]',
    defaultSteps: [
      { id: '1', name: 'Adicionar Água', duration: 30, waterAmount: 0, type: 'pour' },
      { id: '2', name: 'Bloom', duration: 60, waterAmount: 0, type: 'bloom' },
      { id: '3', name: 'Mexer', duration: 15, waterAmount: 0, type: 'stir' },
      { id: '4', name: 'Esperar', duration: 240, waterAmount: 0, type: 'wait' },
      { id: '5', name: 'Pressionar', duration: 30, waterAmount: 0, type: 'pour' }
    ]
  },
  {
    id: 'custom',
    name: 'Receita Personalizada',
    description: 'Monte sua receita de percolação com tempos e despejos personalizados',
    subtitle: 'Crie seu próprio método',
    ratio: 15,
    color: 'bg-blue-100',
    borderColor: 'border-[#4298B5]',
    iconColor: 'text-[#4298B5]',
    defaultSteps: [
      { id: '1', name: 'Passo 1', duration: 30, waterAmount: 60, type: 'bloom' },
      { id: '2', name: 'Passo 2', duration: 45, waterAmount: 150, type: 'pour' },
      { id: '3', name: 'Passo 3', duration: 45, waterAmount: 90, type: 'pour' }
    ]
  }
];

export default function Home() {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [brewingHistory, setBrewingHistory] = useState<BrewingSession[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'methods' | 'calculator' | 'timer' | 'recipes' | 'history' | 'profile'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<CoffeeMethod | null>(null);
  const [selectedRecipe] = useState<Recipe | null>(null);
  
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedRecipes = localStorage.getItem('ebarista-recipes');
      const savedHistory = localStorage.getItem('ebarista-history');
      
      if (savedRecipes) {
        try {
          const recipes = JSON.parse(savedRecipes);
          setCustomRecipes(recipes);
        } catch (error) {
          console.error('Error loading recipes:', error);
        }
      }
      
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setBrewingHistory(history);
        } catch (error) {
          console.error('Error loading history:', error);
        }
      }
    };

    // Use setTimeout to defer setState calls
    const timeoutId = setTimeout(loadData, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (customRecipes.length > 0) {
      localStorage.setItem('ebarista-recipes', JSON.stringify(customRecipes));
    }
  }, [customRecipes]);

  useEffect(() => {
    if (brewingHistory.length > 0) {
      localStorage.setItem('ebarista-history', JSON.stringify(brewingHistory));
    }
  }, [brewingHistory]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerComplete = useCallback(() => {
    if (selectedRecipe) {
      const session: BrewingSession = {
        id: Date.now().toString(),
        recipeId: selectedRecipe.id,
        startTime: new Date(),
        endTime: new Date(),
        completed: true
      };
      
      setBrewingHistory((prev) => [session, ...prev]);
    }
  }, [selectedRecipe]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next step or finish
            if (currentStep < (selectedRecipe?.steps.length || 0) - 1) {
              setCurrentStep((prev) => prev + 1);
              const nextStep = selectedRecipe?.steps[currentStep + 1];
              return nextStep?.duration || 0;
            } else {
              // Timer finished
              setIsRunning(false);
              handleTimerComplete();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentStep, selectedRecipe, handleTimerComplete]);

  const handleLogin = () => {
    // Simulação de login
    setIsLoggedIn(true);
    setUser({ id: '1', name: 'Usuário Teste', email: 'teste@ebarista.com' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('home');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} p-4`}>
      {/* Header */}
      <header className="p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center">
            <Image 
              src="/logo ebarista.svg" 
              alt="e.barista" 
              width={230} 
              height={115}
              className="w-58 h-29"
            />
          </div>

          {/* Login Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('user-dropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* David Bowie inspired avatar */}
                    {/* Face */}
                    <ellipse cx="50" cy="50" rx="35" ry="40" fill="#F4D1AE"/>
                    {/* Hair - Ziggy Stardust style */}
                    <path d="M15 30 Q 20 15, 35 20 Q 50 10, 65 20 Q 80 15, 85 30 Q 82 25, 75 28 Q 60 18, 50 25 Q 40 18, 25 28 Q 18 25, 15 30" fill="#C41E3A"/>
                    {/* Eyes - distinctive mismatched colors */}
                    <circle cx="38" cy="45" r="4" fill="#4A90E2"/>
                    <circle cx="62" cy="45" r="4" fill="#8B4513"/>
                    {/* Eyebrows - thin and arched */}
                    <path d="M32 38 Q 38 35, 44 38" stroke="#8B4513" strokeWidth="2" fill="none"/>
                    <path d="M56 38 Q 62 35, 68 38" stroke="#8B4513" strokeWidth="2" fill="none"/>
                    {/* Nose */}
                    <path d="M50 45 L 48 55 L 52 55" stroke="#D4A574" strokeWidth="2" fill="none"/>
                    {/* Mouth - thin smile */}
                    <path d="M42 65 Q 50 68, 58 65" stroke="#E74C3C" strokeWidth="2" fill="none"/>
                    {/* Lightning bolt makeup - Aladdin Sane style */}
                    <path d="M45 25 L 48 35 L 52 32 L 55 45" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
                  </svg>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div 
                id="user-dropdown"
                className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} hidden z-50`}
              >
                <div className="p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* David Bowie inspired avatar */}
                        {/* Face */}
                        <ellipse cx="50" cy="50" rx="35" ry="40" fill="#F4D1AE"/>
                        {/* Hair - Ziggy Stardust style */}
                        <path d="M15 30 Q 20 15, 35 20 Q 50 10, 65 20 Q 80 15, 85 30 Q 82 25, 75 28 Q 60 18, 50 25 Q 40 18, 25 28 Q 18 25, 15 30" fill="#C41E3A"/>
                        {/* Eyes - distinctive mismatched colors */}
                        <circle cx="38" cy="45" r="4" fill="#4A90E2"/>
                        <circle cx="62" cy="45" r="4" fill="#8B4513"/>
                        {/* Eyebrows - thin and arched */}
                        <path d="M32 38 Q 38 35, 44 38" stroke="#8B4513" strokeWidth="2" fill="none"/>
                        <path d="M56 38 Q 62 35, 68 38" stroke="#8B4513" strokeWidth="2" fill="none"/>
                        {/* Nose */}
                        <path d="M50 45 L 48 55 L 52 55" stroke="#D4A574" strokeWidth="2" fill="none"/>
                        {/* Mouth - thin smile */}
                        <path d="M42 65 Q 50 68, 58 65" stroke="#E74C3C" strokeWidth="2" fill="none"/>
                        {/* Lightning bolt makeup - Aladdin Sane style */}
                        <path d="M45 25 L 48 35 L 52 32 L 55 45" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
                      </svg>
                    </div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {user?.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600 font-medium">Conectado</span>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      setCurrentView('profile');
                      document.getElementById('user-dropdown')?.classList.add('hidden');
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-3 ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('history');
                      document.getElementById('user-dropdown')?.classList.add('hidden');
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-3 ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
                  >
                    <History className="w-4 h-4" />
                    Histórico de Extrações
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isDarkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} mt-2 pt-3`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 text-[#4298B5] hover:text-[#357a99] transition-colors"
            >
              Entrar
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Timer View */}
        {currentView === 'timer' && (
          <div className="space-y-6">
            <header className="mb-6">
              <div className="flex items-center justify-between">
                {/* Back Button + Theme Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentView('methods')}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Logo */}
                <div className="flex flex-col items-center">
                  <Image 
                    src="/logo ebarista.svg" 
                    alt="e.barista" 
                    width={96} 
                    height={48}
                    className="w-24 h-12"
                  />
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-orange-500' : 'text-orange-600'} mt-2`}>
                    {selectedMethod?.name || 'Timer'}
                  </h2>
                </div>

                {/* Login Button */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {user?.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4298B5] text-white hover:bg-[#357a99] transition-colors"
                  >
                    Entrar
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
              </div>
            </header>

            {/* Timer Content - 100% height */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-12 max-w-md w-full mx-auto`}>
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining || 0)}
                  </div>
                  <div className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {currentStep < (selectedRecipe?.steps.length || 0) 
                      ? selectedRecipe?.steps[currentStep]?.name 
                      : 'Preparo Concluído'
                    }
                  </div>
                </div>

                {/* Step Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Etapa {currentStep + 1} de {selectedRecipe?.steps.length || 0}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {selectedRecipe?.steps[currentStep]?.duration || 0}s
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-2 rounded-full bg-[#4298B5] transition-all duration-1000"
                      style={{
                        width: selectedRecipe?.steps[currentStep] 
                          ? `${((selectedRecipe.steps[currentStep].duration - (timeRemaining || 0)) / selectedRecipe.steps[currentStep].duration) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4 justify-center">
                  {!isRunning ? (
                    <button
                      onClick={() => setIsRunning(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Iniciar
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRunning(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pausar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setCurrentStep(0);
                      setTimeRemaining(selectedRecipe?.steps[0]?.duration || 0);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reiniciar
                  </button>
                </div>

                {/* Step List */}
                <div className="mt-8 space-y-2">
                  {selectedRecipe?.steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === currentStep 
                          ? isDarkMode ? 'bg-slate-700' : 'bg-blue-100'
                          : index < currentStep
                          ? isDarkMode ? 'bg-slate-800' : 'bg-green-100'
                          : isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.type === 'bloom' ? 'bg-yellow-500 text-white' :
                          step.type === 'pour' ? 'bg-cyan-500 text-white' :
                          step.type === 'stir' ? 'bg-purple-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {step.type === 'bloom' ? 'B' :
                           step.type === 'pour' ? 'P' :
                           step.type === 'stir' ? 'M' : 'E'}
                        </div>
                        <span className={`text-sm ${
                          index === currentStep 
                            ? isDarkMode ? 'text-slate-100 font-semibold' : 'text-gray-900 font-semibold'
                            : index < currentStep
                            ? isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            : isDarkMode ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                      <span className={`text-xs ${
                        index === currentStep 
                          ? isDarkMode ? 'text-slate-300' : 'text-gray-700'
                          : index < currentStep
                          ? isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          : isDarkMode ? 'text-slate-500' : 'text-gray-500'
                      }`}>
                        {step.duration}s
                        {step.waterAmount > 0 && ` • ${step.waterAmount}ml`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Home View */}
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {coffeeMethods.map((method) => (
                <div
                  key={method.id}
                  className={`${method.color} ${method.borderColor} border rounded-xl p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-pointer`}
                  onClick={() => {
                    setSelectedMethod(method);
                    setCurrentView('methods');
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <Coffee className={`w-8 h-8 ${method.iconColor}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {method.name}
                      </h3>
                      {method.subtitle && (
                        <p className="text-sm text-gray-700 font-bold mt-1">
                          {method.subtitle}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 mt-2 leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className={`fixed bottom-0 left-0 right-0 p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex justify-around items-center max-w-6xl mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'home'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coffee className="w-5 h-5" />
              <span className="text-xs">Explorar</span>
            </button>
            
            <button
              onClick={() => isLoggedIn ? setCurrentView('history') : handleLogin()}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'history'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs">Meu Histórico</span>
            </button>
            
            <button
              onClick={() => isLoggedIn ? setCurrentView('profile') : handleLogin()}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'profile'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Perfil</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
