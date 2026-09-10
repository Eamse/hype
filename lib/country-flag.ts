export function countryFlag(isoCode: string): string {
    const code = isoCode.trim().toUpperCase();
    if (code.length !== 2)
        return '';
    const points = [...code].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
    return String.fromCodePoint(...points);
}
