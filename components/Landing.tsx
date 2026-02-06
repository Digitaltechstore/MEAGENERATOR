import React from 'react';
import { BarChart3, ShieldCheck, ArrowRight, LayoutDashboard, FileBarChart } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <img 
                src="/bacong-logo.png" 
                alt="Logo" 
                className="h-10 w-10"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-xs border border-yellow-400">BD</div><span class="text-xl font-bold text-gray-900 tracking-tight ml-3">BACONG DISTRICT</span>';
                }}
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight">BACONG DISTRICT</span>
          </div>
          <button 
            onClick={onLogin}
            className="px-5 py-2 rounded-full text-sm font-semibold text-blue-900 border border-blue-900 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 mb-8 border border-yellow-200 shadow-sm">
            DepEd Division of Negros Oriental
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
            Monitoring, Evaluation, and <span className="text-blue-900">Adjustment</span>
          </h1>
          <p className="text-lg leading-8 text-gray-600 mb-10 max-w-2xl mx-auto">
            The official centralized reporting tool for Bacong District. Streamline your MEA reports with our secure, school-agnostic digital platform.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <button
              onClick={onLogin}
              className="rounded-xl bg-blue-900 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 flex items-center transition-all hover:scale-105 hover:shadow-xl border-b-4 border-blue-950"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5 text-yellow-400" />
            </button>
          </div>

          {/* Feature Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <LayoutDashboard className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">District-Wide System</h3>
              <p className="text-sm text-gray-500">Unified reporting for all levels: Kinder, SPED, Elementary, High School, and ALS.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-200 transition-colors group">
              <div className="bg-yellow-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                <FileBarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Automated Consolidation</h3>
              <p className="text-sm text-gray-500">School Heads can instantly generate aggregated MEA slides and analytics.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <ShieldCheck className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Compliant</h3>
              <p className="text-sm text-gray-500">Data integrity ensured with cloud storage, accessible only by authorized personnel.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Bacong District. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;