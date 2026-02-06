import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Home from './components/Home';
import DynamicForm from './components/DynamicForm';
import Auth from './components/Auth';
import Landing from './components/Landing';
import ReportsDashboard from './components/ReportsDashboard';
import { EducationLevel } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If we just logged out, don't immediately show auth, show landing
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
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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