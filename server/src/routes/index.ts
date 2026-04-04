import { Router } from 'express';
import authRouter from './auth.js';
import organizationsRouter from './organizations.js';
import overviewPageRouter from './overviewPage.js';
import programsRouter from './programs.js';
import scheduleRoundsRouter from './scheduleRounds.js';
import roundExecutionRouter from './roundExecution.js';
import judgeAssignmentRouter from './judgeAssignment.js';
import publicVotingRouter from './publicVoting.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationsRouter);
router.use('/overview', overviewPageRouter);
router.use('/programs', programsRouter);
router.use('/schedule-rounds', scheduleRoundsRouter);
router.use('/execution', roundExecutionRouter);
router.use('/judge-assignment', judgeAssignmentRouter);
router.use('/voting', publicVotingRouter);

export default router;
