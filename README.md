# STUDYTERM — AI Study Companion

A developer-focused AI study companion with a **retro-tech terminal** aesthetic:
high-contrast phosphor green on dark charcoal, monospaced type, scanline
overlays, subtle CRT flicker, and glassmorphism modals.

## Stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS v4**
- Server-side API routes stand in for the backend; the in-memory store in
  `lib/data.ts` is shaped to be swapped for Supabase/Postgres.
- **Anthropic Claude** (`claude-opus-4-8`) powers the AI tutor and long-form
  grading when `ANTHROPIC_API_KEY` is set; both degrade to deterministic
  offline behavior without it.

## Features

- **Main dashboard** — bento-grid layout with degree progress (credits, GPA,
  graduation ETA), active course cards, up-next sessions, and external
  integration status.
- **Course scraper & parser** (`lib/parser/courseParser.ts`) — ingests a course
  structure (pasted outline or platform adapter) and generates a
  session-by-session learning path: notes skeleton, vocabulary chips, and a
  study plan per session. Try it via **[ + ingest course ]** on the dashboard.
- **Session workspace** — split-screen view: auto-generated markdown notes,
  flip-to-reveal vocabulary chips, and a dynamic study plan on the left; the
  persistent AI tutor chat on the right.
- **Assessment engine** (`lib/assessment/engine.ts`) — generates and grades
  tests in three formats: multiple-choice, fill-in-the-blank, and long-form
  response (AI-graded with a keyword-rubric fallback).
- **AI tutor** — session-aware chat sidebar for Q&A and assignment guidance.
- **Modular integrations** (`lib/integrations/`) — a provider adapter contract
  with Coursera and Udacity stubs; add a platform by writing one adapter file
  and registering it.

## Security model

- All authentication and model access happens **server-side** in API routes.
- Platform credentials and the Anthropic key live in environment variables
  (see `.env.example`); nothing secret is prefixed `NEXT_PUBLIC_` or shipped
  to the browser.
- Assessment answer keys are cached server-side; clients receive redacted
  questions only.

## Getting started

```bash
npm install
cp .env.example .env.local   # optionally add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Layout

```
app/                    pages + API routes
  api/tutor             AI tutor endpoint (server-only model access)
  api/assessment        generate/grade assessments
  api/courses           dashboard payload + course ingestion
  courses/[courseId]    learning-path view
  session/[sessionId]   split-screen session workspace
components/             dashboard, session, assessment, tutor, ui
lib/
  data.ts               in-memory store (DB stand-in) + seed data
  parser/               course outline parser → learning path
  integrations/         provider adapter contract + Coursera/Udacity stubs
  assessment/           assessment engine (generate + grade)
  tutor/                Claude integration + offline fallback
```
