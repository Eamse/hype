'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useRef } from 'react';
import { resizeImageFile } from '@/lib/client-image-resize';
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
export default function TiptapEditor({ content, onChange, }: {
    content: string;
    onChange: (html: string) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension,
            Placeholder.configure({ placeholder: 'Write your story...' }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });
    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor)
            return;
        const resized = await resizeImageFile(file, 1600);
        const fd = new FormData();
        fd.append('image', resized);
        const res = await fetch('/api/magazine/upload-image', {
            method: 'POST',
            body: fd,
        });
        if (!res.ok) {
            alert('Image upload failed.');
            return;
        }
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
    }, [editor]);
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
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file)
                handleImageUpload(file);
            e.target.value = '';
        }}/>
      </div>
      <div style={{ padding: 12, minHeight: 300 }}>
        <EditorContent editor={editor}/>
      </div>
    </div>);
}
