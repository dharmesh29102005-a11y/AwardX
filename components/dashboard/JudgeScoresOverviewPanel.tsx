import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, ChevronRight, Gavel, Layers } from 'lucide-react';
import { SkeletonLoader } from '../SkeletonLoader';
import { db } from '../../services/database';
import { Submission } from '../../services/models';
import { queryKeys } from '../../services/queryKeys';

export interface JudgeScoresOverviewPanelProps {
  programId: string;
  submissions: Submission[];
  focusJudgeId?: string;
  focusJudgeName?: string;
  onOpenSubmission: (submission: Submission, submissionJudgeId: string) => void;
  /** When true, only show the focused judge under each round (judge portal style). */
  judgeOnly?: boolean;
  enabled?: boolean;
}

type RoundScoresGroup = NonNullable<Awaited<ReturnType<typeof db.getJudgeScoresByRound>>[number]>;

const statusLabel = (status: string) => {
  if (status === 'completed') return 'Scored';
  if (status === 'declined') return 'Declined';
  return 'Pending';
};

const statusClass = (status: string) => {
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'declined') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
};

export const JudgeScoresOverviewPanel: React.FC<JudgeScoresOverviewPanelProps> = ({
  programId,
  submissions,
  focusJudgeId,
  focusJudgeName,
  onOpenSubmission,
  judgeOnly = false,
  enabled = true,
}) => {
  const focusRef = useRef<HTMLDivElement | null>(null);

  const { data: roundGroups = [], isLoading } = useQuery({
    queryKey: queryKeys.judging.scoresByRound(programId, judgeOnly ? focusJudgeId : undefined),
    queryFn: () => db.getJudgeScoresByRound(programId),
    enabled: enabled && !!programId,
    staleTime: 30_000,
  });

  const submissionById = useMemo(
    () => new Map(submissions.map((submission) => [submission.id, submission])),
    [submissions],
  );

  const visibleRoundGroups = useMemo(() => {
    return roundGroups
      .map((group) => {
        if (!group) return null;

        const judges = judgeOnly && focusJudgeId
          ? group.judges.filter((judge) => judge.id === focusJudgeId)
          : group.judges;

        if (judges.length === 0) return null;

        return { ...group, judges };
      })
      .filter(Boolean) as RoundScoresGroup[];
  }, [roundGroups, judgeOnly, focusJudgeId]);

  useEffect(() => {
    if (!enabled || !focusJudgeId || isLoading) return;
    const timer = window.setTimeout(() => {
      focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [enabled, focusJudgeId, isLoading, visibleRoundGroups.length]);

  const handleOpenAssignment = (
    assignment: RoundScoresGroup['judges'][number]['assignments'][number],
  ) => {
    const submission = submissionById.get(assignment.submissionId);
    if (!submission) return;
    onOpenSubmission(submission, assignment.submissionJudgeId);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {judgeOnly ? (
          <p>
            Your assigned submissions grouped by round
            {focusJudgeName ? ` for ${focusJudgeName}` : ''}. Open any entry to score it.
          </p>
        ) : (
          <p>
            Scoring progress by round — each section lists the judges assigned in that round and their entries
            {focusJudgeName ? ` (highlighting ${focusJudgeName}).` : '.'}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-28" />
          <SkeletonLoader className="h-28" />
          <SkeletonLoader className="h-28" />
        </div>
      ) : visibleRoundGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Gavel className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No scoring assignments yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Assign judges to submissions in a round to start tracking scores here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleRoundGroups.map((group) => (
            <section
              key={group.roundId}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-slate-900">{group.roundTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {group.roundType} · {group.roundStatus} · {group.judges.length} judge
                    {group.judges.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {group.judges.map((judge) => {
                  const isFocused = !!focusJudgeId && judge.id === focusJudgeId;

                  return (
                    <div
                      key={`${group.roundId}-${judge.id}`}
                      ref={isFocused ? focusRef : undefined}
                      className={`px-5 py-4 ${isFocused ? 'bg-indigo-50/60 ring-1 ring-inset ring-indigo-200' : ''}`}
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                            {judge.name?.charAt(0).toUpperCase() || 'J'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-slate-900">{judge.name}</p>
                              {isFocused && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-slate-500">{judge.email}</p>
                          </div>
                        </div>

                        <div className="min-w-[180px]">
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Progress</span>
                            <span>
                              {judge.completedCount}/{judge.assignedCount}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${
                                judge.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${judge.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {judge.assignments.length === 0 ? (
                        <p className="text-sm text-slate-500">No submissions assigned in this round.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                          {judge.assignments.map((assignment) => {
                            const completed = assignment.status === 'completed';

                            return (
                              <button
                                key={assignment.submissionJudgeId}
                                type="button"
                                onClick={() => handleOpenAssignment(assignment)}
                                disabled={!submissionById.has(assignment.submissionId)}
                                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <span
                                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusClass(
                                        assignment.status,
                                      )}`}
                                    >
                                      {completed ? (
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                      ) : (
                                        <Clock className="mr-1 h-3 w-3" />
                                      )}
                                      {statusLabel(assignment.status)}
                                    </span>
                                  </div>
                                  <p className="truncate font-medium text-slate-900">
                                    {assignment.submissionTitle}
                                  </p>
                                  {assignment.applicantName && (
                                    <p className="truncate text-xs text-slate-500">
                                      by {assignment.applicantName}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
