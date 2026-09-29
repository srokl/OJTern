import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  BookOpen,
  Check,
} from 'lucide-react';
import { useOJTStore } from '../../store/useOJTStore.js';

export const AuthPage = () => {
  const { login, signup, users } = useOJTStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [signupRole, setSignupRole] = useState('Student'); // 'Student' | 'IndustryPartner'
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupProgram, setSignupProgram] = useState('BSIT');
  const [signupCompanyName, setSignupCompanyName] = useState('');
  const [signupIndustry, setSignupIndustry] = useState('Software & IT Services');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password validation rules
  const hasMinLength = signupPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const passwordsMatch = signupPassword.length > 0 && signupPassword === signupConfirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate network response
      await new Promise((r) => setTimeout(r, 400));
      login(loginEmail.trim(), loginPassword);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email) => {
    setError('');
    setIsLoading(true);
    setLoginEmail(email);
    setLoginPassword('DemoPassword123');
    setTimeout(() => {
      try {
        login(email, 'DemoPassword123');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters, include 1 uppercase letter, and 1 number.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupRole === 'IndustryPartner' && !signupCompanyName.trim()) {
      setError('Please provide your company or organization name.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the OJT Internship Guidelines & University Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: signupRole,
        academicProgram: signupRole === 'Student' ? signupProgram : undefined,
        companyName: signupRole === 'IndustryPartner' ? signupCompanyName.trim() : undefined,
        industryType: signupRole === 'IndustryPartner' ? signupIndustry : undefined,
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Background Decorative Blur Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>OJTern</span>
            <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Enterprise
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            On-the-Job Training & Internship Placement Management Platform
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Tab Navigation */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: SIGN IN FORM */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@university.edu.ph"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('For testing, you may select any of the 1-click Demo Accounts below, or enter your registered password.')}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Secure OAuth2/JWT Ready</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts Section */}
              <div className="mt-8 pt-6 border-t border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Fast Demo Access (1-Click Login)
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Instant Persona Switch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Student Demo */}
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('rico@student.university.edu.ph')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 text-left transition-all group flex items-start gap-2.5"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 group-hover:bg-blue-500/20">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300 truncate">
                        Rico Gervero
                      </div>
                      <div className="text-[10px] text-slate-400">OJT Student (BSIT)</div>
                    </div>
                  </button>

                  {/* Partner Demo */}
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('talent@techcorp.ph')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 text-left transition-all group flex items-start gap-2.5"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 group-hover:bg-emerald-500/20">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                        TechCorp HR
                      </div>
                      <div className="text-[10px] text-slate-400">Industry Partner</div>
                    </div>
                  </button>

                  {/* Coordinator Demo */}
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('coordinator@university.edu.ph')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 text-left transition-all group flex items-start gap-2.5"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 group-hover:bg-purple-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                        Prof. Elkordy
                      </div>
                      <div className="text-[10px] text-slate-400">OJT Coordinator</div>
                    </div>
                  </button>

                  {/* Admin Demo */}
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('dean.admin@university.edu.ph')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 text-left transition-all group flex items-start gap-2.5"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 group-hover:bg-indigo-500/20">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                        Dr. N. Trinidad
                      </div>
                      <div className="text-[10px] text-slate-400">School Admin / Dean</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SIGN UP / REGISTRATION FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSignupRole('Student')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      signupRole === 'Student'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        signupRole === 'Student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">OJT Student</div>
                      <div className="text-[10px] text-slate-400">Seeking Placement</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('IndustryPartner')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      signupRole === 'IndustryPartner'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        signupRole === 'IndustryPartner'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Industry Partner</div>
                      <div className="text-[10px] text-slate-400">Hiring Interns</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder={signupRole === 'Student' ? 'e.g. Maria Santos' : 'e.g. Elena Reyes (HR)'}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder={signupRole === 'Student' ? 'maria@student.edu.ph' : 'elena@company.com'}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Role-Specific Fields */}
              {signupRole === 'Student' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Academic Degree Program
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <select
                      value={signupProgram}
                      onChange={(e) => setSignupProgram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="BSIT">BS Information Technology (BSIT - 486 hrs)</option>
                      <option value="BSCS">BS Computer Science (BSCS - 486 hrs)</option>
                      <option value="BSCpE">BS Computer Engineering (BSCpE - 486 hrs)</option>
                      <option value="BSIS">BS Information Systems (BSIS - 486 hrs)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={signupCompanyName}
                        onChange={(e) => setSignupCompanyName(e.target.value)}
                        placeholder="e.g. Apex Innovations Ltd"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Industry Sector
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <select
                        value={signupIndustry}
                        onChange={(e) => setSignupIndustry(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="Software & IT Services">Software & IT Services</option>
                        <option value="Financial Technology">Financial Technology (FinTech)</option>
                        <option value="Telecommunications">Telecommunications</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="E-Commerce & Logistics">E-Commerce & Logistics</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-9 pr-9 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-9 pr-9 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Rule Validation Pills */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="text-slate-400 font-medium">Security Requirements:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                    <span>1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 mt-0.5"
                />
                <span>
                  I acknowledge and agree to the University OJT Guidelines, Code of Conduct, and Data Privacy Act policies.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Access Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Office of Career Services & Industry Linkages • University OJT Portal
        </p>
      </div>
    </div>
  );
};
