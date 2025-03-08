import React, { useState, useEffect } from 'react';
import { Save, FilePlus, X, Settings2, Type, Palette, Mail, Bold, Underline, Strikethrough, Loader2, Download, FolderOpen, Edit2 } from 'lucide-react';
import Editor from './components/Editor';
import ColorPicker from './components/ColorPicker';
import SettingsModal from './components/SettingsModal';
import SendEmailModal from './components/SendEmailModal';
import OpenFileModal from './components/OpenFileModal';
import { Tab, UserSettings } from './types';
import { saveFile, loadFiles, deleteFile, initializeAuth, generateUUID } from './lib/supabase';

function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: generateUUID(), name: 'untitled.txt', content: '' }]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [isOpenFileModalOpen, setIsOpenFileModalOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editorStyle, setEditorStyle] = useState({
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  });
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    emailPassword: '',
    openaiKey: '',
    recipientEmail: '',
    preferredModel: 'gpt-4o'
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await initializeAuth();
        const savedFiles = await loadFiles();
        if (savedFiles.length > 0) {
          setTabs(savedFiles);
          setActiveTab(savedFiles[0].id);
        }
      } catch (err) {
        setError('Failed to initialize');
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const createNewTab = () => {
    const newTab: Tab = {
      id: generateUUID(),
      name: `untitled-${tabs.length + 1}.txt`,
      content: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = async (tabId: string) => {
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, content: newContent } : tab
      )
    );
  };

  const startRenaming = (tabId: string) => {
    setEditingTabId(tabId);
  };

  const finishRenaming = () => {
    setEditingTabId(null);
  };

  const handleRename = (tabId: string, newName: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, name: newName } : tab
      )
    );
  };

  const saveToSupabase = async () => {
    try {
      setError('');
      const currentTab = tabs.find(tab => tab.id === activeTab);
      if (currentTab) {
        await saveFile(currentTab);
        setError('File saved successfully');
        setTimeout(() => setError(''), 2000);
      }
    } catch (err) {
      setError('Failed to save file');
      console.error('Save file error:', err);
    }
  };

  const downloadFile = () => {
    const activeTabContent = tabs.find(tab => tab.id === activeTab);
    if (!activeTabContent) return;

    const blob = new Blob([activeTabContent.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTabContent.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openFile = (file: Tab) => {
    const existingTabIndex = tabs.findIndex(tab => tab.id === file.id);
    
    if (existingTabIndex !== -1) {
      setTabs(prevTabs => 
        prevTabs.map((tab, index) => 
          index === existingTabIndex ? { ...file } : tab
        )
      );
      setActiveTab(file.id);
    } else {
      setTabs(prevTabs => [...prevTabs, file]);
      setActiveTab(file.id);
    }
    setIsOpenFileModalOpen(false);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E1E] text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {error && (
        <div className={`px-4 py-2 ${error.includes('success') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {error}
          <button
            onClick={() => setError('')}
            className="float-right"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-[#303030] text-white p-2 flex items-center space-x-4">
        <button 
          onClick={createNewTab}
          className="p-2 hover:bg-gray-600 rounded"
          title="New File"
        >
          <FilePlus size={20} />
        </button>
        <button 
          onClick={() => setIsOpenFileModalOpen(true)}
          className="p-2 hover:bg-gray-600 rounded"
          title="Open File"
        >
          <FolderOpen size={20} />
        </button>
        <button 
          onClick={saveToSupabase}
          className="p-2 hover:bg-gray-600 rounded"
          title="Save to Cloud"
        >
          <Save size={20} />
        </button>
        <button 
          onClick={downloadFile}
          className="p-2 hover:bg-gray-600 rounded"
          title="Download File"
        >
          <Download size={20} />
        </button>
        <button 
          onClick={() => setIsColorSettingsOpen(!isColorSettingsOpen)}
          className={`p-2 hover:bg-gray-600 rounded ${isColorSettingsOpen ? 'bg-gray-600' : ''}`}
          title="Color Settings"
        >
          <Palette size={20} />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-gray-600 rounded"
          title="Settings"
        >
          <Settings2 size={20} />
        </button>
        <button 
          onClick={() => setIsSendEmailOpen(true)}
          className="p-2 hover:bg-gray-600 rounded"
          title="Send Email"
        >
          <Mail size={20} />
        </button>
      </div>

      {/* Color Settings Panel */}
      {isColorSettingsOpen && (
        <div className="bg-[#252525] text-white p-4 border-b border-gray-600">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Type size={16} />
              <span>Background:</span>
              <ColorPicker
                color={editorStyle.backgroundColor}
                onChange={(color) => setEditorStyle(prev => ({ ...prev, backgroundColor: color }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Type size={16} />
              <span>Text Color:</span>
              <ColorPicker
                color={editorStyle.color}
                onChange={(color) => setEditorStyle(prev => ({ ...prev, color }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#2D2D2D] text-gray-300 overflow-x-auto">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`group flex items-center px-4 py-2 min-w-[150px] cursor-pointer border-r border-gray-600 ${
              activeTab === tab.id ? 'bg-[#1E1E1E] text-white' : 'hover:bg-[#404040]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={tab.name}
                onChange={(e) => handleRename(tab.id, e.target.value)}
                onBlur={finishRenaming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRenaming();
                  if (e.key === 'Escape') {
                    handleRename(tab.id, tab.name);
                    finishRenaming();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#3D3D3D] border-none outline-none flex-1 px-1 rounded"
                autoFocus
              />
            ) : (
              <>
                <span className="flex-1 truncate">{tab.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startRenaming(tab.id);
                  }}
                  className="ml-2 hover:bg-gray-600 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Rename"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-2 hover:bg-gray-600 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 bg-[#1E1E1E] overflow-hidden">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`h-full ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
            <Editor
              content={tab.content}
              onChange={(newContent) => updateTabContent(tab.id, newContent)}
              style={editorStyle}
            />
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="bg-[#007ACC] text-white px-4 py-1 text-sm flex justify-between">
        <div>Ready</div>
        <div>UTF-8</div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <SendEmailModal
        isOpen={isSendEmailOpen}
        onClose={() => setIsSendEmailOpen(false)}
        settings={settings}
        content={activeTabContent}
      />

      <OpenFileModal
        isOpen={isOpenFileModalOpen}
        onClose={() => setIsOpenFileModalOpen(false)}
        onFileSelect={openFile}
      />
    </div>
  );
}

export default App;