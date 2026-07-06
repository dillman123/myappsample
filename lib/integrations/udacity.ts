import "server-only";
import type { RawCourseStructure } from "../types";
import type { CourseProviderAdapter } from "./provider";

// Udacity adapter. Mirrors the Coursera adapter: credential from env,
// normalized output, nothing secret in the result.
export const udacityAdapter: CourseProviderAdapter = {
  id: "udacity",
  name: "Udacity",

  isConfigured() {
    return Boolean(process.env.UDACITY_API_TOKEN);
  },

  async fetchCourse(externalCourseId: string): Promise<RawCourseStructure> {
    if (!this.isConfigured()) {
      throw new Error("Udacity integration is not configured (set UDACITY_API_TOKEN)");
    }
    return {
      title: `Udacity Nanodegree ${externalCourseId}`,
      provider: "udacity",
      modules: [
        { title: "Lesson 1: Welcome", topics: ["program overview", "workspace setup"] },
        { title: "Lesson 2: First Project", topics: ["project rubric", "submission flow"] },
      ],
    };
  },
};
