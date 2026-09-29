import React from 'react';
import { useOJTStore } from './store/useOJTStore.js';
import { AuthPage } from './components/auth/AuthPage.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { StudentDashboard } from './components/student/StudentDashboard.jsx';
import { PartnerDashboard } from './components/partner/PartnerDashboard.jsx';
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';

export default function App() {
  const { currentUser, currentRole } = useOJTStore();

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentRole === 'Student' && <StudentDashboard />}
        {currentRole === 'IndustryPartner' && <PartnerDashboard />}
        {currentRole === 'Coordinator' && <CoordinatorDashboard />}
        {currentRole === 'Admin' && <AdminDashboard />}
      </main>

      {/* Production Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">OJTern</span>
            <span className="text-slate-300">•</span>
            <span>On-the-Job Training & Internship Management Portal</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 Office of Career Services & Industry Linkages. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
