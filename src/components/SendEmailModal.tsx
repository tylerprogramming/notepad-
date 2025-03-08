import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UserSettings, OPENAI_MODELS } from '../types';
import { OpenAI } from 'openai';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  content: string;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  settings,
  content,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(settings.preferredModel || 'gpt-4o');

  if (!isOpen) return null;

  const generateSummary = async () => {
    if (!settings.openaiKey) {
      setError('Please set your OpenAI API key in settings first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const openai = new OpenAI({ 
        apiKey: settings.openaiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      
      const response = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes text content concisely."
          },
          {
            role: "user",
            content: `Please summarize the following text in a few sentences:\n\n${content}`
          }
        ]
      });

      setSummary(response.choices[0].message.content || '');
    } catch (err) {
      setError('Failed to generate summary. Please check your OpenAI API key and selected model.');
      console.error('OpenAI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!settings.email || !settings.emailPassword) {
      setError('Please set your email credentials in settings first');
      return;
    }

    if (!recipientEmail) {
      setError('Please enter a recipient email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: settings.email,
          to: recipientEmail,
          subject: 'Notes from Notepad++',
          text: summary ? `${content}\n\nSummary:\n${summary}` : content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      onClose();
    } catch (err) {
      setError('Failed to send email. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#252525] text-white p-6 rounded-lg w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Email</h2>
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
            <label className="block text-sm mb-1">Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="recipient@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm">AI Model for Summary</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#3D3D3D] p-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              >
                {OPENAI_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm">AI Summary (Optional)</label>
              <button
                onClick={generateSummary}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Generate Summary'}
              </button>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#3D3D3D] p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none h-32"
              placeholder="Click 'Generate Summary' to create an AI summary of your notes..."
              readOnly={loading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={sendEmail}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailModal;