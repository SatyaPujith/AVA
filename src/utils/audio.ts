/**
 * Audio helpers for Web Speech Recognition and Text-to-Speech synthesis
 */

// Check for Web Speech Recognition API
const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export class VoiceRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onStateChangeCallback?: (listening: boolean) => void;
  private onErrorCallback?: (error: any) => void;

  constructor() {
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && this.onResultCallback) {
          this.onResultCallback(finalTranscript.trim(), true);
        } else if (interimTranscript && this.onResultCallback) {
          this.onResultCallback(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Keep listening during an active phone call
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            this.onStateChangeCallback?.(false);
          }
        } else {
          this.onStateChangeCallback?.(false);
        }
      };
    }
  }

  public isSupported(): boolean {
    return Boolean(SpeechRecognition);
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onStateChange: (listening: boolean) => void,
    onError?: (err: any) => void
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;
    this.isListening = true;
    try {
      this.recognition.start();
      this.onStateChangeCallback?.(true);
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }
    this.onStateChangeCallback?.(false);
  }
}

/**
 * Text-to-Speech Player with natural fallback
 */
export class VoiceSpeaker {
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  public async speakText(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      voiceName?: string;
    }
  ) {
    this.stop();

    options?.onStart?.();

    // 1. Try Gemini TTS server endpoint first
    try {
      const response = await fetch('/api/call/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: options?.voiceName || 'Kore',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          await this.playBase64Audio(data.audioBase64, options?.onEnd);
          return;
        }
      }
    } catch (err) {
      console.warn('Server TTS failed, falling back to browser synthesis:', err);
    }

    // 2. High-quality Browser SpeechSynthesis Fallback
    this.speakWithBrowser(text, options?.onEnd);
  }

  private async playBase64Audio(base64: string, onEnd?: () => void) {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check if it's WAV or PCM
      const blob = new Blob([bytes.buffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        this.currentAudio = null;
        onEnd?.();
      };

      await audio.play();
    } catch (e) {
      console.warn('Error playing audio buffer:', e);
      onEnd?.();
    }
  }

  private speakWithBrowser(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => onEnd?.(), 1500);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

    // Pick warm natural sounding female/calm voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Samantha') ||
          v.name.includes('Natural') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen') ||
          v.lang === 'en-US') &&
        !v.name.includes('Whisper')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
