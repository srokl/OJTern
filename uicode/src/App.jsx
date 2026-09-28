import React, { useState } from 'react';
import { useOJTStore } from './store/useOJTStore.js';
import { Navbar } from './components/common/Navbar.jsx';
import { StudentDashboard } from './components/student/StudentDashboard.jsx';
import { PartnerDashboard } from './components/partner/PartnerDashboard.jsx';
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';
import { TraceabilityMatrix } from './components/traceability/TraceabilityMatrix.jsx';
import { MongoDbViewer } from './components/common/MongoDbViewer.jsx';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  UserCheck,
  TableProperties,
} from 'lucide-react';

export default function App() {
  const { currentRole, switchRole } = useOJTStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Main Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'traceability' && <TraceabilityMatrix />}
        {activeTab === 'mongodb' && <MongoDbViewer />}
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'Student' && <StudentDashboard />}
            {currentRole === 'IndustryPartner' && <PartnerDashboard />}
            {currentRole === 'Coordinator' && <CoordinatorDashboard />}
            {currentRole === 'Admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Persistent Quick Stakeholder Switcher Floating Bar */}
      <aside aria-label="Stakeholder Quick Switcher" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 text-xs">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline mr-1">
          Quick Role:
        </span>

        <button
          onClick={() => {
            switchRole('Student');
            setActiveTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
            currentRole === 'Student' && activeTab === 'dashboard'
              ? 'bg-blue-600 text-white font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>

        <button
          onClick={() => {
            switchRole('IndustryPartner');
            setActiveTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
            currentRole === 'IndustryPartner' && activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Partner</span>
        </button>

        <button
          onClick={() => {
            switchRole('Coordinator');
            setActiveTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
            currentRole === 'Coordinator' && activeTab === 'dashboard'
              ? 'bg-purple-600 text-white font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Coordinator</span>
        </button>

        <button
          onClick={() => {
            switchRole('Admin');
            setActiveTab('dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
            currentRole === 'Admin' && activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block" />

        <button
          onClick={() => setActiveTab('traceability')}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            activeTab === 'traceability'
              ? 'bg-indigo-700 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TableProperties className="w-3 h-3" />
          <span>Traceability</span>
        </button>
      </aside>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">OJTern</span>
            <span>• Team DUTERTECH (BSIT Software Engineering)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Instructor: Mohamed Mogib Elkordy • Database: MongoDB Atlas (Cluster0)
          </div>
        </div>
      </footer>
    </div>
  );
}
