import { describe, it, expect } from "vitest";
import { canTransition, ALLOWED_TRANSITIONS } from "./serviceStatuses";

describe("ALLOWED_TRANSITIONS matrix", () => {
  it("scheduled allows ongoing and cancelled", () => {
    expect(ALLOWED_TRANSITIONS.scheduled).toEqual(["ongoing", "cancelled"]);
  });

  it("ongoing allows cancelled and completed", () => {
    expect(ALLOWED_TRANSITIONS.ongoing).toEqual(["cancelled", "completed"]);
  });

  it("cancelled has no allowed transitions", () => {
    expect(ALLOWED_TRANSITIONS.cancelled).toEqual([]);
  });

  it("completed has no allowed transitions", () => {
    expect(ALLOWED_TRANSITIONS.completed).toEqual([]);
  });
});

describe("canTransition()", () => {
  // Valid transitions
  it("allows scheduled to ongoing", () => {
    expect(canTransition("scheduled", "ongoing")).toBe(true);
  });

  it("allows scheduled to cancelled", () => {
    expect(canTransition("scheduled", "cancelled")).toBe(true);
  });

  it("allows ongoing to completed", () => {
    expect(canTransition("ongoing", "completed")).toBe(true);
  });

  it("allows ongoing to cancelled", () => {
    expect(canTransition("ongoing", "cancelled")).toBe(true);
  });

  // Invalid transitions
  it("forbids scheduled to completed", () => {
    expect(canTransition("scheduled", "completed")).toBe(false);
  });

  it("forbids scheduled to scheduled (self-transition)", () => {
    expect(canTransition("scheduled", "scheduled")).toBe(false);
  });

  it("forbids ongoing to scheduled", () => {
    expect(canTransition("ongoing", "scheduled")).toBe(false);
  });

  it("forbids completed to any status", () => {
    expect(canTransition("completed", "scheduled")).toBe(false);
    expect(canTransition("completed", "ongoing")).toBe(false);
    expect(canTransition("completed", "cancelled")).toBe(false);
    expect(canTransition("completed", "completed")).toBe(false);
  });

  it("forbids cancelled to any status", () => {
    expect(canTransition("cancelled", "scheduled")).toBe(false);
    expect(canTransition("cancelled", "ongoing")).toBe(false);
    expect(canTransition("cancelled", "completed")).toBe(false);
    expect(canTransition("cancelled", "cancelled")).toBe(false);
  });
});



