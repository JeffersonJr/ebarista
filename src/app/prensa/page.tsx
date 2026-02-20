'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Clock, Beaker, Thermometer } from 'lucide-react';

interface TimerStep {
  id: string;
  name: string;
  duration: number;
  description: string;
  type: 'pour' | 'stir' | 'wait' | 'press';
}

const frenchPressSteps: TimerStep[] = [
  {
    id: '1',
    name: 'Adicionar Café',
    duration: 0,
    description: 'Adicione o café moído grosso na prensa francesa',
    type: 'pour'
  },
  {
    id: '2',
    name: 'Adicionar Água Quente',
    duration: 30,
    description: 'Despeje água a 92-96°C, cobrindo todo o café',
    type: 'pour'
  },
  {
    id: '3',
    name: 'Bloom',
    duration: 60,
    description: 'Aguarde 60 segundos para o café "florescer"',
    type: 'wait'
  },
  {
    id: '4',
    name: 'Mexer Suavemente',
    duration: 15,
    description: 'Mexa delicadamente com uma colher para quebrar a crosta',
    type: 'stir'
  },
  {
    id: '5',
    name: 'Infusão',
    duration: 240,
    description: 'Deixe o café em infusão por 4 minutos',
    type: 'wait'
  },
  {
    id: '6',
    name: 'Remover Crosta',
    duration: 30,
    description: 'Remova a camada superior de espuma e resíduos',
    type: 'stir'
  },
  {
    id: '7',
    name: 'Pressionar',
    duration: 30,
    description: 'Pressione lentamente o êmbolo até o fundo',
    type: 'press'
  }
];

