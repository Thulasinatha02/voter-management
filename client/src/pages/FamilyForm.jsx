import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeButton from '../components/common/ThemeButton';

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

  // Dynamic Members list
  const [members, setMembers] = useState([
    {
      fullName: '',
      gender: 'male',
      age: '',
      relationship: 'head',
      mobilePhone: '',
      occupation: '',
      education: '',
      status: 'complete',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleHeadNameChange = (val) => {
    setHeadOfFamilyName(val);
    if (members.length > 0 && members[0].relationship === 'head') {
      const updated = [...members];
      updated[0].fullName = val;
      setMembers(updated);
    }
  };

  const addMemberRow = () => {
    setMembers([
      ...members,
      {
        fullName: '',
        gender: 'unspecified',
        age: '',
        relationship: 'spouse',
        mobilePhone: '',
        occupation: '',
        education: '',
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
        members: members.map((m) => ({
          ...m,
          age: m.age ? Number(m.age) : undefined,
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
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
              Register household unit and immediate family members with atomic validation
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section A: Household Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Section A — Ward & Household Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ward Selection *</label>
              <select
                required
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family Label (Optional)</label>
              <input
                type="text"
                value={familyLabel}
                onChange={(e) => setFamilyLabel(e.target.value)}
                placeholder="e.g. Verma Residence"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">House / Flat No. *</label>
              <input
                type="text"
                required
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="e.g. 12-A / Plot 44"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street / Lane</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Civil Lines Road"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Locality / Sector</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Civil Lines"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Water Tank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Record Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-semibold text-emerald-800"
              >
                <option value="complete">Complete & Verified</option>
                <option value="incomplete">Incomplete (Follow-up needed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section B: Dynamic Family Members Table */}
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

          <div className="space-y-3">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs hover:border-emerald-200 transition-colors"
              >
                <div className="sm:col-span-1 flex items-center gap-1 font-extrabold text-slate-400">
                  #{idx + 1}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={member.fullName}
                    onChange={(e) => updateMemberField(idx, 'fullName', e.target.value)}
                    placeholder="Member Name"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                    Gender
                  </label>
                  <select
                    value={member.gender}
                    onChange={(e) => updateMemberField(idx, 'gender', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Unspecified</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                    Relationship
                  </label>
                  <select
                    value={member.relationship}
                    onChange={(e) => updateMemberField(idx, 'relationship', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                  >
                    <option value="head">Head of Family</option>
                    <option value="spouse">Spouse</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="grandfather">Grandfather</option>
                    <option value="grandmother">Grandmother</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={member.occupation}
                    onChange={(e) => updateMemberField(idx, 'occupation', e.target.value)}
                    placeholder="e.g. Teacher, Engineer"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => removeMemberRow(idx)}
                    title="Remove member"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Administrative Policy:</strong> Religion and political-party affiliations are intentionally omitted from registration to uphold privacy standards.
            </span>
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
