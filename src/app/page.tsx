'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coffee, Timer, Clock, Plus, Play, Pause, RotateCcw, Settings, History } from 'lucide-react';

interface CoffeeMethod {
  id: string;
  name: string;
  description: string;
  ratio: number;
  defaultSteps: TimerStep[];
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

const coffeeMethods: CoffeeMethod[] = [
  {
    id: 'v60',
    name: 'Hario V60',
    description: 'Método versátil com controle total sobre extração',
    ratio: 15,
    defaultSteps: [
      { id: '1', name: 'Bloom', duration: 30, waterAmount: 60, type: 'bloom' },
      { id: '2', name: '1º Ataque', duration: 45, waterAmount: 150, type: 'pour' },
      { id: '3', name: '2º Ataque', duration: 45, waterAmount: 90, type: 'pour' },
      { id: '4', name: 'Finalização', duration: 30, waterAmount: 0, type: 'wait' }
    ]
  },
  {
    id: 'chemex',
    name: 'Chemex',
    description: 'Extração limpa e saborosa com filtro espesso',
    ratio: 16,
    defaultSteps: [
      { id: '1', name: 'Bloom', duration: 45, waterAmount: 80, type: 'bloom' },
      { id: '2', name: '1º Ataque', duration: 60, waterAmount: 200, type: 'pour' },
      { id: '3', name: '2º Ataque', duration: 60, waterAmount: 120, type: 'pour' },
      { id: '4', name: 'Finalização', duration: 45, waterAmount: 0, type: 'wait' }
    ]
  },
  {
    id: 'french-press',
    name: 'Prensa Francesa',
    description: 'Corpo encorpado e aromas intensos',
    ratio: 17,
    defaultSteps: [
      { id: '1', name: 'Adicionar Água', duration: 30, waterAmount: 0, type: 'pour' },
      { id: '2', name: 'Bloom', duration: 60, waterAmount: 0, type: 'bloom' },
      { id: '3', name: 'Mexer', duration: 15, waterAmount: 0, type: 'stir' },
      { id: '4', name: 'Esperar', duration: 240, waterAmount: 0, type: 'wait' },
      { id: '5', name: 'Pressionar', duration: 30, waterAmount: 0, type: 'pour' }
    ]
  },
  {
    id: 'aeropress',
    name: 'Aeropress',
    description: 'Versatilidade extrema com pressão',
    ratio: 14,
    defaultSteps: [
      { id: '1', name: 'Bloom', duration: 15, waterAmount: 50, type: 'bloom' },
      { id: '2', name: 'Mexer', duration: 10, waterAmount: 0, type: 'stir' },
      { id: '3', name: 'Adicionar Água', duration: 30, waterAmount: 150, type: 'pour' },
      { id: '4', name: 'Esperar', duration: 60, waterAmount: 0, type: 'wait' },
      { id: '5', name: 'Pressionar', duration: 30, waterAmount: 0, type: 'pour' }
    ]
  }
];

export default function Home() {
  const [selectedMethod, setSelectedMethod] = useState<CoffeeMethod | null>(null);
  const [coffeeAmount, setCoffeeAmount] = useState(20);
  const [waterAmount, setWaterAmount] = useState(300);
  const [ratio, setRatio] = useState(15);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [brewingHistory, setBrewingHistory] = useState<BrewingSession[]>([]);
  const [currentView, setCurrentView] = useState<'methods' | 'calculator' | 'timer' | 'recipes' | 'history'>('methods');
  
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('ebarista-recipes');
    const savedHistory = localStorage.getItem('ebarista-history');
    
    if (savedRecipes) {
      setCustomRecipes(JSON.parse(savedRecipes));
    }
    
    if (savedHistory) {
      setBrewingHistory(JSON.parse(savedHistory));
    }
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

  // Calculate water amount based on coffee and ratio
  useEffect(() => {
    const calculatedWater = coffeeAmount * ratio;
    setWaterAmount(calculatedWater);
  }, [coffeeAmount, ratio]);

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

  const startTimer = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStep(0);
    setTimeRemaining(recipe.steps[0].duration);
    setTotalTime(recipe.steps.reduce((acc, step) => acc + step.duration, 0));
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeRemaining(0);
    setSelectedRecipe(null);
  };

  const createCustomRecipe = useCallback((method: CoffeeMethod) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: `${method.name} - Personalizado`,
      methodId: method.id,
      coffeeAmount,
      waterAmount,
      ratio,
      steps: [...method.defaultSteps],
      createdAt: new Date()
    };
    
