import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Home,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import ThemeStatCard from '../components/common/ThemeStatCard';
import ThemeButton from '../components/common/ThemeButton';
import ThemeCard from '../components/common/ThemeCard';

const Dashboard = () => {
  const { selectedWard } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    if (!selectedWard) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/dashboard/summary?wardId=${selectedWard._id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedWard]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-xs font-semibold">Retrieving ward metrics from database...</p>
      </div>
    );
  }

  const totals = data?.totals || {
    families: 0,
    members: 0,
    completeFamilies: 0,
    incompleteFamilies: 0,
    eligibleVoters: 0,
    minors: 0,
    completionRate: 0,
    avgFamilySize: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Lush Gradient Green Accent */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200 shadow-xs">
              {selectedWard?.wardCode || 'NO WARD SELECTED'}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">
              Zone: {selectedWard?.zone || 'Metro Central'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {selectedWard?.wardName || 'Ward Overview'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sector Locality: <span className="font-semibold text-slate-700">{selectedWard?.locality || 'All sectors covered'}</span> | Estimated Pop: <span className="font-semibold text-slate-700">{selectedWard?.totalPopulationEstimate?.toLocaleString() || 'N/A'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchSummary}
            title="Refresh statistics"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 hover:border-emerald-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <Link to="/families/new">
            <ThemeButton variant="gradient" size="md" icon={PlusCircle}>
              Register New Family
            </ThemeButton>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* 4 Reusable Metric KPI Cards with Gradient Green Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThemeStatCard
          title="Total Families"
          value={totals.families}
          unit="households"
          icon={Home}
          accentColor="emerald"
          footerLabel="Avg Family Size"
          footerValue={`${totals.avgFamilySize} members`}
        />

        <ThemeStatCard
          title="Total Residents"
          value={totals.members}
          unit="enumerated"
          icon={Users}
          accentColor="teal"
          footerLabel="Eligible Voters (18+)"
          footerValue={totals.eligibleVoters}
        />

        <ThemeStatCard
          title="Complete Families"
          value={totals.completeFamilies}
          unit="verified"
          badgeText={`${totals.completionRate}% complete`}
          badgeType="success"
          icon={CheckCircle}
          accentColor="emerald"
          footerLabel="Status"
          footerValue="Verified Complete"
        />

        <ThemeStatCard
          title="Incomplete Records"
          value={totals.incompleteFamilies}
          unit="pending"
          icon={AlertTriangle}
          accentColor="amber"
          footerLabel="Action Needed"
          footerValue="Requires follow-up"
        />
      </div>

      {/* Middle Grid: Locality Breakdown & Gender Demographic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locality Distribution Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 to-teal-400/80" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Locality & Sector Density</h2>
              <p className="text-xs text-slate-500">Aggregated household concentration across {selectedWard?.wardName}</p>
            </div>
            <Link to="/families" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View Directory →
            </Link>
          </div>

          {data?.localityStats?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No locality data recorded yet for this ward.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Locality / Sector</th>
                    <th className="py-2.5 px-3 text-right">Families</th>
                    <th className="py-2.5 px-3 text-right">Total Residents</th>
                    <th className="py-2.5 px-3 text-right">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.localityStats?.map((loc, i) => {
                    const pct = totals.families ? Math.round((loc.families / totals.families) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{loc.locality}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-700">
                          {loc.families}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 font-semibold">
                          {loc.members}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-slate-500 font-medium w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aggregate Demographic Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 to-teal-400/80" />

          <div>
            <h2 className="text-base font-extrabold text-slate-900">Demographic Distribution</h2>
            <p className="text-xs text-slate-500 mb-5">Neutral aggregate indicators for administrative planning</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-semibold">Male</span>
                  <span className="font-extrabold text-slate-800">{data?.genderDistribution?.male || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{
                      width: `${totals.members ? Math.round(((data?.genderDistribution?.male || 0) / totals.members) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-semibold">Female</span>
                  <span className="font-extrabold text-slate-800">{data?.genderDistribution?.female || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                    style={{
                      width: `${totals.members ? Math.round(((data?.genderDistribution?.female || 0) / totals.members) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-semibold">Other / Unspecified</span>
                  <span className="font-extrabold text-slate-800">{data?.genderDistribution?.other || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${totals.members ? Math.round(((data?.genderDistribution?.other || 0) / totals.members) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Statutory Compliance Enforced</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Religion and political party affiliations are excluded from voter lists to preserve neutral democratic integrity.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Eligible Adult Voters (18+):</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg border border-emerald-200">
              {totals.eligibleVoters} / {totals.members}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 opacity-60" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Recent Administrative Logs</h2>
          </div>
          <Link to="/audit-logs" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
            View All Logs →
          </Link>
        </div>

        {data?.recentActivity?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No recent activity recorded.</p>
        ) : (
          <div className="space-y-3">
            {data?.recentActivity?.map((act) => (
              <div
                key={act._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-800">{act.username}</span>
                    <span className="text-slate-500"> performed </span>
                    <span className="font-bold text-emerald-700">{act.action}</span>
                    <span className="text-slate-500"> on </span>
                    <span className="font-semibold text-slate-700">{act.entityType}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
