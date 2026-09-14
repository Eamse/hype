export function maskName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed)
        return trimmed;
    const [first] = trimmed.split(/\s+/);
    return first.length <= 1 ? `${first}*****` : `${first[0]}*****`;
}
