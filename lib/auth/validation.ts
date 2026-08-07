const UTK_EMAIL_DOMAIN = "@utk.edu";

export function isUtkEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(UTK_EMAIL_DOMAIN);
}
