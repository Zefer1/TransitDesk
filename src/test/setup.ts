/**
 * Vitest global test setup file.
 *
 * This runs before every test file in the project. It does two things:
 *  1. Imports jest-dom matchers (e.g., `toBeInTheDocument()`, `toHaveTextContent()`)
 *     so they are available in all test files without explicit imports.
 *  2. Cleans up the JSDOM environment after each test to prevent leaked DOM state
 *     from one test affecting the next.
 *
 * Referenced by `setupFiles` in vitest.config.ts.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});



