'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { Node as PMNode } from '@tiptap/pm/model';
import { resizeImageFile } from '@/lib/client-image-resize';
function createDeletableImageExtension() {
    return ImageExtension.extend({
        addNodeView() {
            return ({ node, editor, getPos }) => {
                const container = document.createElement('div');
                container.className = 'editor-image-wrapper';
                const img = document.createElement('img');
                img.src = node.attrs.src;
                img.alt = node.attrs.alt ?? '';
                container.appendChild(img);
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'editor-image-delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof getPos !== 'function')
                        return;
                    const pos = getPos();
                    if (typeof pos !== 'number')
                        return;
                    editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
                });
                container.appendChild(deleteBtn);
                return { dom: container };
            };
        },
    });
}
function ToolbarButton({ active, onClick, children, }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (<button type="button" onClick={onClick} style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid #000',
            background: active ? '#000' : '#fff',
            color: active ? '#fff' : '#000',
            fontSize: 12,
            cursor: 'pointer',
        }}>
      {children}
    </button>);
}
export type TiptapEditorHandle = {
    removeImage: (index: number) => void;
    moveImage: (fromIndex: number, toIndex: number) => void;
};
type ImagePosition = {
    pos: number;
    node: PMNode;
};
function collectImagePositions(editor: NonNullable<ReturnType<typeof useEditor>>): ImagePosition[] {
    const positions: ImagePosition[] = [];
    editor.state.doc.descendants((node: PMNode, pos: number) => {
        if (node.type.name === 'image')
            positions.push({ pos, node });
    });
    return positions;
}
// 이미지 하나만 떼서 옮기면, 원래 그 이미지 바로 뒤에 있던 문단(텍스트)이 그 자리에 남아
// 엉뚱한 다른 이미지 옆에 붙어버림 — 그래서 "이미지 + 바로 뒤 문단"을 한 덩어리로 취급해서
// 같이 옮겨야 텍스트가 안 뒤섞임.
function getImageUnitRange(doc: PMNode, pos: number, node: PMNode) {
    const afterImage = pos + node.nodeSize;
    const nextNode = doc.nodeAt(afterImage);
    if (nextNode && nextNode.type.name === 'paragraph') {
        return { from: pos, to: afterImage + nextNode.nodeSize };
    }
    return { from: pos, to: afterImage };
}
const TiptapEditor = forwardRef<TiptapEditorHandle, {
    content: string;
    onChange: (html: string) => void;
    onImagesChange?: (urls: string[]) => void;
}>(function TiptapEditor({ content, onChange, onImagesChange }, ref) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragPendingIdx, setDragPendingIdx] = useState<number | null>(null);
    const pendingPreviewUrls = useMemo(
        () => pendingFiles.map((f) => URL.createObjectURL(f)),
        [pendingFiles],
    );
    useEffect(() => {
        return () => {
            pendingPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [pendingPreviewUrls]);
    function movePendingFile(idx: number, dir: -1 | 1) {
        const to = idx + dir;
        if (to < 0 || to >= pendingFiles.length) return;
        setPendingFiles((prev) => {
            const copy = [...prev];
            const [item] = copy.splice(idx, 1);
            copy.splice(to, 0, item);
            return copy;
        });
    }
    function removePendingFile(idx: number) {
        setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    }
    function handlePendingDrop(targetIdx: number) {
        if (dragPendingIdx === null || dragPendingIdx === targetIdx) {
            setDragPendingIdx(null);
            return;
        }
        setPendingFiles((prev) => {
            const copy = [...prev];
            const [item] = copy.splice(dragPendingIdx, 1);
            copy.splice(targetIdx, 0, item);
            return copy;
        });
        setDragPendingIdx(null);
    }
    const DeletableImage = useMemo(() => createDeletableImageExtension(), []);
    const reportImages = useCallback((ed: NonNullable<ReturnType<typeof useEditor>>) => {
        if (!onImagesChange)
            return;
        const urls = collectImagePositions(ed).map(({ node }) => node.attrs.src as string);
        onImagesChange(urls);
    }, [onImagesChange]);
    const editor = useEditor({
        extensions: [
            StarterKit,
            DeletableImage,
            Placeholder.configure({
                placeholder: ({ pos }) => pos === 0 ? 'Write your story...' : 'Type here...',
                showOnlyCurrent: false,
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            reportImages(editor);
        },
    });
    useEffect(() => {
        if (editor)
            reportImages(editor);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);
    useImperativeHandle(ref, () => ({
        removeImage(index: number) {
            if (!editor)
                return;
            const positions = collectImagePositions(editor);
            const target = positions[index];
            if (!target)
                return;
            const range = getImageUnitRange(editor.state.doc, target.pos, target.node);
            editor.chain().deleteRange(range).run();
            reportImages(editor);
        },
        moveImage(fromIndex: number, toIndex: number) {
            if (!editor || fromIndex === toIndex)
                return;
            const positions = collectImagePositions(editor);
            const from = positions[fromIndex];
            const to = positions[toIndex];
            if (!from || !to)
                return;
            const doc = editor.state.doc;
            const fromRange = getImageUnitRange(doc, from.pos, from.node);
            const toRange = getImageUnitRange(doc, to.pos, to.node);
            const slice = doc.slice(fromRange.from, fromRange.to);
            let tr = editor.state.tr;
            tr = tr.delete(fromRange.from, fromRange.to);
            // 오른쪽으로 옮길 땐 목표 블록 "뒤"에, 왼쪽으로 옮길 땐 목표 블록 "앞"에 끼워야
            // 실제로 그 위치로 이동한 것처럼 보임 (항상 앞에 끼우면 오른쪽 이동이 제자리로 돌아옴)
            const targetPos = fromIndex < toIndex ? toRange.to : toRange.from;
            const insertAt = tr.mapping.map(targetPos);
            tr = tr.insert(insertAt, slice.content);
            editor.view.dispatch(tr);
            reportImages(editor);
        },
    }), [editor, reportImages]);
    const uploadImageFile = useCallback(async (file: File) => {
        const resized = await resizeImageFile(file, 1600);
        const fd = new FormData();
        fd.append('image', resized);
        const res = await fetch('/api/magazine/upload-image', {
            method: 'POST',
            body: fd,
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        return data.url as string;
    }, []);
    const handleImagesUpload = useCallback(async (files: File[]) => {
        if (!editor || files.length === 0)
            return;
        setUploading(true);
        try {
            const urls: string[] = [];
            let failed = 0;
            for (const file of files) {
                const url = await uploadImageFile(file);
                if (url)
                    urls.push(url);
                else
                    failed += 1;
            }
            // editor.chain().setImage(...) 를 이미지마다 반복 호출하면 두 번째 호출부터
            // 방금 넣은 이미지 노드(선택 상태)를 대체해버려서 마지막 한 장만 남는 문제가 있었음.
            // 전체 이미지를 HTML 문자열로 만들어 한 번에 insertContent 하는 방식으로 우회.
            // 문서가 비어있는 상태에서 첫 이미지를 넣으면, 커서가 있던 첫 빈 문단이 흡수돼서
            // 최상단에 타이핑할 빈 자리가 없어짐 — 이 경우엔 앞에 빈 문단을 하나 더 끼워줌.
            const isEmptyDoc = editor.isEmpty;
            const html = urls.map((url) => `<img src="${url}" /><p></p>`).join('');
            editor.chain().focus().insertContent(isEmptyDoc ? `<p></p>${html}` : html).run();
            reportImages(editor);
            if (failed > 0)
                alert(`${failed} image(s) failed to upload.`);
        }
        finally {
            setUploading(false);
        }
    }, [editor, uploadImageFile, reportImages]);
    if (!editor)
        return null;
    return (<div style={{ border: '1px solid #000', borderRadius: 6 }}>
      <div style={{
            display: 'flex',
            gap: 4,
            padding: 8,
            borderBottom: '1px solid #000',
            flexWrap: 'wrap',
        }}>
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          &ldquo;
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()}>
          + Image
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0)
                setPendingFiles((prev) => [...prev, ...files]);
            e.target.value = '';
        }}/>
      </div>
      {pendingFiles.length > 0 && (<div style={{
                padding: 10,
                borderBottom: '1px solid #000',
                background: '#fafafa',
            }}>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px' }}>
            {pendingFiles.length} image(s) selected — reorder before inserting
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {pendingFiles.map((_, idx) => (<div key={idx} draggable onDragStart={() => setDragPendingIdx(idx)} onDragOver={(e) => e.preventDefault()} onDrop={() => handlePendingDrop(idx)} style={{ position: 'relative', cursor: 'grab' }}>
                <img src={pendingPreviewUrls[idx]} alt="" style={{
                    width: 70,
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: '1px dashed #999',
                }}/>
                <button type="button" onClick={() => removePendingFile(idx)} style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    lineHeight: 1,
                }}>
                  ×
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2,
                }}>
                  <button type="button" onClick={() => movePendingFile(idx, -1)} disabled={idx === 0} style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: '1px solid #000',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 9,
                    lineHeight: 1,
                    padding: 0,
                }}>
                    ←
                  </button>
                  <button type="button" onClick={() => movePendingFile(idx, 1)} disabled={idx === pendingFiles.length - 1} style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: '1px solid #000',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 9,
                    lineHeight: 1,
                    padding: 0,
                }}>
                    →
                  </button>
                </div>
              </div>))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setPendingFiles([])} style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #000',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 12,
            }}>
              Cancel
            </button>
            <button type="button" disabled={uploading} onClick={async () => {
                const files = pendingFiles;
                setPendingFiles([]);
                await handleImagesUpload(files);
            }} style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: '#000',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
            }}>
              {uploading ? 'Uploading...' : `Insert ${pendingFiles.length} image(s)`}
            </button>
          </div>
        </div>)}
      <div style={{ padding: '24px 12px 12px', minHeight: 300 }}>
        <EditorContent editor={editor}/>
      </div>
    </div>);
});
export default TiptapEditor;
