import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor,
  MonitorOff, MessageCircle, Users, Maximize2, X, Phone
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  initials: string;
  role: string;
  isMuted: boolean;
  isVideoOff: boolean;
  color: string;
}

const participants: Participant[] = [
  { id: '1', name: 'Michael Rodriguez', initials: 'MR', role: 'Investor', isMuted: false, isVideoOff: false, color: 'bg-blue-500' },
  { id: '2', name: 'Jennifer Lee',      initials: 'JL', role: 'Investor', isMuted: true,  isVideoOff: false, color: 'bg-purple-500' },
];

export const VideoCallPage: React.FC = () => {
  const [inCall, setInCall]               = useState(false);
  const [isMuted, setIsMuted]             = useState(false);
  const [isVideoOff, setIsVideoOff]       = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen]       = useState(false);
  const [callDuration, setCallDuration]   = useState(0);
  const [chatMsg, setChatMsg]             = useState('');
  const [messages, setMessages]           = useState([
    { from: 'Michael Rodriguez', text: 'Hi! Can you see my screen?', time: '10:01 AM' },
    { from: 'You', text: 'Yes, loud and clear!', time: '10:01 AM' },
  ]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [inCall]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const endCall = () => {
    setInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsChatOpen(false);
  };

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { from: 'You', text: chatMsg, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]);
    setChatMsg('');
  };

  // ── Pre-call screen ──────────────────────────────────────────
  if (!inCall) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
          <p className="text-sm text-gray-500 mt-1">Connect face-to-face with investors and entrepreneurs</p>
        </div>

        {/* Upcoming calls */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="p-4 font-semibold text-gray-900">Scheduled Calls</div>
          {[
            { name: 'Michael Rodriguez', role: 'Investor · 12 investments', time: 'Today, 10:00 AM', initials: 'MR', color: 'bg-blue-500' },
            { name: 'Jennifer Lee',      role: 'Investor · 18 investments', time: 'Today, 2:00 PM',  initials: 'JL', color: 'bg-purple-500' },
            { name: 'Robert Torres',     role: 'Investor · 9 investments',  time: 'Tomorrow, 9:00 AM', initials: 'RT', color: 'bg-green-500' },
          ].map((call, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${call.color} flex items-center justify-center text-white text-sm font-semibold`}>
                  {call.initials}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{call.name}</p>
                  <p className="text-xs text-gray-500">{call.role}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{call.time}</p>
                </div>
              </div>
              <button
                onClick={() => setInCall(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Phone size={15} /> Join Call
              </button>
            </div>
          ))}
        </div>

        {/* Start instant call */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Start an Instant Call</h3>
            <p className="text-sm opacity-80 mt-1">Jump into a call right now with any connection</p>
          </div>
          <button
            onClick={() => setInCall(true)}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Video size={16} /> New Call
          </button>
        </div>
      </div>
    );
  }

  // ── In-call screen ───────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
          <p className="text-sm text-gray-500">
            {participants.length + 1} participants · <span className="text-green-600 font-medium">{formatDuration(callDuration)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(o => !o)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${isChatOpen ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            <MessageCircle size={16} /> Chat
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Users size={16} /> Participants ({participants.length + 1})
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Video grid */}
        <div className="flex-1 space-y-4">
          <div className={`grid gap-3 ${isChatOpen ? 'grid-cols-1' : 'grid-cols-2'}`}>

            {/* Your tile */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              {isVideoOff ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">NA</div>
                  <p className="text-white text-sm">Camera off</p>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">NA</div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium">You (nabeel)</span>
                {isMuted && <span className="bg-red-600 text-white text-xs px-1.5 py-1 rounded-md"><MicOff size={11} /></span>}
              </div>
              {isScreenSharing && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <Monitor size={11} /> Sharing
                </div>
              )}
            </div>

            {/* Other participants */}
            {participants.map(p => (
              <div key={p.id} className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full ${p.color} flex items-center justify-center text-white text-2xl font-bold`}>
                    {p.initials}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium">{p.name}</span>
                  {p.isMuted && <span className="bg-red-600 text-white text-xs px-1.5 py-1 rounded-md"><MicOff size={11} /></span>}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-center gap-3">
            {/* Mic */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
            </button>

            {/* Camera */}
            <button
              onClick={() => setIsVideoOff(v => !v)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
            </button>

            {/* Screen Share */}
            <button
              onClick={() => setIsScreenSharing(s => !s)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? <MonitorOff size={20} className="text-white" /> : <Monitor size={20} className="text-white" />}
            </button>

            {/* Fullscreen */}
            <button
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={20} className="text-white" />
            </button>

            {/* End call */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors ml-4"
              title="End call"
            >
              <PhoneOff size={22} className="text-white" />
            </button>
          </div>
        </div>

        {/* Chat panel */}
        {isChatOpen && (
          <div className="w-72 bg-white border border-gray-200 rounded-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">In-call Chat</h3>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: '360px' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.from === 'You' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-400 mb-1">{m.from}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${m.from === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {m.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{m.time}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};