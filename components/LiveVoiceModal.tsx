import React, { useEffect, useRef, useState } from 'react';
import { connectLiveSession } from '../services/geminiService';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [volume, setVolume] = useState(0);
  
  // Refs for audio handling to persist across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{ buffer: AudioBuffer; time: number }[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const sessionRef = useRef<{ sendAudio: (data: Float32Array) => void; close: () => void } | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let mounted = true;

    if (isOpen && status === 'idle') {
      startSession();
    }

    return () => {
      mounted = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cleanup = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStatus('idle');
  };

  const playNextInBuffer = (ctx: AudioContext) => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const { buffer } = audioQueueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Schedule playback
    const currentTime = ctx.currentTime;
    // If nextStartTime is in the past, reset it to now
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    source.onended = () => {
      playNextInBuffer(ctx);
    };
  };

  const handleAudioOutput = async (arrayBuffer: ArrayBuffer) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    // Decode audio data. Note: The raw PCM might need header for decodeAudioData, 
    // but the examples provided in prompts often use custom decode or standard if containerized.
    // The prompt's "Live" example uses a custom `decodeAudioData` converting Int16 to Float32 manually.
    // Let's implement that manual decode as standard `decodeAudioData` might fail on raw chunks.
    
    // We'll reuse the logic from the prompt's Live example implicitly or re-implement here for safety.
    // Raw PCM 24kHz (from outputAudioContext in prompt)
    const dataInt16 = new Int16Array(arrayBuffer);
    const float32Data = new Float32Array(dataInt16.length);
    for(let i=0; i<dataInt16.length; i++) {
        float32Data[i] = dataInt16[i] / 32768.0;
    }
    
    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    audioQueueRef.current.push({ buffer, time: Date.now() });

    if (!isPlayingRef.current) {
      playNextInBuffer(ctx);
    }
  };

  const startSession = async () => {
    setStatus('connecting');
    try {
      // Input Audio Context (16kHz for Gemini)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output Audio Context (24kHz for Gemini)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Processor for input
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Calculate volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setVolume(Math.sqrt(sum / inputData.length) * 100);

        if (sessionRef.current) {
            sessionRef.current.sendAudio(inputData);
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination); // Required for script processor to run

      const session = await connectLiveSession(
        handleAudioOutput,
        () => {
            console.log("Session disconnected remotely");
            onClose();
        }
      );
      
      sessionRef.current = session;
      setStatus('connected');

    } catch (err) {
      console.error("Failed to start live session", err);
      setStatus('idle');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md flex flex-col items-center relative shadow-2xl shadow-blue-500/10">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="mb-8 mt-4 relative">
             {/* Visualizer Ring */}
            <div 
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-75 ${
                    status === 'connected' ? 'bg-blue-500/20' : 'bg-slate-800'
                }`}
                style={{
                    transform: `scale(${1 + volume / 50})`
                }}
            >
                 <div className="w-24 h-24 bg-blue-600 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                 </div>
            </div>
            
             {/* Ping animation when connecting */}
            {status === 'connecting' && (
                 <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20 animate-ping"></div>
            )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
            {status === 'connecting' ? 'Connecting to StratOS...' : 'Live Consultation'}
        </h3>
        <p className="text-slate-400 text-center mb-8">
            {status === 'connecting' 
             ? 'Establishing secure voice uplink to Gemini Neural Engine.' 
             : 'Speak naturally. StratOS is listening and analyzing.'}
        </p>

        <button 
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-600"
        >
            End Session
        </button>
      </div>
    </div>
  );
};
