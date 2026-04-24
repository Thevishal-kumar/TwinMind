import React, { useState, useEffect, useRef } from 'react';
import TranscriptColumn from './components/Columns/TranscriptColumn';
import SuggestionsColumn from './components/Columns/SuggestionsColumn';
import ChatColumn from './components/Columns/ChatColumn';
import SettingsModal from './components/SettingsModal';
import { useRecorder } from './hooks/useRecorder';
import { transcribeAudio, generateSuggestions } from './services/groqApi';
import { exportSession } from './utils/exportTools';
import { Settings, Download } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  
  // Custom Settings
  const [livePrompt, setLivePrompt] = useState(localStorage.getItem('twm_live_prompt') || '');
  const [chatPrompt, setChatPrompt] = useState(localStorage.getItem('twm_chat_prompt') || '');
  const [detailedPrompt, setDetailedPrompt] = useState(localStorage.getItem('twm_detailed_prompt') || '');
  const [liveContextLimit, setLiveContextLimit] = useState(localStorage.getItem('twm_live_context') || '3000');
  const [chatContextLimit, setChatContextLimit] = useState(localStorage.getItem('twm_chat_context') || '5000');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const [isProcessingTranscription, setIsProcessingTranscription] = useState(false);
  
  const [suggestionsBatches, setSuggestionsBatches] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  const [selectedContext, setSelectedContext] = useState(null);

  // Lifted Chat Messages State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Meeting Assistant. Click on a suggestion to dive deeper, or ask me anything directly.', timestamp: new Date().toISOString() }
  ]);

  // Hook handles strict 30 second emission, plus forceRefresh
  const { isRecording, startRecording, stopRecording, forceRefresh, error: micError } = useRecorder(async (audioBlob, isForced) => {
    if (!apiKey) {
      alert("Please set your Groq API key in Settings before recording.");
      stopRecording();
      return;
    }
    await processAudioChunk(audioBlob, isForced);
  });

  const processAudioChunk = async (blob, isForced) => {
    setIsProcessingTranscription(true);
    let newText = '';
    
    try {
      if (blob) {
        newText = await transcribeAudio(blob, apiKey);
      }
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsProcessingTranscription(false);
    }

    const addedText = newText && newText.trim();
    if (addedText) {
      transcriptRef.current = transcriptRef.current ? transcriptRef.current + '\n' + newText : newText;
      setTranscript(transcriptRef.current);
    }
    
    // Trigger generation safely outside the state updater avoiding StrictMode double-fires
    if (addedText || isForced) {
      if (transcriptRef.current.trim()) {
        generateNewSuggestions(transcriptRef.current);
      }
    }
  };

  const generateNewSuggestions = async (fullTranscript) => {
    setIsGeneratingSuggestions(true);
    try {
      // Apply Context Window Limit for Live Suggestions
      const limit = parseInt(liveContextLimit, 10) || 3000;
      const recentContext = fullTranscript.length > limit 
        ? fullTranscript.slice(-limit) 
        : fullTranscript;

      const previousTitles = suggestionsBatches.slice(0, 2).flatMap(b => b.items.map(i => i.title));

      const batchOf3 = await generateSuggestions(recentContext, apiKey, livePrompt, previousTitles);
      if (batchOf3.length > 0) {
        // Add timestamp to the batch
        const batchWithMetadata = {
          timestamp: new Date().toISOString(),
          items: batchOf3
        };
        // Unshift to put newest batch at the top
        setSuggestionsBatches(prev => [batchWithMetadata, ...prev]);
      }
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleExport = () => {
    exportSession(transcript, suggestionsBatches, messages);
  };

  // Chat column context slicing
  const getChatTranscriptContext = () => {
    const limit = parseInt(chatContextLimit, 10) || 5000;
    return transcript.length > limit ? transcript.slice(-limit) : transcript;
  };

  return (
    <div className="h-screen w-full bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-300 bg-white flex items-center justify-between px-6 shrink-0 relative z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center font-bold text-white text-lg">
            CP
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Co-Pilot
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExport}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 overflow-hidden flex w-full relative z-10">
        <TranscriptColumn 
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          transcript={transcript}
          isProcessing={isProcessingTranscription}
        />
        <SuggestionsColumn 
          suggestionsBatches={suggestionsBatches}
          isGenerating={isGeneratingSuggestions}
          onSuggestionClick={(ctx) => setSelectedContext(ctx)}
          onRefresh={forceRefresh}
        />
        <ChatColumn 
          transcript={getChatTranscriptContext()}
          selectedContext={selectedContext}
          apiKey={apiKey}
          messages={messages}
          setMessages={setMessages}
          chatPrompt={chatPrompt}
          detailedPrompt={detailedPrompt}
        />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        livePrompt={livePrompt}
        setLivePrompt={setLivePrompt}
        chatPrompt={chatPrompt}
        setChatPrompt={setChatPrompt}
        detailedPrompt={detailedPrompt}
        setDetailedPrompt={setDetailedPrompt}
        liveContext={liveContextLimit}
        setLiveContext={setLiveContextLimit}
        chatContext={chatContextLimit}
        setChatContext={setChatContextLimit}
      />
      
      {micError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-lg border border-red-400 backdrop-blur-sm z-50 animate-in slide-in-from-top-4">
          {micError}
        </div>
      )}
    </div>
  );
}
