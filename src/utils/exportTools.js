export const exportSession = (transcript, suggestionsList, chatHistory) => {
  const data = {
    timestamp: new Date().toISOString(),
    transcript,
    suggestions: suggestionsList,
    chat: chatHistory
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting_copilot_session_${new Date().getTime()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};
