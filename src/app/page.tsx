'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    description: 'Café encorpado, limpo e sem resíduos',
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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'explore' | 'history' | 'profile'>('explore');
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(defaultRecipes);
  const [brewingHistory, setBrewingHistory] = useState<BrewingSession[]>([]);
  const [userEmail] = useState('jeffersoncamposbeirajunior@gmail.com');
  const [grinders, setGrinders] = useState<Grinder[]>([]);

  const [showGrinderModal, setShowGrinderModal] = useState(false);
  const [grinderSearchTerm, setGrinderSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [grinderToDelete, setGrinderToDelete] = useState<string | null>(null);

  const grinderData: Record<string, { name: string, micron: string }[]> = {
    '1Zpresso': [
      { name: '1Zpresso J-Ultra', micron: '2.46µ/click' },
      { name: '1Zpresso JX-Pro S', micron: '4.58µ/click' },
      { name: '1Zpresso JX S', micron: '9µ/click' },
      { name: '1Zpresso X-Ultra', micron: '5.04µ/click' },
      { name: '1Zpresso Q Air', micron: '11.33µ/click' },
      { name: '1Zpresso X-Pro S', micron: '5.17µ/click' },
      { name: '1Zpresso X-Pro', micron: '5.17µ/click' },
      { name: '1Zpresso J-Max', micron: '2.64µ/click' },
      { name: '1Zpresso J', micron: '9µ/click' },
      { name: '1Zpresso JX-Pro', micron: '4.58µ/click' },
      { name: '1Zpresso Q2 (Pentagonal burrs)', micron: '11.33µ/click' },
      { name: '1Zpresso Q2 (Heptagonal burrs)', micron: '11.33µ/click' },
      { name: '1Zpresso Q2 S', micron: '11.33µ/click' },
      { name: '1Zpresso JX', micron: '9µ/click' },
      { name: '1Zpresso JE', micron: '5.8µ/click' },
      { name: '1Zpresso K-Pro', micron: '8.05µ/click' },
      { name: '1Zpresso K-Plus', micron: '8.31µ/click' },
      { name: '1Zpresso K-Ultra', micron: '7.6µ/click' },
      { name: '1Zpresso ZP6 Special', micron: '15.56µ/click' },
      { name: '1Zpresso ZP6', micron: '13.75µ/click' },
      { name: '1Zpresso K-Max', micron: '8.05µ/click' },
      { name: '1Zpresso J-Max S', micron: '2.64µ/click' },
    ],
    'Acaia': [
      { name: 'Acaia Orbit', micron: '7.49µ/click' },
    ],
    'Anfim': [
      { name: 'Anfim Best', micron: '8.64µ/click' },
    ],
    'Balmuda': [
      { name: 'Balmuda Coffee Mill', micron: '60.87µ/click' },
    ],
    'Baratza': [
      { name: 'Baratza Sette 270 Wi', micron: '24µ/click' },
      { name: 'Baratza Starbucks Barista', micron: '20.77µ/click' },
      { name: 'Baratza Maestro Plus', micron: '20.77µ/click' },
      { name: 'Baratza Maestro', micron: '20.77µ/click' },
      { name: 'Baratza Vario W+', micron: '4.2µ/click' },
      { name: 'Baratza Vario W', micron: '4.02µ/click' },
      { name: 'Baratza Vario+', micron: '4.2µ/click' },
      { name: 'Baratza Sette 270', micron: '24µ/click' },
      { name: 'Baratza Virtuoso+', micron: '25µ/click' },
      { name: 'Baratza Sette 30', micron: '24µ/click' },
      { name: 'Baratza Encore', micron: '23.75µ/click' },
      { name: 'Baratza Virtuoso', micron: '22.5µ/click' },
      { name: 'Baratza Sette 270 W', micron: '24µ/click' },
      { name: 'Baratza Vario', micron: '4.02µ/click' },
      { name: 'Baratza Forté AP', micron: '3.55µ/click' },
      { name: 'Baratza Forté BG', micron: '3.55µ/click' },
      { name: 'Baratza Preciso', micron: '2.21µ/click' },
    ],
    'Barista & Co': [
      { name: 'Barista & Co Core All Grind', micron: '20.25µ/click' },
    ],
    'Barista Space': [
      { name: 'Barista Space Premium Coffee Hand Grinder', micron: '23.54µ/click' },
    ],
    'BelleLife': [
      { name: 'BelleLife Electric Coffee Grinder', micron: '24.58µ/click' },
    ],
    'Bentwood': [
      { name: 'Bentwood Vertical 63', micron: '1µ/click' },
    ],
    'Bodum': [
      { name: 'Bodum Bistro 10903', micron: '93.18µ/click' },
    ],
    'Breville (Sage)': [
      { name: 'Breville (Sage) The Smart Grinder Pro', micron: '10.51µ/click' },
      { name: 'Breville (Sage) The Dose Control Pro', micron: '10.51µ/click' },
    ],
    'Cafflano': [
      { name: 'Cafflano Grinder', micron: '65.33µ/click' },
    ],
    'Comandante': [
      { name: 'Comandante X25 Trailmaster (with Red Clix)', micron: '13.63µ/click' },
      { name: 'Comandante C40 MK4 (with Red Clix)', micron: '13.63µ/click' },
      { name: 'Comandante C60 Baracuda', micron: '19.82µ/click' },
      { name: 'Comandante C60 Baracuda (with Gold Clix)', micron: '9.91µ/click' },
      { name: 'Comandante X25 Trailmaster', micron: '27.25µ/click' },
      { name: 'Comandante C40 MK4', micron: '27.25µ/click' },
    ],
    'Compak': [
      { name: 'Compak K3 Touch Advanced', micron: '33.83µ/click' },
      { name: 'Compak K3 Push', micron: '33.83µ/click' },
      { name: 'Compak K3 Touch', micron: '33.83µ/click' },
    ],
    'Cores': [
      { name: 'Cores Cone Grinder C330', micron: '31.47µ/click' },
    ],
    'Epeios': [
      { name: 'Epeios Essense Go', micron: '14.94µ/click' },
    ],
    'Etzinger': [
      { name: 'Etzinger etz-I (Trim)', micron: '11.59µ/click' },
      { name: 'Etzinger etz-U', micron: '11.59µ/click' },
      { name: 'Etzinger etz-I (Regular)', micron: '11.59µ/click' },
    ],
    'Eureka': [
      { name: 'Eureka Mignon Specialità', micron: '25.1µ/click' },
      { name: 'Eureka Mignon Oro XL', micron: '8.44µ/click' },
      { name: 'Eureka Drogheria MCD4', micron: '9.32µ/click' },
      { name: 'Eureka Mignon Silenzio', micron: '25.1µ/click' },
      { name: 'Eureka Atom 60', micron: '20.5µ/click' },
      { name: 'Eureka Mignon Classico', micron: '50.21µ/click' },
      { name: 'Eureka Mignon Oro', micron: '8.44µ/click' },
      { name: 'Eureka Atom 75', micron: '20.5µ/click' },
    ],
    'Fellow': [
      { name: 'Fellow Opus', micron: '23.25µ/click' },
      { name: 'Fellow Ode Brew Grinder Gen 2', micron: '29.5µ/click' },
      { name: 'Fellow Ode Brew Grinder Gen 1', micron: '28.33µ/click' },
    ],
    'Fiorenzato': [
      { name: 'Fiorenzato Pietro', micron: '7.5µ/click' },
    ],
    'Flair': [
      { name: 'Flair Espresso Royal Grinder', micron: '20µ/click' },
    ],
    'Fuji Royal': [
      { name: 'Fuji Royal R-220', micron: '44.44µ/click' },
    ],
    'Goat Story': [
      { name: 'Goat Story Arco', micron: '6.01µ/click' },
    ],
    'Handground': [
      { name: 'Handground Precision Coffee Grinder', micron: '87.5µ/click' },
    ],
    'Hario': [
      { name: 'Hario Skerton PRO', micron: '131.25µ/click' },
      { name: 'Hario V60 EVC-8B', micron: '27.5µ/click' },
      { name: 'Hario Mini Mill PLUS', micron: '63.16µ/click' },
      { name: 'Hario Skerton PLUS', micron: '131.25µ/click' },
      { name: 'Hario Mini Mill Slim', micron: '63.16µ/click' },
      { name: 'Hario Smart-G', micron: '91.54µ/click' },
      { name: 'Hario V60 EVCG-8B-E', micron: '13.49µ/click' },
      { name: 'Hario Mini Mill Slim PRO', micron: '63.16µ/click' },
      { name: 'Hario Skerton', micron: '131.25µ/click' },
    ],
    'Helor': [
      { name: 'Helor 106 Flux', micron: '8.28µ/click' },
      { name: 'Helor 101', micron: '17.5µ/click' },
    ],
    'HeyCafé': [
      { name: 'HeyCafé H1', micron: '12.38µ/click' },
    ],
    'Hongbei': [
      { name: 'Hongbei Coffee Grinder', micron: '43.75µ/click' },
    ],
    'ICafilas': [
      { name: 'ICafilas Manual Grinder', micron: '4.67µ/click' },
    ],
    'ICoffee': [
      { name: 'ICoffee M5 Pro', micron: '6.73µ/click' },
      { name: 'ICoffee M3 Pro', micron: '31.67µ/click' },
    ],
    'Jaffee': [
      { name: 'Jaffee J1 Pro', micron: '7.92µ/click' },
      { name: 'Jaffee J1', micron: '31.67µ/click' },
      { name: 'Jaffee J3', micron: '9.72µ/click' },
    ],
    'JavaPresse': [
      { name: 'JavaPresse Manual Coffee Grinder', micron: '64.74µ/click' },
    ],
    'Joy Resolve': [
      { name: 'Joy Resolve Groove Compact', micron: '30.38µ/click' },
    ],
    'Kaldi': [
      { name: 'Kaldi Ceramic Coffee Mill', micron: '140µ/click' },
    ],
    'Kalita': [
      { name: 'Kalita Next G', micron: '93µ/click' },
      { name: 'Kalita C-90', micron: '142.86µ/click' },
      { name: 'Kalita Nice Cut G', micron: '98µ/click' },
      { name: 'Kalita DIA Coffee Mill', micron: '280µ/click' },
    ],
    'Kanso': [
      { name: 'Kanso Hiku', micron: '19.55µ/click' },
    ],
    'KINGrinder': [
      { name: 'KINGrinder P1', micron: '10.77µ/click' },
      { name: 'KINGrinder K0', micron: '7.36µ/click' },
      { name: 'KINGrinder P2', micron: '10.77µ/click' },
      { name: 'KINGrinder K1', micron: '7.36µ/click' },
      { name: 'KINGrinder K3', micron: '7.36µ/click' },
      { name: 'KINGrinder P0', micron: '10.77µ/click' },
      { name: 'KINGrinder K4', micron: '8.44µ/click' },
      { name: 'KINGrinder K6', micron: '8.44µ/click' },
      { name: 'KINGrinder K5', micron: '7.36µ/click' },
      { name: 'KINGrinder K2', micron: '7.36µ/click' },
    ],
    'Kinu': [
      { name: 'Kinu M47 Phoenix', micron: '16.47µ/click' },
      { name: 'Kinu M47 Simplicity', micron: '16.47µ/click' },
      { name: 'Kinu M47 Classic', micron: '16.47µ/click' },
      { name: 'Kinu M47 Traveller', micron: '16.47µ/click' },
    ],
    'KitchenAid': [
      { name: 'KitchenAid Artisan Coffee Grinder 5KCG0702', micron: '112.86µ/click' },
    ],
    'Knock': [
      { name: 'Knock Feldgrind', micron: '20µ/click' },
      { name: 'Knock Feld2', micron: '23.33µ/click' },
      { name: 'Knock Aergrind', micron: '7.53µ/click' },
    ],
    'Krups': [
      { name: 'Krups GX6000', micron: '65.33µ/click' },
      { name: 'Krups GX5000', micron: '91.36µ/click' },
      { name: 'Krups GVX2', micron: '36.25µ/click' },
      { name: 'Krups GVX1', micron: '36.25µ/click' },
    ],
    'Mahlkönig': [
      { name: 'Mahlkönig EK43 (0-16)', micron: '3.89µ/click' },
      { name: 'Mahlkönig EK43 (1-11)', micron: '6.23µ/click' },
      { name: 'Mahlkönig X54', micron: '9.74µ/click' },
      { name: 'Mahlkönig EK43 S', micron: '3.89µ/click' },
    ],
    'Mazzer': [
      { name: 'Mazzer ZM Plus', micron: '1µ/click' },
      { name: 'Mazzer ZM', micron: '1µ/click' },
    ],
    'Melitta': [
      { name: 'Melitta Molino', micron: '54.38µ/click' },
      { name: 'Melitta Calibra', micron: '28.06µ/click' },
    ],
    'MHW-3BOMBER': [
      { name: 'MHW-3BOMBER Race M1', micron: '17.29µ/click' },
      { name: 'MHW-3BOMBER Blade R3', micron: '5.64µ/click' },
    ],
    'MiiCoffee': [
      { name: 'MiiCoffee D40+', micron: '11.25µ/click' },
      { name: 'MiiCoffee DF64 (Gen 1)', micron: '11.67µ/click' },
      { name: 'MiiCoffee DF64 (Gen 2)', micron: '9.67µ/click' },
      { name: 'MiiCoffee DF54', micron: '8.78µ/click' },
    ],
    'Moccamaster': [
      { name: 'Moccamaster KM5', micron: '97.5µ/click' },
    ],
    'montwave': [
      { name: 'montwave GU2', micron: '50µ/click' },
    ],
    'Mueller': [
      { name: 'Mueller Ultra-Grind', micron: '14.03µ/click' },
    ],
    'Option-O': [
      { name: 'Option-O Lagom Casa', micron: '4.75µ/click' },
      { name: 'Option-O Lagom Mini (Obsidian burrs)', micron: '7.07µ/click' },
      { name: 'Option-O Lagom Mini (Moonshine burrs)', micron: '10µ/click' },
      { name: 'Option-O Lagom P64', micron: '10µ/click' },
    ],
    'Orphan Espresso': [
      { name: 'Orphan Espresso Lido OG', micron: '5µ/click' },
    ],
    'Porlex': [
      { name: 'Porlex Tall', micron: '116.67µ/click' },
      { name: 'Porlex Mini II', micron: '58.33µ/click' },
      { name: 'Porlex Tall II', micron: '58.33µ/click' },
      { name: 'Porlex Mini', micron: '116.67µ/click' },
    ],
    'Precision': [
      { name: 'Precision GS30', micron: '83.57µ/click' },
    ],
    'Rancilio': [
      { name: 'Rancilio Rocky SD', micron: '16.64µ/click' },
      { name: 'Rancilio Rocky', micron: '16.64µ/click' },
    ],
    'ROK': [
      { name: 'ROK GrinderGC', micron: '33.96µ/click' },
    ],
    'Saint Anthony Industries': [
      { name: 'Saint Anthony Industries Millwright Hand Grinder', micron: '14.29µ/click' },
    ],
    'Starseeker': [
      { name: 'Starseeker E55', micron: '4.75µ/click' },
    ],
    'Timemore': [
      { name: 'Timemore G1 Plus', micron: '36.43µ/click' },
      { name: 'Timemore S3', micron: '8.67µ/click' },
      { name: 'Timemore C3 ESP Pro', micron: '11.21µ/click' },
      { name: 'Timemore C3 Max Pro', micron: '38µ/click' },
      { name: 'Timemore C3 Max', micron: '38µ/click' },
      { name: 'Timemore C2 + Silver Clix', micron: '12.67µ/click' },
      { name: 'Timemore C2', micron: '31.67µ/click' },
      { name: 'Timemore Sculptor 078S', micron: '5.56µ/click' },
      { name: 'Timemore Sculptor 078', micron: '25µ/click' },
      { name: 'Timemore Nano', micron: '27.5µ/click' },
      { name: 'Timemore Slim', micron: '31.67µ/click' },
      { name: 'Timemore C3S Pro', micron: '38µ/click' },
      { name: 'Timemore C3S', micron: '38µ/click' },
      { name: 'Timemore C3 + Silver Clix', micron: '15.32µ/click' },
      { name: 'Timemore C3', micron: '38µ/click' },
      { name: 'Timemore G1', micron: '36.43µ/click' },
      { name: 'Timemore C2 Max Pro', micron: '31.67µ/click' },
      { name: 'Timemore C2 Fold', micron: '31.67µ/click' },
      { name: 'Timemore C2 Max', micron: '31.67µ/click' },
      { name: 'Timemore C3 Pro', micron: '38µ/click' },
      { name: 'Timemore C3 ESP', micron: '11.21µ/click' },
      { name: 'Timemore Chestnut X', micron: '7.5µ/click' },
      { name: 'Timemore Sculptor 064', micron: '27.81µ/click' },
      { name: 'Timemore Sculptor 064S', micron: '5µ/click' },
      { name: 'Timemore C5 Pro', micron: '19.79µ/click' },
      { name: 'Timemore C5 ESP Pro', micron: '8.33µ/click' },
      { name: 'Timemore Millab E01', micron: '11.21µ/click' },
    ],
    'Turin': [
      { name: 'Turin DF64 (Gen 1)', micron: '11.67µ/click' },
      { name: 'Turin DF64 (Gen 2)', micron: '9.67µ/click' },
      { name: 'Turin DF54', micron: '8.78µ/click' },
      { name: 'Turin SD40 V2', micron: '10µ/click' },
      { name: 'Turin SD40 V1', micron: '10µ/click' },
      { name: 'Turin DF83', micron: '9.33µ/click' },
      { name: 'Turin DF83V', micron: '11.33µ/click' },
    ],
    'Varia': [
      { name: 'Varia VS3 (Gen 1)', micron: '6.28µ/click' },
      { name: 'Varia Hand grinder', micron: '16.87µ/click' },
      { name: 'Varia VS3 (Gen 2)', micron: '6.28µ/click' },
      { name: 'Varia Evo Hybrid', micron: '4.86µ/click' },
    ],
    'Vevok Chef': [
      { name: 'Vevok Chef 06 Slim', micron: '174µ/click' },
      { name: 'Vevok Chef 06', micron: '174µ/click' },
    ],
    'VSSL': [
      { name: 'VSSL JAVA', micron: '20.92µ/click' },
    ],
    'Wacaco': [
      { name: 'Wacaco Exagrind', micron: '13.33µ/click' },
    ],
    'Weber Workshops': [
      { name: 'Weber Workshops EG-1', micron: '5µ/click' },
      { name: 'Weber Workshops KEY Mk1', micron: '4.18µ/click' },
    ],
    'Wilfa': [
      { name: 'Wilfa Uniform', micron: '19.75µ/click' },
    ],
    'Zwilling': [
      { name: 'Zwilling Enfinigy Coffee Grinder', micron: '5.87µ/click' },
    ],
  };

  const filteredGrinders = Object.entries(grinderData).reduce((acc, [brand, models]) => {
    const filteredModels = models.filter(model => 
      model.name.toLowerCase().includes(grinderSearchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(grinderSearchTerm.toLowerCase())
    );
    if (filteredModels.length > 0) {
      acc[brand] = filteredModels;
    }
    return acc;
  }, {} as Record<string, { name: string, micron: string }[]>);

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
    setGrinderToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteGrinder = () => {
    if (grinderToDelete) {
      setGrinders((prevGrinders) => prevGrinders.filter((g) => g.id !== grinderToDelete));
      setShowDeleteModal(false);
      setGrinderToDelete(null);
    }
  };

  const cancelDeleteGrinder = () => {
    setShowDeleteModal(false);
    setGrinderToDelete(null);
  };

  const setMainGrinder = (id: string) => {
    setGrinders((prevGrinders) =>
      prevGrinders.map((g) =>
        g.id === id ? { ...g, isMain: true } : { ...g, isMain: false }
      )
    );
  };



  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${isDarkMode ? 'text-[#fafafa]' : 'text-gray-900'} p-4 pb-24`}>
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

        <div className="flex items-center gap-2 relative">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 ${currentView === 'profile' || showUserDropdown ? 'border-cyan-500' : 'border-transparent'} transition-all`}
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
                  <div className="p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm truncate">Jefferson Júnior</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        Conectado
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setCurrentView('profile');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                    >
                      <User className="w-4 h-4" />
                      Perfil
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentView('history');
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}
                    >
                      <History className="w-4 h-4" />
                      Histórico de Extrações
                    </button>
                  </div>

                  <div className={`p-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button 
                      onClick={() => {
                        setIsLoggedIn(false);
                        setShowUserDropdown(false);
                      }}
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
              onClick={() => setIsLoggedIn(true)} // Simulação de login
              className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-cyan-600'} transition-colors`}
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {currentView === 'explore' && (
          <div className="space-y-8">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coffeeMethods.map((method) => {
                  const content = (
                    <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6 relative h-full transition-all hover:scale-[1.02]`}>
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Em breve</span>
                      </div>
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
                  );

                  if (method.id === 'v60') {
                    return (
                      <Link key={method.id} href="/v60">
                        {content}
                      </Link>
                    );
                  }

                  return <div key={method.id}>{content}</div>;
                })}
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
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent">
                  <Image 
                    src="/avatar.png" 
                    alt="User Avatar" 
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold">Perfil</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6`}>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  {userEmail}
                </div>
              </div>

              <div className={`${isDarkMode ? 'glass-card' : 'bg-white shadow-lg'} rounded-xl p-6`}>
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
                  <div className="text-center py-4">
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

              <button 
                onClick={() => setIsLoggedIn(false)}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} font-medium transition-colors`}
              >
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
                  {Object.entries(filteredGrinders).map(([brand, models]) => (
                    <div key={brand}>
                      <h4 className="font-medium text-sm mb-2 text-gray-500">{brand}</h4>
                      <div className="space-y-1">
                        {models.map((model) => (
                          <button 
                            key={model.name}
                            onClick={() => addGrinder(model.name)} 
                            className={`w-full p-2 rounded-lg flex justify-between ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-sm`}
                          >
                            <span className="font-bold">{model.name}</span>
                            <span className="text-xs opacity-75">{model.micron}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(filteredGrinders).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum moedor encontrado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-sm mx-4`}>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'} flex items-center justify-center`}>
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">Confirmar Exclusão</h3>
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Tem certeza que deseja excluir este moedor? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteGrinder}
                  className={`flex-1 py-2 px-4 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteGrinder}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      </div>
  );
}
