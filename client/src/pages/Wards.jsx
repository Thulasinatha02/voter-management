import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Archive,
  RotateCcw,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wards = () => {
  const { user, refreshWards } = useAuth();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    wardCode: '',
    wardName: '',
    locality: '',
    district: '',
    zone: '',
    totalPopulationEstimate: 0,
    isActive: true,
  });

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wards?search=${search}&isArchived=${showArchived}`);
      if (res.data.success) {
        setWards(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch wards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, [search, showArchived]);

  const handleOpenCreate = () => {
    setEditingWard(null);
    setFormData({
      wardCode: '',
      wardName: '',
      locality: '',
      district: '',
      zone: '',
      totalPopulationEstimate: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ward) => {
    setEditingWard(ward);
    setFormData({
      wardCode: ward.wardCode,
      wardName: ward.wardName,
      locality: ward.locality || '',
      district: ward.district || '',
      zone: ward.zone || '',
      totalPopulationEstimate: ward.totalPopulationEstimate || 0,
      isActive: ward.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingWard) {
        await api.patch(`/wards/${editingWard._id}`, formData);
      } else {
        await api.post('/wards', formData);
      }
      setIsModalOpen(false);
      fetchWards();
      refreshWards();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving ward.');
    }
  };

  const handleToggleArchive = async (ward) => {
    const action = ward.isArchived ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} ${ward.wardCode}?`)) return;

    try {
      await api.patch(`/wards/${ward._id}/archive`);
      fetchWards();
      refreshWards();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  const isSuperadmin = user?.role === 'superadmin' || user?.role === 'ward_officer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ward Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer electoral divisions, zones, and population metrics
          </p>
        </div>

        {isSuperadmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Ward</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, locality..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Archived Wards</span>
          </label>
        </div>
      </div>

      {/* Ward Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading wards...</div>
        ) : wards.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No wards found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ward Code</th>
                  <th className="py-3 px-4">Ward Name</th>
                  <th className="py-3 px-4">Locality / Area</th>
                  <th className="py-3 px-4">Zone & District</th>
                  <th className="py-3 px-4 text-right">Population Est.</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wards.map((ward) => (
                  <tr key={ward._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-700">
                      {ward.wardCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {ward.wardName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {ward.locality || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {ward.zone || 'Zone N/A'} {ward.district ? `(${ward.district})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {ward.totalPopulationEstimate?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ward.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isSuperadmin && (
                          <button
                            onClick={() => handleOpenEdit(ward)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Ward"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user?.role === 'superadmin' && (
                          <button
                            onClick={() => handleToggleArchive(ward)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              ward.isArchived
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={ward.isArchived ? 'Restore Ward' : 'Archive Ward'}
                          >
                            {ward.isArchived ? (
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingWard ? `Edit ${editingWard.wardCode}` : 'Create New Ward'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Ward Code *</label>
                <input
                  type="text"
                  required
                  value={formData.wardCode}
                  onChange={(e) => setFormData({ ...formData, wardCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. WARD-05"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ward Name *</label>
                <input
                  type="text"
                  required
                  value={formData.wardName}
                  onChange={(e) => setFormData({ ...formData, wardName: e.target.value })}
                  placeholder="e.g. Southern Ridge Ward"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Lake View"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Zone</label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="e.g. South Zone"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Central Metro"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Population Est.</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalPopulationEstimate}
                    onChange={(e) => setFormData({ ...formData, totalPopulationEstimate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-semibold shadow-xs"
                >
                  {editingWard ? 'Save Changes' : 'Create Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wards;
