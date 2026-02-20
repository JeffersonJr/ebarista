'use client';

import { Coffee, History, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t z-50 bg-gray-50 dark:bg-[#09090b] border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center p-2 rounded-lg ${
              pathname === '/' ? 'text-cyan-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span className="text-xs mt-1">Explorar</span>
          </Link>
          <Link 
            href="/?view=history" 
            className={`flex flex-col items-center p-2 rounded-lg ${
              pathname === '/' && currentView === 'history'
                ? 'text-cyan-500' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-xs mt-1">Histórico</span>
          </Link>
          <Link 
            href="/?view=profile" 
            className={`flex flex-col items-center p-2 rounded-lg ${
              pathname === '/' && currentView === 'profile'
                ? 'text-cyan-500' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
