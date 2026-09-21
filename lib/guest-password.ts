export const GUEST_PASSWORD_RULE = /^.{4,}$/;

export const GUEST_PASSWORD_HINT =
  'Must be at least 4 characters.';

export function isStrongGuestPassword(password: string): boolean {
  return GUEST_PASSWORD_RULE.test(password);
}
