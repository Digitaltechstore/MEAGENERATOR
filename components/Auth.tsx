import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Official Bacong District Seal (Public Raw Link)
  const LOGO_URL = "https://raw.githubusercontent.com/Digitaltechstore/MEAGENERATOR/main/SEF%20FUNDED%20(6).png";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Top Blue Background - Now Dark Navy Blue */}
      <div className="w-full h-[35vh] min-h-[250px] bg-blue-950 border-b-[6px] border-yellow-400 relative flex flex-col items-center justify-center pb-16">
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center text-white/80 hover:text-white transition-colors z-20 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center px-4 animate-fade-in z-10">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                Bacong District MEA
            </h2>
            <p className="text-blue-100 text-sm">
                {isLogin ? 'Sign in to access your dashboard' : 'Create an account to start reporting'}
            </p>
          </div>
      </div>

      {/* Main Content Area - Shifted up to overlap */}
      <div className="flex-grow flex flex-col items-center -mt-32 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Logo overlapping the line - made significantly bigger */}
        <div className="mb-6 filter drop-shadow-2xl">
            <img 
                src={LOGO_URL}
                alt="Logo" 
                className="h-64 w-64 object-contain"
            />
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10">
            <form className="space-y-5" onSubmit={handleAuth}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-blue-900 focus:border-blue-900 p-2.5 border"
                    placeholder="you@deped.gov.ph"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-lg focus:ring-blue-900 focus:border-blue-900 p-2.5 border"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign in' : 'Sign up')}
              </button>
            </form>

            <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
                    className="w-full flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {isLogin ? 'Create new account' : 'Sign in to existing account'}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;