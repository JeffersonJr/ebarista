'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Coffee, Moon, Sun, User, LogIn, History, Plus, Trash2, Star, LogOut } from 'lucide-react';

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

interface Grinder {
  id: string;
  name: string;
  isMain: boolean;
}

const coffeeMethods: CoffeeMethod[] = [
  {
    id: 'v60',
    name: 'Hario V60',
    description: 'Controle preciso de extração com método 4:6',
    ratio: 15,
    time: 210,
    difficulty: 'Intermediário',
    icon: '/v60.svg'
  },
  {
    id: 'french-press',
    name: 'Prensa Francesa',
    description: 'Café encorpado e limpo',
    ratio: 17,
    time: 240,
    difficulty: 'Iniciante',
    icon: '/prensa.svg'
  },
  {
    id: 'chemex',
    name: 'Chemex',
    description: 'Extração limpa e sabor complexo',
    ratio: 16,
    time: 270,
    difficulty: 'Intermediário',
    icon: '/chemex.svg'
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    description: 'Versatilidade e rapidez',
    ratio: 14,
    time: 120,
    difficulty: 'Iniciante',
    icon: '/aeropress.svg'
  },
  {
    id: 'kalita',
    name: 'Kalita Wave',
    description: 'Consistência e facilidade',
    ratio: 15,
    time: 180,
    difficulty: 'Iniciante',
    icon: '/kalita wave.svg'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crie seu próprio método',
    ratio: 15,
    time: 180,
    difficulty: 'Avançado',
    icon: '/gear.svg'
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'explore' | 'history' | 'profile'>('explore');
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(defaultRecipes);
  const [brewingHistory, setBrewingHistory] = useState<BrewingSession[]>([]);
  const [userName, setUserName] = useState('Usuário OTC');
  const [userEmail] = useState('jeffersoncamposbeirajunior@gmail.com');
  const [grinders, setGrinders] = useState<Grinder[]>([]);

  const [showGrinderModal, setShowGrinderModal] = useState(false);
  const [grinderSearchTerm, setGrinderSearchTerm] = useState('');

  useEffect(() => {
    const savedRecipes = localStorage.getItem('otc-lab-recipes');
    const savedHistory = localStorage.getItem('otc-lab-history');
    const savedSettings = localStorage.getItem('otc-lab-settings');
    
    if (savedRecipes) {
      try {
        const recipes = JSON.parse(savedRecipes);
        setTimeout(() => setCustomRecipes(recipes), 0);
      } catch (error) {
        console.error('Error loading recipes:', error);
      }
    }
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setTimeout(() => setBrewingHistory(history), 0);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }

    if (savedSettings) {
      try {
        JSON.parse(savedSettings);
        setTimeout(() => {
          // Settings can be loaded here if needed in the future
        }, 0);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('otc-lab-recipes', JSON.stringify(customRecipes));
  }, [customRecipes]);

  useEffect(() => {
    localStorage.setItem('otc-lab-history', JSON.stringify(brewingHistory));
  }, [brewingHistory]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addGrinder = (grinderName: string) => {
    setGrinders((prevGrinders) => [
      ...prevGrinders,
      { id: Date.now().toString(), name: grinderName, isMain: false },
    ]);
    setShowGrinderModal(false);
  };

  const removeGrinder = (id: string) => {
    setGrinders((prevGrinders) => prevGrinders.filter((g) => g.id !== id));
  };

  const setMainGrinder = (id: string) => {
    setGrinders((prevGrinders) =>
      prevGrinders.map((g) =>
        g.id === id ? { ...g, isMain: true } : { ...g, isMain: false }
      )
    );
  };



  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4 pb-20`}>
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-center flex-1">
          <Image 
            src="/logo ebarista.svg" 
            alt="e.barista" 
            width={606}
            height={129}
            className="w-auto h-auto max-w-40"
          />
        </div>

        <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{userName}</span>
                <button onClick={() => {
                  setUserName('');
                }} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  <LogIn className="w-4 h-4 rotate-180" />
                </button>
              </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {currentView === 'explore' && (
          <div className="space-y-8">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coffeeMethods.map((method) => (
                  <div key={method.id} className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6 relative`}>
                    {(method.id !== 'v60' && method.id !== 'french-press') && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Em breve</span>
                      </div>
                    )}
                    <div className="w-16 h-16 mb-4 mx-auto">
                      <Image 
                        src={method.icon} 
                        alt={method.name} 
                        width={64}
                        height={64}
                        className={`w-full h-full object-contain ${isDarkMode ? 'brightness-0 invert' : ''}`}
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-center">{method.name}</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>{method.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}




        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Meu Histórico</h2>
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

        {currentView === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold">Perfil</h2>
              </div>
            </div>

            <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6 space-y-6`}>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  {userEmail}
                </div>
              </div>

              <div>
                {grinders.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Meus Moedores</h3>
                      <button onClick={() => setShowGrinderModal(true)} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white text-sm`}>
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {grinders.map((grinder) => (
                        <div key={grinder.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                              <Coffee className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium">{grinder.name}</div>
                              {grinder.isMain && (
                                <span className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Principal</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!grinder.isMain && (
                              <button onClick={() => setMainGrinder(grinder.id)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                                <Star className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                            <button onClick={() => removeGrinder(grinder.id)} className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {grinders.length === 0 && (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-left">Meus Moedores</h3>
                      <button onClick={() => setShowGrinderModal(true)} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white text-sm`}>
                        <Plus className="w-4 h-4" />
                        Adicionar moedor
                      </button>
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4">
                      <Image 
                        src="/moedor.svg" 
                        alt="Moedor" 
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nenhum moedor cadastrado</p>
                  </div>
                )}
              </div>

              <button className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white font-medium`}>
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {showGrinderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Selecionar Moedor</h3>
                <button 
                  onClick={() => setShowGrinderModal(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar moedor..."
                  value={grinderSearchTerm}
                  onChange={(e) => setGrinderSearchTerm(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">1Zpresso</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('1Zpresso J-Ultra')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso J-Ultra</span>
                        <span className="text-xs opacity-75">2.46µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso JX-Pro S / JX-Pro')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso JX-Pro S / JX-Pro</span>
                        <span className="text-xs opacity-75">4.58µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso X-Ultra')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso X-Ultra</span>
                        <span className="text-xs opacity-75">5.04µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso X-Pro / X-Pro S')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso X-Pro / X-Pro S</span>
                        <span className="text-xs opacity-75">5.17µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso J-Max / J-Max S')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso J-Max / J-Max S</span>
                        <span className="text-xs opacity-75">2.64µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso J / JX / JX S')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso J / JX / JX S</span>
                        <span className="text-xs opacity-75">9.00µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso Q Air / Q2 (Todos)')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso Q Air / Q2 (Todos)</span>
                        <span className="text-xs opacity-75">11.33µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso JE')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso JE</span>
                        <span className="text-xs opacity-75">5.80µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso K-Pro / K-Max')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso K-Pro / K-Max</span>
                        <span className="text-xs opacity-75">8.05µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso K-Plus')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso K-Plus</span>
                        <span className="text-xs opacity-75">8.31µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso K-Ultra')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso K-Ultra</span>
                        <span className="text-xs opacity-75">7.60µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('1Zpresso ZP6 Special')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">1Zpresso ZP6 Special</span>
                        <span className="text-xs opacity-75">15.56µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Baratza</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Baratza Sette 270 / 270Wi / 30')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Baratza Sette 270 / 270Wi / 30</span>
                        <span className="text-xs opacity-75">24.00µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Baratza Encore')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Baratza Encore</span>
                        <span className="text-xs opacity-75">23.75µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Baratza Virtuoso+')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Baratza Virtuoso+</span>
                        <span className="text-xs opacity-75">25.00µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Baratza Forté AP / BG')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Baratza Forté AP / BG</span>
                        <span className="text-xs opacity-75">3.55µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Baratza Vario / Vario+')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Baratza Vario / Vario+</span>
                        <span className="text-xs opacity-75">4.02 / 4.20µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Comandante</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Comandante C40 MK4 / X25')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Comandante C40 MK4 / X25</span>
                        <span className="text-xs opacity-75">27.25µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Comandante C40/X25 (com Red Clix)')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Comandante C40/X25 (com Red Clix)</span>
                        <span className="text-xs opacity-75">13.63µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Comandante C60 Baracuda')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Comandante C60 Baracuda</span>
                        <span className="text-xs opacity-75">19.82µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Fellow</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Fellow Opus')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Fellow Opus</span>
                        <span className="text-xs opacity-75">23.25µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Fellow Ode Gen 2')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Fellow Ode Gen 2</span>
                        <span className="text-xs opacity-75">29.50µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Hario</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Hario Skerton / Skerton PLUS')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Hario Skerton / Skerton PLUS</span>
                        <span className="text-xs opacity-75">131.25µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Hario Mini Mill (Todos)')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Hario Mini Mill (Todos)</span>
                        <span className="text-xs opacity-75">63.16µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">KINGrinder</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('KINGrinder K0 / K1 / K2 / K3 / K5')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">KINGrinder K0 / K1 / K2 / K3 / K5</span>
                        <span className="text-xs opacity-75">7.36µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('KINGrinder K4 / K6')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">KINGrinder K4 / K6</span>
                        <span className="text-xs opacity-75">8.44µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Kinu</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Kinu M47 (Todos os modelos)')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Kinu M47 (Todos os modelos)</span>
                        <span className="text-xs opacity-75">16.47µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Mazzer</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Mazzer ZM / ZM Plus')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Mazzer ZM / ZM Plus</span>
                        <span className="text-xs opacity-75">1.00µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Timemore</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Timemore C2 / C2 Fold / C2 Max')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Timemore C2 / C2 Fold / C2 Max</span>
                        <span className="text-xs opacity-75">31.67µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Timemore C3 / C3 Pro / C3 Max')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Timemore C3 / C3 Pro / C3 Max</span>
                        <span className="text-xs opacity-75">38.00µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Timemore C3 ESP / ESP Pro')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Timemore C3 ESP / ESP Pro</span>
                        <span className="text-xs opacity-75">11.21µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Timemore Sculptor 078S')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Timemore Sculptor 078S</span>
                        <span className="text-xs opacity-75">5.56µ/click</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-500">Weber</h4>
                    <div className="space-y-1">
                      <button onClick={() => addGrinder('Weber EG-1')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Weber EG-1</span>
                        <span className="text-xs opacity-75">5.00µ/click</span>
                      </button>
                      <button onClick={() => addGrinder('Weber KEY Mk1')} className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}>
                        <span className="font-bold">Weber KEY Mk1</span>
                        <span className="text-xs opacity-75">4.18µ/click</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-[#09090b] border-gray-800' : 'bg-white border-gray-200'} border-t`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <button onClick={() => setCurrentView('explore')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'explore' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Coffee className="w-5 h-5" />
              <span className="text-xs mt-1">Explorar</span>
            </button>
            <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'history' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <History className="w-5 h-5" />
              <span className="text-xs mt-1">Histórico</span>
            </button>
            <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'profile' ? 'text-cyan-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Perfil</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
