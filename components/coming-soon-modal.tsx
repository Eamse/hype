'use client';

export default function ComingSoonModal({
  brand,
  onClose,
}: {
  brand: string;
  onClose: () => void;
}) {
  // 1. 화면 전체를 덮는 반투명 배경 div를 그린다
  // 2. 배경을 클릭하면 onClose를 실행해서 닫히게 한다
  // 3. 배경 안에 카드(모달 박스)를 하나 그린다
  // 4. 카드를 클릭했을 때는 배경 클릭 이벤트로 안 이어지게(안 닫히게) 막는다
  // 5. 카드 안에 "{brand}는 곧 공개됩니다" 같은 문구를 보여준다
  // 6. 닫기 버튼을 하나 두고, 누르면 onClose 실행
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10,10,10,0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '52px 40px 40px',
          maxWidth: 380,
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          animation: 'modalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 카드 상단 브랜드 색 강조선 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #2D5A45, #4a8a6a)',
          }}
        />

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: '#bbb',
            fontSize: 16,
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f4f4f4';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#bbb';
          }}
        >
          ✕
        </button>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D5A45, #3f7a5c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 22px',
            fontSize: 20,
            color: '#fff',
            boxShadow: '0 8px 20px rgba(45,90,69,0.35)',
          }}
        >
          ✦
        </div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '2.5px',
            color: '#2D5A45',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Coming Soon
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: 14,
            textTransform: 'uppercase',
            color: '#000',
          }}
        >
          {brand}
        </h2>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: 30 }}>
          This page is currently being prepared.
          <br />
          Thank you for your patience.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '13px 36px',
            background: 'linear-gradient(135deg, #2D5A45, #3f7a5c)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(45,90,69,0.3)',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
