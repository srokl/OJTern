import React from 'react';
import { FileText, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export const DocumentViewer = ({
  document,
  studentName = 'Student Applicant',
  program = 'BSIT',
  isCompact = false,
}) => {
  if (!document || !document.fileName) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-amber-50/60 border border-amber-200 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
        <h4 className="font-semibold text-slate-800">Missing Endorsement Document</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          No endorsement letter is attached to this application. Per Business Rule BR-01, this application cannot be approved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Document Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="font-mono-tabular font-medium truncate max-w-[260px]">
            {document.fileName}
          </span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
            {document.fileSize || '380 KB'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <CheckCircle className="w-3.5 h-3.5" /> PDF Verified
          </span>
        </div>
      </div>

      {/* Simulated Document Preview Canvas */}
      <div className={`p-6 bg-slate-100 flex justify-center ${isCompact ? 'max-h-72 overflow-y-auto' : 'min-h-[420px]'}`}>
        <div className="w-full max-w-lg bg-white border border-slate-300 shadow-md p-6 rounded text-slate-800 text-xs flex flex-col justify-between">
          <div>
            {/* University Letterhead */}
            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Republic of the Philippines • College of Computing Studies
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-1">
                OFFICE OF ON-THE-JOB TRAINING & INDUSTRY LINKAGES
              </h3>
              <p className="text-[11px] text-slate-500 italic">
                Official Student Endorsement Letter & Training Agreement
              </p>
            </div>

            {/* Document Body */}
            <div className="space-y-3 text-slate-700 leading-relaxed font-sans">
              <div className="font-mono-tabular text-[11px] text-slate-500">
                Date: {new Date(document.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <p>
                <strong>TO WHOM IT MAY CONCERN:</strong>
              </p>

              <p>
                This certifies that <strong>{studentName}</strong>, a bona fide student enrolled in the{' '}
                <strong>{program}</strong> program, has completed all academic prerequisites and is officially endorsed to render{' '}
                <strong>486 / 600 hours</strong> of supervised industry on-the-job training.
              </p>

              <p className="text-slate-600">
                The university ensures that the student has undergone orientation regarding institutional data privacy, company confidentiality, and professional workplace conduct.
              </p>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
                <strong>Institutional Verification Stamp:</strong> Validated for Semester AY 2026-2027.
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 mt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-serif italic text-slate-700 text-sm h-6">Mohamed Mogib Elkordy</div>
              <div className="border-t border-slate-300 pt-1 font-semibold text-[10px]">
                Prof. Mohamed Mogib Elkordy
              </div>
              <div className="text-[9px] text-slate-500">OJT Coordinator</div>
            </div>
            <div>
              <div className="font-serif italic text-slate-700 text-sm h-6">Dr. Naethan Trinidad</div>
              <div className="border-t border-slate-300 pt-1 font-semibold text-[10px]">
                Dr. Naethan Trinidad
              </div>
              <div className="text-[9px] text-slate-500">Dean / School Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
