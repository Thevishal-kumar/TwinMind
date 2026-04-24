import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import { chatWithAssistant } from '../../services/groqApi';
import ReactMarkdown from 'react-markdown';

export default function ChatColumn({ 
  transcript, selectedContext, apiKey, 
  messages, setMessages, 
  chatPrompt, detailedPrompt 
}) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-trigger when a context is clicked
  useEffect(() => {
    if (selectedContext) {
      const query = `Can we dive deeper into this suggestion: "${selectedContext.title}"? \nPreview: ${selectedContext.preview}`;
      handleSend(query, selectedContext, true);
    }
  }, [selectedContext]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textOveride = null, contextObj = null, isDetailed = false) => {
    const text = textOveride || input;
    if (!text.trim()) return;

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Please set your Groq API Key in settings first.', timestamp: new Date().toISOString() }]);
      return;
    }

    const newMsgs = [...messages, { role: 'user', content: text, timestamp: new Date().toISOString() }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const promptToUse = isDetailed ? detailedPrompt : chatPrompt;
      const response = await chatWithAssistant(text, contextObj, transcript, apiKey, promptToUse);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-1/4 h-full bg-slate-50 border-l border-slate-300 flex flex-col pt-6 pb-4 px-4 relative">
      {/* Header */}
      <div className="flex items-center pb-4 border-b border-slate-300 mb-4 flex-shrink-0">
        <MessageSquare size={20} className="text-slate-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-900">Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed overflow-x-auto shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white border-slate-900 rounded-tr-sm whitespace-pre-wrap' 
                  : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center mt-1 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm flex space-x-1.5 items-center h-10 w-16 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-300 focus-within:border-slate-500 hover:border-slate-400 transition-colors shadow-sm"
      >
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-transparent text-slate-900 text-sm focus:outline-none p-2 placeholder-slate-400"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 p-2 rounded-lg text-white transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
      
    </div>
  );
}
