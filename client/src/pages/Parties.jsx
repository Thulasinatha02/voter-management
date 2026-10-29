import React, { useState, useEffect } from 'react';
import {
  Flag,
  Plus,
  Search,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeButton from '../components/common/ThemeButton';

const Parties = () => {
  const { user } = useAuth();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    partyName: '',
    partyCode: '',
    description: '',
    isActive: true,
  });

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/parties?search=${search}&isArchived=${showArchived}&all=true`);
      if (res.data.success) {
        setParties(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch political parties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, [search, showArchived]);

  const handleOpenCreate = () => {
    setEditingParty(null);
    setFormData({
      partyName: '',
      partyCode: '',
      description: '',
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (party) => {
    setEditingParty(party);
    setFormData({
      partyName: party.partyName,
      partyCode: party.partyCode,
      description: party.description || '',
      isActive: party.isActive ?? true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingParty) {
        await api.patch(`/parties/${editingParty._id}`, formData);
      } else {
        await api.post('/parties', formData);
      }
      setIsModalOpen(false);
      fetchParties();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving party.');
    }
  };

  const handleToggleArchive = async (party) => {
    const action = party.isArchived ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} ${party.partyCode}?`)) return;

    try {
      await api.patch(`/parties/${party._id}/archive`);
      fetchParties();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const isEditor = user?.role === 'superadmin' || user?.role === 'ward_officer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              Electoral Affiliations
            </span>
            <span className="text-xs text-slate-400 font-medium">Registry Module</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Political Parties</h1>
          <p className="text-xs text-slate-500">
            Administer recognized political parties and electoral affiliations
          </p>
        </div>

        {isEditor && (
          <ThemeButton
            variant="gradient"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Add Political Party
          </ThemeButton>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by party name or code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Show Archived</span>
          </label>
          <span className="font-extrabold text-slate-800">{parties.length}</span> total parties
        </div>
      </div>

      {/* Parties Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading parties...</div>
        ) : parties.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No political parties found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Party Code</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parties.map((party) => (
                  <tr key={party._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {party.partyCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {party.partyName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {party.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {party.isActive && !party.isArchived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : party.isArchived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditor && (
                          <button
                            onClick={() => handleOpenEdit(party)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Party"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user?.role === 'superadmin' && (
                          <button
                            onClick={() => handleToggleArchive(party)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              party.isArchived
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={party.isArchived ? 'Restore Party' : 'Archive Party'}
                          >
                            {party.isArchived ? (
                              <RotateCcw className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingParty ? `Edit ${editingParty.partyCode}` : 'Register New Political Party'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Party Name *</label>
                <input
                  type="text"
                  required
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  placeholder="e.g. All India Anna Dravida Munnetra Kazhagam"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Party Code / Abbreviation *</label>
                <input
                  type="text"
                  required
                  value={formData.partyCode}
                  onChange={(e) => setFormData({ ...formData, partyCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. AIADMK"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details or jurisdiction..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveParty"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveParty" className="font-semibold text-slate-700 cursor-pointer">
                  Active for Member Affiliation
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <ThemeButton type="submit" variant="gradient" size="md">
                  {editingParty ? 'Save Changes' : 'Create Party'}
                </ThemeButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
