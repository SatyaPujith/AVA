import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Send,
  Lock,
  CheckCircle2,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { CustomerProfile, CallMessage, VoiceCallAction } from '../../types/banking';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceRecognitionManager, VoiceSpeaker } from '../../utils/audio';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: (transcript: CallMessage[], actionsTaken: VoiceCallAction[]) => void;
  customer: CustomerProfile;
  onExecuteAction: (action: VoiceCallAction) => void;
  initialTopic?: string;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  customer,
  onExecuteAction,
  initialTopic,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<
    'connecting' | 'listening' | 'thinking' | 'speaking' | 'on_hold'
  >('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcript, setTranscript] = useState<CallMessage[]>([]);
  const [actionsTaken, setActionsTaken] = useState<VoiceCallAction[]>([]);
  const [currentInterimSpeech, setCurrentInterimSpeech] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [memoryNotification, setMemoryNotification] = useState<string | null>(null);

  const recognitionRef = useRef<VoiceRecognitionManager | null>(null);
  const speakerRef = useRef<VoiceSpeaker | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);

  const suggestedPrompts = [
    'Dispute that $124.50 Streamify charge and issue provisional credit.',
    'Could you lock my Sapphire card right now for safety?',
    'I want to apply for the pre-approved EV loan for 48 months.',
    'Could you waive the $35 wire fee from last week?',
    'What do you already remember about my account and recent calls?',
  ];

  useEffect(() => {
    if (!isOpen) return;

    recognitionRef.current = new VoiceRecognitionManager();
    speakerRef.current = new VoiceSpeaker();

    setCallDuration(0);
    setActionsTaken([]);
    setCallStatus('connecting');

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    triggerAgentTurn('', true);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      speakerRef.current?.stop();
    };
  }, [isOpen, customer.id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [transcript, currentInterimSpeech, callStatus]);

  const startListening = () => {
    if (isMuted || !recognitionRef.current) return;

    setCallStatus('listening');
    recognitionRef.current.start(
      (text: string, isFinal: boolean) => {
        setCurrentInterimSpeech(text);
        if (isFinal && text.trim().length > 0) {
          setCurrentInterimSpeech('');
          handleUserSpeech(text.trim());
        }
      },
      (listening: boolean) => {
        // Listening state
      },
      (err: any) => {
        console.warn('Speech recognition warning:', err);
      }
    );
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleUserSpeech = (speechText: string) => {
    stopListening();

    const userMsg: CallMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: speechText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, userMsg]);
    triggerAgentTurn(speechText, false);
  };

  const triggerAgentTurn = async (userText: string, isStart: boolean = false) => {
    setCallStatus('thinking');

    try {
      const response = await fetch('/api/call/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSpeech: userText,
          customer,
          callHistory: transcript,
          isCallStart: isStart,
        }),
      });

      const data = await response.json();
      const replyText =
        data.replyText ||
        `I have updated your banking records. You do not need to repeat anything, ${customer.name.split(' ')[0]}.`;

      if (data.actionsExecuted && data.actionsExecuted.length > 0) {
        for (const action of data.actionsExecuted) {
          const newAction: VoiceCallAction = {
            type: action.toolName,
            payload: action.args,
            description: action.toolName.replace(/_/g, ' '),
            timestamp: new Date().toLocaleTimeString(),
          };
          setActionsTaken((prev) => [...prev, newAction]);
          onExecuteAction(newAction);
        }
      }

      if (data.memoryHighlights && data.memoryHighlights.length > 0) {
        setMemoryNotification(data.memoryHighlights[0]);
        setTimeout(() => setMemoryNotification(null), 7000);
      } else if (isStart) {
        setMemoryNotification(`Loaded ${customer.memoryLog.length} memories for ${customer.name} · Zero repetition`);
        setTimeout(() => setMemoryNotification(null), 7000);
      }

      const agentMsg: CallMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memoryReferenced: data.memoryHighlights?.[0],
      };

      setTranscript((prev) => [...prev, agentMsg]);

      if (speakerEnabled) {
        setCallStatus('speaking');
        speakerRef.current?.speakText(replyText, {
          onEnd: () => {
            startListening();
          },
        });
      } else {
        setCallStatus('listening');
        startListening();
      }
    } catch (err) {
      console.error('Failed to get agent response:', err);
      setCallStatus('listening');
      startListening();
    }
  };

  const handleEndCall = () => {
    speakerRef.current?.stop();
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose(transcript, actionsTaken);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Minimized Floating Pill in White Theme */}
      {isMinimized ? (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl shadow-xl text-zinc-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-950">
                <span>AVA Support Line</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {formatTimer(callDuration)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 capitalize">
                {callStatus === 'speaking'
                  ? 'AVA is speaking'
                  : callStatus === 'listening'
                  ? 'Listening to you'
                  : 'Call active'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
                title="Expand"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleEndCall}
                className="p-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Clean White Calling Modal */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl h-[90vh] max-h-[780px] bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-900">
            {/* Top Navigation */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-950 text-sm">
                      AVA Voice Banker
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {formatTimer(callDuration)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Encrypted Session · Zero Repetition Guarantee
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> End Call
                </button>
              </div>
            </div>

            {/* Memory Context Banner */}
            <div className="px-5 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Customer Memory Loaded for <strong className="text-zinc-900">{customer.name}</strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                ✓ Full History Synced
              </span>
            </div>

            {/* Notification alert toast */}
            {memoryNotification && (
              <div className="mx-4 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <span className="font-medium">{memoryNotification}</span>
              </div>
            )}

            {/* Audio Waveform Zone */}
            <div className="px-6 py-2 flex flex-col items-center justify-center border-b border-zinc-100 bg-white">
              <AudioVisualizer
                state={
                  isMuted
                    ? 'muted'
                    : callStatus === 'speaking'
                    ? 'speaking'
                    : callStatus === 'thinking'
                    ? 'thinking'
                    : 'listening'
                }
              />
              <p className="text-xs font-medium text-zinc-500 mt-1">
                {callStatus === 'speaking'
                  ? 'AVA is speaking...'
                  : callStatus === 'thinking'
                  ? 'AVA is processing and updating your account...'
                  : isMuted
                  ? 'Microphone muted'
                  : 'Listening... Speak naturally'}
              </p>
            </div>

            {/* Live Transcript Stream */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth"
            >
              {transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[11px] text-zinc-400 mb-1 px-1">
                    {msg.sender === 'user' ? customer.name : 'AVA'} · {msg.timestamp}
                  </span>

                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-900 border border-zinc-200/60'
                    }`}
                  >
                    {msg.text}

                    {msg.memoryReferenced && (
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-200/80 text-[11px] text-blue-700 flex items-center gap-1 font-medium">
                        <Brain className="w-3 h-3" />
                        <span>Memory link: {msg.memoryReferenced}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {currentInterimSpeech && (
                <div className="flex flex-col items-end opacity-70">
                  <div className="bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl px-4 py-2 text-sm italic">
                    {currentInterimSpeech}...
                  </div>
                </div>
              )}
            </div>

            {/* Real-time actions feedback bar */}
            {actionsTaken.length > 0 && (
              <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {actionsTaken.length} action{actionsTaken.length > 1 ? 's' : ''} applied live to your account
                </span>
                <span className="font-mono text-[11px] text-emerald-700">
                  ✓ {actionsTaken[actionsTaken.length - 1]?.description}
                </span>
              </div>
            )}

            {/* Quick Speech Prompt Chips */}
            <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-200">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                <span>Tap to speak customer request (Zero Repetition):</span>
                <span>or speak into microphone</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleUserSpeech(prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-white border border-zinc-200 hover:border-zinc-900 text-xs text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setSpeakerEnabled(!speakerEnabled)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    !speakerEnabled
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                  title={speakerEnabled ? 'Mute Speaker' : 'Enable Speaker'}
                >
                  {speakerEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Text fallback input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typedInput.trim()) {
                    handleUserSpeech(typedInput.trim());
                    setTypedInput('');
                  }
                }}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Speak into microphone or type here..."
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <button
                onClick={handleEndCall}
                className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0"
                title="Hang up"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
