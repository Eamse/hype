'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { type Magazine, btnStyle } from './types';

export default function MagazinePanel() {
  const [view, setView] = useState<'list' | 'form' | 'done'>('list');
  const [selected, setSelected] = useState<Magazine | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [detailImages, setDetailImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const detailImgRef = useRef<HTMLInputElement>(null);

  // 목록 불러오기
  function loadMagazines() {
    const controller = new AbortController();
    fetch('/api/admin/magazine', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json() as Promise<Magazine[]>;
      })
      .then((data) => setMagazines(data))
      .catch((e: Error) => {
        if (e.name !== 'AbortError') console.error(e);
      });
  }

  useEffect(() => {
    loadMagazines();
  }, []);

  // 폼 초기화
  function resetForm() {
    setTitle('');
    setContent('');
    setNewImage(null);
    setNewImagePreview(null);
    setSaveError(null);
    setSelected(null);
    setDetailImages([]);
  }

  // 수정 버튼 클릭 시 폼에 기존 데이터 채우기
  function handleEdit(m: Magazine) {
    setSelected(m);
    setTitle(m.title);
    setContent(m.content);
    setNewImage(null);
    setNewImagePreview(m.imageUrl);
    setSaveError(null);
    setView('form');
    setDetailImages([]);
  }

  // 삭제
  async function handleDelete(id: number) {
    if (!confirm('삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    const res = await fetch(`/api/admin/magazine/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadMagazines();
    } else {
      alert('삭제에 실패했습니다.');
    }
  }

  // 저장 (생성 or 수정)
  async function handleSave() {
    if (!title.trim()) {
      setSaveError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setSaveError('내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      let imageUrl: string | null = selected?.imageUrl ?? null;
      // 썸네일 이미지 업로드
      if (newImage) {
        const fd = new FormData();
        fd.append('key', `magazine_${selected?.id ?? 'new'}`);
        fd.append('image', newImage);
        const imgRes = await fetch('/api/images', { method: 'POST', body: fd });
        if (imgRes.ok) {
          const imgData = (await imgRes.json()) as { imageUrl: string };
          imageUrl = imgData.imageUrl;
        }
      }

      const body = {
        title: title.trim(),
        content: content.trim(),
        imageUrl,
      };

      const res = selected
        ? await fetch(`/api/admin/magazine/${selected.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/magazine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data: unknown = await res.json();
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : '저장에 실패했습니다.';
        throw new Error(msg);
      }
      const saved = (await res.json()) as { id: number };
      const magazineId = selected ? selected.id : saved.id;

      if (detailImages.length > 0) {
        const fd = new FormData();
        detailImages.forEach(({ file }) => fd.append('images', file));
        await fetch(`/api/admin/magazine/${magazineId}/images`, {
          method: 'POST',
          body: fd,
        });
      }
      loadMagazines();
      setView('done');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* ── 목록 화면 ── */}
      {view === 'list' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Magazine</h2>
            <button
              onClick={() => {
                resetForm();
                setView('form');
              }}
              style={btnStyle('#191919', '#fff')}
            >
              + 글 작성
            </button>
          </div>

          {magazines.length === 0 ? (
            <div
              style={{
                padding: '48px 0',
                textAlign: 'center',
                color: '#bbb',
                fontSize: 13,
              }}
            >
              아직 글이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {magazines.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* 썸네일 */}
                  {m.imageUrl && (
                    <div
                      style={{
                        position: 'relative',
                        width: 56,
                        height: 56,
                        borderRadius: 6,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={m.imageUrl}
                        alt={m.title}
                        fill
                        sizes="56px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* 정보 */}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#191919',
                        marginBottom: 4,
                      }}
                    >
                      {m.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#aaa' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleEdit(m)}
                      style={btnStyle('transparent', '#191919', '#191919')}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={btnStyle('transparent', '#ef4444', '#ef4444')}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 작성/수정 폼 ── */}
      {view === 'form' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {selected ? '글 수정' : '글 작성'}
            </h2>
            <button
              onClick={() => setView('list')}
              style={btnStyle('transparent', '#555', '#ddd')}
            >
              ← 목록으로
            </button>
          </div>

          {saveError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#dc2626',
              }}
            >
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 제목 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#888',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}
              >
                제목
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="매거진 제목"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: '1px solid #e0e0e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: '#191919',
                }}
              />
            </div>

            {/* 내용 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#888',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}
              >
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="매거진 내용"
                rows={10}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: '1px solid #e0e0e0',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: '#191919',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* 이미지 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#888',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}
              >
                이미지 (선택)
              </label>
              <input
                ref={imgRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setNewImage(f);
                    setNewImagePreview(URL.createObjectURL(f));
                  }
                  e.target.value = '';
                }}
              />
              <input
                ref={detailImgRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setDetailImages((prev) => [
                    ...prev,
                    ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
                  ]);
                  e.target.value = '';
                }}
              />
              <div style={{ display: 'flex', gap: 24 }}>
                {/* 메인 이미지 */}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <button
                      type="button"
                      onClick={() => imgRef.current?.click()}
                      style={btnStyle('transparent', '#555', '#ddd')}
                    >
                      {newImagePreview ? '이미지 변경' : '+ 이미지 선택'}
                    </button>
                    {newImagePreview && (
                      <div
                        style={{
                          position: 'relative',
                          width: 56,
                          height: 56,
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          src={newImagePreview}
                          alt="preview"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  {newImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewImage(null);
                        setNewImagePreview(null);
                      }}
                      style={{
                        fontSize: 11,
                        color: '#aaa',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                      }}
                    >
                      메인 이미지 제거
                    </button>
                  )}
                </div>

                {/* 상세 이미지 (다중) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => detailImgRef.current?.click()}
                    style={btnStyle('transparent', '#555', '#ddd')}
                  >
                    + 상세 이미지 추가
                  </button>
                  {detailImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      {detailImages.map((img, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 6, overflow: 'hidden' }}>
                            <Image src={img.preview} alt="preview" fill style={{ objectFit: 'cover' }} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setDetailImages((prev) => prev.filter((_, j) => j !== i))}
                            style={{ fontSize: 10, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            제거
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={btnStyle('#191919', '#fff')}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setView('list')}
                disabled={saving}
                style={btnStyle('transparent', '#555', '#ddd')}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 완료 화면 ── */}
      {view === 'done' && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            등록이 완료되었습니다
          </p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>
            매거진이 성공적으로 저장되었습니다.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => {
                resetForm();
                setView('form');
              }}
              style={btnStyle('#191919', '#fff')}
            >
              계속 업로드하기
            </button>
            <button
              onClick={() => setView('list')}
              style={btnStyle('transparent', '#555', '#ddd')}
            >
              목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
