Build a Multi-Form Competition Management System
You are building a full-stack competition management platform. The system must support the following core modules working together seamlessly:

1. Form Management

The platform supports multiple forms (e.g., nomination forms, registration forms, feedback forms).
The admin can create, configure, and select which form is active for a given competition.
The selected form is used to collect nominations/entries from participants.
All collected nominations are stored and linked to the competition they belong to.


2. Schedule & Rounds

Each competition has a configurable schedule made up of multiple rounds (e.g., Screening, Judging, Public Voting, Finals).
Each round has a type that determines its behavior:

Judging Round → Assigned judges can log in and submit scores/evaluations for nominations in their queue.
Public Voting Round → Voting is open to the public; each voter can cast votes based on rules set by the admin.
Screening Round → Admin or designated reviewers shortlist nominations.


Nominations collected via the active form automatically flow into the round pipeline based on the schedule.


3. Judge Assignment
The admin has full control over how judges are assigned to nominations. Options include:

Auto Assignment – Random: Nominations are randomly distributed among available judges.
Auto Assignment – Segmented: Nominations are distributed based on defined segments (e.g., category, region, language) so each judge receives nominations relevant to their expertise.
Manual Assignment: The admin manually assigns specific judges to specific nominations from a management interface.


4. Public Voting

When a round is of type Public Voting, a public-facing voting interface is activated.
Voters can browse nominations and cast votes.
The admin controls:

Voting window (start and end time)
Vote limits per user (e.g., one vote per nomination, or N votes total)
Whether voter authentication is required


Results are tracked in real time and visible to the admin.


5. Admin Control Panel
The admin has centralized control over all modules:

Activate/deactivate forms
View and manage all collected nominations
Configure rounds and the schedule timeline
Choose and execute judge assignment strategies
Enable/disable public voting per round
Monitor live progress across all rounds
Override or adjust any assignment or vote at any point


Key Principles

All modules (form → nominations → schedule → rounds → judging/voting) must be connected in a single data pipeline.
No round should be able to proceed without nominations being collected first.
Role-based access: Admins see everything, Judges see only their assigned nominations, Public users see only the voting interface when it is open.
Every action by a judge or voter is logged and auditable by the admin.

6. Dynamic Rounds & Participant Advancement
Rounds are fully dynamic — the admin can create, reorder, rename, and configure any number of rounds for a competition. No round structure is hardcoded.

Round Configuration
Each round is configured with:

Name (e.g., Screening, Semi-Finals, Judging, Public Vote, Finals)
Type (Judging / Public Voting / Screening / Custom)
Start & End Date/Time
Advancement Criteria — the rules that determine which participants move to the next round


Advancement Criteria Options
The admin defines how participants qualify to advance:

Top N — top N participants by score/votes advance
Top N% — top percentage of participants advance
Score Threshold — participants who meet or exceed a defined minimum score advance
Manual Selection — admin handpicks who advances regardless of scores
All Pass — everyone in the round advances (useful for screening rounds with no eliminations)


Advancement Trigger
Once criteria are defined, advancement can be triggered in two ways:

Manual Trigger

Admin reviews the results and clicks "Advance Participants" from the control panel
Admin can preview who will advance before confirming
Admin can override individual participants (add or remove) before finalizing


Automatic Timer Trigger

When a round's end time is reached, the system automatically evaluates the advancement criteria
Participants who qualify are automatically moved to the next round
Admin receives a notification/log entry when this happens
Admin can still make overrides after the auto-trigger fires




Advancement Pipeline

Advancing participants are enrolled into the next round automatically
Their nomination data, scores, and history carry forward into the next round
Eliminated participants are marked as "Eliminated" with the round and reason recorded
The admin can see a full advancement history — who advanced, who was eliminated, which round, which trigger was used, and when


Edge Cases the System Must Handle

If a round ends and there are no scores/votes yet, auto-trigger should pause and alert the admin instead of advancing with empty data
If two participants are tied at the cutoff boundary, the admin is prompted to resolve the tie manually even in auto-trigger mode
A round cannot open unless the previous round has been finalized (advancement completed)