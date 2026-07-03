'use client';

type Props = {
  total: number;
  selectedCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onDeleteSelected: () => Promise<void>;
};

export default function BulkActions({
  total,
  selectedCount,
  allSelected,
  onToggleAll,
  onDeleteSelected,
}: Props) {
  if (total === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px',
        background: '#fafaf8',
        borderRadius: 8,
        border: '1px solid #ede8de',
      }}
    >
      <label
        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', userSelect: 'none' }}
      >
        <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
        전체 선택
      </label>

      {selectedCount > 0 && (
        <>
          <span style={{ fontSize: 12, color: '#888' }}>{selectedCount}개 선택됨</span>
          <button
            onClick={async () => {
              if (!confirm(`선택한 ${selectedCount}개를 삭제할까요?`)) return;
              await onDeleteSelected();
            }}
            style={{
              fontSize: 12,
              padding: '4px 14px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            선택 삭제
          </button>
        </>
      )}
    </div>
  );
}
