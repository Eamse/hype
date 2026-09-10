import { useState, useCallback } from 'react';
export function useSelection<T extends {
    id: number;
}>(items: T[]) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const toggleAll = useCallback(() => {
        setSelectedIds((prev) => prev.size === items.length && items.length > 0
            ? new Set()
            : new Set(items.map((i) => i.id)));
    }, [items]);
    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
    return { selectedIds, toggleSelect, toggleAll, clearSelection };
}
