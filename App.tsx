import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { supabase, checkConnection } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Home from './components/Home';
import DynamicForm from './components/DynamicForm';
import Auth from './components/Auth';
import Landing from './components/Landing';
import ReportsDashboard from './components/ReportsDashboard';
import { EducationLevel } from './types';
import { Loader2, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    const initApp = async () => {
        // 1. Check Connection first
        const conn = await checkConnection();
        if (!conn.success) {
            setConnectionError("Cannot reach Supabase database. Please check your internet connection.");
            setLoading(false);
            return;
        }

        // 2. Check Session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Session check failed:", err);
                // Don't block app on session error, just force login
                setLoading(false); 
            });
    };

    initApp();

    // Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setShowAuth(false);
        setShowReports(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleBack = () => {
    setSelectedLevel(null);
    setShowReports(false);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Connecting to System...</p>
            </div>
        </div>
    );
  }

  if (connectionError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WifiOff className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h2>
                <p className="text-sm text-gray-600 mb-6">{connectionError}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        </div>
      );
  }

  if (!session) {
    if (showAuth) {
      return <Auth onBack={() => setShowAuth(false)} />;
    }
    return <Landing onLogin={() => setShowAuth(true)} />;
  }

  return (
    <HashRouter>
      <Layout>
        {showReports ? (
            <ReportsDashboard onBack={handleBack} />
        ) : selectedLevel ? (
          <DynamicForm levelId={selectedLevel} onBack={handleBack} />
        ) : (
          <Home 
            onSelectLevel={setSelectedLevel} 
            onOpenReports={() => setShowReports(true)}
          />
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;