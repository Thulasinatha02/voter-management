import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Members = () => {
  const { selectedWard } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [voterEligible, setVoterEligible] = useState('');
  const [page, setPage] = useState(1);

  const fetchMembers = async () => {
    if (!selectedWard) return;
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: {
          wardId: selectedWard._id,
          search,
          gender,
          voterEligible: voterEligible !== '' ? voterEligible : undefined,
          page,
          limit: 10,
        },
      });
      if (res.data.success) {
        setMembers(res.data.data);
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
    fetchMembers();
  }, [selectedWard, search, gender, voterEligible, page]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              {selectedWard?.wardCode}
            </span>
            <span className="text-xs text-slate-400 font-medium">Resident Master Index</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Member Management</h1>
          <p className="text-xs text-slate-500">
            Individual demographic registry across {selectedWard?.wardName}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search member name, ID, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* Voter Eligibility Filter */}
          <select
            value={voterEligible}
            onChange={(e) => {
              setVoterEligible(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Age Categories</option>
            <option value="true">Eligible Voters (18+)</option>
            <option value="false">Minors (&lt;18)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-extrabold text-slate-800">{total}</span> total members
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading member records...</div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No member records found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Family Reference</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4 text-center">Age</th>
                  <th className="py-3 px-4 text-center">Voter Eligibility</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const fam = m.familyId || {};
                  return (
                    <tr key={m._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-700">
                        {m.memberCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {m.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 font-semibold">{fam.familyCode || '—'}</span>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          House #{fam.houseNo}, {fam.locality}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                        {m.gender}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {m.age ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {m.isVoterEligible ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Eligible (18+)
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Minor (&lt;18)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-700 font-medium">
                        {m.relationship === 'head' ? (
                          <span className="font-bold text-emerald-700">Head of Family</span>
                        ) : (
                          m.relationship
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {m.mobilePhone || fam.contactPhone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Complete
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

export default Members;
