import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trophy, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonLoader } from '../SkeletonLoader';
import { EmptyState } from '../EmptyState';

interface VotingRound {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  applicant_name: string;
  votes_count: number;
  category?: string;
}

interface VotingConfig {
  votes_per_user: number;
  votes_per_submission: number;
  require_auth: boolean;
  show_results_publicly: boolean;
  show_leaderboard: boolean;
}

export const PublicVotingPage: React.FC = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [votedSubmissions, setVotedSubmissions] = useState<Set<string>>(new Set());
  const [totalVotes, setTotalVotes] = useState(0);

  // Fetch voting round details
  const { data: roundData, isLoading: roundLoading } = useQuery({
    queryKey: ['votingRound', roundId],
    queryFn: async () => {
      const res = await fetch(`/voting/${roundId}`);
      if (!res.ok) throw new Error('Round not found');
      return res.json();
    },
  });

  // Fetch leaderboard if enabled
  const { data: leaderboardData } = useQuery({
    queryKey: ['votingLeaderboard', roundId],
    queryFn: async () => {
      const res = await fetch(`/voting/${roundId}/leaderboard`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: roundData?.config?.show_leaderboard,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const res = await fetch(`/voting/${roundId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          email: userEmail || undefined,
          name: userName || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to vote');
      }
      return res.json();
    },
    onSuccess: (_, submissionId) => {
      setVotedSubmissions((prev) => new Set([...prev, submissionId]));
      setTotalVotes((prev) => prev + 1);
      toast.success('Vote cast successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to vote');
    },
  });

  if (roundLoading) return <SkeletonLoader />;
  if (!roundData) return <EmptyState icon={AlertCircle} title="Voting Round Not Found" description="The voting round you're looking for doesn't exist or has ended." />;

  const { round, config, submissions, program } = roundData.data || roundData;
  const isActive = round?.status === 'active';
  const canVote = isActive && totalVotes < (config?.votes_per_user || 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{round?.title || 'Voting'}</h1>
              <p className="text-slate-600 mt-1">{program?.title}</p>
              <p className="text-sm text-slate-500 mt-2">{round?.description}</p>
            </div>
            <div className="text-right">
              {isActive ? (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  Voting Open
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 font-semibold">
                  <Lock className="w-4 h-4" />
                  Voting Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info (if auth not required) */}
        {!config?.require_auth && isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900 mb-3 font-semibold">Optional: Tell us your name</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {submissions?.map((submission: Submission) => {
            const hasVoted = votedSubmissions.has(submission.id);
            const canVoteForThis = canVote && !hasVoted;

            return (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Image */}
                {submission.cover_image_url && (
                  <img src={submission.cover_image_url} alt={submission.title} className="w-full h-48 object-cover" />
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{submission.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{submission.applicant_name}</p>
                  </div>

                  {submission.description && <p className="text-sm text-slate-600 line-clamp-2">{submission.description}</p>}

                  {config?.show_results_publicly && (
                    <p className="text-sm font-semibold text-indigo-600">❤️ {submission.votes_count || 0} votes</p>
                  )}

                  {/* Vote Button */}
                  <button
                    onClick={() => voteMutation.mutate(submission.id)}
                    disabled={!canVoteForThis || voteMutation.isPending}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      hasVoted
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : canVote
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {hasVoted ? '✓ Voted' : canVote ? 'Vote' : `Votes limit reached`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        {leaderboardData && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboardData.data?.submissions?.map((sub: any, idx: number) => (
                <div key={sub.submission_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-slate-600 w-6 text-right">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{sub.title}</p>
                      <p className="text-xs text-slate-500">{sub.applicant_name}</p>
                    </div>
                  </div>
                  <p className="font-bold text-indigo-600">{sub.vote_count} votes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vote Stats */}
        {isActive && config?.votes_per_user && (
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <p className="text-sm text-indigo-900">
              You have <span className="font-bold">{Math.max(0, config.votes_per_user - totalVotes)}</span> vote(s) remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
