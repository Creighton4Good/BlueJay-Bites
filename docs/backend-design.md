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

## Database

- Database name: `bluejaybites`
- Credentials loaded from environment variables (`DB_USERNAME`, `DB_PASSWORD`) — never hardcoded
- `spring.jpa.hibernate.ddl-auto=update` so the schema auto-creates from entity classes
- Seed data loaded via `data.sql` on startup using `spring.sql.init.mode=always`

## Schema

### Core Tables

- **users** — accounts with email, display name, role, Entra ID (for SSO), and auth provider
- **posts** — food events with title, description, photo, location, food type, servings, pickup window, status and creator

### Lookup Tables

- **roles** — `user`, `event_organizer`, `admin`
- **buildings** — Creighton campus buildings with lat/long coordinates
- **food_types** — Includes food categories (pizza, sandwiches, etc), meal types (breakfast, etc), and cusines types (Italian, etc).
- **dietary_options** — Options including Vegetarian, Vegan, Gluten-Free, etc.

## Design Decisions

### Entities
- Based on core/lookup tables
- Each have fields, as well as constructor, getter and setter methods

### @ManyToOne foreign keys (not int FKs)

User has a `Role` object, not a `roleId int`. Post has `Building`, `FoodType`, and `User createdBy` objects. This:

- Enforces relationships at the entity level
- Allows navigating object references in repository queries (e.g., `findByCreatedBy_Id(Integer userId)`)
- Aligns with proper JPA practices and database design feedback

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

Admins and organizers have separate endpoints for editing and deleting an event, to ensure that organizers are only performing these actions on events they own. Only admins can promote and demote users to other roles. Users can update their own personal information, such as their display name.

### Admin/organizer views

Admins can do anything that an organizer can do, so they will also be able to see the page of events only they created. Admins will also have admin only views such as get all closed posts, get a post by id, or recover a post. This helps to ensure that admins do not need to be assigned the organizer role separately.

### Buildings table = indoor structures only

Outdoor event specifics (e.g., "by the fountain on the north side") live in the `directions` field on Post, not as separate Building entries. Keeps the lookup table clean while still supporting outdoor events.

### Role naming convention

Roles are stored lowercase with underscores: `user`, `event_organizer`, `admin`. The `@PreAuthorize` annotations use `hasAuthority()` instead of `hasRole()` since we don't use the `ROLE_` prefix convention.

## API Conventions

### Base paths

- `/api/posts` — food events
- `/api/users` — user accounts
- `/api/roles` — role lookup
- `/api/buildings` — building lookup
- `/api/foodtypes` — food type lookup
- `/api/dietary-options` — dietary option lookup

### Standard endpoints used in controllers

- `GET /all` — list everything
- `GET /{id}` — get one by ID
- `POST /create` — create new
- `PUT /{id}` — update
- `DELETE /{id}` — soft delete for posts, hard delete for lookup tables

### Authorization

- `@PreAuthorize` annotations on endpoints define role requirements before a view/action
- Uses `hasAuthority('admin')` or `hasAuthority('event_organizer')` — matches lowercase seed values
- Currently `SecurityConfig` permits all `/api/**` requests for development so the frontend can connect without auth
- Will switch to Microsoft Entra SSO before production (see User entity's `entraId` and `authProvider` fields)

## Repository Patterns

- Use Spring Data JPA method naming conventions
- Object navigation uses underscore syntax: `findByCreatedBy_Id(Integer userId)` navigates from Post to User.id
- Sort orders: `findByStatusOrderByCreatedAtDesc(String status)` - allows posts to be sorted by when they were most recently created
- Counting: `long countByRoleRoleName(String roleName);` - allows roles to be counted, useful when ensuring that there will always be at least one admin left when promoting/demoting admins

## Pending Work

- Enable `@EnableMethodSecurity` in `SecurityConfig` so `@PreAuthorize` annotations actually enforce (currently the annotations exist but aren't checked because method security is not enabled)
- Integrate Microsoft Entra SSO for real authentication for signing in/out
- Build notification system (delivery method — in-app vs email — pending IT meeting)
  - Possible approaches: SSE (Single-Server Events, websockets)
- Add analytics endpoints for admin dashboard
- Add photo upload for events
- Add `servingsRemaining` tracking for "running low" UI

