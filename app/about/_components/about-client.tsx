export default function AboutClient({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 20px 120px',
        }}
      >
        {/* TODO: 어바웃 컨텐츠 추가 */}
        <p style={{ color: '#767676', fontSize: 14 }}>
          {brand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'} About 소개 들어갈 자리
        </p>
      </div>
    </div>
  );
}
