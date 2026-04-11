import { describe, it, expect } from "vitest";
import { matchesStatus, matchesSearch, matchesDateRange } from "./useServiceFilters";
import type { Service } from "../types/service.types";

// Minimal fixture factory - only fields relevant to filter logic
function makeService(overrides: Partial<Service>): Service {
  return {
    id: 1,
    description: "Funchal to Santana",
    scheduledAt: "2025-06-15T10:00:00.000Z",
    status: "scheduled",
    type: "Tour",
    stops: [],
    vehicle: { id: 1, licensePlate: "00-AA-00", brand: "Mercedes", model: "Sprinter", year: 2020, passengerCapacity: 20, type: "van", color: "white" },
    driver: { id: 1, name: "João Silva", gender: "Masculino", license: "D", entitledToDrive: "van" },
    ...overrides,
  } as Service;
}

// ─── matchesStatus ───────────────────────────────────────────────────────────
describe("matchesStatus()", () => {
  it("returns true when filter is 'all'", () => {
    const s = makeService({ status: "scheduled" });
    expect(matchesStatus(s, "all")).toBe(true);
  });

  it("returns true when service status matches filter", () => {
    const s = makeService({ status: "ongoing" });
    expect(matchesStatus(s, "ongoing")).toBe(true);
  });

  it("returns false when service status does not match filter", () => {
    const s = makeService({ status: "scheduled" });
    expect(matchesStatus(s, "completed")).toBe(false);
  });

  it("handles each concrete status correctly", () => {
    for (const status of ["scheduled", "ongoing", "completed", "cancelled"] as const) {
      const s = makeService({ status });
      expect(matchesStatus(s, status)).toBe(true);
      expect(matchesStatus(s, "all")).toBe(true);
    }
  });
});

// ─── matchesSearch ───────────────────────────────────────────────────────────
describe("matchesSearch()", () => {
  it("returns true when search is empty string", () => {
    expect(matchesSearch(makeService({}), "")).toBe(true);
  });

  it("returns true when search is whitespace only", () => {
    expect(matchesSearch(makeService({}), "   ")).toBe(true);
  });

  it("matches a substring case-insensitively", () => {
    const s = makeService({ description: "Funchal to Santana" });
    expect(matchesSearch(s, "funchal")).toBe(true);
    expect(matchesSearch(s, "SANTANA")).toBe(true);
    expect(matchesSearch(s, "to Santana")).toBe(true);
  });

  it("returns false when search does not match description", () => {
    const s = makeService({ description: "Funchal to Santana" });
    expect(matchesSearch(s, "Lisbon")).toBe(false);
  });

  it("trims leading/trailing whitespace from search term", () => {
    const s = makeService({ description: "Airport Transfer" });
    expect(matchesSearch(s, "  Airport  ")).toBe(true);
  });
});

// ─── matchesDateRange ─────────────────────────────────────────────────────────
describe("matchesDateRange()", () => {
  const ISO_DATE = "2025-06-15T10:00:00.000Z";

  it("returns true when both startDate and endDate are empty", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "", "")).toBe(true);
  });

  it("returns true when scheduledAt is after startDate", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "2025-06-01", "")).toBe(true);
  });

  it("returns false when scheduledAt is before startDate", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "2025-07-01", "")).toBe(false);
  });

  it("returns true when scheduledAt is before end of endDate", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "", "2025-06-30")).toBe(true);
  });

  it("returns false when scheduledAt is after endDate (end of day)", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "", "2025-06-14")).toBe(false);
  });

  it("returns true when scheduledAt falls exactly on startDate", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "2025-06-15", "")).toBe(true);
  });

  it("returns true when scheduledAt falls exactly on endDate", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "", "2025-06-15")).toBe(true);
  });

  it("returns true when scheduledAt is within startDate-endDate range", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "2025-06-01", "2025-06-30")).toBe(true);
  });

  it("returns false when scheduledAt is outside startDate-endDate range", () => {
    expect(matchesDateRange(makeService({ scheduledAt: ISO_DATE }), "2025-07-01", "2025-07-31")).toBe(false);
  });

  it("returns false when scheduledAt is an invalid date string", () => {
    expect(matchesDateRange(makeService({ scheduledAt: "not-a-date" }), "2025-06-01", "2025-06-30")).toBe(false);
  });
});



