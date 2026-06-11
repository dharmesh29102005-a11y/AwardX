import React from 'react';
import { Modal } from '../Modal';
import { Submission, JudgingCriterion } from '../../services/models';
import { JudgeScoresOverviewPanel } from './JudgeScoresOverviewPanel';

interface JudgeScoresOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  criteria: JudgingCriterion[];
  focusJudgeId?: string;
  focusJudgeName?: string;
  submissions: Submission[];
  onOpenSubmission: (submission: Submission, submissionJudgeId: string) => void;
  judgeOnly?: boolean;
}

export const JudgeScoresOverviewModal: React.FC<JudgeScoresOverviewModalProps> = ({
  isOpen,
  onClose,
  programId,
  focusJudgeId,
  focusJudgeName,
  submissions,
  onOpenSubmission,
  judgeOnly = false,
}) => {
  const title = judgeOnly
    ? focusJudgeName
      ? `${focusJudgeName} · Scoring`
      : 'Your Scoring'
    : focusJudgeName
      ? `Scoring · ${focusJudgeName}`
      : 'Scoring by Round';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="full">
      <JudgeScoresOverviewPanel
        programId={programId}
        submissions={submissions}
        focusJudgeId={focusJudgeId}
        focusJudgeName={focusJudgeName}
        onOpenSubmission={onOpenSubmission}
        judgeOnly={judgeOnly}
        enabled={isOpen}
      />
    </Modal>
  );
};
