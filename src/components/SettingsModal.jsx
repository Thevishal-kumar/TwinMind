import React, { useState } from 'react';
import { X, Key, Save } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, setApiKey, 
  livePrompt, setLivePrompt,
  chatPrompt, setChatPrompt,
  detailedPrompt, setDetailedPrompt,
  liveContext, setLiveContext,
  chatContext, setChatContext
}) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [localLivePrompt, setLocalLivePrompt] = useState(livePrompt);
  const [localChatPrompt, setLocalChatPrompt] = useState(chatPrompt);
  const [localDetailedPrompt, setLocalDetailedPrompt] = useState(detailedPrompt);
  const [localLiveContext, setLocalLiveContext] = useState(liveContext);
  const [localChatContext, setLocalChatContext] = useState(chatContext);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localKey);
    setLivePrompt(localLivePrompt);
    setChatPrompt(localChatPrompt);
    setDetailedPrompt(localDetailedPrompt);
    setLiveContext(localLiveContext);
    setChatContext(localChatContext);
    
    localStorage.setItem('groq_api_key', localKey);
    localStorage.setItem('twm_live_prompt', localLivePrompt);
    localStorage.setItem('twm_chat_prompt', localChatPrompt);
    localStorage.setItem('twm_detailed_prompt', localDetailedPrompt);
    localStorage.setItem('twm_live_context', localLiveContext);
    localStorage.setItem('twm_chat_context', localChatContext);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors p-1"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
          <Key className="mr-2 text-slate-700" size={24} />
          Settings
        </h2>

        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Groq API Key
            </label>
            <input 
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Live Suggestion Context Limit (Chars)
              </label>
              <input 
                type="number"
                value={localLiveContext}
                onChange={(e) => setLocalLiveContext(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chat Context Limit (Chars)
              </label>
              <input 
                type="number"
                value={localChatContext}
                onChange={(e) => setLocalChatContext(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Live Suggestion Prompt
              </label>
              <textarea 
                value={localLivePrompt}
                onChange={(e) => setLocalLivePrompt(e.target.value)}
                placeholder="Leave blank for optimized default..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Direct Chat Prompt
              </label>
              <textarea 
                value={localChatPrompt}
                onChange={(e) => setLocalChatPrompt(e.target.value)}
                placeholder="Leave blank for optimized default..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detailed Answer Prompt (On click)
              </label>
              <textarea 
                value={localDetailedPrompt}
                onChange={(e) => setLocalDetailedPrompt(e.target.value)}
                placeholder="Leave blank for optimized default..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:border-slate-500 transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 mr-2 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg flex items-center shadow-sm transition-all font-medium"
          >
            <Save size={16} className="mr-2" />
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
