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
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
  const [parties, setParties] = useState([]);

  // Dynamic Members list with full electoral fields retrieved
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
      education: '',
      status: 'complete',
      residenceStatus: 'in',
      foreignCountry: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch active political parties
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get('/parties');
        if (res.data.success) {
          setParties(res.data.data);
        }
      } catch (e) {
        console.error('Error fetching parties', e);
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

  const addMemberCard = () => {
    setMembers([
      ...members,
      {
        boothNo: members[0]?.boothNo || 'Booth 01',
        serialNo: '',
        fullName: '',
        voterId: '',
        fatherOrHusbandName: '',
        doorNo: houseNo || '',
        gender: 'male',
        age: '',
        religion: members[0]?.religion || 'Hindu',
        politicalParty: '',
        relationship: 'spouse',
        mobilePhone: '',
        occupation: '',
        education: '',
        status: 'complete',
        residenceStatus: 'in',
        foreignCountry: '',
      },
    ]);
  };

  const removeMemberCard = (index) => {
    if (members.length === 1) {
      alert('At least one primary member (Head of Family) is required.');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const [duplicateWarnings, setDuplicateWarnings] = useState({});

  const checkFieldDuplicate = async (index, field, value) => {
    const val = (value || '').trim();
    const key = `${index}_${field}`;

    if (!val) {
      setDuplicateWarnings((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    // 1. Check local in-form duplicates
    if (field === 'voterId') {
      const upperVal = val.toUpperCase();
      const localDupIndex = members.findIndex(
        (m, idx) => idx !== index && (m.voterId || '').trim().toUpperCase() === upperVal
      );
      if (localDupIndex !== -1) {
        const otherName = members[localDupIndex].fullName || `Member #${localDupIndex + 1}`;
        setDuplicateWarnings((prev) => ({
          ...prev,
          [key]: `Duplicate Voter ID: Already entered above for "${otherName}"`,
        }));
        return;
      }
    }

    if (field === 'serialNo') {
      const localDupIndex = members.findIndex(
        (m, idx) => idx !== index && (m.serialNo || '').trim() === val
      );
      if (localDupIndex !== -1) {
        const otherName = members[localDupIndex].fullName || `Member #${localDupIndex + 1}`;
        setDuplicateWarnings((prev) => ({
          ...prev,
          [key]: `Duplicate Serial No: Already entered above for "${otherName}"`,
        }));
        return;
      }
    }

    // 2. Query backend for database duplicates
    try {
      const params = {};
      if (field === 'voterId') params.voterId = val;
      if (field === 'serialNo') {
        params.serialNo = val;
        params.wardId = wardId;
      }

      const res = await api.get('/members/check-duplicate', { params });
      if (res.data.success) {
        const { voterIdDuplicate, serialNoDuplicate } = res.data.data;
        if (field === 'voterId' && voterIdDuplicate) {
          setDuplicateWarnings((prev) => ({
            ...prev,
            [key]: `Duplicate Voter ID found: Already registered to ${voterIdDuplicate.fullName} (${voterIdDuplicate.wardCode || 'Ward'})`,
          }));
          return;
        }
        if (field === 'serialNo' && serialNoDuplicate) {
          setDuplicateWarnings((prev) => ({
            ...prev,
            [key]: `Serial No "${val}" already assigned to ${serialNoDuplicate.fullName} in this ward`,
          }));
          return;
        }

        // Clear warning if valid
        setDuplicateWarnings((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    } catch (err) {
      console.error('Error checking duplicate:', err);
    }
  };

  const updateMemberField = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    if (index === 0 && field === 'fullName') {
      setHeadOfFamilyName(value);
    }
    setMembers(updated);

    if (field === 'voterId' || field === 'serialNo') {
      checkFieldDuplicate(index, field, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!headOfFamilyName.trim()) {
      setError('Head of family name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!houseNo.trim()) {
      setError('House / Flat number is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          doorNo: m.doorNo || houseNo,
          age: m.age ? Number(m.age) : undefined,
          politicalParty: m.politicalParty || undefined,
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-28 lg:pb-8">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/families"
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 shadow-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('familyForm.title')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('familyForm.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section A: Household & Ward Address */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              {t('familyForm.sectionA')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.wardAssignment')} *</label>
              <div className="relative">
                <select
                  required
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.wardCode} — {w.wardName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.headOfFamily')} *</label>
              <input
                type="text"
                required
                value={headOfFamilyName}
                onChange={(e) => handleHeadNameChange(e.target.value)}
                placeholder="Full Name of Primary Contact"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.familyLabel')}</label>
              <input
                type="text"
                value={familyLabel}
                onChange={(e) => setFamilyLabel(e.target.value)}
                placeholder="e.g. Verma Residence"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.houseNo')} *</label>
              <input
                type="text"
                required
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="e.g. 12-A"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.street')}</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street / Lane"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.locality')}</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.landmark')}</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Water Tank"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.contactPhone')}</label>
              <input
                type="tel"
                inputMode="numeric"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t('familyForm.verificationStatus')}</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-emerald-800 appearance-none"
                >
                  <option value="complete">{t('common.complete')}</option>
                  <option value="incomplete">{t('common.incomplete')}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: All Retrieved Electoral Fields inside Touch Member Cards */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                {t('familyForm.sectionB')} ({members.length})
              </h2>
            </div>

            <ThemeButton
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={addMemberCard}
              className="self-start sm:self-auto w-full sm:w-auto"
            >
              {t('familyForm.addMemberCard')}
            </ThemeButton>
          </div>

          <div className="space-y-4">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xs space-y-4 relative hover:border-emerald-300 transition-all"
              >
                {/* Member Card Header */}
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                      {member.relationship === 'head' ? t('familyForm.headBadge') : `${t('familyForm.memberNumber')} #${idx + 1}`}
                    </span>
                  </div>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMemberCard(idx)}
                      title="Remove member"
                      className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('common.remove')}</span>
                    </button>
                  )}
                </div>

                {/* Form fields in clean, responsive tiers */}
                <div className="space-y-3.5 text-xs">
                  {/* Tier 1: Electoral Registration Indices */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Booth No / வாக்குச்சாவடி
                      </label>
                      <input
                        type="text"
                        value={member.boothNo}
                        onChange={(e) => updateMemberField(idx, 'boothNo', e.target.value)}
                        placeholder="e.g. Booth 01"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Serial No / வரிசை எண்
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={member.serialNo}
                        onChange={(e) => updateMemberField(idx, 'serialNo', e.target.value)}
                        placeholder="e.g. 104"
                        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-hidden font-bold ${
                          duplicateWarnings[`${idx}_serialNo`]
                            ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                            : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {duplicateWarnings[`${idx}_serialNo`] && (
                        <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{duplicateWarnings[`${idx}_serialNo`]}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Voter ID (EPIC) / வாக்காளர் எண்
                      </label>
                      <input
                        type="text"
                        value={member.voterId}
                        onChange={(e) => updateMemberField(idx, 'voterId', e.target.value.toUpperCase())}
                        placeholder="e.g. ABC1234567"
                        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-hidden font-mono font-bold uppercase ${
                          duplicateWarnings[`${idx}_voterId`]
                            ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                            : 'border-slate-200 text-emerald-800 focus:border-emerald-500'
                        }`}
                      />
                      {duplicateWarnings[`${idx}_voterId`] && (
                        <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{duplicateWarnings[`${idx}_voterId`]}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Relationship / உறவு முறை
                      </label>
                      <div className="relative">
                        <select
                          value={member.relationship}
                          onChange={(e) => updateMemberField(idx, 'relationship', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                        >
                          <option value="head">{t('familyForm.rel_head')}</option>
                          <option value="spouse">{t('familyForm.rel_spouse')}</option>
                          <option value="son">{t('familyForm.rel_son')}</option>
                          <option value="daughter">{t('familyForm.rel_daughter')}</option>
                          <option value="father">{t('familyForm.rel_father')}</option>
                          <option value="mother">{t('familyForm.rel_mother')}</option>
                          <option value="brother">{t('familyForm.rel_brother')}</option>
                          <option value="sister">{t('familyForm.rel_sister')}</option>
                          <option value="grandfather">{t('familyForm.rel_grandfather')}</option>
                          <option value="grandmother">{t('familyForm.rel_grandmother')}</option>
                          <option value="other">{t('familyForm.rel_other')}</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: Identity & Household */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        {t('familyForm.fullName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.fullName}
                        onChange={(e) => updateMemberField(idx, 'fullName', e.target.value)}
                        placeholder="Full Legal Name"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Father / Husband Name / தந்தை/கணவர்
                      </label>
                      <input
                        type="text"
                        value={member.fatherOrHusbandName}
                        onChange={(e) => updateMemberField(idx, 'fatherOrHusbandName', e.target.value)}
                        placeholder="Guardian / Spouse Name"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Door No / கதவு எண்
                      </label>
                      <input
                        type="text"
                        value={member.doorNo}
                        onChange={(e) => updateMemberField(idx, 'doorNo', e.target.value)}
                        placeholder={houseNo || 'Door #'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Tier 3: Demographics, Religion & Party Affiliation */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        {t('familyForm.age')}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="125"
                        value={member.age}
                        onChange={(e) => updateMemberField(idx, 'age', e.target.value)}
                        placeholder="Age"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        {t('familyForm.gender')}
                      </label>
                      <div className="relative">
                        <select
                          value={member.gender}
                          onChange={(e) => updateMemberField(idx, 'gender', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium capitalize appearance-none"
                        >
                          <option value="male">{t('common.male')}</option>
                          <option value="female">{t('common.female')}</option>
                          <option value="other">{t('common.other')}</option>
                          <option value="unspecified">{t('common.unspecified')}</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Religion / மதம்
                      </label>
                      <div className="relative">
                        <select
                          value={member.religion}
                          onChange={(e) => updateMemberField(idx, 'religion', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium appearance-none"
                        >
                          {religionsList.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        {t('familyForm.partyAffiliation')}
                      </label>
                      <div className="relative">
                        <select
                          value={member.politicalParty || ''}
                          onChange={(e) => updateMemberField(idx, 'politicalParty', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold text-emerald-900 appearance-none"
                        >
                          <option value="">{t('familyForm.noneNeutral')}</option>
                          {parties.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.partyCode} — {p.partyName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        {t('familyForm.contactPhone')}
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={member.mobilePhone}
                        onChange={(e) => updateMemberField(idx, 'mobilePhone', e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Tier 4: Residence Status (IN / OUT - Living in Ward vs Living Abroad / NRI) */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                        Residence Status / குடியிருப்பு நிலை
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateMemberField(idx, 'residenceStatus', 'in');
                            updateMemberField(idx, 'foreignCountry', '');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            member.residenceStatus === 'in' || !member.residenceStatus
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${member.residenceStatus === 'in' || !member.residenceStatus ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                          <span>Local (IN) / உள்ளூர்</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateMemberField(idx, 'residenceStatus', 'out')}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            member.residenceStatus === 'out'
                              ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${member.residenceStatus === 'out' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                          <span>Abroad (OUT) / வெளிநாடு</span>
                        </button>
                      </div>
                    </div>

                    {member.residenceStatus === 'out' && (
                      <div className="sm:col-span-7 animate-in fade-in slide-in-from-left-2 duration-150">
                        <label className="block text-[10px] uppercase font-bold text-amber-800 mb-1">
                          Foreign Country / City (வெளிநாட்டு பெயர்) *
                        </label>
                        <input
                          type="text"
                          value={member.foreignCountry || ''}
                          onChange={(e) => updateMemberField(idx, 'foreignCountry', e.target.value)}
                          placeholder="e.g. Dubai, UAE / Singapore / London, UK / USA / Malaysia"
                          className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-bold text-amber-950 placeholder:text-amber-700/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMemberCard}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('familyForm.addAnotherMember')}</span>
          </button>
        </div>

        {/* Desktop Save Controls */}
        <div className="hidden lg:flex items-center justify-end gap-3 pt-2">
          <Link
            to="/families"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            {t('common.cancel')}
          </Link>
          <ThemeButton
            type="submit"
            disabled={loading}
            variant="gradient"
            size="md"
            icon={Save}
          >
            {loading ? t('common.saving') : t('familyForm.saveFamilyClose')}
          </ThemeButton>
        </div>

        {/* MOBILE STICKY BOTTOM ACTION BAR (Thumb-Accessible) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 flex items-center gap-2">
          <Link
            to="/families"
            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold shrink-0"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t('common.saving') : t('familyForm.saveFamilyClose')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;
