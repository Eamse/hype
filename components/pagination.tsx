const GROUP_SIZE = 5;
export default function Pagination({ currentPage, totalPages, buildHref, }: {
    currentPage: number;
    totalPages: number;
    buildHref: (page: number) => string;
}) {
    if (totalPages <= 1)
        return null;
    const currentGroup = Math.ceil(currentPage / GROUP_SIZE);
    const groupStart = (currentGroup - 1) * GROUP_SIZE + 1;
    const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
    const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);
    const linkStyle = (active: boolean): React.CSSProperties => ({
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid #000',
        fontWeight: active ? 700 : 400,
        color: active ? '#000' : '#bbb',
        textDecoration: 'none',
    });
    return (<div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      {groupStart > 1 && (<a href={buildHref(groupStart - 1)} style={linkStyle(false)}>
          이전
        </a>)}
      {pages.map((p) => (<a key={p} href={buildHref(p)} style={linkStyle(p === currentPage)}>
          {p}
        </a>))}
      {groupEnd < totalPages && (<>
          <span style={{ padding: '6px 4px', color: '#bbb' }}>...</span>
          <a href={buildHref(groupEnd + 1)} style={linkStyle(false)}>
            다음
          </a>
        </>)}
    </div>);
}
