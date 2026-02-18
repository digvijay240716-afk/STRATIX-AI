import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Helper Types ---
export interface GroundingMetadata {
  web?: { uri: string; title: string };
}

// --- Text & Analysis (Standard) ---
export const generateQuickSummary = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Analyze this data snippet and provide a 1-sentence executive summary highlighting the key metric:\n\n${text}`,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Quick summary failed:", error);
    return "Analysis unavailable.";
  }
};

// --- Strategy & Thinking (Pro + Thinking) ---
export const generateStrategicPlan = async (context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a senior business strategist. Analyze the following company context and generate a comprehensive strategic execution plan. Use deep reasoning to identify hidden risks and non-obvious growth levers.\n\nContext:\n${context}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    return response.text || "Strategy generation failed.";
  } catch (error) {
    console.error("Strategy generation failed:", error);
    return "Could not generate strategy. Please try again.";
  }
};

// --- Market Research (Search Grounding) ---
export const performMarketResearch = async (query: string): Promise<{ text: string; sources: GroundingMetadata[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the latest market data and trends for: ${query}. Summarize the findings with specific numbers where possible.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources: GroundingMetadata[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push(chunk.web);
        }
      });
    }

    return {
      text: response.text || "No results found.",
      sources,
    };
  } catch (error) {
    console.error("Market research failed:", error);
    return { text: "Search unavailable.", sources: [] };
  }
};

// --- Vision (Image Analysis) ---
export const analyzeBusinessImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyze this business document or chart. Extract key figures, trends, and any anomalies you detect." }
        ]
      }
    });
    return response.text || "Image analysis failed.";
  } catch (error) {
    console.error("Vision analysis failed:", error);
    return "Could not analyze image.";
  }
};

// --- Video Understanding ---
export const analyzeBusinessVideo = async (base64Data: string, mimeType: string): Promise<string> => {
    try {
        // Note: For real video files, we'd typically use the File API.
        // Since we are simulating or using small snippets in this web app context without a backend,
        // we will assume short clips or use the same endpoint but expect latency.
        // For large videos, we would need the File API (uploadFile) which is not fully browser-compatible without proxy.
        // We will attempt to use inline data for short clips/previews if supported, or fail gracefully.
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: "Watch this video clip. Summarize the key events, speakers, or data presented." }
                ]
            }
        });
        return response.text || "Video analysis failed.";
    } catch (error) {
        console.error("Video analysis failed:", error);
        return "Could not analyze video. (Note: Large videos require backend processing).";
    }
}


// --- TTS (Text to Speech) ---
export const speakText = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
       // Convert base64 to ArrayBuffer
       const binaryString = atob(base64Audio);
       const len = binaryString.length;
       const bytes = new Uint8Array(len);
       for (let i = 0; i < len; i++) {
         bytes[i] = binaryString.charCodeAt(i);
       }
       return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("TTS failed:", error);
    return null;
  }
};

// --- Chat ---
export const createChatSession = () => {
    return ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: "You are StratOS, an advanced autonomous business intelligence agent. Be concise, professional, and data-driven.",
        }
    });
}

// --- Live API Helpers ---

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const connectLiveSession = async (
    onAudioData: (data: ArrayBuffer) => void,
    onClose: () => void
): Promise<{
    sendAudio: (data: Float32Array) => void;
    close: () => void;
}> => {

    let session: any = null;

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
            onopen: () => console.log('Live session connected'),
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    const binaryString = atob(base64Audio);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    onAudioData(bytes.buffer);
                }
            },
            onclose: () => {
                console.log('Live session closed');
                onClose();
            },
            onerror: (err) => console.error('Live session error:', err),
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            systemInstruction: "You are StratOS Live, an executive AI assistant. Provide brief, high-level business insights spoken clearly.",
        }
    });

    session = await sessionPromise;

    return {
        sendAudio: (data: Float32Array) => {
             const pcmBlob = createPcmBlob(data);
             session.sendRealtimeInput({ media: pcmBlob });
        },
        close: () => {
            // No direct close method exposed in recent snippets easily, usually just disconnect or let garbage collection handle if no method. 
            // The prompt says "When the conversation is finished, use `session.close()`".
            // However, the object returned by `ai.live.connect` is a promise resolving to the session.
            sessionPromise.then(s => s.close());
        }
    };
};
