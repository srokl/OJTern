import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  AlertTriangle,
  BarChart3,
  Calendar,
  Search,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import confetti from 'canvas-confetti';
import { useOJTStore } from '../../store/useOJTStore.js';
import { DocumentViewer } from '../common/DocumentViewer.jsx';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const CoordinatorDashboard = () => {
  const {
    currentUser,
    currentRole,
    applications,
    updateApplicationStatusByCoordinator,
    generatePlacementReportData,
  } = useOJTStore();

  const [activeTab, setActiveTab] = useState('queue');

  // Queue state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');

  // Pending applications for coordinator review
  const pendingApps = applications.filter((a) => a.status === 'Pending');

  // Selected application for side-by-side inspection
  const [selectedApp, setSelectedApp] = useState(
    pendingApps.length > 0 ? pendingApps[0] : null
  );

  // Approval / Return / Reject Confirmation Modal State
  const [actionModal, setActionModal] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [permissionError, setPermissionError] = useState(null);

  // Reports state (FR-12)
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const reportData = generatePlacementReportData(selectedMonth);

  // Filtered queue
  const filteredQueue = pendingApps.filter((app) => {
    const matchesSearch =
      app.studentProfile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentProfile.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.postingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProg =
      filterProgram === 'All' || app.studentProfile.academicProgram === filterProgram;
    return matchesSearch && matchesProg;
  });

  // Handle Decision Submit (Enforcing BR-01 and BR-02)
  const handleConfirmDecision = () => {
    if (!actionModal) return;

    setPermissionError(null);

    // BR-02 Check in UI
    if (currentRole !== 'Coordinator') {
      setPermissionError(
        'BR-02 Authorization Error: Only a user with the OJT coordinator role may change an application status.'
      );
      return;
    }

    // BR-01 Check: Cannot approve if endorsement document is missing or corrupted
    if (
      actionModal.type === 'Approved' &&
      (!actionModal.app.endorsementDocument ||
        !actionModal.app.endorsementDocument.fileName ||
        actionModal.app.endorsementDocument.isCorrupted)
    ) {
      setPermissionError(
        'BR-01 Business Rule Violation: An application cannot be marked Approved if the required endorsement document is missing or corrupted.'
      );
      return;
    }

    try {
      updateApplicationStatusByCoordinator({
        applicationId: actionModal.app._id,
        newStatus: actionModal.type,
        coordinatorRemarks: remarksInput,
      });

      if (actionModal.type === 'Approved') {
        confetti({ particleCount: 70, spread: 60 });
      }

      setActionModal(null);
      setRemarksInput('');

      // Auto select next in queue
      const remaining = pendingApps.filter((a) => a._id !== actionModal.app._id);
      setSelectedApp(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      setPermissionError(err.message || 'Operation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">OJT Coordinator Gatekeeper</h1>
                <span className="bg-purple-500/20 text-purple-200 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-400/30">
                  Document Verification & RBAC
                </span>
              </div>
              <p className="text-purple-200 text-xs mt-1">
                {currentUser.name} • College of Information and Computing Sciences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono-tabular text-amber-300">
                {pendingApps.length}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-bold">Pending Review</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono-tabular text-emerald-300">
                {reportData.totalPlacements}
              </div>
              <div className="text-[10px] text-purple-200 uppercase font-bold">Total Placed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'queue'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Application Review Queue (Pending)</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pendingApps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'reports'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Placement Reports (FR-12)</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
          <span>BR-02 Enforced: Role-based approval authority restricted to Coordinator</span>
        </div>
      </div>

      {/* --- TAB 1: REVIEW QUEUE (FR-07, FR-08, BR-01, BR-02) --- */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <h3 className="font-bold text-slate-800 text-sm">Review Queue Empty!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All submitted student applications have been reviewed and verified. Any new applications submitted by students will automatically queue here.
              </p>
            </div>
          ) : (
            /* Side-by-Side Document Preview & Queue Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane: Review Queue Table */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Pending Approvals
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {pendingApps.length} in queue
                    </span>
                  </div>

                  {/* Filter & Search */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search student or ID..."
                        className="w-full text-xs pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <select
                      value={filterProgram}
                      onChange={(e) => setFilterProgram(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      <option value="All">All Programs</option>
                      <option value="BSIT">BSIT</option>
                      <option value="BSCS">BSCS</option>
                      <option value="BSCpE">BSCpE</option>
                    </select>
                  </div>
                </div>

                {/* Queue List */}
                <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                  {filteredQueue.map((app) => {
                    const isSelected = selectedApp?._id === app._id;
                    const hasDoc = Boolean(app.endorsementDocument?.fileName);

                    return (
                      <button
                        key={app._id}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50/70 border-l-4 border-l-purple-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {app.studentProfile.fullName}
                            </span>
                            <span className="font-mono-tabular text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                              {app.studentProfile.studentIdNumber}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate">
                            {app.postingTitle} • <strong className="text-slate-700">{app.companyName}</strong>
                          </p>

                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="font-mono-tabular text-slate-400">
                              Date: {new Date(app.submissionDate).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-medium flex items-center gap-1 ${
                                hasDoc
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              {hasDoc ? 'Endorsement Attached' : 'Missing Doc'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {app.matchScore}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Embedded Side-by-Side Review & Document Viewer */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                {selectedApp ? (
                  <>
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">
                            {selectedApp.studentProfile.fullName}
                          </h3>
                          <span className="font-mono-tabular text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {selectedApp.studentProfile.studentIdNumber}
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold border border-purple-200">
                            {selectedApp.studentProfile.academicProgram}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applying for: <strong>{selectedApp.postingTitle}</strong> at{' '}
                          <strong>{selectedApp.companyName}</strong>
                        </p>
                      </div>

                      {/* Approval Controls (Approve, Return, Reject) */}
                      <div className="flex items-center gap-2">
                        {/* Return for Correction */}
                        <button
                          onClick={() =>
                            setActionModal({
                              app: selectedApp,
                              type: 'Returned for Correction',
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1 transition-colors"
                          title="Return application back to student for revisions"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() =>
                            setActionModal({
                              app: selectedApp,
                              type: 'Rejected',
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Approve: Disabled if Endorsement Document is missing (BR-01) */}
                        <button
                          disabled={
                            !selectedApp.endorsementDocument ||
                            !selectedApp.endorsementDocument.fileName ||
                            selectedApp.endorsementDocument.isCorrupted
                          }
                          onClick={() =>
                            setActionModal({
                              app: selectedApp,
                              type: 'Approved',
                            })
                          }
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all ${
                            !selectedApp.endorsementDocument ||
                            !selectedApp.endorsementDocument.fileName ||
                            selectedApp.endorsementDocument.isCorrupted
                              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          }`}
                          title={
                            !selectedApp.endorsementDocument?.fileName
                              ? 'Disabled: BR-01 requires an endorsement document before approval'
                              : 'Approve student and forward to partner'
                          }
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Forward</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Alignment Table using Monospaced Fonts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Submission Date
                        </span>
                        <span className="font-mono-tabular text-slate-800 font-semibold">
                          {new Date(selectedApp.submissionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Match Score (C-03)
                        </span>
                        <span className="font-mono-tabular text-purple-700 font-bold">
                          {selectedApp.matchScore}% Ranked
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Target Hours
                        </span>
                        <span className="font-mono-tabular text-slate-800">
                          {selectedApp.studentProfile.requiredHours} hrs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Document Status
                        </span>
                        <span className="font-mono-tabular text-emerald-600 font-bold">
                          BR-01 Attached
                        </span>
                      </div>
                    </div>

                    {/* Side-by-Side Embedded Document Viewer */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span>Side-by-Side Endorsement Document Inspection (BR-01)</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono-tabular">
                          Uploaded: {new Date(selectedApp.endorsementDocument.uploadDate).toLocaleDateString()}
                        </span>
                      </div>

                      <DocumentViewer
                        document={selectedApp.endorsementDocument}
                        studentName={selectedApp.studentProfile.fullName}
                        program={selectedApp.studentProfile.academicProgram}
                        isCompact={true}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Select an application from the queue to start side-by-side review.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: PLACEMENT REPORTS (FR-12) --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Institutional Placement Aggregation Report (FR-12)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregates official placements grouped by partner company and academic program for the selected reporting period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-semibold text-slate-700">Reporting Period:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="August 2026">August 2026 (Active Semester)</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
              </select>
            </div>
          </div>

          {/* Aggregate KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Placed Interns
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono-tabular mt-1">
                {reportData.totalPlacements}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">✓ Official Partner Placements</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Partner Companies with Placements
              </span>
              <div className="text-3xl font-extrabold text-blue-600 font-mono-tabular mt-1">
                {reportData.byCompany.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active hosting enterprises</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Participating Academic Programs
              </span>
              <div className="text-3xl font-extrabold text-purple-600 font-mono-tabular mt-1">
                {reportData.byProgram.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">BSIT, BSCS, BSCpE</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Company Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Placements Grouped by Company (FR-12)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.byCompany}>
                    <XAxis dataKey="companyName" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Placements" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Program Pie Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Placements Grouped by Academic Program (FR-12)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.byProgram}
                      dataKey="count"
                      nameKey="program"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.program}: ${entry.count}`}
                    >
                      {reportData.byProgram.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Formatted Placement Records Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Official Placement Log Table ({selectedMonth})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Placed Company</th>
                    <th className="p-3">Position Title</th>
                    <th className="p-3">Decision Date</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.detailedList.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-semibold text-slate-900">
                        {record.studentProfile.fullName}
                      </td>
                      <td className="p-3 font-mono-tabular text-slate-600">
                        {record.studentProfile.studentIdNumber}
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold">
                          {record.studentProfile.academicProgram}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{record.companyName}</td>
                      <td className="p-3 text-slate-600">{record.postingTitle}</td>
                      <td className="p-3 font-mono-tabular text-slate-500">
                        {record.partnerDecisionDate
                          ? new Date(record.partnerDecisionDate).toLocaleDateString()
                          : 'Recent'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                          Placed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL FOR COORDINATOR DECISION --- */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base">
              {actionModal.type === 'Approved'
                ? 'Approve Application & Forward to Partner'
                : actionModal.type === 'Returned for Correction'
                ? 'Return Application for Student Correction'
                : 'Reject Student Application'}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Applicant: <strong>{actionModal.app.studentProfile.fullName}</strong> (
              {actionModal.app.studentProfile.academicProgram}) for{' '}
              <strong>{actionModal.app.companyName}</strong>
            </p>

            <div className="my-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Official Coordinator Remarks / Instructions:
              </label>
              <textarea
                rows={3}
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                placeholder={
                  actionModal.type === 'Approved'
                    ? 'All academic prerequisites verified. Endorsement letter complete.'
                    : actionModal.type === 'Returned for Correction'
                    ? 'Please re-upload endorsement document with official registrar seal.'
                    : 'Prerequisite credit requirements have not been completed.'
                }
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {permissionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{permissionError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setActionModal(null);
                  setPermissionError(null);
                }}
                className="text-xs text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm transition-all ${
                  actionModal.type === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionModal.type === 'Returned for Correction'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionModal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
