import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Database, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System & Governance Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Data protection compliance, database integrity rules, and system configuration
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Statutory Non-Profiling Policy</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              In accordance with electoral administrative mandates, fields for religious preference and political party affiliation are prohibited from standard voter data capture and machine profiling. Aggregate reporting is restricted to authorized geographical and demographic enumeration.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit">
              <CheckCircle className="w-4 h-4" />
              <span>Neutral Enumeration Standard Enforced</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database & Soft-Deletion Architecture</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Records are maintained with soft-deletion and archiving flags to safeguard electoral audit integrity. Permanent record destruction requires multi-level authorization and is logged into the immutable audit collection.
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Authentication & Session Security</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              API communication is secured via JWT bearer tokens with role-based scoping (Superadmin, Ward Officer, Field Data Operator, Auditor). Rate limiting and helmet headers protect against automated abuse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
