'use client';
import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
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
    async function handleExportExcel() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Members');
        sheet.columns = [
            { header: 'Provider', key: 'provider', width: 12 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Name', key: 'name', width: 16 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Nationality', key: 'country', width: 12 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Birth', key: 'birth', width: 14 },
            { header: 'Joined At', key: 'joinedAt', width: 14 },
        ];
        sheet.getRow(1).font = { bold: true };
        for (const user of users) {
            sheet.addRow({
                provider: user.provider === 'google' ? 'Google' : 'Email',
                email: user.email,
                name: user.name ?? '',
                gender: user.gender ?? '',
                country: user.country ?? '',
                phone: user.phoneCountryCode && user.phone ? `${user.phoneCountryCode} ${user.phone}` : '',
                birth: user.birthYear && user.birthMonth && user.birthDay
                    ? `${user.birthYear}.${user.birthMonth}.${user.birthDay}`
                    : '',
                joinedAt: new Date(user.createdAt).toLocaleDateString('ko-KR'),
            });
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `members_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    }
    return (<div style={{ padding: '32px 24px' }}>
      
      <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
        }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#232323' }}>
          Members
          <span style={{
            fontSize: 13,
            fontWeight: 400,
            color: '#000',
            marginLeft: 8,
        }}>
            {users.length}명
          </span>
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이메일 또는 이름 검색" style={{ ...inputStyle, width: 240, fontSize: 13 }}/>
          <button onClick={handleExportExcel} disabled={users.length === 0} style={{
            padding: '0 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#333',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: 3,
            cursor: users.length === 0 ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
        }}>
            엑셀 다운로드
          </button>
        </div>
      </div>

      
      {loading ? (<p style={{ color: '#000', fontSize: 14 }}>불러오는 중...</p>) : users.length === 0 ? (<p style={{ color: '#000', fontSize: 14 }}>회원이 없어요.</p>) : (<div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
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
            ].map((h) => (<th key={h} style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#555555',
                    whiteSpace: 'nowrap',
                }}>
                    {h}
                  </th>))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (<tr key={user.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '10px 12px' }}>
                    {user.provider === 'google' ? (<span style={{
                        background: '#efefef',
                        color: '#666666',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                    }}>
                        Google
                      </span>) : (<span style={{
                        background: 'white',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                    }}>
                        Email
                      </span>)}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.name ?? '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.gender ?? '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.country ? (<div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}>
                        <Flag code={user.country} style={{ width: 20, height: 14 }}/>
                        {user.country}
                      </div>) : ('-')}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.phoneCountryCode && user.phone
                    ? `${user.phoneCountryCode} ${user.phone}`
                    : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#232323' }}>
                    {user.birthYear && user.birthMonth && user.birthDay
                    ? `${user.birthYear}.${user.birthMonth}.${user.birthDay}`
                    : '-'}
                  </td>
                  <td style={{
                    padding: '10px 12px',
                    color: '#000',
                    whiteSpace: 'nowrap',
                }}>
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </div>);
}
