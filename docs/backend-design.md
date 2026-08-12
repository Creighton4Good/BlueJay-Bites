# Backend Design

This document captures the reasoning behind the backend architecture and design decisions for BlueJay-Bites.

## Overview

The backend is a Spring Boot application that exposes a REST API for the BlueJay-Bites campus food-sharing app. It connects to a MySQL database and serves event data, user data, and lookup table data to the React Native frontend.

## Tech Stack

- **Spring Boot 3.5.7** (Java 21)
- **MySQL 9.x** for persistence
- **Spring Data JPA / Hibernate** for ORM
- **Spring Security** for role-based authorization
- **Maven** for dependency management
- **OAuth2 & Azure** for authentication

## Database

- Database name: `bluejaybites`
- Credentials loaded from environment variables (`DB_USERNAME`, `DB_PASSWORD`) — never hardcoded
- `spring.jpa.hibernate.ddl-auto=update` so the schema auto-creates from entity classes
- Seed data loaded via `data.sql` on startup using `spring.sql.init.mode=always`
- Because `data.sql` runs on every startup, the sample events use `INSERT ... ON DUPLICATE KEY UPDATE` scoped to their availability window and status. This refreshes their pickup times on each restart instead of skipping rows that already exist, so seeded events do not silently expire on a database that has been running for a while. Other fields are left alone, so edits made to a seeded event during testing survive a restart

## Schema

### Core Tables

- **users** — accounts with email, display name, role, Entra ID (for SSO), and auth provider
- **posts** — food events with title, description, photo, location, food type, servings, pickup window, status and creator

### Lookup Tables

- **roles** — `user`, `event_organizer`, `admin`
- **buildings** — Creighton campus buildings with lat/long coordinates
- **food_types** — Includes food categories (pizza, sandwiches, etc), meal types (breakfast, etc), and cusines types (Italian, etc).
- **dietary_options** — Options including Vegetarian, Vegan, Gluten-Free, etc.
- **notifications** - Includes createdAt, read status, and notification type
- **user_preferences** - Supports the notification preference for the user ("on" or "off")
- **post_photos** - Supports photo uploads for organizers when creating posts

### Junction Tables
- **post_dietary_options** - Allows users to select multiple dietary options when creating an event; associates each option with its events, and the event with its options

## Admin Dashboard Server

- Accessible using localhost:8080/admin when running backend
- Utilizes Spring Boot supported admin dashboard
- Useful for monitoring the registered application

## Design Decisions

### Entities
- Based on core/lookup tables
- Each have fields, as well as constructor, getter and setter methods

### @ManyToOne foreign keys (not int FKs)

User has a `Role` object, not a `roleId int`. User has a `UserPreference` object, instead of the UserPreference entity having a `userId int`.  Post has `Building`, `FoodType`, and `User createdBy` objects. Notification has `User` and `Post` objects. UserPreference has a `User` object. Photo has a `Post` object. This:

- Enforces relationships at the entity level
- Allows navigating object references in repository queries (e.g., `findByCreatedBy_Id(Integer userId)`)
- Aligns with proper JPA practices and database design feedback
- Allows for smooth seed data integration

### @ManyToMany

- Post has a `post_dietary_options` junction table, as many events can have the same dietary option, and many dietary options can apply to one event
- This same structure could be used to support a `user_dietary_preferences` junction table, as many dietary preferences can apply to a specific user, and many users can apply to a specific dietary preference

### Pickup window over single expiration time

Posts use `availableFrom` and `availableUntil` instead of a single `expirationTime`. Users need to know when to show up, not just when food runs out. This gives organizers explicit control over the pickup window.

### Lookup tables for stable values

Roles, buildings, food types, and dietary options live in their own tables instead of as enums or free-text strings on Post. Reasons:

