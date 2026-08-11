export function isAuthorizedCronRequest(
  authorizationHeader: string | null,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) {
    return false;
  }

  return authorizationHeader === `Bearer ${expectedSecret}`;
}
