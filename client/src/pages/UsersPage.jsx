import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  CheckCircle,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
  MapPin,
  Check,
} from 'lucide-react';
import api from '../services/api';
import ThemeButton from '../components/common/ThemeButton';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview', desc: 'Summary metrics & charts' },
  { id: 'familyManagement', label: 'Family Management', desc: 'Household registration & overview' },
  { id: 'memberManagement', label: 'Member Management', desc: 'Voter rolls & individual records' },
  { id: 'wardManagement', label: 'Ward Management', desc: 'Create & manage wards' },
  { id: 'partyManagement', label: 'Party Management', desc: 'Political party directories' },
  { id: 'wardReports', label: 'Ward Reports', desc: 'Demographic reports & exports' },
  { id: 'userManagement', label: 'User Management', desc: 'Accounts & access permissions' },
  { id: 'auditLogs', label: 'Audit Logs', desc: 'System activity & security logs' },
];

const DEFAULT_PERMISSIONS = {
  superadmin: {
    dashboard: true,
    familyManagement: true,
    memberManagement: true,
    wardManagement: true,
    partyManagement: true,
    wardReports: true,
    userManagement: true,
    auditLogs: true,
  },
  ward_officer: {
    dashboard: true,
    familyManagement: true,
    memberManagement: true,
    wardManagement: false,
    partyManagement: false,
    wardReports: true,
    userManagement: false,
    auditLogs: false,
  },
  auditor: {
    dashboard: true,
    familyManagement: true,
    memberManagement: true,
    wardManagement: false,
    partyManagement: false,
    wardReports: true,
    userManagement: false,
    auditLogs: true,
  },
  data_operator: {
    dashboard: true,
    familyManagement: true,
    memberManagement: true,
    wardManagement: false,
    partyManagement: false,
    wardReports: false,
    userManagement: false,
    auditLogs: false,
  },
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'data_operator',
    assignedWards: [],
    permissions: { ...DEFAULT_PERMISSIONS.data_operator },
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, wRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/wards?isArchived=false'),
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (wRes.data.success) setWards(wRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'data_operator',
      assignedWards: [],
      permissions: { ...DEFAULT_PERMISSIONS.data_operator },
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      assignedWards: user.assignedWards ? user.assignedWards.map((w) => (w._id ? w._id : w)) : [],
      permissions: user.permissions || {
        ...(DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS.data_operator),
      },
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: {
        ...(DEFAULT_PERMISSIONS[newRole] || DEFAULT_PERMISSIONS.data_operator),
      },
    }));
  };

  const handleToggleWard = (wardId) => {
    setFormData((prev) => {
      const exists = prev.assignedWards.includes(wardId);
      return {
        ...prev,
        assignedWards: exists
          ? prev.assignedWards.filter((id) => id !== wardId)
          : [...prev.assignedWards, wardId],
      };
    });
  };

  const handleTogglePermission = (moduleId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: !prev.permissions[moduleId],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password || !payload.password.trim()) {
          delete payload.password;
        }
        await api.patch(`/auth/users/${editingUser._id}`, payload);
      } else {
        await api.post('/auth/users', formData);
      }

      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user record');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?._id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user @${user.username}?`)) {
      return;
    }

    try {
      await api.delete(`/auth/users/${user._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      alert('You cannot deactivate your own account.');
      return;
    }

    try {
      await api.patch(`/auth/users/${user._id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Access Control
            </span>
            <span className="text-xs text-slate-400 font-medium">RBAC Security Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">User & Operator Management</h1>
          <p className="text-xs text-slate-500">
            Configure administrative permissions, assign ward scopes, and manage user accounts
          </p>
        </div>

        <ThemeButton
          onClick={handleOpenCreate}
          variant="gradient"
          size="md"
          icon={Plus}
          className="self-start sm:self-auto shadow-md shadow-emerald-600/20"
        >
          Add Operator / User
        </ThemeButton>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Ward Scope</th>
                  <th className="py-3 px-4">Allowed Modules</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const allowedCount = u.permissions
                    ? Object.values(u.permissions).filter(Boolean).length
                    : 3;

                  return (
                    <tr key={u._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{u.fullName}</div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          @{u.username} • {u.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            u.role === 'superadmin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'ward_officer'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : u.role === 'auditor'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {u.role === 'superadmin' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> All Wards (Global)
                          </span>
                        ) : u.assignedWards?.length ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.assignedWards.map((w) => (
                              <span
                                key={w._id || w}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]"
                              >
                                {w.wardCode || 'Ward'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Unrestricted</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {allowedCount} of 8 modules
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u._id === currentUser?._id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit User & Permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u._id !== currentUser?._id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}
      </div>

      {/* CREATE & EDIT USER MODAL WITH WARD & PERMISSION SELECTORS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingUser ? `Edit User: @${editingUser.username}` : 'Add New Operator / User'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Configure role assignments, permitted modules, and ward visibility
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ramesh@wardportal.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. ramesh_op"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingUser ? 'Reset Password (Optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Role Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">System Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                >
                  <option value="data_operator">Field Data Operator (Family & Member Access Only)</option>
                  <option value="ward_officer">Ward Officer (Ward Supervisor)</option>
                  <option value="auditor">Auditor (Read-Only Inspection)</option>
                  <option value="superadmin">Superadmin (Unrestricted Master Admin)</option>
                </select>
              </div>

              {/* Row 4: Assigned Ward Scoping */}
              {formData.role !== 'superadmin' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      Assigned Ward Scope
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {formData.assignedWards.length === 0
                        ? 'Access to All Active Wards'
                        : `${formData.assignedWards.length} ward(s) selected`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select specific wards this operator can view and manage:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {wards.map((w) => {
                      const isSelected = formData.assignedWards.includes(w._id);
                      return (
                        <button
                          key={w._id}
                          type="button"
                          onClick={() => handleToggleWard(w._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{w.wardCode}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row 5: Granular Module Permissions Checkbox Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Module Access & Permissions
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Custom Access Control
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  {MODULES.map((m) => {
                    const isChecked = !!formData.permissions[m.id];
                    return (
                      <label
                        key={m.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200/80 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(m.id)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="font-bold text-xs">{m.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{m.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-md shadow-emerald-600/30"
                >
                  {editingUser ? 'Update User Record' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
