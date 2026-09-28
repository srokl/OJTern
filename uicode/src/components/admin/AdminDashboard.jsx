import React, { useState } from 'react';
import {
  UserCheck,
  Users,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Search,
  UserPlus,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { useOJTStore } from '../../store/useOJTStore.js';

export const AdminDashboard = () => {
  const {
    currentUser,
    currentRole,
    users,
    companyProfiles,
    applications,
    updateUserStatus,
    assignUserRole,
    createNewUser,
  } = useOJTStore();

  // Strict RBAC Guard per NFR-02 & Technical Constraints
  if (currentRole !== 'Admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-rose-900">403 Forbidden: Admin Access Required</h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          The School Administrator portal is strictly restricted to accounts with the{' '}
          <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono font-bold">Admin</code> role.
          Your current active role is <strong className="font-mono">{currentRole}</strong>.
        </p>
      </div>
    );
  }

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Deactivate Account Modal State (Requires typed "DEACTIVATE" confirmation)
  const [deactivateModalUser, setDeactivateModalUser] = useState(null);
  const [deactivateTypedText, setDeactivateTypedText] = useState('');
  const [deactivateError, setDeactivateError] = useState(null);

  // Role Assignment Modal State
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('Coordinator');

  // Create User Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'Coordinator',
  });

  // System Health Metrics
  const totalStudents = users.filter((u) => u.role === 'Student').length;
  const activePartners = companyProfiles.filter((c) => c.verificationStatus === 'Verified').length;
  const pendingApprovals = applications.filter((a) => a.status === 'Pending').length;
  const totalPlacements = applications.filter((a) => a.status === 'Accepted').length;

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Deactivate Confirm
  const handleConfirmDeactivate = () => {
    if (!deactivateModalUser) return;

    if (deactivateTypedText.trim() !== 'DEACTIVATE') {
      setDeactivateError('You must type DEACTIVATE in capital letters to confirm.');
      return;
    }

    updateUserStatus(deactivateModalUser._id, 'inactive');
    setDeactivateModalUser(null);
    setDeactivateTypedText('');
    setDeactivateError(null);
  };

  // Handle Activate User
  const handleActivateUser = (userId) => {
    updateUserStatus(userId, 'active');
  };

  // Handle Role Assignment Confirm
  const handleConfirmRoleAssignment = () => {
    if (!roleModalUser) return;
    assignUserRole(roleModalUser._id, selectedNewRole);
    setRoleModalUser(null);
  };

  // Handle Create New User Submit
  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.email.trim()) return;

    createNewUser({
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      status: 'active',
    });

    setShowCreateUserModal(false);
    setNewUserData({ name: '', email: '', role: 'Coordinator' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner: Deep Slate Theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shadow-md">
              <UserCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Institutional Governance Portal
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                  School Administrator
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Executive Account Governance, User Roles & System Health Monitoring (NFR-02)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateUserModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff / User Account</span>
          </button>
        </div>
      </div>

      {/* AdminStatsBanner: Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono-tabular">
            {totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">BSIT, BSCS, BSCpE cohorts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Verified Partners</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono-tabular">
            {activePartners}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Validated industry enterprises</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono-tabular">
            {pendingApprovals}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">System-wide coordinator queue</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Placements</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 font-mono-tabular">
            {totalPlacements}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Official OJT slots filled</p>
        </div>
      </div>

      {/* UserManagementTable: User Accounts & RBAC */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base">User Account Governance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage system permissions, assign or revoke the Coordinator role, and deactivate accounts.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, or role..."
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Student">Student</option>
              <option value="IndustryPartner">Industry Partner</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">User Details</th>
                <th className="p-3">System Role</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isSelf = u._id === currentUser._id;
                return (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                          u.role === 'Coordinator'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'Admin'
                            ? 'bg-slate-800 text-white border-slate-700'
                            : u.role === 'IndustryPartner'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3 font-mono-tabular text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Assignment */}
                        <button
                          onClick={() => {
                            setRoleModalUser(u);
                            setSelectedNewRole(u.role);
                          }}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold transition-colors"
                        >
                          Change Role
                        </button>

                        {/* Status Toggle */}
                        {u.status === 'active' ? (
                          <button
                            disabled={isSelf}
                            onClick={() => {
                              setDeactivateModalUser(u);
                              setDeactivateTypedText('');
                              setDeactivateError(null);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              isSelf
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                            title={isSelf ? 'Cannot deactivate currently active account' : 'Deactivate user'}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(u._id)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: TYPED "DEACTIVATE" CONFIRMATION MODAL --- */}
      {deactivateModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Deactivate Account</h3>
                <p className="text-xs text-rose-700 font-semibold">Destructive Administrative Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate the account for{' '}
              <strong className="text-slate-900">{deactivateModalUser.name}</strong> (
              <span className="font-mono">{deactivateModalUser.email}</span>)?
              The user will immediately lose system login access.
            </p>

            <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-rose-900">
                Type &quot;DEACTIVATE&quot; to confirm:
              </label>
              <input
                type="text"
                value={deactivateTypedText}
                onChange={(e) => setDeactivateTypedText(e.target.value)}
                placeholder="DEACTIVATE"
                className="w-full text-xs border border-rose-300 rounded-lg p-2 font-mono uppercase focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {deactivateError && (
                <p className="text-rose-600 text-[11px] font-semibold">{deactivateError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setDeactivateModalUser(null)}
                className="text-xs text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                disabled={deactivateTypedText.trim() !== 'DEACTIVATE'}
                onClick={handleConfirmDeactivate}
                className={`text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm transition-all ${
                  deactivateTypedText.trim() !== 'DEACTIVATE'
                    ? 'bg-rose-300 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ROLE ASSIGNMENT MODAL --- */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Assign User System Role</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying system role for <strong>{roleModalUser.name}</strong> ({roleModalUser.email})
            </p>

            <div className="my-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select System Role:</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Coordinator">OJT Coordinator (Gatekeeper / Approvals)</option>
                <option value="Student">OJT Student (Applicant / Matches)</option>
                <option value="IndustryPartner">Industry Partner (Company / Screener)</option>
                <option value="Admin">School Administrator (Executive Governance)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-xs text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleAssignment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Save Role Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CREATE USER MODAL --- */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Create University Staff / User</h3>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 my-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Prof. Maria Santos"
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="maria.santos@university.edu.ph"
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Coordinator">OJT Coordinator</option>
                  <option value="Admin">School Administrator</option>
                  <option value="IndustryPartner">Industry Partner</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
