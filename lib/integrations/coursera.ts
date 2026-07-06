import "server-only";
import type { RawCourseStructure } from "../types";
import type { CourseProviderAdapter } from "./provider";

// Coursera adapter. The real implementation would call the Coursera
// Partner API with COURSERA_API_TOKEN; this stub returns a normalized
// structure so the ingestion pipeline is exercisable end-to-end.
export const courseraAdapter: CourseProviderAdapter = {
  id: "coursera",
  name: "Coursera",

  isConfigured() {
    return Boolean(process.env.COURSERA_API_TOKEN);
  },

  async fetchCourse(externalCourseId: string): Promise<RawCourseStructure> {
    if (!this.isConfigured()) {
      throw new Error("Coursera integration is not configured (set COURSERA_API_TOKEN)");
    }
    // Placeholder for: GET https://api.coursera.org/... with the token
    // attached server-side. The token never appears in the returned data.
    return {
      title: `Coursera Course ${externalCourseId}`,
      provider: "coursera",
      modules: [
        { title: "Week 1: Orientation", topics: ["course tour", "grading policy"] },
        { title: "Week 2: Core Concepts", topics: ["foundations", "terminology"] },
      ],
    };
  },
};
