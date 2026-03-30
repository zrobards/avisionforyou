'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useRef } from 'react'
import {
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Link as LinkIcon, Undo, Redo, Minus, Code, Upload,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function MenuButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-600 hover:text-white'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) return null
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB')
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('tags', JSON.stringify(['blog']))
    formData.append('usage', JSON.stringify(['blog-content']))

    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData })
      if (res.ok) {
        const media = await res.json()
        return media.url
      }
    } catch {
      // fall through
    }

    // Fallback: convert to base64 data URL if upload fails
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-gray-100',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file).then((url) => {
              if (url) {
                const { schema } = view.state
                const node = schema.nodes.image.create({ src: url })
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (pos) {
                  const tr = view.state.tr.insert(pos.pos, node)
                  view.dispatch(tr)
                }
              }
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) {
                uploadImage(file).then((url) => {
                  if (url) {
                    const { schema } = view.state
                    const node = schema.nodes.image.create({ src: url })
                    const tr = view.state.tr.replaceSelectionWith(node)
                    view.dispatch(tr)
                  }
                })
              }
              return true
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync external content changes (e.g. when switching to edit a different post)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  if (!editor) return null

  const addLink = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter URL:', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-800 border-b border-gray-600">
        {/* Text style */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <Code className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Insert */}
        <MenuButton onClick={addLink} active={editor.isActive('link')} title="Add link">
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={handleImageButtonClick} title="Upload image">
          <Upload className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Undo / Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Hint */}
      <div className="px-3 py-1.5 bg-gray-800 border-t border-gray-600 text-gray-500 text-xs">
        Drag & drop or paste images directly into the editor. Use the toolbar buttons to format text.
      </div>
    </div>
  )
}