    setCustomRecipes((prev) => [newRecipe, ...prev]);
    setCurrentView('recipes');
  }, [coffeeAmount, waterAmount, ratio]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepIcon = (type: TimerStep['type']) => {
    switch (type) {
      case 'bloom': return <Coffee className="w-5 h-5" />;
      case 'pour': return <Timer className="w-5 h-5" />;
      case 'stir': return <Settings className="w-5 h-5" />;
      case 'wait': return <Clock className="w-5 h-5" />;
      default: return <Timer className="w-5 h-5" />;
    }
  };

  const getStepColor = (type: TimerStep['type']) => {
    switch (type) {
      case 'bloom': return 'text-yellow-400';
      case 'pour': return 'text-cyan-400';
      case 'stir': return 'text-purple-400';
      case 'wait': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      {/* Header */}
      <header className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo ebarista.svg" alt="e.barista" className="w-24 h-12" />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('methods')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'methods' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Métodos
            </button>
            <button
              onClick={() => setCurrentView('calculator')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'calculator' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setCurrentView('recipes')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'recipes' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentView === 'history' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Histórico
            </button>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex md:hidden gap-2 mt-4">
          <button
            onClick={() => setCurrentView('methods')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              currentView === 'methods' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Métodos
          </button>
          <button
            onClick={() => setCurrentView('calculator')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              currentView === 'calculator' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calc
          </button>
          <button
            onClick={() => setCurrentView('recipes')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              currentView === 'recipes' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
              currentView === 'history' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hist
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Methods View */}
        {currentView === 'methods' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Métodos de Preparo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {coffeeMethods.map((method) => (
                <div key={method.id} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-400">{method.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{method.description}</p>
                    </div>
                    <Coffee className="w-6 h-6 text-cyan-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm">
                      <span className="text-slate-500">Ratio:</span>
                      <span className="text-slate-200 ml-2">1:{method.ratio}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Etapas:</span>
                      <span className="text-slate-200 ml-2">{method.defaultSteps.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMethod(method);
                        setRatio(method.ratio);
                        setCurrentView('calculator');
                      }}
                      className="btn-primary flex-1 text-sm"
                    >
                      Usar Método
                    </button>
                    <button
                      onClick={() => createCustomRecipe(method)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Personalizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculator View */}
        {currentView === 'calculator' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Calculadora de Proporções</h2>
            
            <div className="glass-card p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Café (gramas)
                  </label>
                  <input
                    type="number"
                    value={coffeeAmount}
                    onChange={(e) => setCoffeeAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Ratio (água:café)
                  </label>
                  <input
                    type="number"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                    min="10"
                    max="20"
                    step="0.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Água (ml)
                  </label>
                  <div className="w-full px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700 text-cyan-400 font-semibold">
                    {waterAmount}
                  </div>
                </div>
              </div>
              
              {selectedMethod && (
                <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Método selecionado</p>
                      <p className="font-semibold text-cyan-400">{selectedMethod.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        const recipe: Recipe = {
                          id: Date.now().toString(),
                          name: `${selectedMethod.name} - Rápido`,
                          methodId: selectedMethod.id,
                          coffeeAmount,
                          waterAmount,
                          ratio,
                          steps: selectedMethod.defaultSteps,
                          createdAt: new Date()
                        };
                        startTimer(recipe);
                        setCurrentView('timer');
                      }}
                      className="btn-primary"
                    >
                      Iniciar Preparo
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Ratios */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Ratios Rápidos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[12, 14, 15, 16, 17, 18].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`p-3 rounded-lg border transition-all ${
                      ratio === r
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    1:{r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timer View */}
        {currentView === 'timer' && selectedRecipe && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cronômetro de Preparo</h2>
              <button
                onClick={() => setCurrentView('methods')}
                className="btn-secondary"
              >
                Voltar
              </button>
            </div>
            
            <div className="glass-card p-8">
              {/* Recipe Info */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">{selectedRecipe.name}</h3>
                <div className="flex items-center justify-center gap-6 text-slate-400">
                  <span>{selectedRecipe.coffeeAmount}g café</span>
                  <span>•</span>
                  <span>{selectedRecipe.waterAmount}ml água</span>
                  <span>•</span>
                  <span>1:{selectedRecipe.ratio}</span>
                </div>
              </div>
              
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold font-mono text-cyan-400 mb-4">
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((totalTime - timeRemaining) / totalTime) * 100}%` 
                    }}
                  />
                </div>
                
                {/* Current Step */}
                {selectedRecipe.steps[currentStep] && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStepColor(selectedRecipe.steps[currentStep].type)}`}>
                    {getStepIcon(selectedRecipe.steps[currentStep].type)}
                    <span className="font-semibold">
                      {selectedRecipe.steps[currentStep].name}
                    </span>
                    {selectedRecipe.steps[currentStep].waterAmount > 0 && (
                      <span className="text-sm">
                        ({selectedRecipe.steps[currentStep].waterAmount}ml)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Steps Timeline */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Etapas</h4>
                  <span className="text-sm text-slate-400">
                    {currentStep + 1} / {selectedRecipe.steps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedRecipe.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        index === currentStep
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : index < currentStep
                          ? 'bg-slate-800/30 opacity-50'
                          : 'bg-slate-800/20'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === currentStep
                          ? 'bg-cyan-500 text-slate-900'
                          : index < currentStep
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {index < currentStep ? '✓' : index + 1}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className={getStepColor(step.type)}>
                          {getStepIcon(step.type)}
                        </span>
                        <span className="flex-1">{step.name}</span>
                        <span className="text-sm text-slate-400">
                          {formatTime(step.duration)}
                        </span>
                        {step.waterAmount > 0 && (
                          <span className="text-sm text-cyan-400">
                            +{step.waterAmount}ml
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex gap-3">
                {!isRunning ? (
                  timeRemaining > 0 ? (
                    <button
                      onClick={resumeTimer}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Retomar
                    </button>
                  ) : (
                    <button
                      onClick={() => startTimer(selectedRecipe)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Iniciar
                    </button>
                  )
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    Pausar
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="btn-secondary flex items-center justify-center gap-2 px-6"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipes View */}
        {currentView === 'recipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Minhas Receitas</h2>
              <button
                onClick={() => setCurrentView('methods')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Receita
              </button>
            </div>
            
            {customRecipes.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Coffee className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">
                  Nenhuma receita personalizada
                </h3>
                <p className="text-slate-500 mb-6">
                  Crie suas próprias receitas personalizadas a partir dos métodos disponíveis
                </p>
                <button
                  onClick={() => setCurrentView('methods')}
                  className="btn-primary"
                >
                  Explorar Métodos
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {customRecipes.map((recipe) => {
                  const method = coffeeMethods.find(m => m.id === recipe.methodId);
                  return (
                    <div key={recipe.id} className="glass-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-cyan-400">{recipe.name}</h3>
                          <p className="text-slate-400 text-sm">{method?.name}</p>
                        </div>
                        <Coffee className="w-6 h-6 text-cyan-400" />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <span className="text-slate-400">{recipe.coffeeAmount}g</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{recipe.waterAmount}ml</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">1:{recipe.ratio}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            startTimer(recipe);
                            setCurrentView('timer');
                          }}
                          className="btn-primary flex-1 text-sm"
                        >
                          Iniciar Preparo
                        </button>
                        <button
                          onClick={() => {
                            setCoffeeAmount(recipe.coffeeAmount);
                            setWaterAmount(recipe.waterAmount);
                            setRatio(recipe.ratio);
                            setCurrentView('calculator');
                          }}
                          className="btn-secondary flex-1 text-sm"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Histórico de Preparos</h2>
              <button
                onClick={() => setBrewingHistory([])}
                className="btn-secondary text-sm"
              >
                Limpar Histórico
              </button>
            </div>
            
            {brewingHistory.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">
                  Nenhum preparo registrado
                </h3>
                <p className="text-slate-500">
                  Seus preparos aparecerão aqui após completar o cronômetro
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {brewingHistory.map((session) => {
                  const recipe = [...customRecipes, ...coffeeMethods.map(m => ({
                    id: m.id,
                    name: m.name,
                    methodId: m.id,
                    coffeeAmount: 20,
                    waterAmount: 300,
                    ratio: m.ratio,
                    steps: m.defaultSteps,
                    createdAt: new Date()
                  }))].find(r => r.id === session.recipeId);
                  
                  return (
                    <div key={session.id} className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-cyan-400">
                            {recipe?.name || 'Preparo'}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                            <span>{new Date(session.startTime).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{new Date(session.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            {session.completed && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">Concluído</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {recipe && (
                          <button
                            onClick={() => {
                              startTimer(recipe);
                              setCurrentView('timer');
                            }}
                            className="btn-primary text-sm"
                          >
                            Repetir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
