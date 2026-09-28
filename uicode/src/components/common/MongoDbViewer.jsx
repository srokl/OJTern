import React, { useState } from 'react';
import { Database, Copy, Check, Layers, ExternalLink, ShieldCheck } from 'lucide-react';
import { useOJTStore } from '../../store/useOJTStore.js';

export const MongoDbViewer = () => {
  const store = useOJTStore();
  const [selectedCollection, setSelectedCollection] = useState('applications');
  const [copied, setCopied] = useState(false);

  const collections = {
    applications: {
      title: 'db.applications',
      count: store.applications.length,
      data: store.applications,
    },
    student_profiles: {
      title: 'db.student_profiles',
      count: store.studentProfiles.length,
      data: store.studentProfiles,
    },
    company_profiles: {
      title: 'db.company_profiles',
      count: store.companyProfiles.length,
      data: store.companyProfiles,
    },
    internship_postings: {
      title: 'db.internship_postings',
      count: store.postings.length,
      data: store.postings,
    },
    users: {
      title: 'db.users',
      count: store.users.length,
      data: store.users,
    },
    notifications: {
      title: 'db.notifications',
      count: store.notifications.length,
      data: store.notifications,
    },
  };

  const currentData = collections[selectedCollection]?.data || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-white shadow-md">
              <Database className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  MongoDB Atlas Document Collection Explorer
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live Atlas Cluster
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Cluster URI: <code className="text-emerald-400 font-mono">REDACTED_CLUSTER</code> • Database: <code className="text-emerald-400 font-mono">ojtern_db</code>
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy Collection JSON'}</span>
          </button>
        </div>
      </div>

      {/* Collection Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {Object.entries(collections).map(([key, col]) => (
          <button
            key={key}
            onClick={() => setSelectedCollection(key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedCollection === key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="font-mono">{col.title}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCollection === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {col.count}
            </span>
          </button>
        ))}
      </div>

      {/* Document View */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-200 font-mono text-xs">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-emerald-400 font-bold">
            {collections[selectedCollection]?.title} ({currentData.length} Documents)
          </span>
          <span className="text-[11px] text-slate-400">Indexed by _id</span>
        </div>

        <div className="p-4 max-h-[600px] overflow-y-auto">
          <pre className="text-emerald-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
