import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UserSettings, OPENAI_MODELS } from '../types';
import { saveUserSettings } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await saveUserSettings(settings);
      onClose();
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252525] text-white p-6 rounded-lg w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Your Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onSettingsChange({ ...settings, email: e.target.value })}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Email Password (App Password)</label>
            <input
              type="password"
              value={settings.emailPassword}
              onChange={(e) => onSettingsChange({ ...settings, emailPassword: e.target.value })}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Your email app password"
            />
            <p className="text-xs text-gray-400 mt-1">
              For Gmail, use an App Password generated from your Google Account settings
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">OpenAI API Key</label>
            <input
              type="password"
              value={settings.openaiKey}
              onChange={(e) => onSettingsChange({ ...settings, openaiKey: e.target.value })}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Preferred AI Model</label>
            <select
              value={settings.preferredModel}
              onChange={(e) => onSettingsChange({ ...settings, preferredModel: e.target.value })}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {OPENAI_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;