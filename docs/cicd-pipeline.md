# CI/CD Pipeline - User Story and Tasks

Paste these into GitHub. Create the user story first, then create each task and link it as a sub-issue.

---

## [User Story] Automate testing, building, and deployment

**Title:** `[User Story] Automate testing, building, and deployment`

**Body:**

As a developer, I want changes to be automatically checked and deployed so that we are not testing and deploying by hand every time, and so that broken code does not reach staging.

The pipeline will be built with GitHub Actions, with workflows defined in `.github/workflows`. Workflows run automatically when code is pushed or a pull request is opened. The pipeline installs dependencies, runs linting and TypeScript checks, runs automated tests, and after those pass, builds and deploys. Secrets such as API tokens are stored in GitHub Actions Secrets rather than in the repository.

Production releases to the App Store and Google Play are out of scope for now and will require manual approval when they are added.

**Acceptance criteria:**
- Pull requests automatically run linting, type checks, and tests
- `main` cannot be pushed to directly
- Merging to `main` builds the backend image and deploys it to staging
- Merging to `main` triggers EAS builds for iOS and Android
- All secrets are stored in GitHub Actions Secrets, not committed

---

## [Task] Protect the main branch from direct pushes

Configure branch protection on `main` so changes have to go through a pull request. This is a prerequisite for the rest of the pipeline, since workflows that run on pull requests do not help if code can be pushed straight to main.

Should require a pull request before merging, and require status checks to pass once the checks exist.

---

## [Task] Add a workflow that runs linting and type checks on pull requests

Create a GitHub Actions workflow that triggers on pull requests. It should check out the code, install Node dependencies, run the linter, and run the TypeScript compiler check.

This is the smallest useful first step and gives immediate value on every pull request.

---

## [Task] Add automated tests to the pipeline

Add a step to the pull request workflow that runs the test suite.

Note that we do not currently have meaningful automated tests, so this task may need to start with deciding what to test and adding a baseline. Worth scoping separately if it turns out to be large.

---

## [Task] Store pipeline secrets in GitHub Actions Secrets

Identify everything the pipeline needs that cannot be committed, and add it to GitHub Actions Secrets.

Likely includes AWS credentials for pushing to ECR and updating the ECS service, and an Expo token for triggering EAS builds. Document what each secret is for so the next person knows what they are looking at.

---

## [Task] Build and push the backend image to ECR on merge to main

Add a workflow step that runs when a pull request merges to `main`. It should build the backend Docker image and push it to ECR.

The image has to be built for `linux/amd64`, since Fargate runs x86 and building on ARM produces an image that will not start. The current manual process is documented in the AWS handoff doc and this should mirror it.

---

## [Task] Deploy the new image to ECS on merge to main

After the image is pushed, force a new deployment on the ECS service so the new image is picked up.

Worth checking whether the workflow should wait for the deployment to become stable and fail if it does not, rather than reporting success as soon as the command is issued. Deployments take about three minutes and can fail on the health check.

---

## [Task] Trigger EAS builds for iOS and Android

Add a workflow step that triggers Expo Application Services builds for both platforms after checks pass.

Needs an Expo token stored in secrets. Should build the development or preview profile rather than production, since store releases are out of scope for now.

---

## [Task] Add a manual approval gate before production releases

Once the pipeline is working for staging, add an approval step so that anything going to the App Store or Google Play requires a person to approve it rather than deploying automatically.

Not needed until we are actually publishing, but worth tracking so it does not get forgotten.

---

## [Spike] Decide how the pipeline handles the two halves of the project

The frontend and backend deploy to completely different places. The frontend goes through EAS to app builds, and the backend goes through ECR and ECS. They also change independently, so a frontend-only change should probably not trigger a backend deploy and vice versa.

Worth deciding whether this is one workflow or two, and whether to use path filters so each only runs when relevant files change. Doing this before building the workflows will save rework.
