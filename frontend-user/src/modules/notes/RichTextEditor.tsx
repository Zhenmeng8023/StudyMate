import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function normalizeContent(value: string) {
  if (!value.trim()) {
    return "<p></p>";
  }

  if (value.includes("<")) {
    return value;
  }

  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`);

  return paragraphs.join("");
}

export function RichTextEditor(props: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true
      }),
      Placeholder.configure({
        placeholder: props.placeholder ?? "开始写下你的阅读理解..."
      })
    ],
    content: normalizeContent(props.value),
    editorProps: {
      attributes: {
        class: "tiptap-editor"
      }
    },
    onUpdate({ editor: currentEditor }) {
      props.onChange(currentEditor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = normalizeContent(props.value);
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, props.value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-editor-shell">
      <div className="editor-toolbar">
        <button
          className={editor.isActive("heading", { level: 2 }) ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="二级标题"
          type="button"
        >
          <Heading2 size={16} />
        </button>
        <button
          className={editor.isActive("bold") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="加粗"
          type="button"
        >
          <Bold size={16} />
        </button>
        <button
          className={editor.isActive("italic") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体"
          type="button"
        >
          <Italic size={16} />
        </button>
        <button
          className={editor.isActive("underline") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="下划线"
          type="button"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          className={editor.isActive("strike") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="删除线"
          type="button"
        >
          <Strikethrough size={16} />
        </button>
        <button
          className={editor.isActive("bulletList") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="无序列表"
          type="button"
        >
          <List size={16} />
        </button>
        <button
          className={editor.isActive("orderedList") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="有序列表"
          type="button"
        >
          <ListOrdered size={16} />
        </button>
        <button
          className={editor.isActive("blockquote") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="引用"
          type="button"
        >
          <Quote size={16} />
        </button>
        <button
          className={editor.isActive("codeBlock") ? "ghost-button active" : "ghost-button"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="代码块"
          type="button"
        >
          <Code2 size={16} />
        </button>
        <button
          className={editor.isActive("link") ? "ghost-button active" : "ghost-button"}
          onClick={() => {
            const previous = editor.getAttributes("link").href ?? "";
            const next = window.prompt("输入链接地址", previous);
            if (next === null) {
              return;
            }
            if (!next) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: next }).run();
          }}
          title="链接"
          type="button"
        >
          <Link2 size={16} />
        </button>
        <button
          className="ghost-button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="清除格式"
          type="button"
        >
          <RemoveFormatting size={16} />
        </button>
        <button
          className="ghost-button"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="撤销"
          type="button"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="ghost-button"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="重做"
          type="button"
        >
          <Redo2 size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
