# Family Chat

## Current State
New project. Only scaffolded files exist (empty Motoko actor, no frontend components).

## Requested Changes (Diff)

### Add
- User registration and login (authorization)
- Member cap: maximum 20 members can be registered at any time
- Group chat: any member can send/read messages visible to all
- Shared photo gallery: any member can upload and view photos
- Announcements board: any member can post and read announcements
- Member directory: see who has joined (shows current count vs 20 cap)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Use `authorization` component for open sign-up and login
2. Use `blob-storage` component for photo uploads and retrieval
3. Backend: enforce 20-member cap on registration; implement chat messages (store/retrieve), announcements (store/retrieve), expose member list with count
4. Frontend: landing/login page showing cap status, main app with tabs for Chat, Gallery, Announcements, and Members
5. Any authenticated user (up to 20 total) can post messages, upload photos, and post announcements -- no roles or restrictions
6. When 20 members are registered, new sign-ups are blocked with a friendly message
