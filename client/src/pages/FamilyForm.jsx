import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Users,
  Building,
  Flag,
  UserCheck,
  Check,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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

const FamilyForm = () => {
  const { selectedWard, wards } = useAuth();
  const navigate = useNavigate();

  const [wardId, setWardId] = useState(selectedWard?._id || (wards[0]?._id || ''));
  const [headOfFamilyName, setHeadOfFamilyName] = useState('');
  const [familyLabel, setFamilyLabel] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState(selectedWard?.locality || '');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('complete');
  const [notes, setNotes] = useState('');

  // Default household affiliation shortcuts
  const [defaultBooth, setDefaultBooth] = useState('Booth 01');
  const [defaultReligion, setDefaultReligion] = useState('Hindu');
  const [defaultParty, setDefaultParty] = useState('');
  const [parties, setParties] = useState([]);

  // Dynamic Members list
  const [members, setMembers] = useState([
    {
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
      relationship: 'head',
      mobilePhone: '',
      occupation: '',
      status: 'complete',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get('/parties');
        if (res.data.success) {
          setParties(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load political parties:', err);
      }
    };
    fetchParties();
  }, []);

  const handleHeadNameChange = (val) => {
    setHeadOfFamilyName(val);
    if (members.length > 0 && members[0].relationship === 'head') {
      const updated = [...members];
      updated[0].fullName = val;
      setMembers(updated);
    }
  };

  const handleHouseNoChange = (val) => {
    setHouseNo(val);
    setMembers((prev) =>
      prev.map((m, idx) => ({
        ...m,
        doorNo: m.doorNo ? m.doorNo : val,
      }))
    );
  };

  const applyDefaultsToAllMembers = () => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        boothNo: defaultBooth || m.boothNo,
        doorNo: houseNo || m.doorNo,
        religion: defaultReligion || m.religion,
        politicalParty: defaultParty !== undefined ? defaultParty : m.politicalParty,
      }))
    );
  };

  const addMemberRow = () => {
    setMembers([
      ...members,
      {
        boothNo: defaultBooth || (members[0]?.boothNo || 'Booth 01'),
        serialNo: '',
        fullName: '',
        voterId: '',
        fatherOrHusbandName: headOfFamilyName || '',
        doorNo: houseNo || '',
        gender: 'unspecified',
        age: '',
        religion: defaultReligion || 'Hindu',
        politicalParty: defaultParty || '',
        relationship: 'spouse',
        mobilePhone: contactPhone || '',
        occupation: '',
        status: 'complete',
      },
    ]);
  };

  const removeMemberRow = (index) => {
    if (members.length === 1) {
      alert('At least one primary member (Head of Family) is required.');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMemberField = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    if (index === 0 && field === 'fullName') {
      setHeadOfFamilyName(value);
    }
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!headOfFamilyName.trim()) {
      setError('Head of family name is required.');
      return;
    }
    if (!houseNo.trim()) {
      setError('House / Flat number is required.');
      return;
    }

    for (let i = 0; i < members.length; i++) {
      if (!members[i].fullName.trim()) {
        setError(`Member #${i + 1} full name is missing.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        wardId,
        headOfFamilyName,
        familyLabel: familyLabel || `${headOfFamilyName}'s Household`,
        houseNo,
        street,
        locality,
        landmark,
        pincode,
        contactPhone,
        status,
        notes,
        members: members.map((m, idx) => ({
          boothNo: m.boothNo || defaultBooth || 'Booth 01',
          serialNo: m.serialNo || '',
          fullName: m.fullName,
          voterId: m.voterId ? m.voterId.toUpperCase() : '',
          fatherOrHusbandName: m.fatherOrHusbandName || '',
          doorNo: m.doorNo || houseNo,
          gender: m.gender,
          age: m.age ? Number(m.age) : undefined,
          religion: m.religion || 'Unspecified',
          politicalParty: m.politicalParty ? m.politicalParty : null,
          relationship: m.relationship || (idx === 0 ? 'head' : 'other'),
          mobilePhone: m.mobilePhone || contactPhone,
          occupation: m.occupation,
          status: m.status || 'complete',
        })),
      };

      const res = await api.post('/families', payload);
      if (res.data.success) {
        setSuccessMsg('Family and all members successfully registered!');
        setTimeout(() => {
          navigate('/families');
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Registration failed.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/families"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Family Registration Form</h1>
            <p className="text-xs text-slate-500">
              Register household unit with complete voter roll attributes and affiliations
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section A: Household Address & Defaults */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Section A — Ward & Household Address
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ward Selection *</label>
              <select
                required
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-emerald-500"
              >
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardCode} — {w.wardName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head of Family *</label>
              <input
                type="text"
                required
                value={headOfFamilyName}
                onChange={(e) => handleHeadNameChange(e.target.value)}
                placeholder="Full Name of Primary Contact"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family Label (Optional)</label>
              <input
                type="text"
                value={familyLabel}
                onChange={(e) => setFamilyLabel(e.target.value)}
                placeholder="e.g. Verma Residence"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">House / Door No. *</label>
              <input
                type="text"
                required
                value={houseNo}
                onChange={(e) => handleHouseNoChange(e.target.value)}
                placeholder="e.g. 12-A / Plot 44"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-semibold text-emerald-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street / Lane</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Civil Lines Road"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Locality / Sector</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Civil Lines"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Water Tank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Record Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold text-emerald-800"
              >
                <option value="complete">Complete & Verified</option>
                <option value="incomplete">Incomplete (Follow-up needed)</option>
              </select>
            </div>
          </div>

          {/* Household Demographic Defaults Helper Box */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs">Household Demographics Fast-Fill</span>
                <p className="text-[11px] text-slate-500">
                  Select family booth, religion & party affiliation to apply to all members with one click
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <input
                  type="text"
                  value={defaultBooth}
                  onChange={(e) => setDefaultBooth(e.target.value)}
                  placeholder="Default Booth"
                  title="Default Booth No (e.g. Booth 01)"
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 w-28 text-center"
                />
              </div>

              <div>
                <select
                  value={defaultReligion}
                  onChange={(e) => setDefaultReligion(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-emerald-500"
                >
                  {religionsList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={defaultParty}
                  onChange={(e) => setDefaultParty(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="">None / Independent</option>
                  {parties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.partyCode} — {p.partyName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={applyDefaultsToAllMembers}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to All Members</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section B: Dynamic Family Members Cards */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Section B — Family Members ({members.length})
              </h2>
            </div>

            <ThemeButton
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addMemberRow}
            >
              Add Member Row
            </ThemeButton>
          </div>

          <div className="space-y-4">
            {members.map((member, idx) => {
              const isEligible = member.age ? Number(member.age) >= 18 : false;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs hover:border-emerald-300 transition-all shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-800">
                        {member.fullName || `Member #${idx + 1}`}
                      </span>
                      {member.relationship === 'head' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Head of Family
                        </span>
                      )}
                      {member.age && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            isEligible
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-200/60 text-slate-500'
                          }`}
                        >
                          {isEligible ? 'Voter (18+)' : 'Minor (<18)'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMemberRow(idx)}
                      title="Remove member"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tier 1: Voter Identity & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Booth No
                      </label>
                      <input
                        type="text"
                        value={member.boothNo || ''}
                        onChange={(e) => updateMemberField(idx, 'boothNo', e.target.value)}
                        placeholder="e.g. Booth 01"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Booth Serial No
                      </label>
                      <input
                        type="text"
                        value={member.serialNo || ''}
                        onChange={(e) => updateMemberField(idx, 'serialNo', e.target.value)}
                        placeholder="e.g. 104"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-center text-emerald-800"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Name of Voter *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.fullName}
                        onChange={(e) => updateMemberField(idx, 'fullName', e.target.value)}
                        placeholder="Full Legal Name"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Voter ID (EPIC)
                      </label>
                      <input
                        type="text"
                        value={member.voterId}
                        onChange={(e) => updateMemberField(idx, 'voterId', e.target.value.toUpperCase())}
                        placeholder="e.g. ABC1234567"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-mono font-bold uppercase"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Father / Husband Name
                      </label>
                      <input
                        type="text"
                        value={member.fatherOrHusbandName}
                        onChange={(e) => updateMemberField(idx, 'fatherOrHusbandName', e.target.value)}
                        placeholder="Guardian Name"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Tier 2: Door No, Demographics, Affiliation & Contact */}
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-center pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Door No
                      </label>
                      <input
                        type="text"
                        value={member.doorNo}
                        onChange={(e) => updateMemberField(idx, 'doorNo', e.target.value)}
                        placeholder={houseNo || 'Door #'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Age
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="125"
                        value={member.age}
                        onChange={(e) => updateMemberField(idx, 'age', e.target.value)}
                        placeholder="Age"
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-center font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Gender
                      </label>
                      <select
                        value={member.gender}
                        onChange={(e) => updateMemberField(idx, 'gender', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unspecified">Unspecified</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Religion
                      </label>
                      <select
                        value={member.religion}
                        onChange={(e) => updateMemberField(idx, 'religion', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                      >
                        {religionsList.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Political Party
                      </label>
                      <select
                        value={member.politicalParty || ''}
                        onChange={(e) => updateMemberField(idx, 'politicalParty', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-semibold text-emerald-900"
                      >
                        <option value="">None / Independent</option>
                        {parties.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.partyCode} — {p.partyName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Phone No
                      </label>
                      <input
                        type="tel"
                        value={member.mobilePhone}
                        onChange={(e) => updateMemberField(idx, 'mobilePhone', e.target.value)}
                        placeholder="Mobile"
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: "Save Family & Close" */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/families"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancel
          </Link>

          <ThemeButton
            type="submit"
            disabled={loading}
            variant="gradient"
            size="md"
            icon={Save}
          >
            {loading ? 'Validating & Saving...' : 'Save Family & Close'}
          </ThemeButton>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;
