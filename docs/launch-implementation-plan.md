# NSBE UTK launch implementation plan

Supabase `main` already has the Phase 2 schema. The workspace contains the matching app changes, which are still uncommitted. The first release restores app and database compatibility. The soft launch adds approved content and verifies the supported workflows. The full launch brings back submissions and replaces the member portal placeholders.

## 1. Deploy the app that matches Supabase

**Owner** — Release maintainer

1. Identify the actual production deployment, its Git commit, and the Supabase project it uses. If it points to `egvzzpgfxhpxnjfhayyh` and runs the older app, treat opportunity submission and officer role changes as at risk until the matching app is deployed.
2. Review the workspace diff, including the existing lockfile changes. Commit the intended app, migrations, and CI files together. Open a release PR and require clean install, lint, route type generation, TypeScript, tests, and the production build.
3. Deploy the release candidate to a preview connected to staging Supabase and a test GroupMe group. Run the workflow checks below. Confirm the production deploy has the correct Supabase URL and public key, a server-only service role key, the approved auth callback URL, and the intended cron and GroupMe settings. Remove the officer seed list after initial provisioning.
4. Promote the tested commit to production. Verify the deployment commit and run the production smoke checks below. Keep a deployed build that supports the current database contract available for rollback. If that build has a regression, fix forward or temporarily disable the affected feature while preparing a compatible release.

**Done when** — The production host serves the reviewed commit and can create a pending opportunity through the app. Confirm the officer action calls the database role function. Keep production test actions from sending GroupMe messages.

## 2. Reconcile migrations and prepare staging

**Owner** — Supabase administrator

1. Record that migrations `0001` through `0007` are already reflected in production. The SQL Editor application did not populate CLI migration history. Compare each file with the live schema and grants, then mark matching versions as applied via the team's CLI migration workflow. Verify local and remote histories agree before enabling future pushes. Keep this work separate from the urgent app deployment.
2. Create or identify an isolated staging database. Apply `0001`–`0007` in order to an empty staging database. Also rehearse `0004`–`0007` against representative legacy data, using synthetic records for names and emails. Check `0005` constraints before upgrading.
3. Record who owns migration approval, backups, and recovery. Verify a restore in staging before relying on the recovery process.

**Done when** — Production migration history matches the verified schema, staging can be rebuilt from the repository, and the release maintainer can identify and restore a backup.

## 3. Close the soft-launch release checks

**Owners** — Chapter content lead and release maintainer

1. Populate `lib/data/chapter.ts` with approved officers, sponsors, events, news, links, and contact addresses. Set event timestamps with explicit offsets, confirm external links, and leave sections empty where the chapter has no approved content.
2. Confirm production DNS and TLS, configure Supabase SMTP and the auth redirect allowlist, then test magic links with both UTK domains. Verify anonymous, member, and officer access in staging.
3. Run the staging acceptance checks below, then smoke-test production public routes, login, and a pending opportunity submission. Use a staging GroupMe bot for delivery tests. Enable live delivery after the chapter confirms the destination and schedule.
4. Set up alerts for failed submissions, login errors, and failed or unconfirmed GroupMe deliveries. Assign an officer to review stale delivery claims and reconcile them before retries.

| Workflow | Staging acceptance check |
| --- | --- |
| Opportunities | A valid form creates a pending row. Invalid or expired submissions fail. Public readers see only approved, unexpired entries and never see submitter details. |
| Moderation | Officers can review the full submission. Approval publishes it, rejection keeps it private, and overlapping approval and digest requests produce one delivery claim. |
| Officer roles | A role change creates an audit entry. Members cannot change roles. The last officer survives demotion and account deletion attempts, including concurrent attempts. |
| GroupMe | A test post finalizes its claim. An explicit rejection returns an error and can retry. A timeout returns an error and holds the claim for review. Unauthorized cron requests return 401. |
| Events and navigation | Approved events display EST or EDT, calendar downloads preserve the event instant, and public pages work on mobile and with keyboard navigation. |

**Done when** — The chapter approves the public content, staging checks pass, production smoke checks pass, and a named owner receives alerts.

## 4. Complete the full launch

**Owners** — Chapter product lead and engineering maintainer

1. **Contact, join, and sponsorship.** Choose the chapter inbox or official external destination for each workflow. For forms hosted on the site, validate on the server, add spam controls, store submissions durably, and record notification failures for retry. Confirm receipt only after the submission has been accepted. Verify access to submissions and agree on a retention period before re-enabling the forms.
2. **RSVP.** Confirm whether VOLink is the chapter's source of truth. Use its official event links if so. If the site owns registration, store RSVPs against an event, prevent duplicates, and give officers access to the roster. Verify open and closed registrations.
3. **Member portal.** Agree on the sources and visibility rules for attendance, points, and committee assignments. Build event attendance first, calculate points from verified attendance and chapter rules, then add committee assignments. Give officers a way to correct records and members a way to see their own data. Replace each placeholder only after its workflow passes staging checks.

**Done when** — Every published form leads to a verified destination, portal screens use real authorized data, and officers can operate the workflows without engineering help.
