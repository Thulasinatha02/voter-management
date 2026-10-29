import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Flag,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const religionsList = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Other',
];

const Members = () => {
  const { selectedWard } = useAuth();
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [boothNo, setBoothNo] = useState('');
  const [gender, setGender] = useState('');
  const [voterEligible, setVoterEligible] = useState('');
  const [religion, setReligion] = useState('');
  const [politicalParty, setPoliticalParty] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get('/parties');
        if (res.data.success) {
          setParties(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load parties:', err);
      }
    };
    fetchParties();
  }, []);

  const fetchMembers = async () => {
    if (!selectedWard) return;
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: {
          wardId: selectedWard._id,
          search,
          boothNo: boothNo || undefined,
          gender,
          voterEligible: voterEligible !== '' ? voterEligible : undefined,
          religion: religion || undefined,
          politicalParty: politicalParty || undefined,
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
  }, [selectedWard, search, boothNo, gender, voterEligible, religion, politicalParty, page]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              {selectedWard?.wardCode}
            </span>
            <span className="text-xs text-slate-400 font-medium">Resident Master Electoral Roll</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Member & Voter Management</h1>
          <p className="text-xs text-slate-500">
            Individual demographic registry, party affiliation, and voter roll in {selectedWard?.wardName}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
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
              placeholder="Search voter name, Voter ID, guardian..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Booth No Filter */}
          <input
            type="text"
            value={boothNo}
            onChange={(e) => {
              setBoothNo(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Booth (e.g. Booth 01)..."
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500 w-44"
          />

          {/* Political Party Filter */}
          <select
            value={politicalParty}
            onChange={(e) => {
              setPoliticalParty(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Political Parties</option>
            <option value="none">No Affiliation / Independent</option>
            {parties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.partyCode} — {p.partyName}
              </option>
            ))}
          </select>

          {/* Religion Filter */}
          <select
            value={religion}
            onChange={(e) => {
              setReligion(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Religions</option>
            {religionsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

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
                  <th className="py-3 px-3 text-center">Booth No</th>
                  <th className="py-3 px-3 text-center">Sl No</th>
                  <th className="py-3 px-3">Voter ID (EPIC)</th>
                  <th className="py-3 px-4">Name of Voter</th>
                  <th className="py-3 px-3">Father / Husband Name</th>
                  <th className="py-3 px-3">Door No</th>
                  <th className="py-3 px-3">Locality</th>
                  <th className="py-3 px-2 text-center">Gender / Age</th>
                  <th className="py-3 px-3">Religion</th>
                  <th className="py-3 px-3">Political Party</th>
                  <th className="py-3 px-3 text-center">Franchise (18+)</th>
                  <th className="py-3 px-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const fam = m.familyId || {};
                  return (
                    <tr key={m._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-3 text-center font-medium text-slate-700">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-[11px]">
                          {m.boothNo || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-800">
                        {m.serialNo || '—'}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                        {m.voterId ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                            {m.voterId}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {m.fullName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {m.fatherOrHusbandName || '—'}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {m.doorNo || fam.houseNo || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {fam.locality || '—'}
                      </td>
                      <td className="py-3.5 px-2 text-center capitalize text-slate-600">
                        {m.gender} • <span className="font-bold text-slate-900">{m.age ?? '—'}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {m.religion || 'Unspecified'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {m.politicalParty ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
                            {m.politicalParty.partyCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Independent</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {m.isVoterEligible ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Eligible
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Minor (&lt;18)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                        {m.mobilePhone || fam.contactPhone || '—'}
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
