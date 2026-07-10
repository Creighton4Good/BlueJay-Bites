## BlueJay Bites Contribution Guidelines

This document is adapted from TeamNewPipe Contribution [Guidelines](https://github.com/TeamNewPipe/NewPipe?tab=contributing-ov-file), licensed under the GNU General Public License (GPLv3). This modified version (initial implementation: 6-10-26) is distributed under GPLv3. See full license [here](https://github.com/Creighton4Good/BlueJay-Bites/blob/main/docs/GPLv3.md).

## Code Contribution
### Guidelines
In particular do not bring non-free software (e.g. binary blobs) into the project. Make sure you do not introduce any closed-source library from Google.
New dependencies should be clearly relevant to the project, actively maintained, and open source.
Write comments that are concise and helpful. Prefer comments that explain why something is done when the intent is not obvious from the code.
Follow the existing code structure and naming conventions of the repository. Prioritize readability and consistency in method names, variable names, and file organization.
Propose basic Java conventions: camelCase for variables/methods, PascalCase for classes, JavaDoc on public methods, max ~120 chars per line. Doesn't need to be strict, just enough that the codebase stays consistent.
Use clear and descriptive commit messages that summarize the purpose of the change in approximately under 70 characters.
By contributing you agree that your contributions will be licensed under the licenses used in this project (MIT, GPLv3, etc)
### Before starting development
If you want to help out with an existing bug report or feature request, leave a comment on that issue saying you want to try your hand at it.
If there is no existing issue for what you want to work on, open a new one describing the changes you are planning to introduce. This gives the team and the community a chance to give feedback before you spend time on something that is already in development, should be done differently, or should be avoided completely.
Please show intention to maintain your features and code after you contribute a PR. Unmaintained code is a hassle for core developers. If you do not intend to maintain features you plan to contribute, please rethink your submission, or clearly state that in the PR description.
Create PRs that cover only one specific issue/solution/bug. Do not create PRs that are huge monoliths and could have been split into multiple independent contributions.

### Creating a Pull Request (PR)
Make changes on a separate branch with a meaningful name (such as update-user-roles or fix-map-flow), not on the master branch or the dev branch. This is commonly known as feature branch workflow. You may then send your changes as a pull request (PR) on GitHub.
Please test (compile and run) your code before submitting changes! Ideally, provide test feedback in the PR description. Untested code will not be merged!
Respond if someone requests changes or otherwise raises issues about your PRs.
Keep each PR focused on one issue or feature. Avoid large PRs that combine unrelated changes.
Make sure your PR is up-to-date with the rest of the code. Often, a simple click on "Update branch" will do the job, but if not, you must rebase your branch on the dev branch manually and resolve the conflicts on your own. You can find help [on the NewPipe wiki](https://github.com/TeamNewPipe/NewPipe/wiki/How-to-merge-a-PR). Doing this makes the maintainers' job way easier. View the PR template [here](https://github.com/Creighton4Good/BlueJay-Bites/blob/main/.github/pull_request_template.md).

## Issue reporting/feature requests
* Already reported? Browse the [existing issues](https://github.com/Creighton4Good/BlueJay-Bites/issues) to make sure your issue/feature hasn't been reported/requested.
* Already fixed? Check whether your issue/feature is already fixed/implemented.
* Still relevant? Check if the issue still exists in the latest release/beta version.
* Can you fix it? If you are an Android/Java developer, you are always welcome to fix an issue or implement a feature yourself. PRs welcome! See [Code contribution](https://github.com/Creighton4Good/BlueJay-Bites?tab=contributing-ov-file#code-contribution) for more info.
* Is it in English? Issues in other languages will be ignored unless someone translates them.
* Is it one issue? Multiple issues require multiple reports that can be linked to track their statuses.
* The template: Fill it out, everyone wins. Your issue has a chance of getting fixed.

### User Story Template

1. Create Stories:
Begin by creating user stories that clearly describe a user need and the value it provides. Stories should follow a consistent format (e.g., As a [user], I want [goal], so that [benefit]) and focus on user outcomes rather than technical implementation. Add labels help organize and sort stories. 
2. Add Acceptance Criteria:
Once the story is established, add acceptance criteria to specify what conditions must be met for the story to be considered complete. For example, for a story such as:
As a user, I want to receive notifications for new events so that I don’t miss opportunities.
Acceptance criteria might include:
·       User can enable/disable notifications
·       Notification is triggered when a new event is created
·       Notifications respect user preferences
These criteria provide a concrete foundation for implementation and ensure that all team members share a common understanding of success. See this example: https://github.com/Creighton4Good/BlueJay-Bites/issues/63
3. Break Stories into Tasks:
From there, the story is decomposed into smaller, actionable tasks that represent the actual development work required. For instance, this story could be broken into tasks such as:
·       Add a database field for notification preferences
·       Build a user interface toggle for enabling notifications
·       Implement backend logic to trigger notifications on event creation
·       Integrate a notification service (e.g., push or email)
·       Write tests to verify notification behavior
Each task should be specific, manageable, and directly tied to the acceptance criteria. In GitHub, tasks typically appear as issues or sub-issues linked to a parent user story, often using checklists or linked issues for tracking. The goal is to make each task assignable, trackable, and clearly connected to the story.
4. Estimate, Assign, and Schedule Work:
After tasks are identified, the team estimates the effort required for each one to assess feasibility and inform planning. This can be informal, but you should consider team skill sets and expected time to completion. Tasks are then assigned to individual team members to establish clear ownership and accountability.
With ownership in place, work is scheduled into a sprint or development cycle based on priority and team capacity. A practical approach is to pull one task at a time from the backlog and begin a new task only after the current one has moved into review.
Repeat - This process is iterative. Progress should be tracked continuously using GitHub to maintain visibility into task status and ensure steady movement from initial story to completed implementation. Pull requests should be linked to tasks associated with user stories. As work progresses, if new tasks or missing stories are identified, they should be created and/or existing issues can be updated to reflect the evolving state of the project. Additionally, if you realize there is replication or redundancy in stories and tasks, you can modify or close them as duplicates.
## Communication
You can use the GitHub Discussions Q/A Thread to ask/answer questions.

## AI Policy
Please refrain from contributions which are heavily dependent on AI generated source code because they are usually lacking a fundamental understanding of the overall project structure and thus come with poor quality. However, you are allowed to use gen. AI if you
* are aware of the project structure,
* ensure that the generated code follows the project structure,
* fully understand the generated code, and
* review the generated code completely.

Using AI to find the root cause of bugs and generating small fixes might be acceptable. However, gen. AI often does not fix the underlying problem but is trying to fix the symptoms. If you are using AI to fix bugs, ensure that the root cause is tackled.
The use of AI to generate documentation is allowed. We ask you to thoroughly check the quality of generated documentation – wrong, misleading or uninformative documentation is useless and wastes the reader's time. Ensure that reasoning is documented.
Using generative AI to write or fill in PR or issue templates is prohibited. Those texts are often lengthy and miss critical information.
PRs and issues that do not follow this AI policy can be closed without further explanation.

