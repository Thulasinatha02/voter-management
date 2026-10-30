import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  UserCheck,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  AlertCircle,
  Filter,
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
  const { selectedWard, wards, changeWard } = useAuth();
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [boothNo, setBoothNo] = useState('');
  const [gender, setGender] = useState('');
  const [residenceStatus, setResidenceStatus] = useState('');
  const [voterEligible, setVoterEligible] = useState('');
  const [religion, setReligion] = useState('');
  const [politicalParty, setPoliticalParty] = useState('');
  const [page, setPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editError, setEditError] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.member-action-menu')) {
        setActiveDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const [duplicateWarning, setDuplicateWarning] = useState({ voterId: '', serialNo: '' });

  const checkEditDuplicate = async (field, value) => {
    const val = (value || '').trim();
    if (!val || !editingMember) {
      setDuplicateWarning((prev) => ({ ...prev, [field]: '' }));
      return;
    }

    try {
      const params = { excludeMemberId: editingMember._id };
      if (field === 'voterId') params.voterId = val;
      if (field === 'serialNo') {
        params.serialNo = val;
        params.wardId = selectedWard?._id;
      }

      const res = await api.get('/members/check-duplicate', { params });
      if (res.data.success) {
        const { voterIdDuplicate, serialNoDuplicate } = res.data.data;
        if (field === 'voterId' && voterIdDuplicate) {
          setDuplicateWarning((prev) => ({
            ...prev,
            voterId: `Duplicate Voter ID: Already registered to ${voterIdDuplicate.fullName} (${voterIdDuplicate.wardCode || 'Ward'})`,
          }));
          return;
        }
        if (field === 'serialNo' && serialNoDuplicate) {
          setDuplicateWarning((prev) => ({
            ...prev,
            serialNo: `Serial No "${val}" already assigned to ${serialNoDuplicate.fullName} in this ward`,
          }));
          return;
        }

        setDuplicateWarning((prev) => ({ ...prev, [field]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (m) => {
    setActiveDropdownId(null);
    setDuplicateWarning({ voterId: '', serialNo: '' });
    setEditingMember({
      _id: m._id,
      memberCode: m.memberCode,
      boothNo: m.boothNo || 'Booth 01',
      serialNo: m.serialNo || '',
      fullName: m.fullName || '',
      voterId: m.voterId || '',
      fatherOrHusbandName: m.fatherOrHusbandName || '',
      doorNo: m.doorNo || m.familyId?.houseNo || '',
      gender: m.gender || 'male',
      age: m.age ?? '',
      religion: m.religion || 'Hindu',
      politicalParty: m.politicalParty?._id || m.politicalParty || '',
      relationship: m.relationship || 'son',
      mobilePhone: m.mobilePhone || '',
      occupation: m.occupation || '',
      education: m.education || '',
      residenceStatus: m.residenceStatus || 'in',
      foreignCountry: m.foreignCountry || '',
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember || !editingMember.fullName.trim()) return;

    try {
      await api.patch(`/members/${editingMember._id}`, {
        ...editingMember,
        age: editingMember.age !== '' ? Number(editingMember.age) : undefined,
        politicalParty: editingMember.politicalParty || '',
        residenceStatus: editingMember.residenceStatus || 'in',
        foreignCountry:
          editingMember.residenceStatus === 'out'
            ? (editingMember.foreignCountry || '').trim()
            : '',
      });
      setIsEditModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating member record');
    }
  };

  const handleDeleteMember = async (m) => {
    setActiveDropdownId(null);
    if (!window.confirm(`Are you sure you want to permanently delete "${m.fullName}"?`)) {
      return;
    }

    try {
      await api.delete(`/members/${m._id}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member record');
    }
  };

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

  const [limit, setLimit] = useState(25);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Helper to generate numbered pagination with ellipsis
  const getPaginationRange = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const isAllWards = !selectedWard || selectedWard._id === 'ALL';

  // Reset to page 1 whenever selected ward changes
  useEffect(() => {
    setPage(1);
  }, [selectedWard?._id]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', {
        params: {
          wardId: isAllWards ? undefined : selectedWard._id,
          search: debouncedSearch || undefined,
          boothNo: boothNo || undefined,
          gender: gender || undefined,
          residenceStatus: residenceStatus || undefined,
          voterEligible: voterEligible !== '' ? voterEligible : undefined,
          religion: religion || undefined,
          politicalParty: politicalParty || undefined,
          page,
          limit,
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
  }, [
    selectedWard?._id,
    debouncedSearch,
    boothNo,
    gender,
    residenceStatus,
    voterEligible,
    religion,
    politicalParty,
    page,
    limit,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              {isAllWards ? '🌐 ALL WARDS' : selectedWard?.wardCode}
            </span>
            <span className="text-xs text-slate-400 font-medium">Resident Master Electoral Roll</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Member & Voter Management</h1>
          <p className="text-xs text-slate-500">
            {isAllWards 
              ? 'Individual demographic registry, party affiliation, and voter roll across all wards' 
              : `Individual demographic registry, party affiliation, and voter roll in ${selectedWard?.wardName}`}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Top Search & Mobile Filter Toggle Row */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
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

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`xl:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 active:scale-95 ${
              showMobileFilters || boothNo || politicalParty || religion || gender || residenceStatus || voterEligible !== ''
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(boothNo || politicalParty || religion || gender || residenceStatus || voterEligible !== '') && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Filter Dropdowns Grid: Always visible on desktop (xl:flex), collapsible on mobile */}
        <div
          className={`${
            showMobileFilters ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100' : 'hidden xl:flex xl:flex-wrap xl:items-center xl:gap-2.5'
          }`}
        >
          {/* Booth No Filter */}
          <input
            type="text"
            value={boothNo}
            onChange={(e) => {
              setBoothNo(e.target.value);
              setPage(1);
            }}
            placeholder="Booth No (e.g. 01)..."
            className="w-full xl:w-36 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500"
          />

          {/* Political Party Filter */}
          <select
            value={politicalParty}
            onChange={(e) => {
              setPoliticalParty(e.target.value);
              setPage(1);
            }}
            className="w-full xl:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500 truncate"
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
            className="w-full xl:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
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
            className="w-full xl:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          {/* Residence Status Filter (IN / OUT) */}
          <select
            value={residenceStatus}
            onChange={(e) => {
              setResidenceStatus(e.target.value);
              setPage(1);
            }}
            className="w-full xl:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Residence (Local & NRI)</option>
            <option value="in">Local Resident (IN)</option>
            <option value="out">Abroad / NRI (OUT)</option>
          </select>

          {/* Voter Eligibility Filter */}
          <select
            value={voterEligible}
            onChange={(e) => {
              setVoterEligible(e.target.value);
              setPage(1);
            }}
            className="w-full xl:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="">All Age Categories</option>
            <option value="true">Eligible Voters (18+)</option>
            <option value="false">Minors (&lt;18)</option>
          </select>

          {/* Clear Filters Reset Button */}
          {(boothNo || politicalParty || religion || gender || residenceStatus || voterEligible !== '') && (
            <button
              type="button"
              onClick={() => {
                setBoothNo('');
                setPoliticalParty('');
                setReligion('');
                setGender('');
                setResidenceStatus('');
                setVoterEligible('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Total: <span className="font-extrabold text-slate-800">{total}</span> members
          </span>
          <span className="text-[11px] text-slate-400">Page {page} of {pages}</span>
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
          <>
            {/* MOBILE CARD VIEW (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {members.map((m) => {
                const fam = m.familyId || {};
                return (
                  <div key={m._id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isAllWards && (
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {m.wardId?.wardCode || 'WARD'}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-[11px] text-slate-700">
                            Booth: {m.boothNo || '—'}
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-100">
                            Sl #{m.serialNo || '—'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5">{m.fullName}</h3>
                        <p className="text-xs text-slate-500">{m.fatherOrHusbandName ? `S/o or W/o: ${m.fatherOrHusbandName}` : ''}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Voter ID</span>
                        <span className="font-mono font-bold text-emerald-700">{m.voterId || 'Pending'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Door & Locality</span>
                        <span className="font-semibold text-slate-700">{m.doorNo || fam.houseNo || '—'}, {fam.locality || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Gender & Age</span>
                        <span className="capitalize">{m.gender} • {m.age ?? '—'} yrs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Residence & Party</span>
                        <span className="font-semibold text-slate-800">
                          {m.residenceStatus === 'out' ? 'Abroad (OUT)' : 'Local (IN)'}
                          {m.politicalParty?.partyCode ? ` • ${m.politicalParty.partyCode}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (>= md) */}
            <div className="hidden md:block overflow-x-auto min-h-[320px] pb-12">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                    {isAllWards && <th className="py-3 px-3 text-center">Ward</th>}
                    <th className="py-3 px-3 text-center">Booth No</th>
                    <th className="py-3 px-3 text-center">Sl No</th>
                    <th className="py-3 px-3">Voter ID (EPIC)</th>
                    <th className="py-3 px-4">Name of Voter</th>
                    <th className="py-3 px-3">Father / Husband Name</th>
                    <th className="py-3 px-3">Door No</th>
                    <th className="py-3 px-3">Locality</th>
                    <th className="py-3 px-3 text-center">Residence</th>
                    <th className="py-3 px-2 text-center">Gender / Age</th>
                    <th className="py-3 px-3">Religion</th>
                    <th className="py-3 px-3">Political Party</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m, index) => {
                    const fam = m.familyId || {};
                    const isNearBottom = index >= members.length - 2 && members.length > 2;
                    return (
                      <tr key={m._id} className="hover:bg-emerald-50/30 transition-colors">
                        {isAllWards && (
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {m.wardId?.wardCode || 'WARD'}
                            </span>
                          </td>
                        )}
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
                        <td className="py-3.5 px-3 text-center">
                          {m.residenceStatus === 'out' ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                                Abroad (OUT)
                              </span>
                              {m.foreignCountry && (
                                <span className="text-[10px] font-semibold text-amber-700 mt-0.5 truncate max-w-[120px]" title={m.foreignCountry}>
                                  {m.foreignCountry}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Local (IN)
                            </span>
                          )}
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
                        <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                          {m.mobilePhone || fam.contactPhone || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-center relative member-action-menu">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === m._id ? null : m._id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                            title="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* 3-Dots Dropdown Menu */}
                          {activeDropdownId === m._id && (
                            <div
                              className={`absolute right-3 ${
                                isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'
                              } w-32 bg-white rounded-xl shadow-2xl border border-slate-200/90 py-1 z-50 animate-in fade-in zoom-in-95 text-left`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(m);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMember(m);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Production-Grade Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/40">
          {/* Left: Range and Per-Page Selector */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing <span className="font-extrabold text-slate-800">{total === 0 ? 0 : (page - 1) * limit + 1}</span>–
              <span className="font-extrabold text-slate-800">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-extrabold text-slate-800">{total}</span>
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-400 font-medium">Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 hover:border-emerald-400 font-bold text-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right: Numerical & Sequential Page Navigation */}
          {pages > 1 && (
            <div className="flex items-center gap-1 self-center sm:self-auto">
              {/* Jump to First */}
              <button
                disabled={page <= 1}
                onClick={() => setPage(1)}
                title="First Page"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev */}
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                title="Previous Page"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Numbered Pills with Ellipsis */}
              <div className="flex items-center gap-1 px-1">
                {getPaginationRange(page, pages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 select-none font-bold">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = p === page;
                  return (
                    <button
                      key={`page-${p}`}
                      onClick={() => setPage(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition-all border ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                title="Next Page"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Jump to Last */}
              <button
                disabled={page >= pages}
                onClick={() => setPage(pages)}
                title="Last Page"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MEMBER MODAL */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Edit Member: {editingMember.fullName}
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {editingMember.memberCode}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingMember(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateMember} className="mt-4 space-y-3.5 text-xs">
              {/* Row 1: Electoral Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booth No</label>
                  <input
                    type="text"
                    value={editingMember.boothNo}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, boothNo: e.target.value })
                    }
                    placeholder="e.g. Booth 01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial No</label>
                  <input
                    type="text"
                    value={editingMember.serialNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingMember({ ...editingMember, serialNo: val });
                      checkEditDuplicate('serialNo', val);
                    }}
                    placeholder="e.g. 104"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-hidden font-medium ${
                      duplicateWarning.serialNo
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {duplicateWarning.serialNo && (
                    <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{duplicateWarning.serialNo}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voter ID (EPIC)</label>
                  <input
                    type="text"
                    value={editingMember.voterId}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setEditingMember({
                        ...editingMember,
                        voterId: val,
                      });
                      checkEditDuplicate('voterId', val);
                    }}
                    placeholder="e.g. ABC1234567"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-hidden uppercase font-mono font-bold ${
                      duplicateWarning.voterId
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {duplicateWarning.voterId && (
                    <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{duplicateWarning.voterId}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Full Name & Guardian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.fullName}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={editingMember.fatherOrHusbandName}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        fatherOrHusbandName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Residence Status (IN / OUT) with Conditional Country */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Residence Status (IN / OUT)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMember({
                          ...editingMember,
                          residenceStatus: 'in',
                          foreignCountry: '',
                        })
                      }
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        editingMember.residenceStatus !== 'out'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      Local Resident (IN)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMember({
                          ...editingMember,
                          residenceStatus: 'out',
                        })
                      }
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        editingMember.residenceStatus === 'out'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      Living Abroad / NRI (OUT)
                    </button>
                  </div>
                </div>

                {editingMember.residenceStatus === 'out' && (
                  <div className="pt-1 animate-in fade-in">
                    <label className="block font-bold text-amber-900 mb-1">
                      Foreign Country Name *
                    </label>
                    <input
                      type="text"
                      required={editingMember.residenceStatus === 'out'}
                      value={editingMember.foreignCountry}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          foreignCountry: e.target.value,
                        })
                      }
                      placeholder="e.g. Singapore, UAE, Malaysia, USA"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:border-amber-500 font-semibold text-amber-950"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Gender & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setEditingMember({ ...editingMember, gender: g })
                        }
                        className={`py-2 text-center text-xs font-bold rounded-xl border capitalize transition-all ${
                          editingMember.gender === g
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="125"
                    value={editingMember.age}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, age: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Row 5: Religion & Political Party */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Religion</label>
                  <div className="relative">
                    <select
                      value={editingMember.religion}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          religion: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                    >
                      {religionsList.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Political Party</label>
                  <div className="relative">
                    <select
                      value={editingMember.politicalParty}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          politicalParty: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                    >
                      <option value="">None / Neutral</option>
                      {parties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.abbreviation || p.partyName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 6: Phone & Door No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Door / House No</label>
                  <input
                    type="text"
                    value={editingMember.doorNo}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, doorNo: e.target.value })
                    }
                    placeholder="e.g. 14/B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={editingMember.mobilePhone}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        mobilePhone: e.target.value,
                      })
                    }
                    placeholder="10 digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
