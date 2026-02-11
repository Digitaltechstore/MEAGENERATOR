import React from 'react';
import { ShieldCheck, ArrowRight, LayoutDashboard, FileBarChart } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  // Official Bacong District Seal (Public Raw Link)
  const LOGO_URL = "https://raw.githubusercontent.com/Digitaltechstore/MEAGENERATOR/main/SEF%20FUNDED%20(6).png";

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <img 
                src={LOGO_URL}
                alt="Bacong District Logo" 
                className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold text-gray-900 tracking-tight uppercase">BACONG DISTRICT</span>
          </div>
          <button 
            onClick={onLogin}
            className="px-6 py-2 rounded-full text-sm font-semibold text-blue-900 border border-blue-900 hover:bg-blue-50 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-1.5 text-xs font-bold text-yellow-800 mb-8 uppercase tracking-wide">
            DepEd Division of Negros Oriental
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
            Monitoring, Evaluation, and <br/>
            <span className="text-blue-900">Adjustment</span>
          </h1>
          
          <p className="text-lg leading-8 text-gray-500 mb-10 max-w-2xl mx-auto">
            The official centralized reporting tool for Bacong District. Streamline your MEA reports with our secure, school-agnostic digital platform.
          </p>
          
          <div className="flex items-center justify-center">
            <button
              onClick={onLogin}
              className="rounded-lg bg-blue-900 px-8 py-3.5 text-base font-bold text-white shadow-lg hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 flex items-center transition-all hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4 text-yellow-400" />
            </button>
          </div>

          {/* Feature Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <LayoutDashboard className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">District-Wide System</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Unified reporting for all levels: Kinder, SPED, Elementary, High School, and ALS.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="bg-yellow-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FileBarChart className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Automated Consolidation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                School Heads can instantly generate aggregated MEA slides and analytics.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Secure & Compliant</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Data integrity ensured with cloud storage, accessible only by authorized personnel.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} Bacong District. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;