import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Calendar, User, Activity } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/audit-logs', {
        params: {
          page,
          limit: 15,
          action: actionFilter,
          entityType: entityFilter,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security & Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trails of administrative actions, modifications, and system exports
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="ARCHIVE">ARCHIVE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="EXPORT">EXPORT</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Entities</option>
          <option value="Family">Family</option>
          <option value="Member">Member</option>
          <option value="Ward">Ward</option>
          <option value="User">User</option>
          <option value="Report">Report</option>
        </select>

        <div className="ml-auto text-xs text-slate-500">
          Total Recorded Actions: <span className="font-semibold text-slate-800">{total}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No audit logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4 text-center">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Ward Scoped</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.username}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action === 'UPDATE'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : log.action === 'ARCHIVE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : log.action === 'EXPORT'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(-6)}` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {log.wardId ? `${log.wardId.wardCode} - ${log.wardId.wardName}` : 'Global'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
