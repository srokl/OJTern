import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useOJTStore } from '../../store/useOJTStore.js';

export const Navbar = () => {
  const {
    currentUser,
    currentRole,
    users,
    setCurrentUser,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useOJTStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  if (!currentUser) return null;

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser._id)
    : [];
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
      badge: 'Coordinator Portal',
    },
    Admin: {
      label: 'School Administrator',
      icon: <UserCheck className="w-4 h-4 text-slate-800" />,
      badge: 'Governance Portal',
    },
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b shadow-xs ${
        isAdminTheme
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
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
                    Enterprise
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-tight ${
                    isAdminTheme ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Intelligent Internship Placement & Career Management
                </p>
              </div>
            </div>

            {/* Portal Badge */}
            <div className="hidden sm:flex items-center ml-4 pl-4 border-l border-slate-300/40">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  isAdminTheme
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {roleConfig[currentRole]?.badge || 'Portal Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Controls: Account Switcher & Notifications */}
          <div className="flex items-center gap-3">
            {/* User Profile / Persona Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-xs ${
                  isAdminTheme
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
                title="Account Settings & Persona Switching"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs leading-none">{currentUser.name}</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isAdminTheme ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showRoleSwitcher && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900"
                  onClick={() => setShowRoleSwitcher(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Active User Accounts
                    </p>
                    <p className="text-xs text-slate-500">
                      Switch account to view corresponding portal
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
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                roleConfig[u.role]?.icon
                              )}
                            </div>
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

                  <div className="pt-1.5 mt-1 border-t border-slate-100 px-1">
                    <button
                      onClick={() => {
                        setShowRoleSwitcher(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Sign out of your account"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-colors ${
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

            {/* Direct Sign Out Action */}
            <button
              onClick={() => logout()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                isAdminTheme
                  ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40'
                  : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
              }`}
              title="Sign Out of OJTern Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
