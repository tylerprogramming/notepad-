import React, { useState } from 'react';
import { Save, FilePlus, X, Settings2, Type, Palette, Mail } from 'lucide-react';
import Editor from './components/Editor';
import ColorPicker from './components/ColorPicker';
import SettingsModal from './components/SettingsModal';
import SendEmailModal from './components/SendEmailModal';
import { Tab, UserSettings } from './types';

function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', name: 'untitled.txt', content: '' }]);
  const [activeTab, setActiveTab] = useState('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [editorStyle, setEditorStyle] = useState({
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  });
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    emailPassword: '',
    openaiKey: '',
    recipientEmail: '',
  });

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `untitled-${tabs.length + 1}.txt`,
      content: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, content: newContent } : tab
    ));
  };

  const renameTab = (tabId: string, newName: string) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId ? { ...tab, name: newName } : tab
    ));
  };

  const saveFile = () => {
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

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content || '';

  return (
    <div className="flex flex-col h-screen bg-gray-100">
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
          onClick={saveFile}
          className="p-2 hover:bg-gray-600 rounded"
          title="Save"
        >
          <Save size={20} />
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
            className={`flex items-center px-4 py-2 min-w-[150px] cursor-pointer border-r border-gray-600 ${
              activeTab === tab.id ? 'bg-[#1E1E1E] text-white' : 'hover:bg-[#404040]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <input
              type="text"
              value={tab.name}
              onChange={(e) => renameTab(tab.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none outline-none flex-1 focus:bg-[#3D3D3D] px-1 rounded"
            />
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-2 hover:bg-gray-600 rounded p-1"
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
    </div>
  );
}

export default App;