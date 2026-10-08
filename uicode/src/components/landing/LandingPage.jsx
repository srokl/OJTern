import React, { useState } from 'react';
import { AuthPage } from '../auth/AuthPage';
import { 
  Briefcase, 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Globe2,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">OJTern</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAuth(true)}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Gen OJT Platform</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 mb-6 max-w-4xl">
          Bridge the Gap Between <br className="hidden sm:block" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Campus and Career</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Seamlessly connect students, university coordinators, and industry partners in one unified internship management ecosystem.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setShowAuth(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
          >
            Join as Student <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowAuth(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Partner with us <Building2 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats or Features Micro */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <FeatureCard 
            icon={<GraduationCap className="w-6 h-6 text-blue-400" />}
            title="For Students"
            desc="Find the perfect internship that matches your skills and track your OJT hours effortlessly."
          />
          <FeatureCard 
            icon={<Building2 className="w-6 h-6 text-indigo-400" />}
            title="For Partners"
            desc="Discover top university talent and manage applications through a streamlined dashboard."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
            title="For Coordinators"
            desc="Monitor student progress, verify endorsements, and generate comprehensive placement reports."
          />
        </div>

        {/* Product Explanation Section */}
        <div className="mt-32 w-full max-w-4xl text-left bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white">What is OJTern?</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            OJTern is a centralized On-the-Job Training (OJT) and internship platform built specifically to eliminate the friction between university programs and industry demands.
          </p>
          <ul className="space-y-4 text-slate-400">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Automated Matching:</strong> Intelligent skill-based recommendations pair the right students with the right company roles.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Unified Workflow:</strong> From endorsement validation to final evaluations, everything is tracked transparently in real-time.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Compliance First:</strong> Designed with university guidelines in mind, ensuring all internships meet academic requirements and hours.</span>
            </li>
          </ul>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>© 2026 OJTern Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm flex flex-col items-start hover:border-slate-700 hover:bg-slate-800/40 transition-all group">
    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);
