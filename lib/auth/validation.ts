const UTK_EMAIL_DOMAINS = ["@utk.edu", "@vols.utk.edu"];

export function isUtkEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+$/.test(normalized) &&
    UTK_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
}

export function isSafeNextPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") &&
    !/[\\\u0000-\u0020\u007f]/.test(path);
}
