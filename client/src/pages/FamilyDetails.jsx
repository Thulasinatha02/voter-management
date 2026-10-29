import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Plus,
  Flag,
  UserCheck,
  ShieldCheck,
  X,
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

  const handleOpenAddModal = () => {
    setNewMember({
      boothNo: members[0]?.boothNo || 'Booth 01',
      serialNo: '',
      fullName: '',
      voterId: '',
      fatherOrHusbandName: family?.headOfFamilyName || '',
      doorNo: family?.houseNo || '',
      gender: 'male',
      age: '',
      religion: members[0]?.religion || 'Hindu',
      politicalParty: members[0]?.politicalParty?._id || '',
      relationship: 'son',
      mobilePhone: family?.contactPhone || '',
      occupation: '',
      status: 'complete',
    });
    setIsAddMemberOpen(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.fullName.trim()) return;

    try {
      await api.post('/members', {
        ...newMember,
        familyId: family._id,
        wardId: family.wardId?._id || family.wardId,
        boothNo: newMember.boothNo || members[0]?.boothNo || 'Booth 01',
        serialNo: newMember.serialNo || '',
        voterId: newMember.voterId ? newMember.voterId.toUpperCase() : '',
        doorNo: newMember.doorNo || family.houseNo,
        age: newMember.age ? Number(newMember.age) : undefined,
        politicalParty: newMember.politicalParty ? newMember.politicalParty : null,
      });
      setIsAddMemberOpen(false);
      fetchFamily();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  if (loading || !family) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading family details...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/families"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {family.familyCode}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {family.wardId?.wardCode} — {family.wardId?.wardName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {family.headOfFamilyName}'s Household
            </h1>
          </div>
        </div>

        <ThemeButton
          variant="gradient"
          size="md"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          Add Member
        </ThemeButton>
      </div>

      {/* Household Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
          Household & Address Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Head of Family</span>
            <span className="font-bold text-slate-900 text-sm">{family.headOfFamilyName}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Address</span>
            <span className="font-semibold text-slate-800">
              House #{family.houseNo}, {family.street || ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Locality / Sector</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {family.locality || 'Civil Lines'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Contact Phone</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {family.contactPhone || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registered Family Members ({members.length})
            </h2>
          </div>
        </div>

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
                <th className="py-3 px-3">Relationship</th>
                <th className="py-3 px-2 text-center">Gender / Age</th>
                <th className="py-3 px-3">Religion</th>
                <th className="py-3 px-3">Political Party</th>
                <th className="py-3 px-3 text-center">Voter Franchise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
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
                    {m.doorNo || family.houseNo}
                  </td>
                  <td className="py-3.5 px-3 capitalize text-slate-700">
                    {m.relationship === 'head' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        Head
                      </span>
                    ) : (
                      m.relationship
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
                  <td className="py-3.5 px-3 font-medium">
                    {m.politicalParty ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
                        {m.politicalParty.partyCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Independent</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {m.isVoterEligible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Eligible (18+)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Minor (&lt;18)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Add Member to Household</h2>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Booth No</label>
                  <input
                    type="text"
                    value={newMember.boothNo}
                    onChange={(e) => setNewMember({ ...newMember, boothNo: e.target.value })}
                    placeholder="e.g. Booth 01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium text-center"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Booth Sl No</label>
                  <input
                    type="text"
                    value={newMember.serialNo}
                    onChange={(e) => setNewMember({ ...newMember, serialNo: e.target.value })}
                    placeholder="e.g. 104"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-center text-emerald-800"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">Name of Voter *</label>
                  <input
                    type="text"
                    required
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voter ID (EPIC No)</label>
                  <input
                    type="text"
                    value={newMember.voterId}
                    onChange={(e) => setNewMember({ ...newMember, voterId: e.target.value.toUpperCase() })}
                    placeholder="e.g. TN/01/123/00456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    value={newMember.fatherOrHusbandName}
                    onChange={(e) => setNewMember({ ...newMember, fatherOrHusbandName: e.target.value })}
                    placeholder="Guardian Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Door No</label>
                  <input
                    type="text"
                    value={newMember.doorNo}
                    onChange={(e) => setNewMember({ ...newMember, doorNo: e.target.value })}
                    placeholder={family.houseNo || 'Door #'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="Age"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Unspecified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Religion</label>
                  <select
                    value={newMember.religion}
                    onChange={(e) => setNewMember({ ...newMember, religion: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                  >
                    {religionsList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Political Party</label>
                  <select
                    value={newMember.politicalParty}
                    onChange={(e) => setNewMember({ ...newMember, politicalParty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold text-emerald-900"
                  >
                    <option value="">None / Independent</option>
                    {parties.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.partyCode} — {p.partyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
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
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newMember.mobilePhone}
                    onChange={(e) => setNewMember({ ...newMember, mobilePhone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <ThemeButton type="submit" variant="gradient" size="md">
                  Save Member
                </ThemeButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDetails;
