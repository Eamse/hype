// Shoot Details(촬영시간/장소/원본사진수)의 값에서 숫자(굵은 글씨) 부분과
// 단위(작은 글씨) 부분을 분리한다. "4.5 - 5 hours" 같은 숫자 범위도
// 하이픈까지 통째로 숫자로 인식해야 한다.
export function parseShootDetailValue(value: string): { num: string; unit: string } {
    const m = value.match(/^([\d,.+]+(?:\s*-\s*[\d,.+]+)?)\s*(.*)$/);
    return {
        num: m ? m[1] : value,
        unit: m ? m[2] : '',
    };
}

// addon 설명 텍스트를 문장 단위로 줄바꿈한다. "Approx." 같은 줄임말 뒤의
// 마침표는 문장의 끝이 아니므로 분리하지 않는다.
export function splitAddonDescIntoLines(text: string): string {
    const sentences = text
        .split(/(?<!\bApprox)(?<!\bapprox)\.\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    if (sentences.length <= 1)
        return text;
    return sentences
        .map((s, i) => (i < sentences.length - 1 ? `${s}.` : s.endsWith('.') ? s : `${s}.`))
        .join('\n');
}
