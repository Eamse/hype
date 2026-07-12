'use client';

import { useState, useEffect } from 'react';
import { inputStyle } from './types';
import Flag from 'react-world-flags';

type User = {
  id: string;
  email: string;
  name: string | null;
  gender: string | null;
  country: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  birthYear: string | null;
  birthMonth: string | null;
  birthDay: string | null;
  createdAt: string;
  provider: string;
};

export default function UserPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ padding: '32px 24px' }}>
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2d1f1f' }}>
          Members
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#000',
              marginLeft: 8,
            }}
          >
            {users.length}명
          </span>
        </h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이메일 또는 이름 검색"
          style={{ ...inputStyle, width: 240, fontSize: 13 }}
        />
      </div>

      {/* 테이블 */}
      {loading ? (
        <p style={{ color: '#000', fontSize: 14 }}>불러오는 중...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#000', fontSize: 14 }}>회원이 없어요.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                {[
                  'Provider',
                  'Email',
                  'Name',
                  'Gender',
                  'Nationality',
                  'Phone',
                  'Birth',
                  'Joined At',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#6b4c4c',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0e8e8' }}>
                  <td style={{ padding: '10px 12px' }}>
                    {user.provider === 'google' ? (
                      <span
                        style={{
                          background: '#e8f0fe',
                          color: '#1a73e8',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Google
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#000',
                          color: '#000',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Email
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.name ?? '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.gender ?? '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.country ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Flag
                          code={user.country}
                          style={{ width: 20, height: 14 }}
                        />
                        {user.country}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.phoneCountryCode && user.phone
                      ? `${user.phoneCountryCode} ${user.phone}`
                      : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#2d1f1f' }}>
                    {user.birthYear && user.birthMonth && user.birthDay
                      ? `${user.birthYear}.${user.birthMonth}.${user.birthDay}`
                      : '-'}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: '#000',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
