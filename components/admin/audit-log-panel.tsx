'use client';

import { useEffect, useState } from 'react';
import { inputStyle, labelStyle, btnStyle } from './types';

type LogEntry = {
  id: number;
  model: string;
  recordId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  admin: { name: string; loginId: string };
};

const PAGE_SIZE = 50;

export default function AuditLogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // 입력할 때마다 바로 요청하지 않고, 검색 버튼(또는 엔터)을 눌렀을 때만 실제 쿼리에 반영
  const [appliedQ, setAppliedQ] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (appliedQ) params.set('q', appliedQ);
    if (appliedFrom) params.set('from', appliedFrom);
    if (appliedTo) params.set('to', appliedTo);

    fetch(`/api/admin/audit-log?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      })
      .finally(() => setLoading(false));
  }, [page, appliedQ, appliedFrom, appliedTo]);

  function applyFilters() {
    setPage(1);
    setAppliedQ(q);
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        수정 로그
      </h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
        상품/패키지 등 콘텐츠가 수정될 때 자동으로 기록됩니다. 이 로그는 삭제할 수 없습니다.
      </p>

      {/* 필터 */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <label style={labelStyle}>검색 (계정/필드/값 등)</label>
          <input
            style={{ ...inputStyle, width: 220 }}
            value={q}
            placeholder="예: title, Jeju and You"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <div>
          <label style={labelStyle}>시작일</label>
          <input
            style={inputStyle}
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>종료일</label>
          <input
            style={inputStyle}
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button style={btnStyle('#000', '#fff')} onClick={applyFilters}>
          검색
        </button>
      </div>

      {loading && <p style={{ fontSize: 13, color: '#000' }}>불러오는 중...</p>}
      {!loading && logs.length === 0 && (
        <p style={{ fontSize: 13, color: '#000' }}>기록된 로그가 없습니다.</p>
      )}

      {!loading && logs.length > 0 && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #000' }}>
                  <th style={{ padding: '8px 10px' }}>날짜/시간</th>
                  <th style={{ padding: '8px 10px' }}>계정</th>
                  <th style={{ padding: '8px 10px' }}>대상</th>
                  <th style={{ padding: '8px 10px' }}>필드</th>
                  <th style={{ padding: '8px 10px' }}>변경 전</th>
                  <th style={{ padding: '8px 10px' }}>변경 후</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#666' }}>
                      {new Date(log.createdAt).toLocaleString('ko-KR')}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {log.admin.name} ({log.admin.loginId})
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {log.model} #{log.recordId}
                    </td>
                    <td style={{ padding: '8px 10px' }}>{log.field}</td>
                    <td style={{ padding: '8px 10px', color: '#888', maxWidth: 220 }}>
                      {log.oldValue ?? '(없음)'}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 220 }}>
                      {log.newValue ?? '(없음)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              style={btnStyle('#fff', '#000', '#000')}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              이전
            </button>
            <span style={{ fontSize: 13, color: '#000' }}>
              {page} / {totalPages} ({total}건)
            </span>
            <button
              style={btnStyle('#fff', '#000', '#000')}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
