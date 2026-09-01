# AWS Staging Environment

Everything lives in the **us-east-2 (Ohio)** region. If something looks missing in the console, check the region selector first.

**Staging URL:** https://bjbites-staging.creighton.edu

---

## Quick reference

| Item | Value |
|---|---|
| AWS account | 908136806182 |
| Region | us-east-2 (Ohio) |
| Staging URL | https://bjbites-staging.creighton.edu |
| Load balancer hostname | bjbites-staging-alb-713725665.us-east-2.elb.amazonaws.com |
| ECS cluster | bjbites-staging |
| ECS service | bjbites-backend |
| Task definition family | bjbites-staging |
| ECR repository | 908136806182.dkr.ecr.us-east-2.amazonaws.com/bjbites-backend |
| RDS instance | bjbites-staging |
| Database name | bluejaybites |
| Database user | admin |
| Photo bucket | bjbites-staging-photos |
| Task role (S3 access) | bjbitesTaskRole |
| Execution role | ecsTaskExecutionRole |
| Log group | /ecs/bjbites-staging |
| Budget | bjbites-monthly, $25, alerts at 50% |

Credentials are not in this file. The database password and the Entra client secret are environment variables on the ECS task definition, visible in the console.

---

## What's in AWS

### ECR — where the image is stored

Repository: `bjbites-backend`

ECR is a private registry holding the Docker image. The image is the packaged backend: the compiled jar plus a Java runtime, bundled into something that can run anywhere.

- Only the image tagged `latest` matters. That is what Fargate pulls. Untagged images are older builds that lost their tag when a new one was pushed. Harmless, a few cents of storage.
- There is no versioning. Every push overwrites `latest`. If rollbacks are ever needed, start tagging by version or commit.
- The pushed date on `latest` is what to check if a deploy does not seem to have taken effect.

### ECS with Fargate — what runs the image

Cluster `bjbites-staging`, service `bjbites-backend`.

- The service keeps one container running and restarts it if it dies. Desired count 1, running count should also be 1.
- Under the service: **Tasks** shows the running container, **Deployments** shows rollout status, **Events** is the useful tab when something is wrong.
- **Task Definitions** in the left nav holds the configuration: image address, CPU and memory, environment variables, and the IAM roles. Every config change creates a new revision, and creating one changes nothing until the service is updated to use it. That also means a bad config change can be rolled back by pointing the service at the previous revision.

### RDS — the database

Instance `bjbites-staging`, database `bluejaybites`, user `admin`.

**This is a separate database from anyone's local one.** It was created fresh and seeded from `data.sql`. Accounts are created here on first sign-in by `UserProvisioningService`, and everyone defaults to the `user` role regardless of what their local database says. To grant organizer or admin, either edit the database directly or use the settings screen from an account that is already an admin.

The security group only allows connections from specific IP addresses. To connect from your own machine you have to add your IPv4 address to it first: EC2 → Security Groups → `bjbites-staging-db` → add an inbound rule for MySQL on port 3306 from your address with `/32` on the end. IPv6 addresses will not work, since the database endpoint is IPv4.

### Load balancer — the stable address

Name: `bjbites-staging-alb`

Gives one address that does not change and handles HTTPS. Without it the container gets a new IP on every restart, which would break the Entra redirect URI.

- Two listeners: port 80 (HTTP) and port 443 (HTTPS with the certificate). Both forward to the same target group.
- **Target groups** in the left nav is where health shows. The settings there matter, see the health check section below.

### S3 — where event photos are stored

Bucket: `bjbites-staging-photos`

Photos used to be written to local disk inside the container. Containers get replaced on every deploy, so uploaded photos disappeared. They now go to S3.

