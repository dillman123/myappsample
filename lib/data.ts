// ── In-memory data store with seed data ─────────────────────────────
// Stands in for a real database (Supabase/Postgres). All reads/writes
// happen server-side; swap `store` for a DB client without touching
// the UI layer.

import type { Course, DegreeProgram, StudySession } from "./types";

const degree: DegreeProgram = {
  id: "deg-cs",
  name: "B.S. Computer Science",
  totalCredits: 120,
  earnedCredits: 78,
  gpa: 3.72,
  expectedGraduation: "2027-05",
};

const courses: Course[] = [
  {
    id: "crs-os",
    code: "CS-350",
    title: "Operating Systems",
    provider: "internal",
    credits: 4,
    progress: 62,
    status: "active",
    sessionIds: ["ses-os-1", "ses-os-2", "ses-os-3"],
    color: "green",
  },
  {
    id: "crs-ml",
    code: "ML-101",
    title: "Machine Learning Foundations",
    provider: "coursera",
    credits: 3,
    progress: 38,
    status: "active",
    sessionIds: ["ses-ml-1", "ses-ml-2"],
    color: "cyan",
  },
  {
    id: "crs-fswd",
    code: "ND-0044",
    title: "Full Stack Web Developer",
    provider: "udacity",
    credits: 3,
    progress: 15,
    status: "active",
    sessionIds: ["ses-fs-1"],
    color: "amber",
  },
  {
    id: "crs-algo",
    code: "CS-260",
    title: "Algorithms & Data Structures",
    provider: "internal",
    credits: 4,
    progress: 100,
    status: "completed",
    sessionIds: [],
    color: "green",
  },
];

