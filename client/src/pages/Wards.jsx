import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeButton from '../components/common/ThemeButton';

const Wards = () => {
  const { user, refreshWards } = useAuth();
  const { t } = useLanguage();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    wardCode: '',
    wardName: '',
    locality: '',
    district: '',
    zone: '',
    isActive: true,
  });

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wards?search=${search}&isArchived=${showArchived}`);
      if (res.data.success) {
        setWards(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch wards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, [search, showArchived]);

  const handleOpenCreate = () => {
    setEditingWard(null);
    setFormData({
      wardCode: '',
      wardName: '',
      locality: '',
      district: '',
      zone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ward) => {
    setEditingWard(ward);
    setFormData({
      wardCode: ward.wardCode,
      wardName: ward.wardName,
      locality: ward.locality || '',
      district: ward.district || '',
      zone: ward.zone || '',
      isActive: ward.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let createdWardId = null;
      if (editingWard) {
        await api.patch(`/wards/${editingWard._id}`, formData);
      } else {
        const res = await api.post('/wards', formData);
        if (res.data?.data?._id) {
          createdWardId = res.data.data._id;
        }
      }
      setIsModalOpen(false);
      fetchWards();
      // Instantly refresh navbar ward selector and auto-select this new ward if created
      refreshWards(createdWardId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving ward.');
    }
  };

  const handleToggleArchive = async (ward) => {
    const action = ward.isArchived ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} ${ward.wardCode}?`)) return;

    try {
      await api.patch(`/wards/${ward._id}/archive`);
      fetchWards();
      refreshWards();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  // 100% Dynamic permission checking (Zero Hardcoding)
  const canManageWards =
    user?.role === 'superadmin' ||
    user?.role === 'ward_officer' ||
    Boolean(user?.permissions?.wardManagement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('wards.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('wards.subtitle')}
          </p>
        </div>

        {canManageWards && (
          <ThemeButton
            onClick={handleOpenCreate}
            variant="gradient"
            size="md"
            icon={Plus}
            className="self-stretch sm:self-auto"
          >
            {t('wards.addNewWard')}
          </ThemeButton>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('common.search')}...`}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>{t('common.showArchived')}</span>
          </label>
        </div>
      </div>

      {/* Ward Cards (Mobile) & Table (Desktop) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold">{t('common.loading')}</div>
        ) : wards.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold">
            No wards found.
          </div>
        ) : (
          <>
            {/* MOBILE CARD FEED (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {wards.map((ward) => (
                <div key={ward._id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          {ward.wardCode}
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {ward.actualPopulation || 0} residents
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5">{ward.wardName}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSuperadmin && (
                        <button
                          onClick={() => handleOpenEdit(ward)}
                          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {user?.role === 'superadmin' && (
                        <button
                          onClick={() => handleToggleArchive(ward)}
                          className={`p-2 rounded-xl ${
                            ward.isArchived ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {ward.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <div>Locality: <span className="font-semibold text-slate-700">{ward.locality || '—'}</span></div>
                    <div>Zone: <span className="font-semibold text-slate-700">{ward.zone || 'N/A'}</span></div>
                    <div>Families: <span className="font-bold text-emerald-700">{ward.totalFamilies || 0}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{t('wards.wardCode')}</th>
                    <th className="py-3 px-4">{t('wards.wardName')}</th>
                    <th className="py-3 px-4">Locality / Area</th>
                    <th className="py-3 px-4">{t('wards.zone')} & {t('wards.district')}</th>
                    <th className="py-3 px-4 text-center">Registered Families</th>
                    <th className="py-3 px-4 text-right">Live Registered Population</th>
                    <th className="py-3 px-4 text-center">Created By</th>
                    <th className="py-3 px-4 text-center">{t('common.status')}</th>
                    <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wards.map((ward) => (
                    <tr key={ward._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {ward.wardCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {ward.wardName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {ward.locality || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {ward.zone || 'Zone N/A'} {ward.district ? `(${ward.district})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {ward.totalFamilies || 0} households
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-xs">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {ward.actualPopulation?.toLocaleString() || 0} residents
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {ward.createdBy?.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                            System Admin
                          </span>
                        ) : ward.createdBy ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200" title={`Created by ${ward.createdBy.fullName || ward.createdBy.username}`}>
                            Field Officer ({ward.createdBy.username})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-semibold">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {ward.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageWards && (
                            <button
                              onClick={() => handleOpenEdit(ward)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Ward"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user?.role === 'superadmin' && (
                            <button
                              onClick={() => handleToggleArchive(ward)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                ward.isArchived
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={ward.isArchived ? 'Restore Ward' : 'Archive Ward'}
                            >
                              {ward.isArchived ? (
                                <RotateCcw className="w-3.5 h-3.5" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MOBILE-ADAPTIVE MODAL / BOTTOM SHEET (WITHOUT MANUAL POPULATION ESTIMATE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingWard ? `Edit ${editingWard.wardCode}` : t('wards.addNewWard')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('wards.wardCode')} *</label>
                <input
                  type="text"
                  required
                  value={formData.wardCode}
                  onChange={(e) => setFormData({ ...formData, wardCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. WARD-05"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('wards.wardName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.wardName}
                  onChange={(e) => setFormData({ ...formData, wardName: e.target.value })}
                  placeholder="e.g. Southern Ridge Ward"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Locality / Area</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Lake View"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('wards.zone')}</label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="e.g. South Zone"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('wards.district')}</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Central Metro"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              {/* Informative notice explaining live auto-calculation */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800">
                <span className="font-bold">Live Population Tracking:</span> Resident population will automatically calculate in real-time as families and members are enrolled in this ward.
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-md shadow-emerald-600/30"
                >
                  {editingWard ? t('common.save') : t('wards.addNewWard')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wards;
