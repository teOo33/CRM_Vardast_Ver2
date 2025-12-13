import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('مرورگر شما از قابلیت تبدیل صدا به متن پشتیبانی نمی‌کند.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => { console.error('Speech error', event.error); setIsRecording(false); };
    recognition.onresult = (event) => { onTranscript(event.results[0][0].transcript); };
    recognition.start();
  };
  return (
    <button type="button" onClick={startRecording} className={`p-2 rounded-full transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="تبدیل گفتار به متن">
      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
};

export default VoiceRecorder;
