import { describe, it, expect } from 'vitest';
import { toggleId } from './wedding-photographer-types';

describe('toggleId', () => {
    it('없는 id는 추가한다', () => {
        expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it('있는 id는 제거한다', () => {
        expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
    });

    it('빈 배열에 추가할 수 있다', () => {
        expect(toggleId([], 5)).toEqual([5]);
    });

    it('원본 배열을 변경하지 않는다', () => {
        const original = [1, 2];
        toggleId(original, 3);
        expect(original).toEqual([1, 2]);
    });
});
