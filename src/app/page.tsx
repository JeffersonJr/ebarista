'use client';

import { useState, useEffect } from 'react';
import { Coffee, Beaker, Settings, Moon, Sun, User, LogIn, History, Plus, Play, Pause, RotateCcw } from 'lucide-react';

interface CoffeeMethod {
  id: string;
  name: string;
  description: string;
  ratio: number;
  time: number;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  icon: string;
}

interface Recipe {
  id: string;
  name: string;
  method: string;
  coffee: number;
  water: number;
  ratio: number;
  time: number;
  steps: string[];
}

interface BrewingSession {
  id: string;
  recipeName: string;
  method: string;
  date: Date;
  duration: number;
  success: boolean;
}

const coffeeMethods: CoffeeMethod[] = [
  {
    id: 'v60',
    name: 'Hario V60',
    description: 'Controle preciso de extração com método 4:6',
    ratio: 15,
    time: 210,
    difficulty: 'Intermediário',
    icon: '☕'
  },
  {
    id: 'french-press',
    name: 'Prensa Francesa',
    description: 'Café encorpado e limpo',
    ratio: 17,
    time: 240,
    difficulty: 'Iniciante',
    icon: '🫖'
  },
  {
    id: 'chemex',
    name: 'Chemex',
    description: 'Extração limpa e sabor complexo',
    ratio: 16,
    time: 270,
    difficulty: 'Intermediário',
    icon: '🥃'
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    description: 'Versatilidade e rapidez',
    ratio: 14,
    time: 120,
    difficulty: 'Iniciante',
    icon: '🚀'
  },
  {
    id: 'kalita',
    name: 'Kalita Wave',
    description: 'Consistência e facilidade',
    ratio: 15,
    time: 180,
    difficulty: 'Iniciante',
    icon: '〰️'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu próprio método',
    ratio: 15,
    time: 180,
    difficulty: 'Avançado',
    icon: '⚙️'
  }
];