- The bucket is private and blocks all public access. Photos are still served through the backend at `/api/uploads/photos/{filename}`, which reads the object from S3 and streams it back. Nothing changed on the frontend and existing photo URLs still work.
- The container gets S3 access through the IAM task role `bjbitesTaskRole`, scoped to that bucket only, with get, put, and delete. This is separate from the execution role, which ECS uses to pull images and write logs.
- The bucket name comes from the `PHOTO_BUCKET` environment variable.
- Locally the app uses your own AWS credentials from `aws login`, so uploads from a dev machine go to the same staging bucket.

---

## Deploying a change

Docker Desktop has to be running first. If you get "failed to connect to the docker API", open Docker Desktop and wait for it to start.

```bash
cd backend

docker build --platform linux/amd64 -t bjbites-backend . && \
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 908136806182.dkr.ecr.us-east-2.amazonaws.com && \
docker tag bjbites-backend:latest 908136806182.dkr.ecr.us-east-2.amazonaws.com/bjbites-backend:latest && \
docker push 908136806182.dkr.ecr.us-east-2.amazonaws.com/bjbites-backend:latest && \
aws ecs update-service --cluster bjbites-staging --service bjbites-backend --force-new-deployment --region us-east-2
```

The commands are chained with `&&` so a failed build stops the sequence rather than pushing a stale image.

The `--platform linux/amd64` flag matters. Macs are ARM, Fargate is x86. Without it the image builds but will not start on Fargate, with an unhelpful error.

Deployment takes about three minutes. The old container keeps serving until the new one is healthy, so there is no downtime.

**Watch the rollout:**
```bash
aws ecs describe-services --cluster bjbites-staging --services bjbites-backend --region us-east-2 \
  --query "services[0].deployments[*].{Status:status,Running:runningCount,Failed:failedTasks,Rollout:rolloutState}" --output table
```

You want a single row showing PRIMARY, running 1, rollout COMPLETED. Two rows means it is still rolling over, which is normal for a few minutes.

### Staging is shared, and it runs whatever was last deployed

There is no "staging branch". The image is built from whatever branch you have checked out, so deploying from a feature branch puts that branch's code on staging and silently removes anything else that is not in it. Normally staging should run `main`. Deploying a branch for testing is fine, but tell the team, and put `main` back afterwards.

You do not need to deploy to test backend changes. Running the backend locally and leaving `EXPO_PUBLIC_API_URL` unset points the app at your own machine, which is a much faster loop. Deploying is for when everyone needs to test the same thing, or for mobile sign-in, which only works against staging because of the registered redirect URI.

### AWS CLI sessions expire

If you see "session has expired", run `aws login`.

---

## The health check

This broke every deployment before it was fixed, so it is worth understanding.

The app takes about 70 seconds to start. That is slow enough to fight with the load balancer health check. The original settings were path `/api/posts/active`, healthy threshold 5, unhealthy threshold 2, interval 30 seconds. That meant a container needed 150 seconds of passing checks to be considered healthy, but only 60 seconds of failing to be killed. With a 70 second startup it never survived, and ECS kept replacing it.

The symptom is deployments that flip between 1 and 2 running tasks and never complete, with a rising failed task count. The site keeps working the whole time because the old container stays up, which makes it easy to miss.

Current settings, which work:

| Setting | Value |
|---|---|
| Health check path | /actuator/health |
| Healthy threshold | 2 |
| Unhealthy threshold | 5 |
| Interval | 15 seconds |
| Timeout | 10 seconds |
| Service grace period | 180 seconds |

`/actuator/health` is used rather than `/api/posts/active` because it responds immediately without querying the database.

**If deploys start failing again:**
```bash
aws ecs list-tasks --cluster bjbites-staging --region us-east-2 --desired-status STOPPED --query "taskArns[0]" --output text

aws ecs describe-tasks --cluster bjbites-staging --region us-east-2 --tasks <ARN> \
  --query "tasks[0].{StoppedReason:stoppedReason,ExitCode:containers[0].exitCode}" --output json
```

"Task failed ELB health checks" with exit code 143 means the health check killed it, not an application crash.

---

## Logs

