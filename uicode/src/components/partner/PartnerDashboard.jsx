import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOJTStore } from '../../store/useOJTStore.js';
import { DocumentViewer } from '../common/DocumentViewer.jsx';

export const PartnerDashboard = () => {
  const {
    currentUser,
    companyProfiles,
    postings,
    getScreenedApplicantsForPartner,
    createPosting,
    decideOnApplicantByPartner,
  } = useOJTStore();

  const company =
    companyProfiles.find((c) => c.userId === currentUser._id) || companyProfiles[0];

  const [activeTab, setActiveTab] = useState('screened');

  // Hardcoded BR-03 query: Partner only sees Coordinator-Approved applicants!
  const screenedApplicants = getScreenedApplicantsForPartner(company._id);

  // Selected applicant for side-by-side split pane inspection
  const [selectedApp, setSelectedApp] = useState(
    screenedApplicants.length > 0 ? screenedApplicants[0] : null
  );

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');

  // Posting Form State (FR-03)
  const [postingForm, setPostingForm] = useState({
    title: '',
    department: '',
    slots: 3,
    requiredProgram: 'BSIT',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
    location: company.location || 'Davao City',
    isRemote: false,
    stipend: '₱7,000 / month allowance',
    description: '',
    responsibilities: [
      'Contribute to production-grade software features',
      'Participate in agile sprint ceremonies and code reviews',
    ],
  });
  const [skillInput, setSkillInput] = useState('');
  const [postingSuccessToast, setPostingSuccessToast] = useState(false);

  // Filter screened applicants for this company's postings
  const companyPostings = postings.filter((p) => p.companyId === company._id);

  // Add skill tag in Posting Form
  const handleAddSkill = (e) => {
    if (e.key && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !postingForm.requiredSkills.includes(trimmed)) {
      setPostingForm({
        ...postingForm,
        requiredSkills: [...postingForm.requiredSkills, trimmed],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setPostingForm({
      ...postingForm,
      requiredSkills: postingForm.requiredSkills.filter((s) => s !== skill),
    });
  };

  // Submit New Posting (FR-03)
  const handleCreatePostingSubmit = (e) => {
    e.preventDefault();
    if (!postingForm.title.trim() || !postingForm.description.trim()) {
      alert('Please fill in title and description.');
      return;
    }

    createPosting({
      companyId: company._id,
      companyName: company.companyName,
      companyLocation: company.location,
      title: postingForm.title,
      department: postingForm.department || 'Engineering Team',
      slots: Number(postingForm.slots),
      requiredProgram: postingForm.requiredProgram,
      requiredSkills: postingForm.requiredSkills,
      location: postingForm.location,
      isRemote: postingForm.isRemote,
      stipend: postingForm.stipend,
      description: postingForm.description,
      responsibilities: postingForm.responsibilities,
    });

    setPostingSuccessToast(true);
    setTimeout(() => setPostingSuccessToast(false), 3000);
    setActiveTab('postings');
  };

  // Confirm Decision
  const handleConfirmDecision = () => {
    if (!decisionModal) return;

    decideOnApplicantByPartner({
      applicationId: decisionModal.app._id,
      decision: decisionModal.type,
      remarks: decisionRemarks,
    });

    if (decisionModal.type === 'Accepted') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }

    setDecisionModal(null);
    setDecisionRemarks('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white shadow-md">
              <Building2 className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{company.companyName}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {company.verificationStatus} Partner
                </span>
              </div>
              <p className="text-emerald-100 text-xs mt-1">
                {company.industryType} • {company.location} • Contact: {company.contactPerson}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono-tabular">
                {screenedApplicants.filter((a) => a.status === 'Approved').length}
              </div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold">Ready to Screen</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <div className="text-2xl font-bold font-mono-tabular">
                {screenedApplicants.filter((a) => a.status === 'Accepted').length}
              </div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold">Accepted Interns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('screened')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'screened'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Coordinator-Screened Applicants</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'screened' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {screenedApplicants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('postings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'postings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Active Internship Postings</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'postings' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {companyPostings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create-posting')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'create-posting'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Opportunity</span>
          </button>
        </div>

        {/* BR-03 Badge Notification */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>BR-03 Enforced: Raw unapproved applications are strictly hidden</span>
        </div>
      </div>

      {postingSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>New internship opportunity published successfully to the student recommendation pool!</span>
        </div>
      )}

      {/* --- TAB 1: SCREENED APPLICANTS (FR-09, BR-03) --- */}
      {activeTab === 'screened' && (
        <div className="space-y-4">
          {screenedApplicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-sm">No Screened Applicants In Queue</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Per Business Rule BR-03, students must first be reviewed and verified by the university OJT Coordinator before appearing in your screening portal.
              </p>
            </div>
          ) : (
            /* Split-Pane Screening Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane: Applicant List */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Screening Queue (Approved Only)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verified by university coordinator
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {screenedApplicants.length} Candidates
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                  {screenedApplicants.map((app) => {
                    const isSelected = selectedApp?._id === app._id;
                    return (
                      <button
                        key={app._id}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {app.studentProfile.fullName}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {app.studentProfile.academicProgram}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate">
                            Target: <span className="text-slate-700 font-medium">{app.postingTitle}</span>
                          </p>

                          {/* Matched Skills */}
                          <div className="flex flex-wrap gap-1">
                            {app.matchBreakdown.matchedSkills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {app.matchBreakdown.matchedSkills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{app.matchBreakdown.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {app.matchScore}% Match
                          </span>

                          {app.status === 'Accepted' && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Accepted
                            </span>
                          )}
                          {app.status === 'Partner Rejected' && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              Declined
                            </span>
                          )}
                          {app.status === 'Approved' && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              Pending Action
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Detailed Profile & Embedded Endorsement Preview */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {selectedApp ? (
                  <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-lg">
                            {selectedApp.studentProfile.fullName}
                          </h3>
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {selectedApp.studentProfile.studentIdNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedApp.studentProfile.academicProgram} • {selectedApp.studentProfile.yearLevel} •{' '}
                          {selectedApp.studentProfile.preferredLocation}
                        </p>
                      </div>

                      {/* Action Decision Buttons */}
                      <div className="flex items-center gap-2">
                        {selectedApp.status === 'Approved' ? (
                          <>
                            <button
                              onClick={() =>
                                setDecisionModal({ app: selectedApp, type: 'Partner Rejected' })
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>

                            <button
                              onClick={() =>
                                setDecisionModal({ app: selectedApp, type: 'Accepted' })
                              }
                              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept Intern</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                            Decision Recorded: {selectedApp.status}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student Background & Match Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                          Candidate Qualifications
                        </span>
                        <div className="space-y-1 text-slate-600">
                          <div>
                            <strong>Email:</strong> {selectedApp.studentProfile.email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {selectedApp.studentProfile.phone || 'Available in letter'}
                          </div>
                          <div>
                            <strong>Required Hours:</strong> {selectedApp.studentProfile.requiredHours} hrs
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                        <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                          Coordinator Verification Stamp
                        </span>
                        <div className="space-y-1 text-emerald-800 text-[11px]">
                          <div>
                            <strong>Verified By:</strong>{' '}
                            {selectedApp.reviewedByCoordinatorName || 'Prof. Mohamed Mogib Elkordy'}
                          </div>
                          <div>
                            <strong>Remarks:</strong> &quot;{selectedApp.coordinatorRemarks || 'Requirements verified.'}&quot;
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Matched vs Missing Skills */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Technical Skill Match Analysis
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.matchBreakdown.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {s}
                          </span>
                        ))}
                        {selectedApp.matchBreakdown.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200"
                          >
                            Missing: {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Side-by-Side Embedded Endorsement Document Viewer */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>Official Endorsement Document (Verified per BR-01)</span>
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
                    Select an applicant from the left queue to review credentials and endorsement documents.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: ACTIVE POSTINGS (FR-03) --- */}
      {activeTab === 'postings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyPostings.map((p) => {
              const remaining = p.slots - p.filledSlots;
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          remaining > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {remaining > 0 ? 'Active Slots' : 'Filled'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div>
                        <strong>Department:</strong> {p.department}
                      </div>
                      <div>
                        <strong>Capacity / Slots:</strong>{' '}
                        <span className="font-mono-tabular font-bold text-slate-800">
                          {p.filledSlots} / {p.slots} filled
                        </span>
                      </div>
                      <div>
                        <strong>Target Program:</strong> {p.requiredProgram}
                      </div>
                      <div>
                        <strong>Stipend:</strong> {p.stipend}
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {p.requiredSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: CREATE POSTING (FR-03) --- */}
      {activeTab === 'create-posting' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Post New Internship Opportunity</h3>
            <p className="text-xs text-slate-500 mt-1">
              Specify capacity, required academic program, and technical skill requirements (FR-03).
            </p>
          </div>

          <form onSubmit={handleCreatePostingSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Position / Internship Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postingForm.title}
                  onChange={(e) => setPostingForm({ ...postingForm, title: e.target.value })}
                  placeholder="e.g. Frontend Engineering Intern"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={postingForm.department}
                  onChange={(e) => setPostingForm({ ...postingForm, department: e.target.value })}
                  placeholder="e.g. Web Products Team"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available Slots (Numerical Capacity) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={postingForm.slots}
                  onChange={(e) =>
                    setPostingForm({ ...postingForm, slots: parseInt(e.target.value) || 1 })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Academic Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={postingForm.requiredProgram}
                  onChange={(e) =>
                    setPostingForm({
                      ...postingForm,
                      requiredProgram: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Any IT">Any Computing / IT Program</option>
                  <option value="BSIT">BS Information Technology (BSIT)</option>
                  <option value="BSCS">BS Computer Science (BSCS)</option>
                  <option value="BSCpE">BS Computer Engineering (BSCpE)</option>
                  <option value="BSIS">BS Information Systems (BSIS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={postingForm.location}
                  onChange={(e) => setPostingForm({ ...postingForm, location: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stipend / Allowance</label>
                <input
                  type="text"
                  value={postingForm.stipend}
                  onChange={(e) => setPostingForm({ ...postingForm, stipend: e.target.value })}
                  placeholder="e.g. ₱7,500 / month"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Reusable Tag-Input for Required Skills */}
            <div className="space-y-2 pt-2">
              <label className="block font-semibold text-slate-700">
                Required Technical Skills (Tag Input Component) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 border border-slate-200 rounded-xl bg-slate-50 min-h-[44px]">
                {postingForm.requiredSkills.map((s) => (
                  <span
                    key={s}
                    className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type skill & press Enter (e.g. React, SQL, Python)..."
                  className="border-none bg-transparent focus:outline-none text-xs flex-1 min-w-[180px] p-1"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                These tags will be compared with student profiles by the recommendation engine.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Opportunity Description & Learning Objectives <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={postingForm.description}
                onChange={(e) => setPostingForm({ ...postingForm, description: e.target.value })}
                placeholder="Describe project responsibilities, team environment, and mentor guidance..."
                className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
              >
                Publish Internship Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CONFIRMATION MODAL FOR PARTNER DECISION --- */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">
              {decisionModal.type === 'Accepted'
                ? 'Accept Applicant for OJT'
                : 'Decline Candidate Application'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <strong>{decisionModal.app.studentProfile.fullName}</strong> for{' '}
              <strong>{decisionModal.app.postingTitle}</strong>
            </p>

            <div className="my-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Partner Remarks / Feedback to Student:
              </label>
              <textarea
                rows={2}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder={
                  decisionModal.type === 'Accepted'
                    ? 'Welcome to the team! Report to HR on first day...'
                    : 'Thank you for applying. We are pursuing other candidates...'
                }
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setDecisionModal(null)}
                className="text-xs text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`text-xs font-bold px-4 py-2 rounded-lg text-white ${
                  decisionModal.type === 'Accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {decisionModal.type === 'Accepted' ? 'Acceptance' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
