import Header from '@/components/header';
export default function ComingSoon({ brand, }: {
    brand: 'hype-wedding' | 'hype-snap';
}) {
    return (<div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <Header brand={brand}/>
      <main style={{
            paddingTop: 56,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
        }}>
        <div>
          <p style={{
            fontSize: 11,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#bbb',
            marginBottom: 16,
        }}>
            {brand === 'hype-snap' ? 'HYPE SNAP' : 'HYPE WEDDING'}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>
            COMING SOON
          </h1>
        </div>
      </main>
    </div>);
}
