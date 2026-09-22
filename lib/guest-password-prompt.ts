export const GUEST_PASSWORD_PROMPT = 'Please enter the password you used when posting.';

export function promptGuestPassword(): string | null {
    return window.prompt(GUEST_PASSWORD_PROMPT);
}
