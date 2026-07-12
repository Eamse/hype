'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSignIn() {
  const router = useRouter();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'id' | 'pw' | null>(null);
  const [btnHover, setBtnHover] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginId || !password) return;
    const result = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    });
    if (!result.ok) {
      setErrors('Please check your ID and password.');
    } else {
      router.push('/admin');
    }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    padding: '13px 16px',
    border: `1px solid ${focused ? '#c9956a' : '#4a2e20'}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    color: '#fff',
    backgroundColor: '#3a2018',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: focused ? '0 0 0 3px rgba(184,134,90,0.18)' : 'none',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes blobMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes blobMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.08); }
          66% { transform: translate(20px, -10px) scale(0.96); }
        }
        @keyframes blobMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -25px) scale(1.04); }
        }
        @keyframes lineShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-18px) scale(1.08); opacity: 1; }
        }
        @keyframes heartFloat2 {
          0%, 100% { transform: translateY(0) scale(1) rotate(-10deg); opacity: 0.65; }
          50% { transform: translateY(14px) scale(0.92) rotate(-10deg); opacity: 0.95; }
        }
        ::placeholder { color: #6a4a38; }
      `}</style>

      {/* 떠다니는 하트들 */}
      {[
        {
          top: '12%',
          left: '8%',
          size: 36,
          delay: '0s',
          anim: 'heartFloat',
          color: 'rgba(220,60,100,0.95)',
        },
        {
          top: '20%',
          right: '10%',
          size: 22,
          delay: '1s',
          anim: 'heartFloat2',
          color: 'rgba(200,80,130,0.9)',
        },
        {
          top: '70%',
          left: '5%',
          size: 28,
          delay: '0.5s',
          anim: 'heartFloat',
          color: 'rgba(230,90,140,0.95)',
        },
        {
          top: '75%',
          right: '7%',
          size: 44,
          delay: '1.5s',
          anim: 'heartFloat2',
          color: 'rgba(180,40,90,0.95)',
        },
        {
          top: '45%',
          left: '90%',
          size: 18,
          delay: '2s',
          anim: 'heartFloat',
          color: 'rgba(215,70,115,0.92)',
        },
        {
          top: '5%',
          left: '50%',
          size: 14,
          delay: '0.8s',
          anim: 'heartFloat2',
          color: 'rgba(240,100,150,0.9)',
        },
        {
          top: '55%',
          left: '2%',
          size: 20,
          delay: '1.8s',
          anim: 'heartFloat',
          color: 'rgba(190,50,95,0.95)',
        },
        {
          top: '88%',
          left: '40%',
          size: 16,
          delay: '0.3s',
          anim: 'heartFloat2',
          color: 'rgba(225,80,125,0.92)',
        },
      ].map((h, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: h.top,
            left: 'left' in h ? h.left : undefined,
            right: 'right' in h ? h.right : undefined,
            width: h.size,
            height: h.size,
            animation: `${h.anim} ${4 + i * 0.4}s ease-in-out ${h.delay} infinite`,
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={h.color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      ))}

      {/* 대각선 라인 패턴 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(184,134,90,0.18) 40px,
            rgba(184,134,90,0.18) 41px
          )`,
          pointerEvents: 'none',
        }}
      />
      {/* 반대 방향 라인 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(201,149,106,0.1) 80px,
            rgba(201,149,106,0.1) 81px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* 원형 블러 오브 */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: 550,
          height: 550,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(210,120,150,0.75) 0%, transparent 65%)',
          animation: 'blobMove1 8s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-8%',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,130,80,0.65) 0%, transparent 65%)',
          animation: 'blobMove2 10s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(70px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '65%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(230,140,170,0.7) 0%, transparent 65%)',
          animation: 'blobMove3 7s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245,180,200,0.65) 0%, transparent 65%)',
          animation: 'blobMove1 9s ease-in-out 2s infinite',
          pointerEvents: 'none',
          filter: 'blur(45px)',
        }}
      />

      {/* 카드 */}
      <div
        style={{
          position: 'relative',
          width: 400,
          borderRadius: 20,
          padding: '48px 36px',
          border: '1px solid rgba(184,134,90,0.3)',
          boxShadow:
            '0 24px 64px rgba(80,20,10,0.3), inset 0 1px 0 rgba(184,134,90,0.15)',
          backgroundColor: '#2c1a14',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}
      >
        {/* 카드 상단 로즈골드 라인 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #c9956a, #e8b88a, #c9956a, transparent)',
          }}
        />

        {/* 데코 라인 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(to right, transparent, #b8865a)',
            }}
          />
          <p
            style={{
              fontSize: 9,
              letterSpacing: '4px',
              color: '#b8865a',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            HYPE WEDDING
          </p>
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(to left, transparent, #b8865a)',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 300,
            color: '#fff',
            marginBottom: 8,
            letterSpacing: '0.5px',
          }}
        >
          Welcome Back
        </h1>
        <p style={{ fontSize: 12, color: '#7a5a4a', marginBottom: 32 }}>
          Admin Portal
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="text"
            value={loginId}
            placeholder="ID"
            onChange={(e) => setLoginId(e.target.value)}
            onFocus={() => setFocusedInput('id')}
            onBlur={() => setFocusedInput(null)}
            style={inputStyle(focusedInput === 'id')}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput('pw')}
            onBlur={() => setFocusedInput(null)}
            style={inputStyle(focusedInput === 'pw')}
          />
          {errors && (
            <p style={{ fontSize: 12, color: '#f87171', margin: '2px 0 0' }}>
              {errors}
            </p>
          )}
          <button
            type="submit"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              marginTop: 10,
              padding: '14px',
              background: btnHover
                ? 'linear-gradient(135deg, #dba878, #c9956a)'
                : 'linear-gradient(135deg, #c9956a, #b8865a)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
              transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: btnHover
                ? '0 8px 20px rgba(184,134,90,0.4)'
                : '0 4px 12px rgba(184,134,90,0.2)',
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
