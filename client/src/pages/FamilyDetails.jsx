import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  Plus,
  X,
  ChevronDown,
  Edit2,
} from 'lucide-react';
import api from '../services/api';
import ThemeButton from '../components/common/ThemeButton';

const religionsList = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Other',
  'Unspecified',
];

const FamilyDetails = () => {
  const { id } = useParams();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isEditFamilyOpen, setIsEditFamilyOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState({
    headOfFamilyName: '',
    familyLabel: '',
    houseNo: '',
    street: '',
    locality: '',
    landmark: '',
    pincode: '',
    contactPhone: '',
    status: 'complete',
  });
  const [newMember, setNewMember] = useState({
    boothNo: 'Booth 01',
    serialNo: '',
    fullName: '',
    voterId: '',
    fatherOrHusbandName: '',
    doorNo: '',
    gender: 'male',
    age: '',
    religion: 'Hindu',
    politicalParty: '',
    relationship: 'son',
    mobilePhone: '',
    occupation: '',
    education: '',
    status: 'complete',
  });

  const fetchFamily = async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        api.get(`/families/${id}`),
        api.get('/parties'),
      ]);
      if (fRes.data.success) {
        setFamily(fRes.data.data.family);
        setMembers(fRes.data.data.members);
      }
      if (pRes.data.success) {
        setParties(pRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, [id]);

  const handleOpenEditFamily = () => {
    if (!family) return;
    setEditingFamily({
      headOfFamilyName: family.headOfFamilyName || '',
      familyLabel: family.familyLabel || '',
      houseNo: family.houseNo || '',
      street: family.street || '',
      locality: family.locality || '',
      landmark: family.landmark || '',
      pincode: family.pincode || '',
      contactPhone: family.contactPhone || '',
      status: family.status || 'complete',
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
      await api.patch(`/families/${family._id}`, editingFamily);
      setIsEditFamilyOpen(false);
      await fetchFamily();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating family');
    }
  };

  const handleOpenEdit = (m) => {
    setEditingMember({
      _id: m._id,
      memberCode: m.memberCode,
      boothNo: m.boothNo || 'Booth 01',
      serialNo: m.serialNo || '',
      fullName: m.fullName || '',
      voterId: m.voterId || '',
      fatherOrHusbandName: m.fatherOrHusbandName || '',
      doorNo: m.doorNo || family?.houseNo || '',
      gender: m.gender || 'male',
      age: m.age ?? '',
      religion: m.religion || 'Hindu',
      politicalParty: m.politicalParty?._id || m.politicalParty || '',
      relationship: m.relationship || 'son',
      mobilePhone: m.mobilePhone || '',
      occupation: m.occupation || '',
      education: m.education || '',
      status: m.status || 'complete',
    });
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember || !editingMember.fullName.trim()) return;

    try {
      await api.patch(`/members/${editingMember._id}`, {
        ...editingMember,
        age: editingMember.age !== '' ? Number(editingMember.age) : undefined,
        politicalParty: editingMember.politicalParty || '',
      });
      setIsEditMemberOpen(false);
      setEditingMember(null);
      await fetchFamily();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating member');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.fullName.trim()) return;

    try {
      await api.post('/members', {
        ...newMember,
        familyId: family._id,
        wardId: family.wardId?._id || family.wardId,
        age: newMember.age ? Number(newMember.age) : undefined,
        doorNo: newMember.doorNo || family.houseNo,
        politicalParty: newMember.politicalParty || undefined,
      });
      setIsAddMemberOpen(false);
      setNewMember({
        boothNo: 'Booth 01',
        serialNo: '',
        fullName: '',
        voterId: '',
        fatherOrHusbandName: '',
        doorNo: family.houseNo || '',
        gender: 'male',
        age: '',
        religion: 'Hindu',
        politicalParty: '',
        relationship: 'son',
        mobilePhone: '',
        occupation: '',
        education: '',
        status: 'complete',
      });
      fetchFamily();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  if (loading || !family) {
    return <div className="py-20 text-center text-xs text-slate-400 font-semibold">Loading family details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/families"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {family.familyCode}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {family.wardId?.wardCode} — {family.wardId?.wardName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {family.headOfFamilyName}'s Household
            </h1>
          </div>
        </div>

        <ThemeButton
          onClick={() => {
            setNewMember((prev) => ({ ...prev, doorNo: family.houseNo }));
            setIsAddMemberOpen(true);
          }}
          variant="gradient"
          size="md"
          icon={Plus}
          className="self-stretch sm:self-auto"
        >
          Add Member
        </ThemeButton>
      </div>

      {/* Household Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Household & Address Overview
          </h2>
          <button
            onClick={handleOpenEditFamily}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Household
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Head of Family</span>
            <span className="font-bold text-slate-800 text-sm">{family.headOfFamilyName}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Address</span>
            <span className="font-semibold text-slate-800">
              House #{family.houseNo}, {family.street || ''}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Locality</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {family.locality || 'Civil Lines'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Contact Phone</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {family.contactPhone ? (
                <a href={`tel:${family.contactPhone}`} className="text-emerald-700 hover:underline">
                  {family.contactPhone}
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Members Directory (Responsive Cards on Mobile & Table on Desktop with retrieved fields) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registered Family Members ({members.length})
            </h2>
          </div>
        </div>

        {/* MOBILE CARD FEED (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {members.map((m) => (
            <div key={m._id} className="p-4 space-y-2 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{m.fullName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono font-bold text-emerald-700">
                      {m.memberCode}
                    </span>
                    {m.voterId && (
                      <span className="text-[10px] font-mono font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        EPIC: {m.voterId}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 capitalize border border-emerald-200 whitespace-nowrap self-start">
                  {m.relationship === 'head' ? 'Head of Family' : m.relationship}
                </span>
              </div>

              {/* Electoral details badge row */}
              <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                {m.boothNo && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {m.boothNo}
                  </span>
                )}
                {m.serialNo && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    S.No: #{m.serialNo}
                  </span>
                )}
                {m.religion && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-100">
                    {m.religion}
                  </span>
                )}
                {m.politicalParty && (
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold border border-teal-100">
                    {m.politicalParty?.partyName || m.politicalParty?.abbreviation || 'Party Affiliated'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                <div>Age: <span className="font-bold text-slate-700">{m.age ?? '—'}</span> ({m.gender})</div>
                {m.fatherOrHusbandName && (
                  <div>Guardian: <span className="font-semibold text-slate-700">{m.fatherOrHusbandName}</span></div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                {m.isVoterEligible ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Eligible Voter (18+)
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px] font-medium">Minor (&lt;18)</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  {m.mobilePhone && (
                    <a href={`tel:${m.mobilePhone}`} className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member Code / EPIC</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Guardian / Father</th>
                <th className="py-3 px-4">Booth / Serial</th>
                <th className="py-3 px-4">Gender & Age</th>
                <th className="py-3 px-4">Religion & Party</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-700">{m.memberCode}</div>
                    {m.voterId && (
                      <span className="inline-block text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                        {m.voterId}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {m.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {m.fatherOrHusbandName || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{m.boothNo || '—'}</div>
                    {m.serialNo && <div className="text-[10px] text-slate-400">S.No: {m.serialNo}</div>}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                    {m.gender}, {m.age ?? '—'} yrs
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{m.religion || '—'}</div>
                    {m.politicalParty && (
                      <div className="text-[10px] font-bold text-teal-700">
                        {m.politicalParty?.abbreviation || m.politicalParty?.partyName}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-700 font-medium whitespace-nowrap">
                    {m.relationship === 'head' ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 shadow-2xs whitespace-nowrap">
                        Head of Family
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {m.relationship}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {m.status || 'Complete'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200 transition-colors shadow-2xs"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR ADD MEMBER WITH FULL ELECTORAL FIELDS */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Member to Household</h2>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-3.5 text-xs">
              {/* Row 1: Electoral */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booth No</label>
                  <input
                    type="text"
                    value={newMember.boothNo}
                    onChange={(e) => setNewMember({ ...newMember, boothNo: e.target.value })}
                    placeholder="e.g. Booth 01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial No</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newMember.serialNo}
                    onChange={(e) => setNewMember({ ...newMember, serialNo: e.target.value })}
                    placeholder="e.g. 104"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voter ID (EPIC)</label>
                  <input
                    type="text"
                    value={newMember.voterId}
                    onChange={(e) => setNewMember({ ...newMember, voterId: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABC1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold uppercase text-emerald-800"
                  />
                </div>
              </div>

              {/* Row 2: Name & Father/Husband */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    value={newMember.fatherOrHusbandName}
                    onChange={(e) => setNewMember({ ...newMember, fatherOrHusbandName: e.target.value })}
                    placeholder="Guardian Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Relationship & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <div className="relative">
                    <select
                      value={newMember.relationship}
                      onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                    >
                      <option value="spouse">Spouse</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setNewMember({ ...newMember, gender: g })}
                        className={`py-1.5 text-center text-xs font-bold rounded-xl border capitalize transition-all ${
                          newMember.gender === g
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Age & Religion & Party */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="125"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Religion</label>
                  <div className="relative">
                    <select
                      value={newMember.religion}
                      onChange={(e) => setNewMember({ ...newMember, religion: e.target.value })}
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
                      value={newMember.politicalParty}
                      onChange={(e) => setNewMember({ ...newMember, politicalParty: e.target.value })}
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

              {/* Row 5: Contact & Door No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={newMember.mobilePhone}
                    onChange={(e) => setNewMember({ ...newMember, mobilePhone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Door No</label>
                  <input
                    type="text"
                    value={newMember.doorNo}
                    onChange={(e) => setNewMember({ ...newMember, doorNo: e.target.value })}
                    placeholder={family.houseNo || 'Door #'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-md shadow-emerald-600/30"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET FOR EDIT MEMBER CONNECTED TO BACKEND PATCH */}
      {isEditMemberOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Member Details</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-emerald-700">{editingMember.memberCode}</span>
                  {editingMember.voterId && (
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {editingMember.voterId}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditMemberOpen(false);
                  setEditingMember(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4 pt-4 text-xs">
              {/* Row 0: Electoral Booth & Serial */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booth No</label>
                  <input
                    type="text"
                    value={editingMember.boothNo}
                    onChange={(e) => setEditingMember({ ...editingMember, boothNo: e.target.value })}
                    placeholder="e.g. Booth 01"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editingMember.serialNo}
                    onChange={(e) => setEditingMember({ ...editingMember, serialNo: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 1: Full Name & EPIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.fullName}
                    onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                    placeholder="e.g. Annamalai K"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Voter ID / EPIC</label>
                  <input
                    type="text"
                    value={editingMember.voterId}
                    onChange={(e) => setEditingMember({ ...editingMember, voterId: e.target.value.toUpperCase() })}
                    placeholder="e.g. TN/01/001/000123"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Guardian & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    value={editingMember.fatherOrHusbandName}
                    onChange={(e) => setEditingMember({ ...editingMember, fatherOrHusbandName: e.target.value })}
                    placeholder="Guardian or Father name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship to Head</label>
                  <div className="relative">
                    <select
                      value={editingMember.relationship}
                      onChange={(e) => setEditingMember({ ...editingMember, relationship: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                    >
                      <option value="head">Head of Family</option>
                      <option value="spouse">Spouse</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="brother">Brother</option>
                      <option value="sister">Sister</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Gender, Age & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <div className="relative">
                    <select
                      value={editingMember.gender}
                      onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={editingMember.age}
                    onChange={(e) => setEditingMember({ ...editingMember, age: e.target.value })}
                    placeholder="Years"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={editingMember.status}
                      onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none capitalize"
                    >
                      <option value="complete">Complete</option>
                      <option value="pending">Pending</option>
                      <option value="shifted">Shifted</option>
                      <option value="deceased">Deceased</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 4: Religion & Party */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Religion</label>
                  <div className="relative">
                    <select
                      value={editingMember.religion}
                      onChange={(e) => setEditingMember({ ...editingMember, religion: e.target.value })}
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
                      onChange={(e) => setEditingMember({ ...editingMember, politicalParty: e.target.value })}
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

              {/* Row 5: Contact & Door No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={editingMember.mobilePhone}
                    onChange={(e) => setEditingMember({ ...editingMember, mobilePhone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Door No</label>
                  <input
                    type="text"
                    value={editingMember.doorNo}
                    onChange={(e) => setEditingMember({ ...editingMember, doorNo: e.target.value })}
                    placeholder={family.houseNo || 'Door #'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMemberOpen(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-md shadow-emerald-600/30"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET FOR EDIT FAMILY CONNECTED TO BACKEND PATCH */}
      {isEditFamilyOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Household & Address</h2>
                <span className="text-xs font-mono font-bold text-emerald-700">{family.familyCode}</span>
              </div>
              <button
                onClick={() => setIsEditFamilyOpen(false)}
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
                  onClick={() => setIsEditFamilyOpen(false)}
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

export default FamilyDetails;
