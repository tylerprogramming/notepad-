import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText } from 'lucide-react';
import { loadFiles } from '../lib/supabase';
import { Tab } from '../types';

interface OpenFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: Tab) => void;
}

const OpenFileModal: React.FC<OpenFileModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const [files, setFiles] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSavedFiles();
    }
  }, [isOpen]);

  const loadSavedFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const savedFiles = await loadFiles();
      setFiles(savedFiles);
    } catch (err) {
      setError('Failed to load files');
      console.error('Load files error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252525] text-white p-6 rounded-lg w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Open File</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No saved files found
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => onFileSelect(file)}
                  className="w-full flex items-center gap-3 p-3 rounded hover:bg-[#3D3D3D] text-left"
                >
                  <FileText size={20} className="text-blue-400" />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {file.content.length} characters
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenFileModal;