import "server-only";
import { courseraAdapter } from "./coursera";
import { udacityAdapter } from "./udacity";
import type { CourseProviderAdapter, IntegrationStatus } from "./provider";

// Modular registry — adding a platform means writing one adapter file
// and registering it here.
const adapters: CourseProviderAdapter[] = [courseraAdapter, udacityAdapter];

export function getAdapter(id: string): CourseProviderAdapter | undefined {
  return adapters.find((a) => a.id === id);
}

/** Connection status safe to send to the client (no credentials). */
export function getIntegrationStatuses(): IntegrationStatus[] {
  return adapters.map((a) => ({
    id: a.id,
    name: a.name,
    connected: a.isConfigured(),
  }));
}
