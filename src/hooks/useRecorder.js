import { useState, useEffect, useRef } from 'react';

export function useRecorder(onChunkReady) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  
  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunkTimeoutRef = useRef(null);
  const onChunkReadyRef = useRef(onChunkReady);
  const isForcedRef = useRef(false);

  // Keep the latest callback ref updated to avoid stale closures
  useEffect(() => {
    onChunkReadyRef.current = onChunkReady;
  }, [onChunkReady]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      let localChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          localChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const forced = isForcedRef.current;
        isForcedRef.current = false;

        if (localChunks.length > 0) {
          const blob = new Blob(localChunks, { type: 'audio/webm' });
          onChunkReadyRef.current(blob, forced);
          localChunks = [];
        } else if (forced) {
          onChunkReadyRef.current(null, true);
        }
        
        // Use the ref to check if we should continue capturing the next chunk
        if (isRecordingRef.current) {
          mediaRecorder.start();
          scheduleNextChunk();
        }
      };

      isRecordingRef.current = true;
      setIsRecording(true);
      setError(null);
      
      mediaRecorder.start();
      scheduleNextChunk();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone permission denied or not available.');
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const scheduleNextChunk = () => {
    clearTimeout(chunkTimeoutRef.current);
    chunkTimeoutRef.current = setTimeout(() => {
      // Force a stop to trigger onstop, which will restart it if isRecordingRef is still true
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 30000);
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    clearTimeout(chunkTimeoutRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(chunkTimeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const forceRefresh = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      isForcedRef.current = true;
      mediaRecorderRef.current.stop(); // Triggers onstop -> emits chunk -> restarts
    } else {
      onChunkReadyRef.current(null, true);
    }
  };

  return { isRecording, startRecording, stopRecording, forceRefresh, error };
}
