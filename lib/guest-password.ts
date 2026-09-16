export const GUEST_PASSWORD_RULE = /^(?=.*[^A-Za-z0-9]).{8,}$/;

export const GUEST_PASSWORD_HINT =
  '8자 이상, 특수문자를 포함해야 합니다.';

export function isStrongGuestPassword(password: string): boolean {
  return GUEST_PASSWORD_RULE.test(password);
}
