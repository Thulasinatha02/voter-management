import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  MapPin,
  Users,
  Home,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeButton from '../components/common/ThemeButton';
import ThemeStatCard from '../components/common/ThemeStatCard';

const Reports = () => {
  const { selectedWard } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    if (!selectedWard) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/ward/${selectedWard._id}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedWard]);

  const handleDownloadCsv = async () => {
    if (!selectedWard) return;
    setExporting(true);
    try {
      const res = await api.get(`/reports/ward/${selectedWard._id}/export-csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ward_${selectedWard.wardCode}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV export.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !report) {
    return <div className="py-20 text-center text-xs text-slate-400 font-semibold">Compiling official ward report...</div>;
  }

  const summary = report?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
              {selectedWard?.wardCode}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Statutory Governance Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Ward Administrative Report</h1>
          <p className="text-xs text-slate-500">
            Neutral demographic aggregates and verification records for {selectedWard?.wardName}
          </p>
        </div>

        <ThemeButton
          onClick={handleDownloadCsv}
          disabled={exporting}
          variant="gradient"
          size="md"
          icon={Download}
        >
          {exporting ? 'Generating CSV...' : 'Export Ward CSV'}
        </ThemeButton>
      </div>

      {/* Summary KPI Cards with Green Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThemeStatCard
          title="Households"
          value={summary.totalFamilies || 0}
          unit="units"
          icon={Home}
          accentColor="emerald"
          footerLabel="Verified Complete"
          footerValue={`${summary.completeFamilies || 0} households`}
        />

        <ThemeStatCard
          title="Total Residents"
          value={summary.totalMembers || 0}
          unit="residents"
          icon={Users}
          accentColor="teal"
          footerLabel="Scope"
          footerValue="Full ward registry"
        />

        <ThemeStatCard
          title="Voter Franchise (18+)"
          value={summary.voterEligibleMembers || 0}
          unit="citizens"
          icon={CheckCircle}
          accentColor="emerald"
          footerLabel="Adult Voters"
          footerValue="Electorally eligible"
        />

        <ThemeStatCard
          title="Completion Rate"
          value={`${summary.completionRate || 0}%`}
          unit=""
          icon={CheckCircle}
          accentColor="emerald"
          footerLabel="Verification Status"
          footerValue="Administrative certified"
        />
      </div>

      {/* Locality Aggregations */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500" />

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          Locality Concentration Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Locality / Colony</th>
                <th className="py-2.5 px-3 text-right">Families Count</th>
                <th className="py-2.5 px-3 text-right">Member Population</th>
                <th className="py-2.5 px-3 text-right">Average Household Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.localities?.map((loc, i) => (
                <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{loc._id}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-700">
                    {loc.familyCount}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 font-semibold">
                    {loc.memberCount}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600">
                    {loc.familyCount ? (loc.memberCount / loc.familyCount).toFixed(1) : 0} members
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
