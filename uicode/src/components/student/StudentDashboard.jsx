import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  FileUp,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Info,
  ShieldAlert,
  Send,
  Building,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOJTStore } from '../../store/useOJTStore.js';
import { calculateMatchScore } from '../../utils/matchingEngine.js';

const AVAILABLE_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'NoSQL Databases',
  'Docker',
  'Git',
  'Linux',
  'REST APIs',
  'Figma',
];

const AVAILABLE_LOCATIONS = ['Davao City', 'Cebu City', 'Metro Manila', 'Remote'];

export const StudentDashboard = () => {
  const {
    currentUser,
    getStudentProfile,
    updateStudentProfile,
    postings,
    applications,
    submitApplication,
    resubmitApplicationWithDocument,
  } = useOJTStore();

  const profile = getStudentProfile(currentUser._id);

  const [activeSubTab, setActiveSubTab] = useState('recommendations');
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [breakdownPosting, setBreakdownPosting] = useState(null);

  // Profile Form State (ProfileBuilder FR-01)
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || currentUser.name,
    studentIdNumber: profile?.studentIdNumber || '2023-10842',
    academicProgram: profile?.academicProgram || 'BSIT',
    yearLevel: profile?.yearLevel || '3rd Year',
    requiredHours: profile?.requiredHours || 486,
    preferredLocation: profile?.preferredLocation || 'Davao City',
    technicalSkills: profile?.technicalSkills || ['React', 'JavaScript', 'Tailwind CSS', 'SQL'],
    interests: profile?.interests || ['Web Development'],
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    email: profile?.email || currentUser.email,
  });

  const [formErrors, setFormErrors] = useState({});
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Application Modal File State (BR-01 Enforcement)
  const [attachedDocument, setAttachedDocument] = useState(null);
  const [applyError, setApplyError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resubmit Modal State (Returned for Correction)
  const [resubmitApp, setResubmitApp] = useState(null);
  const [resubmitDoc, setResubmitDoc] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  // Student's Applications
  const myApplications = applications.filter((app) => app.studentId === currentUser._id);

  // FR-04: Calculate ranked recommendations
  const rankedPostings = useMemo(() => {
    if (!profile) return [];
    return postings
      .map((posting) => {
        const match = calculateMatchScore(profile, posting);
        return {
          posting,
          match,
        };
      })
      .sort((a, b) => b.match.totalScore - a.match.totalScore);
  }, [profile, postings]);

  // Filtered recommendations
  const filteredPostings = rankedPostings.filter(({ posting }) => {
    const matchesSearch =
      posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation =
      filterLocation === 'All' ||
      posting.location.toLowerCase() === filterLocation.toLowerCase() ||
      (filterLocation === 'Remote' && posting.isRemote);
    return matchesSearch && matchesLocation;
  });

  // Handle Profile Save with Validation (FR-01, NFR-04)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.studentIdNumber.trim()) errors.studentIdNumber = 'Student ID is required.';
    if (!formData.academicProgram) errors.academicProgram = 'Academic program is required.';
    if (!formData.preferredLocation) errors.preferredLocation = 'Preferred location is required.';
    if (formData.technicalSkills.length === 0) {
      errors.technicalSkills = 'Please select at least one technical skill for the matching engine.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    updateStudentProfile({
      userId: currentUser._id,
      ...formData,
    });

    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const toggleSkill = (skill) => {
    if (formData.technicalSkills.includes(skill)) {
      setFormData({
        ...formData,
        technicalSkills: formData.technicalSkills.filter((s) => s !== skill),
      });
    } else {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, skill],
      });
    }
  };

  // Attach sample endorsement letter helper
  const handleAttachSampleDocument = () => {
    setAttachedDocument({
      _id: `doc-${Date.now()}`,
      fileName: `${formData.fullName.replace(/\s+/g, '_')}_Official_Endorsement_Letter.pdf`,
      fileSize: '412 KB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString(),
    });
    setApplyError(null);
  };

  // Submit Application (FR-05, FR-06, BR-01)
  const handleConfirmApplication = () => {
    if (!selectedPosting) return;

    // BR-01 Validation
    if (!attachedDocument || !attachedDocument.fileName) {
      setApplyError('Mandatory endorsement document is missing. An application cannot be submitted without an official university endorsement.');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      submitApplication({
        postingId: selectedPosting._id,
        studentId: currentUser._id,
        endorsementDocument: attachedDocument,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setShowApplyModal(false);
      setSelectedPosting(null);
      setAttachedDocument(null);
      setActiveSubTab('applications');
    } catch (err) {
      setApplyError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resubmit Application (Returned for Correction)
  const handleConfirmResubmit = () => {
    if (!resubmitApp || !resubmitDoc) return;

    try {
      resubmitApplicationWithDocument(resubmitApp._id, resubmitDoc);
      confetti({ particleCount: 50, spread: 60 });
      setResubmitApp(null);
      setResubmitDoc(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Student Greeting */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>OJT Student Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.fullName || currentUser.name}!
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Program: <strong className="text-white">{profile?.academicProgram || 'BSIT'}</strong> • Preferred Location:{' '}
              <strong className="text-white">{profile?.preferredLocation || 'Davao City'}</strong> • Target Hours:{' '}
              <strong className="text-white">{profile?.requiredHours || 486} Hours</strong>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold font-mono-tabular">{myApplications.length}</div>
              <div className="text-[11px] text-blue-200 uppercase font-medium">Applications</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-bold font-mono-tabular">
                {myApplications.filter((a) => a.status === 'Approved' || a.status === 'Accepted').length}
              </div>
              <div className="text-[11px] text-blue-200 uppercase font-medium">Approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'recommendations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Recommended Internships</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {filteredPostings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'applications'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Application Tracking</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                activeSubTab === 'applications' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {myApplications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Profile & Matching Preferences</span>
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: RECOMMENDATIONS (FR-04, C-03) --- */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role, company, or skills..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Location:</span>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Locations</option>
                <option value="Davao City">Davao City</option>
                <option value="Cebu City">Cebu City</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPostings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No Matching Internship Postings</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try updating your search query or adjust your skills in your profile builder to receive more recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredPostings.map(({ posting, match }) => {
                const alreadyApplied = myApplications.some((a) => a.postingId === posting._id);
                const isHighMatch = match.totalScore >= 80;

                return (
                  <div
                    key={posting._id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Company & Match Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-100">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {posting.title}
                            </h4>
                            <p className="text-xs text-slate-500">{posting.companyName}</p>
                          </div>
                        </div>

                        {/* Match Score Badge (C-03 Non-ML Rule) */}
                        <button
                          onClick={() => setBreakdownPosting(posting)}
                          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm transition-transform hover:scale-105 ${
                            isHighMatch
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : match.totalScore >= 50
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                          title="Click to view rule-based match score calculation breakdown"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{match.totalScore}% Match</span>
                          <Info className="w-3 h-3 opacity-60" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {posting.description}
                      </p>

                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {posting.location} {posting.isRemote && '(Remote Option)'}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Target: {posting.requiredProgram}
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Slots: {posting.slots - posting.filledSlots} remaining
                        </span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {posting.stipend}
                        </span>
                      </div>

                      {/* Skills Intersect (Green if matched, Gray if missing) */}
                      <div className="space-y-1 mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Required Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {posting.requiredSkills.map((skill) => {
                            const isMatched = match.matchedSkills.includes(skill);
                            return (
                              <span
                                key={skill}
                                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                  isMatched
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {isMatched && '✓ '}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setBreakdownPosting(posting)}
                        className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Why Recommended?
                      </button>

                      {alreadyApplied ? (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Application Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPosting(posting);
                            setShowApplyModal(true);
                            setAttachedDocument(null);
                            setApplyError(null);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all hover:gap-2"
                        >
                          <span>Apply for OJT</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 2: APPLICATION TRACKING (FR-10) --- */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Your Active OJT Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status progression from Student Submission → Coordinator Verification → Industry Partner Screening.
            </p>

            {myApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileUp className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">You haven&apos;t submitted any OJT applications yet.</p>
                <button
                  onClick={() => setActiveSubTab('recommendations')}
                  className="mt-3 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Browse Recommended Internships
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {myApplications.map((app) => {
                  return (
                    <div
                      key={app._id}
                      className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all bg-slate-50/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{app.postingTitle}</h4>
                            <span className="font-mono text-xs text-slate-400">ID: {app._id}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Company: <strong className="text-slate-800">{app.companyName}</strong> • Submitted:{' '}
                            <span className="font-mono-tabular">
                              {new Date(app.submissionDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>

                        {/* Status Pill */}
                        <div>
                          {app.status === 'Pending' && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending Coordinator Review
                            </span>
                          )}
                          {app.status === 'Approved' && (
                            <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                              Coordinator Approved • Partner Screening
                            </span>
                          )}
                          {app.status === 'Accepted' && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              Official Placement Accepted! 🎉
                            </span>
                          )}
                          {app.status === 'Returned for Correction' && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              Returned for Correction
                            </span>
                          )}
                          {app.status === 'Rejected' && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              Application Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Section: Endorsement Document & Remarks */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Attached Endorsement Document:
                          </span>
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono-tabular text-slate-800 font-medium truncate">
                              {app.endorsementDocument.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({app.endorsementDocument.fileSize})
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Coordinator & Partner Feedback:
                          </span>
                          {app.coordinatorRemarks ? (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                              <strong>Coordinator:</strong> &quot;{app.coordinatorRemarks}&quot;
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No remarks posted yet.</span>
                          )}

                          {app.partnerRemarks && (
                            <div className="mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-xs">
                              <strong>Partner:</strong> &quot;{app.partnerRemarks}&quot;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Re-submission Action for Returned Status */}
                      {app.status === 'Returned for Correction' && (
                        <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between bg-rose-50/60 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-rose-800">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="text-xs">
                              Action Required: Upload an updated endorsement letter to resume review.
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setResubmitApp(app);
                              setResubmitDoc(null);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Fix & Resubmit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: PROFILE BUILDER (FR-01, NFR-04) --- */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Student OJT Profile Builder</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your profile attributes directly drive the internship matching engine (Academic Program 40%, Preferred Location 20%, Technical Skills 40%).
            </p>
          </div>

          {profileSavedToast && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully! Recommendation rankings have refreshed.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Academic Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Academic Prerequisite Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.fullName && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {formErrors.studentIdNumber && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.studentIdNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Program (Degree) <span className="text-rose-500">* (40% Match Weight)</span>
                  </label>
                  <select
                    value={formData.academicProgram}
                    onChange={(e) =>
                      setFormData({ ...formData, academicProgram: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="BSIT">BS Information Technology (BSIT)</option>
                    <option value="BSCS">BS Computer Science (BSCS)</option>
                    <option value="BSCpE">BS Computer Engineering (BSCpE)</option>
                    <option value="BSIS">BS Information Systems (BSIS)</option>
                  </select>
                  {formErrors.academicProgram && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.academicProgram}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required OJT Hours
                  </label>
                  <input
                    type="number"
                    value={formData.requiredHours}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredHours: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Location & Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Work Location <span className="text-rose-500">* (20% Match Weight)</span>
                  </label>
                  <select
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {AVAILABLE_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {formErrors.preferredLocation && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.preferredLocation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Technical Skills Checklist */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Technical Skills Inventory <span className="text-rose-500">* (40% Match Weight)</span>
                </h4>
                <span className="text-[11px] text-blue-600 font-medium">
                  {formData.technicalSkills.length} selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Select your verified competencies. The recommendation engine calculates the intersection against company slot requirements.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {AVAILABLE_SKILLS.map((skill) => {
                  const selected = formData.technicalSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3 py-2 rounded-lg border font-medium text-left flex items-center justify-between transition-all ${
                        selected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{skill}</span>
                      {selected && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
              {formErrors.technicalSkills && (
                <p className="text-rose-500 text-[11px] mt-1">{formErrors.technicalSkills}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all"
              >
                Save Profile & Update Matching Rankings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 1: APPLICATION SUBMISSION WITH BR-01 ENFORCEMENT --- */}
      {showApplyModal && selectedPosting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Internship Application
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">{selectedPosting.title}</h3>
                <p className="text-xs text-slate-500">{selectedPosting.companyName}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Rule Notice */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>University Requirement:</strong> An application strictly cannot be submitted without an attached endorsement document signed by the university coordinator.
                </div>
              </div>

              {/* Document Attachment Upload Section */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50">
                {attachedDocument ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="font-mono-tabular text-xs font-semibold text-slate-800">
                      {attachedDocument.fileName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Size: {attachedDocument.fileSize} • Uploaded just now
                    </div>
                    <button
                      onClick={() => setAttachedDocument(null)}
                      className="text-[11px] text-rose-600 hover:underline font-medium mt-1"
                    >
                      Remove and change document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Upload Official Endorsement Letter (PDF)
                      </p>
                      <p className="text-[11px] text-slate-400">Max size 5MB • Signed institutional letter</p>
                    </div>

                    {/* Pre-packaged Sample Letter for Instant Verification */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAttachSampleDocument}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Attach Verified Sample Endorsement Document</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {applyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{applyError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-xs text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>

              {/* Submit Button MUST be disabled if endorsement document is missing (BR-01) */}
              <button
                disabled={!attachedDocument || isSubmitting}
                onClick={handleConfirmApplication}
                className={`text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all ${
                  !attachedDocument || isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application (Requires Endorsement)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: WHY RECOMMENDED BREAKDOWN (C-03 & FR-04) --- */}
      {breakdownPosting && profile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {(() => {
              const match = calculateMatchScore(profile, breakdownPosting);
              return (
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Internship Match Score Analysis
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{breakdownPosting.title}</h3>
                      <p className="text-xs text-slate-500">{breakdownPosting.companyName}</p>
                    </div>
                    <button
                      onClick={() => setBreakdownPosting(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div className="text-3xl font-extrabold text-blue-600 font-mono-tabular">
                      {match.totalScore}%
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">
                      Total Calculated Match Score
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Weighted Score: Degree Program (40%) + Location (20%) + Skills (40%)
                    </div>
                  </div>

                  {/* Weights Breakdown */}
                  <div className="space-y-3 text-xs">
                    {/* 1. Academic Program */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">
                          1. Academic Program Match (40% Max)
                        </span>
                        <span className="font-mono font-bold text-blue-600">{match.programScore} / 40 pts</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Student: <strong>{profile.academicProgram}</strong> | Required:{' '}
                        <strong>{breakdownPosting.requiredProgram}</strong>
                      </p>
                    </div>

                    {/* 2. Preferred Location */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">
                          2. Location Match (20% Max)
                        </span>
                        <span className="font-mono font-bold text-blue-600">{match.locationScore} / 20 pts</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Student: <strong>{profile.preferredLocation}</strong> | Posting:{' '}
                        <strong>{breakdownPosting.location}</strong> {breakdownPosting.isRemote && '(Remote)'}
                      </p>
                    </div>

                    {/* 3. Skill Intersection */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">
                          3. Skill Intersection (40% Max)
                        </span>
                        <span className="font-mono font-bold text-blue-600">{match.skillsScore} / 40 pts</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Matched {match.matchedSkills.length} of {breakdownPosting.requiredSkills.length} required skills.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {breakdownPosting.requiredSkills.map((s) => {
                          const has = match.matchedSkills.includes(s);
                          return (
                            <span
                              key={s}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                has
                                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {has ? '✓ ' : '✕ '}
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      onClick={() => setBreakdownPosting(null)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      Close Breakdown
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 3: RESUBMIT CORRECTION DOCUMENT --- */}
      {resubmitApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Re-upload Endorsement Document</h3>
            <p className="text-xs text-slate-500 mt-1">
              Coordinator Note: &quot;{resubmitApp.coordinatorRemarks}&quot;
            </p>

            <div className="my-4 p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
              {resubmitDoc ? (
                <div className="space-y-1">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p className="font-mono text-xs font-semibold text-slate-800">{resubmitDoc.fileName}</p>
                  <p className="text-[11px] text-slate-400">Ready to resubmit</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setResubmitDoc({
                      _id: `doc-resub-${Date.now()}`,
                      fileName: `${formData.fullName}_Official_Signed_Endorsement_V2.pdf`,
                      fileSize: '512 KB',
                      fileType: 'application/pdf',
                      uploadDate: new Date().toISOString(),
                    })
                  }
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  Attach Corrected Endorsement Document
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setResubmitApp(null)}
                className="text-xs text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!resubmitDoc}
                onClick={handleConfirmResubmit}
                className={`text-xs font-bold px-4 py-2 rounded-lg text-white ${
                  !resubmitDoc ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Resubmit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