- Single source of truth (e.g., building's lat/long stored once)
- Can add/edit values without code changes — just update `data.sql`
- Foreign key constraints prevent bad data

### Soft delete via status field

Posts are never hard-deleted. Status changes from `active` to `closed`, where only admins can view them. This preserves history for analytics and allows admins to recover closed posts via the `/recover` endpoint, changing it back to `active`.

### Admin/organizer actions

Admins and organizers can both edit and delete their own event, but admins can edit or delete any event. There are security checks to ensure that organizers are only performing these actions on events they own. Only admins can promote and demote users to other roles. Any user can update their own personal information, such as their display name.

### Admin/organizer views

Admins can do anything that an organizer can do, so they will also be able to see the page of events only they created. Admin only views are supported in conroller classes, such as get all closed posts, get a post by id, or recover a post. This helps to ensure that admins do not need to be assigned the organizer role separately.

Screens that are admin-only, such as the all-events view, are restricted on the frontend by a route guard that checks the admin role alone rather than organizer-or-admin, so an organizer cannot reach them by navigating directly. The corresponding tab is also hidden for non-admins. This is a usability layer on top of the backend checks, not a replacement for them, since the backend still authorizes every request against the session user.

### Closing events on a schedule rather than at read time

Status only changed to `closed` when a post was explicitly closed or deleted, so an event that simply ran out of time stayed `active` in the database. It would drop out of the active feed once it aged past the grace window, but never appear under closed posts, leaving expired events in a gap.

`EventStatusService` runs on a schedule (`@Scheduled`, with `@EnableScheduling` on the application class) and closes any post whose `availableUntil` has passed while its status is still `active`.

A scheduled job was chosen over treating "expired" as a read-time filter so the stored status stays the single source of truth. Deriving expiry at read time would mean every query that reads status has to repeat the same time comparison, and the stored value would stay permanently inaccurate.

The job compares against `availableUntil` plus the grace period rather than the current time, so an event is not pulled out of the active feed before its countdown finishes. The grace period lives in `EventConstants.GRACE_PERIOD_MINUTES` so the active-events query and the scheduled job cannot drift apart.

### Buildings table = indoor structures only

Outdoor event specifics (e.g., "by the fountain on the north side") live in the `directions` field on Post, not as separate Building entries. Keeps the lookup table clean while still supporting outdoor events.

### Role naming convention

Roles are stored lowercase with underscores: `user`, `event_organizer`, `admin`. The `@PreAuthorize` annotations use `hasAuthority()` instead of `hasRole()` since we don't use the `ROLE_` prefix convention.

### Notifications

Notifications are sent using Expo notifications through Firebase. There are entities for Notification and UserPreference (entity for notifications to be on or off)
- Notifications are only sent to those with a user preference of "on"
- They are triggered when an event-organizer/admin creates a post
- Endpoints exist to get certain notifications, such as by read status, support the user enabling or disabling notifications, and for user to subscribe to notifications

### Photos

- A photo can be uploaded and attached to an event and be associated with that event
- `PhotoController`, `PhotoUploadController`, and `PhotoService` work together to handle uploading, retrieving, and storing photos, based on the photo that was uploaded
- Currently, photo upload only allows one photo per event. However, backend integration can support multiple if this is a future addition
  - `displayOrder` field to be used to display photos in event details page in creation order
  - `photoUrl` would include the primary photo in main events page to display; this would be auto assigned to the newest created photo that is existing (highest in displayOrder)
- Photos are stored using a UUID (Universally Unique Identifier), to allow for unique filenames and proper storage
- `photoUrl` is used to get photo data from the frontend
- Currently, photos are being stored locally through an env variable "file.upload-dir". When testing, feel free to set this to your preferred destination in an environment variable
- Testing through CURL (client URL) commands on command prompt:
  - Create image: curl.exe -X POST http://localhost:8080/api/uploads/photos -F file=@{your-file-path} -F “postId={your-post-id}”
  -	Retrieve image: http://localhost:8080/api/uploads/photos/{filename}
  -	Delete image: curl.exe -X DELETE http://localhost:8080/api/post-photos/{your-photo-id}


### Environment Variables
- `file.upload-dir` - Local storage for photos
- `DB_USERNAME` - Username for SQL
- `DB_PASSWORD` - Password for SQL
- `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET` - credentials for authentication through Microsoft SSO

## API Conventions

### Base paths

- `/api/posts` — food events
- `/api/users` — user accounts
- `/api/roles` — role lookup
- `/api/buildings` — building lookup
- `/api/foodtypes` — food type lookup
- `/api/dietary-options` — dietary option lookup
- `api/post-photos` - photo lookup
- `api/uploads` - photo upload
- `api/notifications` - noitification lookup
- `api/user_preferences` - notification preference lookup

### Standard endpoints used in controllers

- `GET /all` — list everything
- `GET /{id}` — get one by ID
- `POST /create` — create new
- `PUT /{id}` — update
- `DELETE /{id}` — soft delete for posts, hard delete for lookup tables

### Authorization

- `@PreAuthorize` annotations on endpoints define role requirements before a view/action
- Uses `hasAuthority('admin')` or `hasAuthority('event_organizer')` — matches lowercase seed values
- `SecurityConfig` requires an authenticated session for API requests. Public lookup and active-event reads are permitted; anything that identifies or acts on behalf of a user requires a signed-in session
- CORS is configured globally to allow the frontend origin with credentials, so browser requests can carry the session cookie. Frontend calls to session-based endpoints must send `credentials: "include"`

## Authentication
- Logging in and logging out of the application will be done using a Microsoft Entra Account through OAUTH
  - Using the documentation provided by Microsoft [here](https://learn.microsoft.com/en-us/azure/developer/java/spring-framework/configure-spring-boot-starter-java-app-with-entra), which includes dependencies and configuration information
  - OAUTH was chosen over SAML due to being more compatible with Spring-Boot
- Sign-in is handled by the backend's OAuth2 flow. The frontend opens the backend login endpoint, Entra authenticates the user, and the backend establishes a session. The frontend then calls `/api/users/me` to load the authenticated user
- `CustomOidcUserService` handles the OIDC user on login, and `UserProvisioningService.getOrCreateUser` looks the user up by their Entra ID and creates a record on first sign-in, defaulting them to the `user` role. Roles are elevated afterward through role management, not at provisioning time
- Because authorization is session-based, the authenticated user is taken from the session rather than passed in by the client. Endpoints that act on behalf of a user (creating, updating, or closing an event, listing a user's own events) resolve the user from the session
- `@AuthenticatedPrincipal` annotations on endpoints in order to get the authenticated OAuth2 user for checks involving type of user, ownership, or actions involving a particular user

## Repository Patterns

- Use Spring Data JPA method naming conventions
- Object navigation uses underscore syntax: `findByCreatedBy_Id(Integer userId)` navigates from Post to User.id
- Sort orders: `findByStatusOrderByCreatedAtDesc(String status)` - allows posts to be sorted by when they were most recently created
- Counting: `long countByRoleRoleName(String roleName);` - allows roles to be counted, useful when ensuring that there will always be at least one admin left when promoting/demoting admins

## Pending Work

- Enable `@EnableMethodSecurity` in `SecurityConfig` so `@PreAuthorize` annotations actually enforce (currently the annotations exist but aren't checked because method security is not enabled)
- Build notification system (delivery method = push notifications)
  - Current approach: Expo Notifications through Firebase
- Add analytics endpoints for admin dashboard -> might be more nice to have for metrics tracking, so this would be more of a way to view upcoming events
- Support for uploading and converting photos end-to-end
- Add `servingsRemaining` tracking for "running low" UI
- Integrate photo storage through AWS