const defaultRecipes: Recipe[] = [
  {
    id: '1',
    name: 'V60 Tetsu Kasuya',
    method: 'Hario V60',
    coffee: 20,
    water: 300,
    ratio: 15,
    time: 210,
    steps: ['Bloom 30s', 'Primeiro despejo 45s', 'Segundo despejo 45s', 'Finalização 30s']
  },
  {
    id: '2',
    name: 'Prensa Francesa Clássica',
    method: 'Prensa Francesa',
    coffee: 30,
    water: 510,
    ratio: 17,
    time: 240,
    steps: ['Adicionar água', 'Bloom 60s', 'Mexer 15s', 'Esperar 4min', 'Pressionar 30s']
  }
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'methods' | 'timer' | 'recipes' | 'history' | 'settings' | 'login'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(defaultRecipes);
  const [brewingHistory, setBrewingHistory] = useState<BrewingSession[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [defaultCoffee, setDefaultCoffee] = useState(20);
  const [defaultRatio, setDefaultRatio] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedRecipes = localStorage.getItem('otc-lab-recipes');
    const savedHistory = localStorage.getItem('otc-lab-history');
    
    if (savedRecipes) {
      try {
        setCustomRecipes(JSON.parse(savedRecipes));
      } catch (error) {
        console.error('Error loading recipes:', error);
      }
    }
    
    if (savedHistory) {
      try {
        setBrewingHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customRecipes.length > 0) {
      localStorage.setItem('otc-lab-recipes', JSON.stringify(customRecipes));
    }
  }, [customRecipes]);

  useEffect(() => {
    if (brewingHistory.length > 0) {
      localStorage.setItem('otc-lab-history', JSON.stringify(brewingHistory));
    }
  }, [brewingHistory]);

  const playBeep = () => {
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerComplete = () => {
    if (selectedRecipe) {
      const session: BrewingSession = {
        id: Date.now().toString(),
        recipeName: selectedRecipe.name,
        method: selectedRecipe.method,
        date: new Date(),
        duration: totalTime - currentTime,
        success: true
      };
      
      setBrewingHistory((prev) => [session, ...prev]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) {
              playBeep();
            }
            handleTimerComplete();
            return 0;
          }
          
          if (prev <= 5 && soundEnabled) {
            playBeep();
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentTime, soundEnabled, selectedRecipe, totalTime]);

  const startTimer = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setTotalTime(recipe.time);
    setCurrentTime(recipe.time);
    setCurrentView('timer');
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentTime(totalTime);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName('Usuário OTC');
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setCurrentView('home');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-500';
      case 'Intermediário': return 'text-yellow-500';
      case 'Avançado': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4 pb-20`}>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">OTC Lab</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Seu laboratório de café</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{userName}</span>
              <button onClick={handleLogout} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <LogIn className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentView('login')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm">
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {currentView === 'home' && (
          <div className="space-y-8">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 text-center`}>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Bem-vindo ao OTC Lab
              </h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-2xl mx-auto`}>
                App profissional para preparo de café com métodos especiais. V60, Prensa Francesa e mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setCurrentView('methods')} className="btn-primary flex items-center justify-center gap-2">
                  <Coffee className="w-5 h-5" />
                  Explorar Métodos
                </button>
                <button onClick={() => setCurrentView('recipes')} className="btn-secondary flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nova Receita
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-cyan-500">{coffeeMethods.length}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Métodos</div>
              </div>
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-blue-500">{customRecipes.length}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receitas</div>
              </div>
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-green-500">{brewingHistory.length}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Extrações</div>
              </div>
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold text-purple-500">{Math.round(brewingHistory.filter(h => h.success).length / Math.max(brewingHistory.length, 1) * 100)}%</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sucesso</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Métodos Populares</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coffeeMethods.slice(0, 6).map((method) => (
                  <div key={method.id} onClick={() => setCurrentView('methods')} className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{method.icon}</div>
                      <span className={`text-xs font-medium ${getDifficultyColor(method.difficulty)}`}>{method.difficulty}</span>
                    </div>
                    <h4 className="font-bold mb-2">{method.name}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{method.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>1:{method.ratio}</span>
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>{formatTime(method.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Métodos de Preparo</h2>
              <button onClick={() => setCurrentView('home')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coffeeMethods.map((method) => (
                <div key={method.id} className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6`}>
                  <div className="text-4xl mb-4 text-center">{method.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-center">{method.name}</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 text-center`}>{method.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Dificuldade:</span>
                      <span className={`font-medium ${getDifficultyColor(method.difficulty)}`}>{method.difficulty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Proporção:</span>
                      <span className="font-medium">1:{method.ratio}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Tempo:</span>
                      <span className="font-medium">{formatTime(method.time)}</span>
                    </div>
                  </div>

                  <button onClick={() => {
                    const recipe = customRecipes.find(r => r.method === method.name) || {
                      id: `default-${method.id}`,
                      name: `${method.name} Padrão`,
                      method: method.name,
                      coffee: defaultCoffee,
                      water: defaultCoffee * method.ratio,
                      ratio: method.ratio,
                      time: method.time,
                      steps: ['Preparar', 'Bloom', 'Despejar', 'Finalizar']
                    };
                    startTimer(recipe);
                  }} className="w-full btn-primary">
                    <Play className="w-4 h-4" />
                    Iniciar Timer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'timer' && selectedRecipe && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentView('methods')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">{selectedRecipe.name}</h2>
              <div className="w-9" />
            </div>

            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 max-w-md mx-auto`}>
              <div className="text-center mb-8">
                <div className={`text-6xl font-bold mb-2 ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'}`}>{formatTime(currentTime)}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedRecipe.method}</div>
              </div>

              <div className="mb-8">
                <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000" style={{ width: `${((totalTime - currentTime) / totalTime) * 100}%` }} />
                </div>
              </div>

              <div className="flex gap-4 justify-center mb-8">
                <button onClick={toggleTimer} className={`p-4 rounded-full ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'} text-white transition-colors`}>
                  {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button onClick={resetTimer} className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
                <h4 className="font-bold mb-3">Informações da Receita</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Café:</span><span className="ml-2 font-medium">{selectedRecipe.coffee}g</span></div>
                  <div><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Água:</span><span className="ml-2 font-medium">{selectedRecipe.water}ml</span></div>
                  <div><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Proporção:</span><span className="ml-2 font-medium">1:{selectedRecipe.ratio}</span></div>
                  <div><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tempo:</span><span className="ml-2 font-medium">{formatTime(selectedRecipe.time)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'recipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Minhas Receitas</h2>
              <button onClick={() => setCurrentView('home')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {customRecipes.map((recipe) => (
                <div key={recipe.id} className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6`}>
                  <h3 className="text-xl font-bold mb-2">{recipe.name}</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{recipe.method}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Café:</span><span className="ml-2 font-medium">{recipe.coffee}g</span></div>
                    <div><span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Água:</span><span className="ml-2 font-medium">{recipe.water}ml</span></div>
                    <div><span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Ratio:</span><span className="ml-2 font-medium">1:{recipe.ratio}</span></div>
                    <div><span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Tempo:</span><span className="ml-2 font-medium">{formatTime(recipe.time)}</span></div>
                  </div>

                  <button onClick={() => startTimer(recipe)} className="w-full btn-primary">
                    <Play className="w-4 h-4" />
                    Iniciar Preparo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Histórico de Extrações</h2>
              <button onClick={() => setCurrentView('home')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {brewingHistory.length === 0 ? (
                <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-8 text-center`}>
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma extração registrada ainda</p>
                </div>
              ) : (
                brewingHistory.map((session) => (
                  <div key={session.id} className={`${isDarkMode ? 'glass-card' : 'bg-white shadow'} rounded-xl p-6`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{session.recipeName}</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{session.method}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(session.date).toLocaleDateString('pt-BR')}</div>
                        <div className="text-sm font-medium">{formatTime(session.duration)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Configurações</h2>
              <button onClick={() => setCurrentView('home')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6 space-y-6`}>
              <div>
                <h3 className="font-bold mb-4">Configurações Padrão</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantidade de Café Padrão (g)</label>
                    <input type="number" value={defaultCoffee} onChange={(e) => setDefaultCoffee(Number(e.target.value))} className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proporção Padrão (1:X)</label>
                    <input type="number" value={defaultRatio} onChange={(e) => setDefaultRatio(Number(e.target.value))} className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Notificações</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Som do Timer</span>
                    <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} className="w-5 h-5 rounded" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'login' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-8 max-w-md w-full`}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Beaker className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Bem-vindo ao OTC Lab</h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Entre para continuar sua jornada</p>
              </div>

              <button onClick={handleLogin} className="w-full btn-primary mb-4">
                <User className="w-5 h-5" />
                Entrar como Convidado
              </button>

              <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Entre para salvar suas receitas e histórico</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {currentView !== 'login' && currentView !== 'timer' && (
        <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-[#09090b] border-gray-800' : 'bg-white border-gray-200'} border-t`}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-around py-2">
              <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'home' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Coffee className="w-5 h-5" />
                <span className="text-xs mt-1">Início</span>
              </button>
              <button onClick={() => setCurrentView('methods')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'methods' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Beaker className="w-5 h-5" />
                <span className="text-xs mt-1">Métodos</span>
              </button>
              <button onClick={() => setCurrentView('recipes')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'recipes' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Plus className="w-5 h-5" />
                <span className="text-xs mt-1">Receitas</span>
              </button>
              <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'history' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <History className="w-5 h-5" />
                <span className="text-xs mt-1">Histórico</span>
              </button>
              <button onClick={() => setCurrentView('settings')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'settings' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Settings className="w-5 h-5" />
                <span className="text-xs mt-1">Config</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
