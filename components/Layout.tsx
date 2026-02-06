import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full m-1 opacity-20 blur-sm"></div>
                <img 
                    src="/bacong-logo.png" 
                    alt="Bacong District Logo" 
                    className="h-14 w-14 rounded-full bg-white p-0.5 shadow-md relative z-10"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="h-14 w-14 rounded-full bg-white flex items-center justify-center text-blue-900 font-bold border-2 border-yellow-400">BD</div>';
                    }}
                />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Bacong District</h1>
              <p className="text-xs text-yellow-400 font-medium tracking-wide">Division of Negros Oriental</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:block text-right text-sm text-blue-100 mr-2">
                <p className="font-semibold text-white">MEA System</p>
                <p className="opacity-75 text-xs">SY 2025-2026</p>
             </div>
             <button 
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm transition-all border border-blue-700 shadow-sm hover:shadow group"
                title="Sign Out"
             >
                <LogOut className="w-4 h-4 mr-2 group-hover:text-yellow-400 transition-colors" />
                Sign Out
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-slate-200">MEA Generator for Bacong District Teachers</span>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-slate-600">
            <p>© {new Date().getFullYear()} All Rights Reserved. Data Privacy Notice: Data is stored securely in the cloud.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;