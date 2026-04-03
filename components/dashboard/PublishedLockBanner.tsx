import React from 'react';
import { Lock, Globe } from 'lucide-react';
import { Program } from '../../services/models';
import { programStatusLabel } from '../../services/models';

interface PublishedLockBannerProps {
  program: Program;
  sectionName?: string;
  onUnpublish?: () => void;
}

export const PublishedLockBanner: React.FC<PublishedLockBannerProps> = ({
  program,
  sectionName = 'this section',
  onUnpublish,
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
      <Lock className="w-8 h-8 text-indigo-500" />
    </div>
    <div className="flex items-center gap-2 mb-3">
      <Globe className="w-4 h-4 text-green-600" />
      <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
        {programStatusLabel(program.status)}
      </span>
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-2">
      {sectionName} is locked
    </h2>
    <p className="text-slate-500 max-w-sm mb-8">
      This program is currently published. Editing {sectionName.toLowerCase()} is disabled while the program is live to protect active submissions.
    </p>
    {onUnpublish && (
      <button
        onClick={onUnpublish}
        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Unpublish to Edit
      </button>
    )}
  </div>
);
