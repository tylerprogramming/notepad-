import React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  style: {
    backgroundColor: string;
    color: string;
  };
}

const Editor: React.FC<EditorProps> = ({ content, onChange, style }) => {
  return (
    <textarea
      className="w-full h-full p-4 resize-none focus:outline-none font-mono"
      style={style}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="Start typing..."
    />
  );
}

export default Editor;