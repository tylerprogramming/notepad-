import React, { useRef, useEffect } from 'react';
import { Bold, Underline, Strikethrough } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  style: {
    backgroundColor: string;
    color: string;
  };
}

const Editor: React.FC<EditorProps> = ({ content, onChange, style }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Update editor content when prop changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== content) {
      editor.innerHTML = content;
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing.current) {
      const newContent = e.currentTarget.innerHTML;
      onChange(newContent);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposing.current = false;
    handleInput(e as any);
  };

  const applyFormatting = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormatting('bold');
    } else if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyFormatting('underline');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-[#252525] border-b border-gray-600 p-2 flex gap-2">
        <button
          onClick={() => applyFormatting('bold')}
          className="p-1 hover:bg-gray-600 rounded text-white"
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => applyFormatting('underline')}
          className="p-1 hover:bg-gray-600 rounded text-white"
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => applyFormatting('strikeThrough')}
          className="p-1 hover:bg-gray-600 rounded text-white"
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="flex-1 p-4 overflow-auto focus:outline-none"
        contentEditable
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      />
    </div>
  );
};

export default Editor;