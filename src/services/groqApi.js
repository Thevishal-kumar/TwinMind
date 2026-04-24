

// Using Groq for Whisper and Llama models
export const transcribeAudio = async (audioBlob, apiKey) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-large-v3');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Transcription failed');
  }

  const data = await response.json();
  return data.text;
};

export const generateSuggestions = async (transcript, apiKey, systemPrompt, previousTitles = []) => {
  if (!transcript || transcript.trim().length === 0) return [];

  const defaultPrompt = `You are an elite AI Meeting Copilot listening to an ongoing conversation. Your goal is to surface 3 highly relevant, contextual suggestions to the user to help them navigate the meeting.
Analyze the recent transcript context. Decide what the user needs RIGHT NOW. It could be:
- 'Follow-up Question': An insightful question the user should ask the speaker.
- 'Fact Check': A quick verification of a claim made.
- 'Clarifying Info': A brief explanation of an acronym or concept just mentioned.
- 'Talking Point': A strategic point the user should bring up.
- 'Action Item': Something the user should commit to doing.

Your response must be a strict JSON strictly formatted as an array of exactly 3 objects:
[
  { "title": "Short Title", "preview": "A 1-2 sentence preview that immediately delivers value", "type": "<One of the types above>" }
]
The \`preview\` must contain the actual answer or value. For example, if it's a fact check, state whether it's true or false and why in the preview.
Do not output any markdown besides the JSON itself.`;

  let finalPrompt = systemPrompt || defaultPrompt;
  if (previousTitles && previousTitles.length > 0) {
    finalPrompt += `\n\nCRITICAL RULE: The user has already seen these recent suggestions: [${previousTitles.join(', ')}]. You MUST output completely DIFFERENT and NEW suggestions. Do not repeat them!`;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: finalPrompt },
        { role: 'user', content: `Transcript:\n${transcript}` }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    let errMsg = 'Failed to generate suggestions';
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  try {
    let content = data.choices[0].message.content.trim();
    
    // Find the first '[' and last ']' to extract the JSON array and ignore any surrounding text
    const startIndex = content.indexOf('[');
    const endIndex = content.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      content = content.slice(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed.slice(0,3) : [];
  } catch (error) {
    console.error('Failed to parse suggestions JSON', error);
    return [];
  }
};

export const chatWithAssistant = async (query, context, transcript, apiKey, customPrompt) => {
  const basePrompt = customPrompt || `You are a brilliant AI Meeting Assistant. You will answer the user's questions based on the meeting transcript. Be concise, direct, and insightful.`;
  
  const prompt = `${basePrompt}

Meeting Transcript:
${transcript}

${context ? `Selected Context snippet:\n${JSON.stringify(context)}\n` : ''}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    let errMsg = 'Chat failed';
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