```bash
aws logs tail /ecs/bjbites-staging --since 10m --region us-east-2
```

Same output you would see running the app locally: Spring startup, SQL queries, stack traces.

```bash
# just the errors
aws logs tail /ecs/bjbites-staging --since 10m --region us-east-2 | grep -i "error\|exception\|caused by"

# confirm the app started
aws logs tail /ecs/bjbites-staging --since 10m --region us-east-2 | grep -i "started bjbites"
```

Stack traces are long and the useful line is usually the "Caused by" near the bottom.

In the console: CloudWatch → Log groups → `/ecs/bjbites-staging`. Each container run creates its own log stream named by task ID, so after a deploy there is a new one. Sort by last event time and take the newest.

---

## Authentication

Sign-in works on staging. Three pieces had to come together.

**DNS.** `bjbites-staging.creighton.edu` is a CNAME pointing at the load balancer, in the external zone so it resolves off campus. Requested through the Service Desk under Infrastructure → Network and Connectivity → DNS.

**HTTPS.** Brian Bautista in Information Security issued a Creighton certificate through InCommon. It is imported into ACM and attached to the port 443 listener.

**Entra.** Staging has its own app registration, separate from the one used for local development. The client ID, tenant ID, and client secret are environment variables on the task definition.

Two application settings were needed, both in `application.properties`:

- `server.forward-headers-strategy=framework` — the load balancer terminates TLS and forwards plain HTTP to the container, so without this Spring builds redirect URIs with `http` and Entra rejects them.
- `spring.cloud.azure.active-directory.redirect-uri-template` — the derived value was missing the registration id on the end, so it is set explicitly.

### Registered redirect URI

`https://bjbites-staging.creighton.edu/login/oauth2/code/azure`

If the hostname ever changes, Brian has to register the new URI before sign-in will work.

---

## The certificate

- **Type is Imported, not Amazon Issued.** AWS will not auto-renew it.
- **Expires March 13, 2027.**
- The private key was generated locally and is held outside the repository. If it is lost and the certificate ever needs reimporting, you have to start over with a new signing request.

**To renew:** generate a new key and CSR with openssl for `bjbites-staging.creighton.edu`, send Brian the `.csr` file, and he returns a zip from CertiNext. Import the end entity certificate plus the two intermediates as the chain into ACM, then update the listener to use it.

---

## Costs

Around $30 to $35 a month: load balancer $16 to $18, database $12 to $15, Fargate and storage small.

- Budget `bjbites-monthly` is set at $25 and emails the project account when actual spend hits 50 percent. It alerts only, it does not stop anything.
- The load balancer and database bill hourly whether or not anyone uses them, so the monthly cost is essentially fixed and does not scale with traffic at this size.
- $200 in credits, issued by AWS in two $100 allocations.
- The account had to be upgraded from the AWS free plan to the paid plan, because free tier accounts cannot receive credits. That required root access, since IAM users do not have billing permissions.

---

## Known gaps

**Database password and Entra secret are in plaintext** in the task definition, visible to anyone with ECS read access. They should be in Secrets Manager.

**Photo uploads are not fully tested.** The S3 code is deployed and the app runs cleanly with it, but an end to end upload has not been verified.

**No CI/CD.** Deploys are manual. Stories for building this out are tracked separately.

**Spring Boot Admin client URL is hardcoded to localhost** in `application.properties`, so the admin dashboard does not work correctly on staging. Not harmful, just broken config.

**No separate production environment.** This hostname is staging specific. Production would need its own DNS entry, certificate, and app registration.

---

## Who to contact

| Person | For |
|---|---|
| Brian Bautista, Information Security | Entra app registrations, redirect URIs, SSL certificates |
| Amina Holt, Solutions Architect – Cloud | AWS architecture questions, credits |
| Network Team, via myservices.creighton.edu | DNS records |
| Apoorva Chaturvedi, Senior Product Manager | IT coordination generally |
