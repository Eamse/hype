export function stripPassword<T extends { password: unknown }>(
    review: T,
): Omit<T, 'password'> {
    const { password: _password, ...rest } = review;
    return rest;
}
