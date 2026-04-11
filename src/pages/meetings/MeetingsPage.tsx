import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, User, Video, CheckCircle, XCircle, Plus, X } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'confirmed' | 'pending' | 'declined';
  with: string;
  type: 'video' | 'in-person';
  color?: string;
}

interface MeetingRequest {
  id: string;
  from: string;
  topic: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
}

const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Pitch Meeting — Michael Rodriguez',
    start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00',
    end:   new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T11:00:00',
    status: 'confirmed',
    with: 'Michael Rodriguez',
    type: 'video',
    color: '#2563eb',
  },
  {
    id: '2',
    title: 'Follow-up — Jennifer Lee',
    start: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T14:00:00',
    end:   new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] + 'T15:00:00',
    status: 'confirmed',
    with: 'Jennifer Lee',
    type: 'video',
    color: '#2563eb',
  },
  {
    id: '3',
    title: 'Intro Call — Robert Torres',
    start: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] + 'T09:00:00',
    end:   new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] + 'T09:30:00',
    status: 'pending',
    with: 'Robert Torres',
    type: 'video',
    color: '#f59e0b',
  },
];

const initialRequests: MeetingRequest[] = [
  { id: 'r1', from: 'Sarah Johnson', topic: 'Investment Discussion', date: '2026-04-15', time: '11:00 AM', status: 'pending' },
  { id: 'r2', from: 'David Kim',     topic: 'Partnership Opportunity', date: '2026-04-17', time: '3:00 PM',  status: 'pending' },
];

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings]       = useState<Meeting[]>(initialMeetings);
  const [requests, setRequests]       = useState<MeetingRequest[]>(initialRequests);
  const [showModal, setShowModal]     = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab]     = useState<'calendar' | 'requests' | 'upcoming'>('calendar');
  const [toast, setToast]             = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '', date: '', startTime: '09:00', endTime: '10:00', with: '', type: 'video',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    setForm(f => ({ ...f, date: info.dateStr }));
    setShowModal(true);
  };

  const handleAddMeeting = () => {
    if (!form.title || !form.date || !form.with) {
      showToast('Please fill in all required fields.');
      return;
    }
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: `${form.title} — ${form.with}`,
      start: `${form.date}T${form.startTime}:00`,
      end:   `${form.date}T${form.endTime}:00`,
      status: 'confirmed',
      with: form.with,
      type: form.type as 'video' | 'in-person',
      color: '#2563eb',
    };
    setMeetings(prev => [...prev, newMeeting]);
    setShowModal(false);
    setForm({ title: '', date: '', startTime: '09:00', endTime: '10:00', with: '', type: 'video' });
    showToast('Meeting scheduled successfully!');
  };

  const handleRequest = (id: string, action: 'accepted' | 'declined') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    if (action === 'accepted') {
      const req = requests.find(r => r.id === id)!;
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        title: `${req.topic} — ${req.from}`,
        start: `${req.date}T09:00:00`,
        end:   `${req.date}T10:00:00`,
        status: 'confirmed',
        with: req.from,
        type: 'video',
        color: '#2563eb',
      };
      setMeetings(prev => [...prev, newMeeting]);
      showToast(`Meeting with ${req.from} accepted!`);
    } else {
      showToast('Meeting request declined.');
    }
  };

  const confirmedMeetings = meetings.filter(m => m.status === 'confirmed');
  const pendingCount       = requests.filter(r => r.status === 'pending').length;

  const calendarEvents = meetings.map(m => ({
    id: m.id,
    title: m.title,
    start: m.start,
    end: m.end,
    backgroundColor: m.status === 'confirmed' ? '#2563eb' : '#f59e0b',
    borderColor:     m.status === 'confirmed' ? '#1d4ed8' : '#d97706',
  }));

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your schedule and meeting requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Upcoming</p>
            <p className="text-xl font-bold text-gray-900">{confirmedMeetings.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending Requests</p>
            <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Video size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">This Week</p>
            <p className="text-xl font-bold text-gray-900">{confirmedMeetings.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['calendar', 'requests', 'upcoming'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'requests' ? `Requests ${pendingCount > 0 ? `(${pendingCount})` : ''}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-3">💡 Click any date to schedule a meeting</p>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            height={580}
            editable={false}
            selectable={true}
          />
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {requests.length === 0 && (
            <div className="p-12 text-center text-gray-400">No meeting requests yet.</div>
          )}
          {requests.map(req => (
            <div key={req.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{req.from}</p>
                  <p className="text-sm text-gray-500">{req.topic}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{req.date} · {req.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleRequest(req.id, 'accepted')}
                      className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle size={15} /> Accept
                    </button>
                    <button
                      onClick={() => handleRequest(req.id, 'declined')}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle size={15} /> Decline
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {confirmedMeetings.length === 0 && (
            <div className="p-12 text-center text-gray-400">No upcoming meetings.</div>
          )}
          {confirmedMeetings.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Video size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(m.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(m.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(m.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">Confirmed</span>
                <button className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  <Video size={14} /> Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Schedule a Meeting</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Pitch Discussion"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">With (Name) *</label>
                <input
                  type="text"
                  placeholder="Investor / Entrepreneur name"
                  value={form.with}
                  onChange={e => setForm(f => ({ ...f, with: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeeting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};