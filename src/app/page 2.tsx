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
  image?: string;
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
  const [currentView, setCurrentView] = useState<'home' | 'methods' | 'calculator' | 'timer' | 'recipes' | 'history' | 'profile' | 'login' | 'register' | 'forgot-password' | 'confirm-email'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<CoffeeMethod | null>(null);
  const [selectedRecipe] = useState<Recipe | null>(null);
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleLogin = (userData?: User) => {
    if (userData) {
      setIsLoggedIn(true);
      setUser(userData);
      setCurrentView('home');
      setMessage('');
    } else {
      // Simulação de login com email
      if (email && password) {
        const mockUser: User = {
          id: Date.now().toString(),
          name: name || 'Usuário e.barista',
          email: email,
          image: '/avatar.webp'
        };
        setIsLoggedIn(true);
        setUser(mockUser);
        setCurrentView('home');
        setEmail('');
        setPassword('');
        setName('');
        setMessage('');
      } else {
        setMessage('Por favor, preencha email e senha');
      }
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulação de login Google - entra diretamente no sistema
    setTimeout(() => {
      const googleUser: User = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        image: '/avatar.webp'
      };
      setIsLoggedIn(true);
      setUser(googleUser);
      setCurrentView('home');
      setIsLoading(false);
      setMessage('');
    }, 1500);
  };

  const handleForgotPassword = () => {
    if (email) {
      setIsLoading(true);
      // Simulação de envio de email
      setTimeout(() => {
        setMessage('Link de redefinição enviado para ' + email);
        setTimeout(() => {
          setCurrentView('confirm-email');
          setMessage('');
        }, 2000);
        setIsLoading(false);
      }, 1500);
    } else {
      setMessage('Por favor, digite seu email');
    }
  };

  const handleRegister = () => {
    if (name && email && password) {
      setIsLoading(true);
      // Simulação de cadastro
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          image: '/avatar.webp'
        };
        handleLogin(newUser);
        setIsLoading(false);
      }, 1500);
    } else {
      setMessage('Por favor, preencha todos os campos');
    }
  };

  const handleGoogleRegister = () => {
    setIsLoading(true);
    // Simulação de cadastro Google - entra diretamente no sistema
    setTimeout(() => {
      const googleUser: User = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        image: '/avatar.webp'
      };
      setIsLoggedIn(true);
      setUser(googleUser);
      setCurrentView('home');
      setIsLoading(false);
      setMessage('');
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('home');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} p-2 sm:p-4 pb-20`}>
      {/* Header - Hidden on auth screens */}
      {!['login', 'register', 'forgot-password', 'confirm-email'].includes(currentView) && (
        <header className="p-2 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center flex-1 mx-2 sm:mx-4">
            <Image 
              src="/logo ebarista.svg" 
              alt="e.barista" 
              width={230} 
              height={115}
              className="w-32 h-16 sm:w-58 sm:h-29"
            />
          </div>

          {/* Login Button */}
          <div className="flex-shrink-0">
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
                  <Image 
                    src={user?.image || "/avatar.webp"} 
                    alt="User Avatar" 
                    width={32} 
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div 
                id="user-dropdown"
                className={`absolute right-0 mt-2 w-64 sm:w-72 rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} hidden z-50`}
              >
                <div className="p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image 
                        src={user?.image || "/avatar.webp"} 
                        alt="User Avatar" 
                        width={40} 
                        height={40}
                        className="w-full h-full object-cover"
                      />
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
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-2 text-[#4298B5] hover:text-[#357a99] transition-colors"
            >
              Entrar
              <LogIn className="w-4 h-4" />
            </button>
          )}
          </div>
        </div>
      </header>
      )}

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
                    onClick={handleLoginClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4298B5] text-white hover:bg-[#357a99] transition-colors"
                  >
                    Entrar
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
              </div>
            </header>

            {/* Timer Content - 100% height */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] sm:min-h-[calc(100vh-200px)] px-2">
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6 sm:p-12 max-w-md w-full mx-auto`}>
                {/* Timer Display */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className={`text-4xl sm:text-6xl font-bold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining || 0)}
                  </div>
                  <div className={`text-base sm:text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {currentStep < (selectedRecipe?.steps.length || 0) 
                      ? selectedRecipe?.steps[currentStep]?.name 
                      : 'Preparo Concluído'
                    }
                  </div>
                </div>

                {/* Step Progress */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Etapa {currentStep + 1} de {selectedRecipe?.steps.length || 0}
                    </span>
                    <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  {!isRunning ? (
                    <button
                      onClick={() => setIsRunning(true)}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors w-full sm:w-auto"
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
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
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
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity w-full sm:w-auto`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reiniciar
                  </button>
                </div>

                {/* Step List */}
                <div className="mt-6 sm:mt-8 space-y-2">
                  {selectedRecipe?.steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                        index === currentStep 
                          ? isDarkMode ? 'bg-slate-700' : 'bg-blue-100'
                          : index < currentStep
                          ? isDarkMode ? 'bg-slate-800' : 'bg-green-100'
                          : isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.type === 'bloom' ? 'bg-yellow-500 text-white' :
                          step.type === 'pour' ? 'bg-cyan-500 text-white' :
                          step.type === 'stir' ? 'bg-purple-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {step.type === 'bloom' ? 'B' :
                           step.type === 'pour' ? 'P' :
                           step.type === 'stir' ? 'M' : 'E'}
                        </div>
                        <span className={`text-xs sm:text-sm ${
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
        
        {/* Login View */}
        {currentView === 'login' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] sm:min-h-[calc(100vh-200px)] px-2">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto`}>
              {/* Logo */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <Image 
                  src="/logo ebarista.svg" 
                  alt="e.barista" 
                  width={96} 
                  height={48}
                  className="w-20 h-10 sm:w-24 sm:h-12 mb-3 sm:mb-4"
                />
                <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  Bem-vindo de volta
                </h2>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mt-1 text-center`}>
                  Entre para continuar sua jornada
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">
                  {isLoading ? 'Entrando...' : 'Continuar com Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 sm:gap-4 my-4 sm:my-6">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ou</span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
              </div>

              {/* Email Form */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5] text-sm`}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5] text-sm`}
                    placeholder="••••••••"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#4298B5] focus:ring-[#4298B5]"
                    />
                    <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Lembrar de mim
                    </span>
                  </label>
                  <button
                    onClick={() => setCurrentView('forgot-password')}
                    className="text-xs sm:text-sm text-[#4298B5] hover:text-[#357a99] transition-colors"
                  >
                    Esqueci a senha
                  </button>
                </div>

                {/* Error Message */}
                {message && (
                  <div className="p-2 sm:p-3 rounded-lg bg-red-100 text-red-700 text-xs sm:text-sm">
                    {message}
                  </div>
                )}

                {/* Login Button */}
                <button
                  onClick={() => handleLogin()}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>

                {/* Register Link */}
                <div className="text-center pt-3 sm:pt-4">
                  <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Não tem uma conta?{' '}
                  </span>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="text-xs sm:text-sm text-[#4298B5] hover:text-[#357a99] transition-colors font-medium"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Register View */}
        {currentView === 'register' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 max-w-md w-full mx-auto`}>
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <Image 
                  src="/logo ebarista.svg" 
                  alt="e.barista" 
                  width={96} 
                  height={48}
                  className="w-24 h-12 mb-4"
                />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  Criar conta
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
                  Comece sua jornada no café especial
                </p>
              </div>

              {/* Google Register Button */}
              <button
                onClick={handleGoogleRegister}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">
                  {isLoading ? 'Criando conta...' : 'Cadastrar com Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ou</span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
              </div>

              {/* Register Form */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5]`}
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5]`}
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5]`}
                    placeholder="••••••••"
                  />
                </div>

                {/* Error Message */}
                {message && (
                  <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                    {message}
                  </div>
                )}

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Já tem uma conta?{' '}
                  </span>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-sm text-[#4298B5] hover:text-[#357a99] transition-colors font-medium"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password View */}
        {currentView === 'forgot-password' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 max-w-md w-full mx-auto`}>
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <Image 
                  src="/logo ebarista.svg" 
                  alt="e.barista" 
                  width={96} 
                  height={48}
                  className="w-24 h-12 mb-4"
                />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  Esqueci a senha
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mt-1 text-center`}>
                  Digite seu email e enviaremos um link para redefinir sua senha
                </p>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#4298B5]`}
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('enviado') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setCurrentView('login');
                      setMessage('');
                      setEmail('');
                    }}
                    className="text-sm text-[#4298B5] hover:text-[#357a99] transition-colors font-medium"
                  >
                    ← Voltar ao login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Email View */}
        {currentView === 'confirm-email' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 max-w-md w-full mx-auto text-center`}>
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Logo */}
              <Image 
                src="/logo ebarista.svg" 
                alt="e.barista" 
                width={96} 
                height={48}
                className="w-24 h-12 mx-auto mb-6"
              />

              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} mb-4`}>
                Link enviado!
              </h2>
              
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mb-8`}>
                Enviamos um link de redefinição para seu email. 
                Verifique sua caixa de entrada e siga as instruções.
              </p>

              {/* Back to Login Button */}
              <button
                onClick={() => {
                  setCurrentView('login');
                  setMessage('');
                  setEmail('');
                }}
                className="w-full py-3 bg-[#4298B5] text-white rounded-lg hover:bg-[#357a99] transition-colors font-medium"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        )}

        {/* Home View */}
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {coffeeMethods.filter(method => method.id !== 'custom').map((method) => (
                <div
                  key={method.id}
                  className={`${method.color} ${method.borderColor} border rounded-xl p-4 sm:p-6 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-pointer`}
                  onClick={() => {
                    setSelectedMethod(method);
                    setCurrentView('methods');
                  }}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {method.id === 'v60' ? (
                        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${method.iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M3 3h18l-5 14h-8L3 3z"/>
                          <path d="M19 6c2 0.5 3 2 3 3.5s-1 3-3 3.5"/>
                          <ellipse cx="12" cy="20" rx="7" ry="1.5"/>
                          <line x1="10" y1="17" x2="10" y2="19"/>
                          <line x1="14" y1="17" x2="14" y2="19"/>
                        </svg>
                      ) : method.id === 'french-press' ? (
                        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${method.iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="12" height="16" rx="1"/>
                          <line x1="12" y1="1" x2="12" y2="4"/>
                          <line x1="9" y1="1" x2="15" y2="1"/>
                          <line x1="6" y1="12" x2="18" y2="12"/>
                          <line x1="8" y1="20" x2="5" y2="23"/>
                          <line x1="16" y1="20" x2="19" y2="23"/>
                        </svg>
                      ) : (
                        <Coffee className={`w-6 h-6 sm:w-8 sm:h-8 ${method.iconColor}`} />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {method.name}
                      </h3>
                      {method.subtitle && (
                        <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
                          {method.subtitle}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-800 mt-2 leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation - Hidden on auth screens */}
        {!['login', 'register', 'forgot-password', 'confirm-email'].includes(currentView) && (
          <div className={`fixed bottom-0 left-0 right-0 p-2 sm:p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex justify-around items-center max-w-6xl mx-auto">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all ${
                currentView === 'home'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Explorar</span>
            </button>
            
            <button
              onClick={() => isLoggedIn ? setCurrentView('history') : handleLogin()}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all ${
                currentView === 'history'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Meu Histórico</span>
            </button>
            
            <button
              onClick={() => isLoggedIn ? setCurrentView('profile') : handleLogin()}
              className={`flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all ${
                currentView === 'profile'
                  ? 'bg-[#4298B5] text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Perfil</span>
            </button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
