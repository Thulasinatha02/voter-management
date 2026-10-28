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
  Edit2,
  Trash2,
  UserCheck,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../services/api';

const FamilyDetails = () => {
  const { id } = useParams();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    gender: 'male',
    age: '',
    relationship: 'son',
    mobilePhone: '',
    occupation: '',
    education: '',
    status: 'complete',
  });

  const fetchFamily = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/families/${id}`);
      if (res.data.success) {
        setFamily(res.data.data.family);
        setMembers(res.data.data.members);
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.fullName.trim()) return;

    try {
      await api.post('/members', {
        ...newMember,
        familyId: family._id,
        wardId: family.wardId?._id || family.wardId,
        age: newMember.age ? Number(newMember.age) : undefined,
      });
      setIsAddMemberOpen(false);
      setNewMember({
        fullName: '',
        gender: 'male',
        age: '',
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
    return <div className="py-20 text-center text-xs text-slate-400">Loading family details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/families"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {family.familyCode}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {family.wardId?.wardCode} — {family.wardId?.wardName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {family.headOfFamilyName}'s Household
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Household Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          Household & Address Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Head of Family</span>
            <span className="font-bold text-slate-800 text-sm">{family.headOfFamilyName}</span>
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
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {family.locality || 'Civil Lines'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Contact Phone</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {family.contactPhone || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Members Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registered Family Members ({members.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Member Code</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-center">Age</th>
                <th className="py-3 px-4 text-center">Voter Eligibility</th>
                <th className="py-3 px-4">Occupation</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {m.memberCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {m.fullName}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-700">
                    {m.relationship === 'head' ? (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                        Head of Family
                      </span>
                    ) : (
                      m.relationship
                    )}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-600">
                    {m.gender}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                    {m.age ?? '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {m.isVoterEligible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Eligible (18+)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Minor (&lt;18)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {m.occupation || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Complete
                    </span>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Member to Household</h2>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
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
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
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
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    placeholder="e.g. Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-semibold shadow-xs"
                >
                  Save Member
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