const sessions: StudySession[] = [
  {
    id: "ses-os-1",
    courseId: "crs-os",
    index: 1,
    title: "Processes & Threads",
    status: "completed",
    objectives: [
      "Differentiate processes from threads",
      "Describe the process lifecycle states",
      "Explain context switching costs",
    ],
    notesMarkdown: `# Processes & Threads

## The Process Abstraction
A **process** is a running instance of a program: its address space, open file descriptors, registers, and scheduling state. The OS provides the illusion that each process owns the CPU.

## Threads
A **thread** is a unit of execution *within* a process. Threads share the address space and heap but keep private stacks and register sets.

- Cheaper to create than processes
- Communication via shared memory (beware races)
- Killed together when the process dies

## Lifecycle
\`\`\`
NEW -> READY -> RUNNING -> (WAITING) -> TERMINATED
\`\`\`

## Context Switching
Saving one task's registers and restoring another's. Costs come from:
1. Register save/restore
2. TLB and cache pollution
3. Kernel crossing overhead`,
    vocab: [
      { term: "process", definition: "A running program instance with its own address space and resources." },
      { term: "thread", definition: "An execution unit within a process sharing its address space." },
      { term: "context switch", definition: "Swapping the CPU from one task to another by saving/restoring state." },
      { term: "TLB", definition: "Translation Lookaside Buffer — a cache of virtual-to-physical address mappings." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 15, done: true },
      { id: "p2", label: "Flash-review vocabulary chips", estMinutes: 10, done: true },
      { id: "p3", label: "Sketch the process lifecycle from memory", estMinutes: 10, done: true },
      { id: "p4", label: "Take the session assessment", estMinutes: 20, done: true },
    ],
  },
  {
    id: "ses-os-2",
    courseId: "crs-os",
    index: 2,
    title: "CPU Scheduling",
    status: "in-progress",
    objectives: [
      "Compare FCFS, SJF, RR and MLFQ schedulers",
      "Compute turnaround and response time",
      "Reason about starvation and fairness",
    ],
    notesMarkdown: `# CPU Scheduling

## Why Schedule?
More runnable tasks than CPUs. The **scheduler** decides who runs next, trading off *turnaround time* against *response time*.

## Classic Policies
| Policy | Idea | Weakness |
| --- | --- | --- |
| FCFS | Run in arrival order | Convoy effect |
| SJF | Shortest job first | Needs future knowledge |
| RR | Time-slice round robin | Poor turnaround |
| MLFQ | Learn from behavior | Complex tuning |

## Metrics
- **Turnaround** = completion − arrival
- **Response** = first-run − arrival

## MLFQ Rules
1. New jobs enter the top queue
2. Use your whole slice → demoted
3. Periodic priority boost prevents starvation`,
    vocab: [
      { term: "turnaround time", definition: "Time from job arrival to job completion." },
      { term: "response time", definition: "Time from job arrival to its first scheduling on the CPU." },
      { term: "convoy effect", definition: "Short jobs stuck waiting behind a long-running job in FCFS." },
      { term: "MLFQ", definition: "Multi-Level Feedback Queue — a scheduler that adjusts priority based on observed behavior." },
      { term: "starvation", definition: "A task waiting indefinitely because others are always preferred." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 20, done: true },
      { id: "p2", label: "Flash-review vocabulary chips", estMinutes: 10, done: true },
      { id: "p3", label: "Work one turnaround-time example by hand", estMinutes: 15, done: false },
      { id: "p4", label: "Ask the tutor to quiz you on MLFQ rules", estMinutes: 10, done: false },
      { id: "p5", label: "Take the session assessment", estMinutes: 20, done: false },
    ],
  },
  {
    id: "ses-os-3",
    courseId: "crs-os",
    index: 3,
    title: "Virtual Memory",
    status: "available",
    objectives: [
      "Explain paging and page tables",
      "Trace an address translation",
      "Describe replacement policies (LRU, clock)",
    ],
    notesMarkdown: `# Virtual Memory

## The Big Idea
Every process sees a private, contiguous address space. The OS + MMU translate **virtual addresses** to **physical frames** page by page.

## Page Tables
A per-process map from virtual page number → physical frame number, with permission bits. Multi-level tables keep the structure sparse.

## Replacement
When memory is full, evict a page:
- **LRU** — evict least recently used (costly to track exactly)
- **Clock** — approximate LRU with a reference bit sweep`,
    vocab: [
      { term: "page", definition: "A fixed-size block of virtual address space, typically 4KB." },
      { term: "page fault", definition: "A trap raised when a referenced page is not resident in memory." },
      { term: "MMU", definition: "Memory Management Unit — hardware that translates virtual to physical addresses." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 20, done: false },
      { id: "p2", label: "Flash-review vocabulary chips", estMinutes: 10, done: false },
      { id: "p3", label: "Trace a two-level translation on paper", estMinutes: 15, done: false },
      { id: "p4", label: "Take the session assessment", estMinutes: 20, done: false },
    ],
  },
  {
    id: "ses-ml-1",
    courseId: "crs-ml",
    index: 1,
    title: "Supervised Learning Basics",
    status: "completed",
    objectives: [
      "Define features, labels and hypotheses",
      "Split data into train/validation/test",
      "Recognize overfitting vs underfitting",
    ],
    notesMarkdown: `# Supervised Learning Basics

## Setup
Given examples \`(x, y)\` learn a function \`h(x) ≈ y\`. **Features** describe the input; the **label** is what we predict.

## Generalization
We care about performance on *unseen* data:
- **Overfitting** — memorizes noise, great train / poor test
- **Underfitting** — too simple for the signal

## Data Splits
Train to fit, validate to tune, test once to report.`,
    vocab: [
      { term: "feature", definition: "An input variable used by a model to make predictions." },
      { term: "label", definition: "The target value a supervised model learns to predict." },
      { term: "overfitting", definition: "Fitting noise in training data at the cost of generalization." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 15, done: true },
      { id: "p2", label: "Flash-review vocabulary chips", estMinutes: 5, done: true },
      { id: "p3", label: "Take the session assessment", estMinutes: 15, done: true },
    ],
  },
  {
    id: "ses-ml-2",
    courseId: "crs-ml",
    index: 2,
    title: "Linear Models & Gradient Descent",
    status: "in-progress",
    objectives: [
      "Write the linear regression loss",
      "Step through gradient descent updates",
      "Choose a sensible learning rate",
    ],
    notesMarkdown: `# Linear Models & Gradient Descent

## Model
\`h(x) = w·x + b\` — a weighted sum. Squared-error loss measures how wrong we are on average.

## Gradient Descent
Iteratively nudge parameters downhill:
\`\`\`
w := w - lr * dL/dw
\`\`\`

- Learning rate too big → divergence
- Too small → glacial convergence`,
    vocab: [
      { term: "loss function", definition: "A scalar measure of prediction error the optimizer minimizes." },
      { term: "gradient descent", definition: "Iterative optimization following the negative gradient of the loss." },
      { term: "learning rate", definition: "Step size scaling each gradient descent update." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 20, done: true },
      { id: "p2", label: "Derive the gradient of squared error", estMinutes: 15, done: false },
      { id: "p3", label: "Take the session assessment", estMinutes: 15, done: false },
    ],
  },
  {
    id: "ses-fs-1",
    courseId: "crs-fswd",
    index: 1,
    title: "HTTP & REST Fundamentals",
    status: "in-progress",
    objectives: [
      "Describe the request/response cycle",
      "Map CRUD operations to HTTP verbs",
      "Read and set common headers",
    ],
    notesMarkdown: `# HTTP & REST Fundamentals

## Request / Response
The client sends a **method**, path, headers and optional body; the server answers with a **status code**, headers and body.

## Verbs ↔ CRUD
| Verb | CRUD |
| --- | --- |
| POST | Create |
| GET | Read |
| PUT/PATCH | Update |
| DELETE | Delete |

## Status Families
2xx success · 3xx redirect · 4xx client error · 5xx server error`,
    vocab: [
      { term: "idempotent", definition: "An operation that has the same effect whether performed once or many times." },
      { term: "status code", definition: "A three-digit number describing the outcome of an HTTP request." },
      { term: "REST", definition: "An architectural style using stateless HTTP requests on resources." },
    ],
    studyPlan: [
      { id: "p1", label: "Read auto-generated notes", estMinutes: 15, done: true },
      { id: "p2", label: "Flash-review vocabulary chips", estMinutes: 10, done: false },
      { id: "p3", label: "Take the session assessment", estMinutes: 15, done: false },
    ],
  },
];

// Module-scoped singleton store. `globalThis` keeps it stable across
// Next.js dev-server hot reloads.
const g = globalThis as unknown as { __studyStore?: Store };

export interface Store {
  degree: DegreeProgram;
  courses: Course[];
  sessions: StudySession[];
}

export function getStore(): Store {
  if (!g.__studyStore) {
    g.__studyStore = { degree, courses, sessions };
  }
  return g.__studyStore;
}

export function getDegree(): DegreeProgram {
  return getStore().degree;
}

export function getCourses(): Course[] {
  return getStore().courses;
}

export function getCourse(id: string): Course | undefined {
  return getStore().courses.find((c) => c.id === id);
}

export function getSessions(courseId?: string): StudySession[] {
  const all = getStore().sessions;
  return courseId ? all.filter((s) => s.courseId === courseId) : all;
}

export function getSession(id: string): StudySession | undefined {
  return getStore().sessions.find((s) => s.id === id);
}

export function addCourseWithSessions(course: Course, newSessions: StudySession[]) {
  const store = getStore();
  store.courses.push(course);
  store.sessions.push(...newSessions);
}
