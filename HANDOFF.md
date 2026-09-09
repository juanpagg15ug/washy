# Washy: Project Handoff Document
**Project:** Local-First ADHD Laundry Ritual OS
**Mission:** A laundry management app designed specifically for neurodivergent brains (ADHD). It acts as an external executive function prosthetic, prioritizing zero cognitive load, elimination of guilt (Zeigarnik effect), and physical reality anchoring.

## 1. Project Status & State
- **Phase:** Architecture, Database Schema, and UX/Psychology Foundation completed. Ready for UI/Frontend Development.
- **Tech Stack:**
  - **Core/Backend:** TypeScript, Drizzle ORM, SQLite (Local-First).
  - **Sync/Cloud (Planned):** Turso (libSQL) for free, robust omnichannel background syncing.
  - **Frontend:** React Native / Expo (Feature-Sliced Design).

## 2. Master Blueprint Files
All core decisions have been strictly documented in the following files. **Any new agent or developer MUST read these before writing code:**

1. **`architecture.md`** - The "Constitution". Covers DDD domains, multi-user logic (Ghost User & Magic Handoff), and Edge Cases (Frankenstein loads, Weather delays).
2. **`packages/washy-ui/ui_architecture.md`** - The frontend routing strategy (Single Screen Focus) and executive function aids (Absolute time, Pipeline Steppers).
3. **`packages/washy-ui/nudge_strategy.md`** - The UX Copywriting guide. Includes the Urgency/Scarcity triggers and Duolingo-style humor to re-engage users without moral guilt (e.g., "The Closet Thief").

## 3. Database & State Management
Located in `packages/washy-core/src/db/`:
- **`schema.ts`**: The official Drizzle ORM schema. It includes UUIDs for offline syncing, Patric Richardson's default parameters (Express/Warm), and strict Event Sourcing (`batch_events`) to track changes.
- **`mockData.ts`**: Seed data for UI development simulating standard flows.
- **`mockDataStressTest.ts`**: Extreme edge cases (Negative timers, contradictory wash rules, null pointers) to stress-test the UI's Reconciliation Engine.
- **`schema.dbml`**: Visual DBML script for dbdiagram.io.

## 4. Key Behavioral Engineering Rules
If you are developing features for this app, you must respect these rules:
- **No Math:** Never display "38 minutes left". Display "Ready at 5:15 PM".
- **Physical Micro-copy:** Buttons must describe physical actions (e.g., "Ya saqué la ropa").
- **Elastic Habits:** Every task has 3 valid closure levels (Mini, Plus, Elite). All of them are considered a "Win".
- **The "Silla-Clóset" Auto-Done:** If dry clothes are ignored for 3 days, the system silently closes the loop to prevent guilt accumulation.
- **Weakest Link Rule:** In mixed loads (Frankenstein Batches), the UI falls back to the most delicate item's rules and recommends Mesh Bags. No blocking the user.
- **Amnesia over Punishments:** Ignored nudges disappear. There are no broken streaks or red numbers.

## 5. Next Immediate Steps for Development
1. Initialize the React Native / Expo workspace in `packages/washy-ui`.
2. Configure Drizzle ORM and `expo-sqlite` (or `libsql`) in the UI to consume the schema.
3. Build the **Dashboard (`index.tsx`)** using the mock data to render the `TrafficLight` and the `ActiveWipCard`.
4. Implement the `useReconciliation` hook to catch and resolve the stress-test edge cases on app boot.
