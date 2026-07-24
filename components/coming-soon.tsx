import Header from '@/components/header';

// 클라이언트 기획 확정 전까지 임시로 노출하는 빈 페이지.
// 실제 페이지 로직/컴포넌트는 그대로 두고 진입만 이걸로 막아둔 것 — 기획 나오면 이 컴포넌트 대신 원래 페이지를 다시 렌더링하면 됨.
export default function ComingSoon({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  return (
    <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <Header brand={brand} />
      <main
        style={{
          paddingTop: 56,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: '#bbb',
              marginBottom: 16,
            }}
          >
            {brand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'}
          </p>
          <h1
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}
          >
            COMING SOON
          </h1>
        </div>
      </main>
    </div>
  );
}
