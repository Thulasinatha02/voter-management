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
    </div>
  );
};

export default Families;
