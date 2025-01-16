import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock server setup
export const server = setupServer(
  // Add your API mocks here
  http.get(`${import.meta.env.VITE_API_URL}/api/v1/dashboard/stats`, () => {
    return HttpResponse.json({
      data: {
        performanceSummary: {
          totalAttempts: 10,
          averageScore: 75,
          totalTimeSpent: 3600,
        },
        recentActivity: [],
        weakAreas: [],
        activeSubscriptions: [],
      },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
