"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { MediaModal } from "./MediaPicker";

function Btn({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      className={`min-w-8 h-8 px-2 text-sm border transition-colors disabled:opacity-30 ${active ? "bg-brand-700 border-brand-700 text-white" : "border-paper-line bg-white hover:border-brand-700"}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  function link() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove the link)", prev || "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }
  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-b border-paper-line bg-paper sticky top-0 z-10">
      <Btn label="Heading" active={editor.isActive("heading", { level: 2 })} on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn label="Sub-heading" active={editor.isActive("heading", { level: 3 })} on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Btn label="Bold" active={editor.isActive("bold")} on={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
      <Btn label="Italic" active={editor.isActive("italic")} on={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
      <Btn label="Bulleted list" active={editor.isActive("bulletList")} on={() => editor.chain().focus().toggleBulletList().run()}>&bull; List</Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} on={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Btn>
      <Btn label="Quote" active={editor.isActive("blockquote")} on={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</Btn>
      <Btn label="Link" active={editor.isActive("link")} on={link}>Link</Btn>
      <Btn label="Insert image from the library" on={onImage}>Image</Btn>
      <Btn label="Divider line" on={() => editor.chain().focus().setHorizontalRule().run()}>&mdash;</Btn>
      <span className="flex-1" />
      <Btn label="Undo" disabled={!editor.can().undo()} on={() => editor.chain().focus().undo().run()}>&#8630;</Btn>
      <Btn label="Redo" disabled={!editor.can().redo()} on={() => editor.chain().focus().redo().run()}>&#8631;</Btn>
    </div>
  );
}

// WYSIWYG editor. Writes its HTML into a hidden input named `name`, so it works
// inside a normal <form action={serverAction}>.
export default function RichEditor({ name, initialHtml = "", minHeight = "18rem" }: { name: string; initialHtml?: string; minHeight?: string }) {
  const [html, setHtml] = useState(initialHtml);
  const [pick, setPick] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }), Image],
    content: initialHtml,
    editorProps: { attributes: { class: "rich focus:outline-none p-4", style: `min-height:${minHeight}` } },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="border border-paper-line bg-white">
      <input type="hidden" name={name} value={html} />
      {editor ? <Toolbar editor={editor} onImage={() => setPick(true)} /> : <div className="h-12 bg-paper border-b border-paper-line" />}
      <EditorContent editor={editor} />
      <MediaModal
        open={pick}
        onClose={() => setPick(false)}
        accept="image"
        multiple
        title="Insert images"
        onPick={(items) => {
          if (!editor) return;
          items.forEach((m) => editor.chain().focus().setImage({ src: m.url, alt: m.alt || m.filename.replace(/\.[a-z0-9]+$/i, "") }).run());
        }}
      />
    </div>
  );
}
