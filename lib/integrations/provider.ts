// ── Integration provider contract ────────────────────────────────────
// Every external platform (Coursera, Udacity, ...) implements this
// interface. Adapters run ONLY on the server: credentials come from
// environment variables and are never serialized to the client.

import type { RawCourseStructure } from "../types";

export interface IntegrationStatus {
  id: string;
  name: string;
  /** True when a server-side credential is configured for this provider. */
  connected: boolean;
}

export interface CourseProviderAdapter {
  id: string;
  name: string;

  /** Whether a server-side credential is configured (env var present). */
  isConfigured(): boolean;

  /**
   * Fetch and normalize a course structure from the platform.
   * Implementations must never leak the credential into the result.
   */
  fetchCourse(externalCourseId: string): Promise<RawCourseStructure>;
}
