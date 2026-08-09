const UTK_EMAIL_DOMAINS = ["@utk.edu", "@vols.utk.edu"];

export function isUtkEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return UTK_EMAIL_DOMAINS.some((domain) => normalized.endsWith(domain));
}
