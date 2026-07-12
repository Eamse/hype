import SubTabBar from '@/components/sub-tab-bar';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'history', label: 'History' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'achievement', label: 'Achievement' },
];

export default function AboutClient({
  brand,
}: {
  brand: 'hype-wedding' | 'hype-snap';
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SubTabBar tabs={SECTIONS} />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px 120px',
        }}
      >
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              scrollMarginTop: 106,
              minHeight: '50vh',
              paddingTop: 60,
              borderBottom: '1px solid #000',
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>
              {section.label}
            </h2>
            {/* TODO: {section.label} 콘텐츠 추가 */}
            <p style={{ color: '#000', fontSize: 14 }}>
              {brand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'} {section.label} 콘텐츠 들어갈 자리
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
