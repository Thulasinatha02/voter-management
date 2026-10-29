import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Home,
  Plus,
  Search,
  Eye,
  Users,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Archive,
  RotateCcw,
  Edit2,
  X,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeButton from '../components/common/ThemeButton';
import ThemeBadge from '../components/common/ThemeBadge';

const Families = () => {
  const { selectedWard } = useAuth();
  const [searchParams] = useSearchParams();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [showArchived, setShowArchived] = useState(false);
  const [isEditFamilyOpen, setIsEditFamilyOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  const fetchFamilies = async () => {
    if (!selectedWard) return;
    setLoading(true);
    try {
      const res = await api.get('/families', {
        params: {
          wardId: selectedWard._id,
          search,
          status,
          page,
          limit: 10,
          isArchived: showArchived,
        },
      });
      if (res.data.success) {
        setFamilies(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [selectedWard, search, status, page, showArchived]);

  const handleOpenEdit = (fam) => {
    setEditingFamily({
      _id: fam._id,
      familyCode: fam.familyCode,
      headOfFamilyName: fam.headOfFamilyName || '',
      familyLabel: fam.familyLabel || '',
      houseNo: fam.houseNo || '',
      street: fam.street || '',
      locality: fam.locality || '',
      landmark: fam.landmark || '',
      pincode: fam.pincode || '',
      contactPhone: fam.contactPhone || '',
      status: fam.status || 'complete',
    });
    setIsEditFamilyOpen(true);
  };

  const handleUpdateFamily = async (e) => {
    e.preventDefault();
    if (!editingFamily.headOfFamilyName.trim() || !editingFamily.houseNo.trim()) {
      alert('Head of family name and house number are required.');
      return;
    }

    try {
      await api.patch(`/families/${editingFamily._id}`, editingFamily);
      setIsEditFamilyOpen(false);
      setEditingFamily(null);
      await fetchFamilies();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating family');
    }
  };

  const handleToggleArchive = async (fam) => {
    const action = fam.isArchived ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} family ${fam.familyCode}?`)) return;

    try {
      await api.patch(`/families/${fam._id}/archive`);
      fetchFamilies();
    } catch (err) {
      alert('Failed to update family archive status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              {selectedWard?.wardCode}
            </span>
            <span className="text-xs text-slate-400 font-medium">Scoped Household Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Family Management</h1>
          <p className="text-xs text-slate-500">
            Registered households and family units in {selectedWard?.wardName}
          </p>
        </div>

        <Link to="/families/new">
          <ThemeButton variant="gradient" size="md" icon={Plus}>
            Register New Family
          </ThemeButton>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by code, head of family, house #..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="complete">Complete Records Only</option>
            <option value="incomplete">Incomplete Records Only</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Show Archived</span>
          </label>
          <span className="font-extrabold text-slate-800">{total}</span> total households
        </div>
      </div>

      {/* Families List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading families...</div>
        ) : families.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No family records found. Click "Register New Family" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Family Code</th>
                  <th className="py-3 px-4">Head of Family</th>
                  <th className="py-3 px-4">Address / House No</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4 text-center">Members</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families.map((fam) => (
                  <tr key={fam._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700">
                      {fam.familyCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{fam.headOfFamilyName}</div>
                      {fam.familyLabel && (
                        <div className="text-[11px] text-slate-400 font-medium">{fam.familyLabel}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div>House #{fam.houseNo}</div>
                      {fam.street && <div className="text-[11px] text-slate-400">{fam.street}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {fam.locality || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/70">
                        <Users className="w-3 h-3 text-emerald-600" />
                        {fam.memberCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {fam.status === 'complete' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Incomplete
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(fam)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Family"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/families/${fam._id}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Family Details & Members"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggleArchive(fam)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            fam.isArchived
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={fam.isArchived ? 'Restore' : 'Archive'}
                        >
                          {fam.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT FAMILY MODAL / BOTTOM SHEET */}
      {isEditFamilyOpen && editingFamily && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Household & Address</h2>
                <span className="text-xs font-mono font-bold text-emerald-700">{editingFamily.familyCode}</span>
              </div>
              <button
                onClick={() => {
                  setIsEditFamilyOpen(false);
                  setEditingFamily(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateFamily} className="space-y-4 pt-4 text-xs">
              {/* Row 1: Head of Family & Family Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Head of Family Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFamily.headOfFamilyName}
                    onChange={(e) => setEditingFamily({ ...editingFamily, headOfFamilyName: e.target.value })}
                    placeholder="e.g. Thulasinatha"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Family / Household Label</label>
                  <input
                    type="text"
                    value={editingFamily.familyLabel}
                    onChange={(e) => setEditingFamily({ ...editingFamily, familyLabel: e.target.value })}
                    placeholder="e.g. Thulasinatha Household"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: House No & Street */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    House No / Door No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFamily.houseNo}
                    onChange={(e) => setEditingFamily({ ...editingFamily, houseNo: e.target.value })}
                    placeholder="e.g. 57/1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Street / Cross</label>
                  <input
                    type="text"
                    value={editingFamily.street}
                    onChange={(e) => setEditingFamily({ ...editingFamily, street: e.target.value })}
                    placeholder="e.g. Paramasivapuram"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Locality & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={editingFamily.locality}
                    onChange={(e) => setEditingFamily({ ...editingFamily, locality: e.target.value })}
                    placeholder="e.g. Mallaikottai"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={editingFamily.landmark}
                    onChange={(e) => setEditingFamily({ ...editingFamily, landmark: e.target.value })}
                    placeholder="Near temple, school, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 4: Contact Phone, Pincode & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={editingFamily.contactPhone}
                    onChange={(e) => setEditingFamily({ ...editingFamily, contactPhone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editingFamily.pincode}
                    onChange={(e) => setEditingFamily({ ...editingFamily, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={editingFamily.status}
                      onChange={(e) => setEditingFamily({ ...editingFamily, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none capitalize"
                    >
                      <option value="complete">Complete</option>
                      <option value="incomplete">Incomplete</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditFamilyOpen(false);
                    setEditingFamily(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-md shadow-emerald-600/30"
                >
                  Update Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Families;
