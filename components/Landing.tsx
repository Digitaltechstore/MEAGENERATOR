import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  LayoutDashboard, 
  FileBarChart, 
  UserPlus, 
  MousePointerClick, 
  FileText, 
  Lock,
  Download
} from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const LOGO_URL = "https://raw.githubusercontent.com/Digitaltechstore/MEAGENERATOR/main/SEF%20FUNDED%20(6).png";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header - Now Dark Navy Blue */}
      <header className="bg-blue-950 text-white sticky top-0 z-50 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-sm border border-white/20">
                <img 
                    src={LOGO_URL}
                    alt="Bacong District Logo" 
                    className="h-8 w-8 object-contain"
                />
             </div>
            <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight uppercase leading-none">Bacong District</span>
                <span className="text-[10px] text-blue-200 font-medium tracking-wider uppercase mt-0.5">Division of Negros Oriental</span>
            </div>
          </div>
          <button 
            onClick={onLogin}
            className="px-5 py-2 rounded-full text-xs font-bold text-blue-950 bg-white hover:bg-yellow-400 transition-all shadow-md transform hover:-translate-y-0.5"
          >
            SIGN IN
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        {/* Hero Area */}
        <div className="relative bg-white overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-yellow-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 flex flex-col items-center text-center">
                <div className="mb-8 animate-fade-in relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                    <img 
                        src={LOGO_URL}
                        alt="Bacong District Logo" 
                        className="h-44 w-44 object-contain drop-shadow-2xl relative z-10 transform transition-transform duration-700 hover:scale-105"
                    />
                </div>

                <div className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-bold text-blue-800 mb-8 uppercase tracking-wide shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Official MEA System • SY 2025-2026
                </div>
                
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-6 leading-tight max-w-4xl">
                    Monitoring, Evaluation, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Adjustment</span>
                </h1>
                
                <p className="text-xl leading-8 text-gray-500 mb-10 max-w-2xl mx-auto font-light">
                    A centralized, secure, and automated reporting tool designed exclusively for the educators and administrators of Bacong District.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
                    <button
                    onClick={onLogin}
                    className="w-full sm:w-auto rounded-xl bg-blue-950 px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-blue-900 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-950 flex items-center justify-center transition-all hover:-translate-y-1"
                    >
                    Access Dashboard <ArrowRight className="ml-2 h-5 w-5 text-yellow-400" />
                    </button>
                    <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-colors flex items-center justify-center">
                        Learn how it works
                    </a>
                </div>
            </div>
        </div>

        {/* Steps Section */}
        <div id="how-it-works" className="bg-slate-50 py-24 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Streamlined Reporting Process</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Follow these simple steps to submit your Monthly Learners' Movement and Failure reports.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative mb-20">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>

                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                            <UserPlus className="h-10 w-10 text-blue-600" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-950 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">1</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Sign In</h3>
                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                            Create an account or log in using your email. We use a secure magic link or password system.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                            <MousePointerClick className="h-10 w-10 text-yellow-500" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-950 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">2</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Select Role</h3>
                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                            Choose your department (Kinder, Elem, JHS, SHS, ALS) or School Head dashboard.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                            <FileText className="h-10 w-10 text-green-500" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-950 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">3</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Enter Data</h3>
                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                            Input enrollment figures and failure counts. The system auto-saves your draft.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                            <Download className="h-10 w-10 text-purple-500" />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-950 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">4</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Report</h3>
                        <p className="text-sm text-gray-500 leading-relaxed px-4">
                            School Heads export the consolidated PPTX slides instantly.
                        </p>
                    </div>
                </div>

                {/* Important Notice Box */}
                <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-8 sm:p-12 relative overflow-hidden text-center sm:text-left shadow-2xl">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-yellow-400 opacity-10 rounded-full"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <Lock className="h-12 w-12 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">Restricted Access Control</h3>
                            <p className="text-blue-100 leading-relaxed max-w-2xl text-base">
                                Data entry is open to all registered faculty. However, the <strong className="text-white">Report Generator</strong> feature is strictly protected by a secure passcode. Only the <span className="text-white font-bold underline decoration-yellow-400 decoration-2 underline-offset-4">MEA Coordinator and School Head</span> possess this key to ensure data integrity and authorized release.
                            </p>
                        </div>
                        <button onClick={onLogin} className="whitespace-nowrap bg-white text-blue-950 px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-lg">
                            Login Now
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white py-24">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     <div className="flex flex-col items-start p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                        <div className="bg-blue-100 p-3 rounded-lg mb-4">
                            <LayoutDashboard className="h-6 w-6 text-blue-700" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">District-Wide Standardization</h4>
                        <p className="text-gray-500 leading-relaxed">
                            Unified reporting templates for Kinder, SPED, Elementary, High School, and ALS ensure consistency across all Bacong schools.
                        </p>
                     </div>
                     <div className="flex flex-col items-start p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
                            <FileBarChart className="h-6 w-6 text-yellow-700" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Real-time Consolidation</h4>
                        <p className="text-gray-500 leading-relaxed">
                            Eliminate manual collation. Submitted data is instantly aggregated, allowing School Heads to view trends immediately.
                        </p>
                     </div>
                     <div className="flex flex-col items-start p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                        <div className="bg-green-100 p-3 rounded-lg mb-4">
                            <ShieldCheck className="h-6 w-6 text-green-700" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Secure Cloud Storage</h4>
                        <p className="text-gray-500 leading-relaxed">
                            Your data is encrypted and stored in the cloud, compliant with data privacy standards and accessible 24/7.
                        </p>
                     </div>
                </div>
             </div>
        </div>
      </main>

      {/* Footer - Now Dark */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                    <img src={LOGO_URL} alt="Logo" className="h-12 w-12 opacity-90" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white tracking-tight leading-none">BACONG DISTRICT</span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Division of Negros Oriental</span>
                    </div>
                </div>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                    Empowering educators with digital tools for efficient Monitoring, Evaluation, and Adjustment. Simplifying data, maximizing impact.
                </p>
             </div>
             
             <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={onLogin} className="hover:text-blue-400 transition-colors">Sign In</button></li>
                    <li><button onClick={onLogin} className="hover:text-blue-400 transition-colors">Register Account</button></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">User Manual</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Report Issues</a></li>
                </ul>
             </div>

             <div>
                <h4 className="text-white font-bold mb-4">Contact Support</h4>
                <p className="text-sm text-slate-400 mb-2">District Office, Bacong</p>
                <p className="text-sm text-slate-400">Negros Oriental, Philippines</p>
                <p className="text-sm text-slate-400 mt-2 hover:text-white transition-colors cursor-pointer">admin@bacongdistrict.gov.ph</p>
             </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Bacong District. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <span className="cursor-pointer hover:text-slate-300">Privacy Policy</span>
                <span className="cursor-pointer hover:text-slate-300">Terms of Service</span>
                <span className="cursor-pointer hover:text-slate-300">Data Privacy Notice</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;