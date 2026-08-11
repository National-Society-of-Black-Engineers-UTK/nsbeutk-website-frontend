import { describe, expect, it } from "vitest";
import { isAuthorizedCronRequest } from "./cron-auth";

describe("isAuthorizedCronRequest", () => {
  it("accepts a matching bearer token", () => {
    expect(isAuthorizedCronRequest("Bearer secret123", "secret123")).toBe(true);
  });

  it("rejects a missing authorization header", () => {
    expect(isAuthorizedCronRequest(null, "secret123")).toBe(false);
  });

  it("rejects a mismatched token", () => {
    expect(isAuthorizedCronRequest("Bearer wrong", "secret123")).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    expect(isAuthorizedCronRequest("Bearer secret123", undefined)).toBe(false);
  });
});
