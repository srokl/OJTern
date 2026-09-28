import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  Database,
  TableProperties,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useOJTStore } from '../../store/useOJTStore.js';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    currentRole,
    users,
    setCurrentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToDefaultData,
    mongoDbStatus,
  } = useOJTStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const userNotifications = notifications.filter((n) => n.userId === currentUser._id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const isAdminTheme = currentRole === 'Admin';

  const roleConfig = {
    Student: {
      label: 'OJT Student',
      icon: <GraduationCap className="w-4 h-4 text-blue-500" />,
      badge: 'Student Portal',
    },
    IndustryPartner: {
      label: 'Industry Partner',
      icon: <Building2 className="w-4 h-4 text-emerald-500" />,
      badge: 'Partner Portal',
    },
    Coordinator: {
      label: 'OJT Coordinator',
      icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
      badge: 'Gatekeeper Portal',
    },
    Admin: {
      label: 'School Administrator',
      icon: <UserCheck className="w-4 h-4 text-slate-800" />,
      badge: 'Governance Portal',
    },
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isAdminTheme
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105 ${
                  isAdminTheme
                    ? 'bg-gradient-to-br from-indigo-500 to-slate-700'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight">OJTern</span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      isAdminTheme
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    DUTERTECH
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-tight ${
                    isAdminTheme ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Smart Matching & Recommendation Platform
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-300/40">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? isAdminTheme
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 font-semibold'
                    : isAdminTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {roleConfig[currentRole]?.badge || 'Portal Dashboard'}
              </button>

              <button
                onClick={() => setActiveTab('traceability')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'traceability'
                    ? isAdminTheme
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 font-semibold'
                    : isAdminTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Traceability Matrix</span>
                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  All Passing
                </span>
              </button>

              <button
                onClick={() => setActiveTab('mongodb')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'mongodb'
                    ? isAdminTheme
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 font-semibold'
                    : isAdminTheme
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>MongoDB Atlas Docs</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            </nav>
          </div>

          {/* Right Controls: Role Switcher & Notifications */}
          <div className="flex items-center gap-3">
            {/* MongoDB Atlas Connected Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Atlas: cluster0.h38ialq</span>
            </div>

            {/* Quick Stakeholder Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
                  isAdminTheme
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
                title="Switch active role / persona"
              >
                <span className="flex items-center gap-1.5">
                  {roleConfig[currentRole]?.icon}
                  <span className="hidden sm:inline font-semibold">{currentUser.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isAdminTheme ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {currentRole}
                  </span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showRoleSwitcher && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900"
                  onClick={() => setShowRoleSwitcher(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Stakeholder Persona
                    </p>
                    <p className="text-xs text-slate-500">
                      Instantly test each role workflow and permissions
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {users.map((u) => {
                      const isSelected = currentUser._id === u._id;
                      return (
                        <button
                          key={u._id}
                          onClick={() => {
                            setCurrentUser(u);
                            setShowRoleSwitcher(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-800 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {roleConfig[u.role]?.icon}
                            <div>
                              <div className="font-medium text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell (FR-10, FR-11) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isAdminTheme
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 text-slate-900 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">Notifications</h4>
                      <p className="text-[10px] text-slate-500">
                        Status updates & coordinator alerts
                      </p>
                    </div>
                    {userNotifications.length > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead(currentUser._id)}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markNotificationAsRead(n._id)}
                          className={`p-3 text-xs transition-colors cursor-pointer ${
                            n.isRead ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/50 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : n.type === 'warning' ? (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono-tabular">
                                {new Date(n.dateSent).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reset State Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to clean factory state?')) {
                  resetToDefaultData();
                  alert('Demo database reset to default state.');
                }
              }}
              className={`p-2 rounded-lg text-xs transition-colors ${
                isAdminTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Reset Database to Clean Initial State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
