import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import { renderWithProviders } from "../../../test/utils";
import { server } from "../../../test/setup";
import { http, HttpResponse } from "msw";

describe("Login Component", () => {
  it("renders login form", () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for invalid inputs", async () => {
    renderWithProviders(<Login />);
    const user = userEvent.setup();

    // Click submit without entering any data
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("handles successful login", async () => {
    server.use(
      http.post(`${import.meta.env.VITE_API_URL}/api/v1/users/login`, () => {
        return HttpResponse.json({
          data: {
            user: { id: "1", email: "test@example.com" },
            accessToken: "fake-token",
          },
        });
      })
    );

    renderWithProviders(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  it("handles login error", async () => {
    server.use(
      http.post(`${import.meta.env.VITE_API_URL}/api/v1/users/login`, () => {
        return new HttpResponse(null, {
          status: 401,
          statusText: "Unauthorized",
        });
      })
    );

    renderWithProviders(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
