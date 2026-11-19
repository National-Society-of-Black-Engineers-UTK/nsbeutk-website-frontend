import { describe, expect, it } from "vitest";
import { isSafeNextPath, isUtkEmail } from "./validation";

describe("isUtkEmail", () => {
  it.each(["@utk.edu", "a@@utk.edu", "first last@utk.edu", "a\n@utk.edu"])("rejects malformed address %j", (email) => {
    expect(isUtkEmail(email)).toBe(false);
  });

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

  it("accepts a vols.utk.edu address", () => {
    expect(isUtkEmail("student@vols.utk.edu")).toBe(true);
  });

  it("rejects a lookalike vols domain", () => {
    expect(isUtkEmail("student@fakevols.utk.edu")).toBe(false);
  });
});

describe("isSafeNextPath", () => {
  it.each(["/\\evil.com", "/\n/evil.com", "/\t/evil.com", "/\r/evil.com"])("rejects URL normalization bypass %j", (path) => {
    expect(isSafeNextPath(path)).toBe(false);
  });

  it("accepts a same-origin relative path", () => {
    expect(isSafeNextPath("/portal")).toBe(true);
  });

  it("accepts a nested relative path", () => {
    expect(isSafeNextPath("/officer/roster")).toBe(true);
  });

  it("rejects a protocol-relative path (open redirect)", () => {
    expect(isSafeNextPath("//evil.com")).toBe(false);
  });

  it("rejects an absolute URL", () => {
    expect(isSafeNextPath("https://evil.com")).toBe(false);
  });

  it("rejects a userinfo-style open redirect", () => {
    expect(isSafeNextPath("@evil.com")).toBe(false);
  });

  it("rejects a path not starting with a slash", () => {
    expect(isSafeNextPath("evil.com")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isSafeNextPath("")).toBe(false);
  });
});
