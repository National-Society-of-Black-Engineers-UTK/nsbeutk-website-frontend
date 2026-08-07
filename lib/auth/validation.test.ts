import { describe, expect, it } from "vitest";
import { isUtkEmail } from "./validation";

describe("isUtkEmail", () => {
  it("accepts a plain utk.edu address", () => {
    expect(isUtkEmail("student@utk.edu")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isUtkEmail("Student@UTK.EDU")).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(isUtkEmail("  student@utk.edu  ")).toBe(true);
  });

  it("rejects a different domain", () => {
    expect(isUtkEmail("student@gmail.com")).toBe(false);
  });

  it("rejects a lookalike domain that merely ends in utk.edu", () => {
    expect(isUtkEmail("student@fakeutk.edu")).toBe(false);
  });

  it("rejects a non-email string", () => {
    expect(isUtkEmail("not-an-email")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isUtkEmail("")).toBe(false);
  });
});
