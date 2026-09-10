export function maskName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed)
        return trimmed;
    const [first, ...rest] = trimmed.split(/\s+/);
    if (rest.length === 0) {
        return first.length <= 1 ? `${first}*****` : `${first[0]}*****`;
    }
    return `${first}*****`;
}