export default function PrensaFrancesa() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState(15);
  const [waterAmount, setWaterAmount] = useState(255);
  const [ratio, setRatio] = useState(17);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedTheme = localStorage.getItem('ebarista-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ebarista-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next step
            if (currentStep < frenchPressSteps.length - 1) {
              const nextStep = frenchPressSteps[currentStep + 1];
              setCurrentStep((prev) => prev + 1);
              setCompletedSteps((prev) => new Set(prev).add(frenchPressSteps[currentStep].id));
              return nextStep.duration;
            } else {
              // Timer finished
              setIsRunning(false);
              setCompletedSteps((prev) => new Set(prev).add(frenchPressSteps[currentStep].id));
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentStep === 0 && timeRemaining === 0) {
      // Start from beginning
      setCurrentStep(1);
      setTimeRemaining(frenchPressSteps[1].duration);
      setCompletedSteps(new Set(['1']));
    } else {
      // Resume from current step
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeRemaining(0);
    setCompletedSteps(new Set());
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === 0) {
      setCurrentStep(0);
      setTimeRemaining(0);
      setIsRunning(false);
      setCompletedSteps(new Set());
    } else {
      setCurrentStep(stepIndex);
      setTimeRemaining(frenchPressSteps[stepIndex].duration);
      setIsRunning(false);
      const newCompleted = new Set<string>();
      for (let i = 0; i < stepIndex; i++) {
        newCompleted.add(frenchPressSteps[i].id);
      }
      setCompletedSteps(newCompleted);
    }
  };

  const calculateWater = () => {
    return coffeeAmount * ratio;
  };

  useEffect(() => {
    setWaterAmount(calculateWater());
  }, [coffeeAmount, ratio]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} p-2 sm:p-4 pb-20`}>
      {/* Header */}
      <header className="p-2 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          {/* Back Button + Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400' : 'text-gray-700'}`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center flex-1 mx-2 sm:mx-4">
            <Image 
              src="/logo ebarista.svg" 
              alt="e.barista" 
              width={230} 
              height={115}
              className="w-32 h-16 sm:w-58 sm:h-29"
            />
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mt-2`}>
              Prensa Francesa
            </h1>
          </div>

          {/* Placeholder for balance */}
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Recipe Calculator */}
        <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            Calculadora de Receita
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Café (g)
              </label>
              <input
                type="number"
                value={coffeeAmount}
                onChange={(e) => setCoffeeAmount(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Proporção (1:X)
              </label>
              <input
                type="number"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Água (g)
              </label>
              <div className={`w-full px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-gray-100 text-gray-900'} border`}>
                {waterAmount}g
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-green-50'} border ${isDarkMode ? 'border-slate-700' : 'border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                Receita James Hoffmann
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Método profissional para extrair café encorpado, limpo e sem resíduos amargos.
              Temperatura ideal: 92-96°C. Tempo total: ~5 minutos.
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6 sm:p-8`}>
          {/* Timer Circle */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-green-100'} mb-4`}>
              <div>
                <div className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
                  {frenchPressSteps[currentStep]?.name || 'Pronto'}
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  {currentStep === 0 ? 'Iniciar' : 'Continuar'}
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  Pausar
                </button>
              )}
              <button
                onClick={handleReset}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition-opacity`}
              >
                <RotateCcw className="w-5 h-5" />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Step Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Etapa {currentStep + 1} de {frenchPressSteps.length}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {frenchPressSteps[currentStep]?.duration || 0}s
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-1000"
                style={{
                  width: frenchPressSteps[currentStep]?.duration 
                    ? `${((frenchPressSteps[currentStep].duration - timeRemaining) / frenchPressSteps[currentStep].duration) * 100}%`
                    : currentStep === frenchPressSteps.length - 1 && timeRemaining === 0
                    ? '100%'
                    : '0%'
                }}
              />
            </div>
          </div>

          {/* Current Step Description */}
          {currentStep < frenchPressSteps.length && (
            <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-green-50'} border ${isDarkMode ? 'border-slate-700' : 'border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {frenchPressSteps[currentStep].type === 'pour' && <Beaker className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />}
                {frenchPressSteps[currentStep].type === 'stir' && <Coffee className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />}
                {frenchPressSteps[currentStep].type === 'wait' && <Clock className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />}
                {frenchPressSteps[currentStep].type === 'press' && <Thermometer className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />}
                <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                  {frenchPressSteps[currentStep].name}
                </h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {frenchPressSteps[currentStep].description}
              </p>
            </div>
          )}

          {/* Step List */}
          <div className="space-y-2">
            {frenchPressSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentStep 
                    ? isDarkMode ? 'bg-slate-700 border border-green-500' : 'bg-green-100 border border-green-300'
                    : completedSteps.has(step.id)
                    ? isDarkMode ? 'bg-slate-800' : 'bg-green-50'
                    : isDarkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.type === 'pour' ? 'bg-blue-500 text-white' :
                      step.type === 'stir' ? 'bg-purple-500 text-white' :
                      step.type === 'wait' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {step.type === 'pour' ? 'D' :
                       step.type === 'stir' ? 'M' :
                       step.type === 'wait' ? 'E' : 'P'}
                    </div>
                    <span className={`text-sm ${
                      index === currentStep 
                        ? isDarkMode ? 'text-slate-100 font-semibold' : 'text-gray-900 font-semibold'
                        : completedSteps.has(step.id)
                        ? isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  <span className={`text-xs ${
                    index === currentStep 
                      ? isDarkMode ? 'text-slate-300' : 'text-gray-700'
                      : completedSteps.has(step.id)
                      ? isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      : isDarkMode ? 'text-slate-500' : 'text-gray-500'
                  }`}>
                    {step.duration > 0 ? `${step.duration}s` : 'Manual'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            Dicas Profissionais
          </h2>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'} border ${isDarkMode ? 'border-slate-700' : 'border-blue-200'}`}>
              <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Moagem Grosseira
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Use moagem grossa, similar a sal grosso. Moagem fina resulta em café amargo e com resíduos.
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-yellow-50'} border ${isDarkMode ? 'border-slate-700' : 'border-yellow-200'}`}>
              <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Temperatura Controlada
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Água entre 92-96°C. Água fervendo queima o café e extrai sabores amargos indesejados.
              </p>
            </div>
            
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-green-50'} border ${isDarkMode ? 'border-slate-700' : 'border-green-200'}`}>
              <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                Pressão Lenta
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Pressione o êmbolo lentamente e com firmeza. Pressão rápida agita o café e cria turbidez.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
