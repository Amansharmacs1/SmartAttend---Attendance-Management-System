import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { requestNotificationPermission, getNotificationStatus } from '../utils/notifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { 
  Bell, BellOff, Plus, Edit2, Trash2, CalendarDays, List, Copy, AlertTriangle, Info, Clock, MapPin, User 
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Timetable() {
  const schedule = useStore(state => state.schedule);
  const subjects = useStore(state => state.subjects);
  const { addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, toggleTimetableEntry, toggleNotification, setNotificationsPermission, notificationsPermission } = useStore();

  const [view, setView] = useState('list'); // 'weekly' or 'list'
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    subjectId: '',
    subjectName: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    room: '',
    faculty: '',
    notificationsEnabled: false
  });
  const [error, setError] = useState(null);

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState('Monday');
  const [copyTargetDay, setCopyTargetDay] = useState('Tuesday');

  useEffect(() => {
    // Check initial notification status without requesting
    setNotificationsPermission(getNotificationStatus());
  }, [setNotificationsPermission]);

  const handleEnableNotifications = async () => {
    const status = await requestNotificationPermission();
    setNotificationsPermission(status);
  };

  const openAddModal = (day = 'Monday') => {
    setEditingId(null);
    setFormData({
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      subjectName: '',
      dayOfWeek: day,
      startTime: '',
      endTime: '',
      room: '',
      faculty: '',
      notificationsEnabled: notificationsPermission === 'granted'
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingId(entry.id);
    setFormData({
      subjectId: entry.subjectId || '',
      subjectName: entry.subjectName || '',
      dayOfWeek: entry.dayOfWeek || 'Monday',
      startTime: entry.startTime || '',
      endTime: entry.endTime || '',
      room: entry.room || '',
      faculty: entry.faculty || '',
      notificationsEnabled: entry.notificationsEnabled || false
    });
    setError(null);
    setIsModalOpen(true);
  };

  const validateOverlap = (data, excludeId = null) => {
    const daySchedule = schedule[data.dayOfWeek] || [];
    for (const entry of daySchedule) {
      if (entry.id === excludeId) continue;
      
      // Exact duplicate check
      if (entry.subjectId === data.subjectId && entry.startTime === data.startTime && entry.endTime === data.endTime) {
        return "An exact duplicate class already exists.";
      }
      
      // Overlap check
      if (data.startTime < entry.endTime && data.endTime > entry.startTime) {
        return `Overlaps with existing class from ${entry.startTime} to ${entry.endTime}.`;
      }
    }
    return null;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.subjectId && !formData.subjectName) {
      setError('Please select or enter a subject.');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required.');
      return;
    }
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time.');
      return;
    }

    const overlapError = validateOverlap(formData, editingId);
    if (overlapError) {
      setError(overlapError);
      return;
    }

    if (editingId) {
      updateTimetableEntry(editingId, formData);
    } else {
      addTimetableEntry(formData);
    }
    setIsModalOpen(false);
  };

  const handleCopySchedule = () => {
    if (copySourceDay === copyTargetDay) {
      alert("Source and target days cannot be the same.");
      return;
    }
    const sourceEntries = schedule[copySourceDay] || [];
    const targetEntries = schedule[copyTargetDay] || [];
    
    // Simple check if target day is not empty
    if (targetEntries.length > 0) {
      const confirm = window.confirm(`This will append ${sourceEntries.length} classes to ${copyTargetDay}. Proceed?`);
      if (!confirm) return;
    }

    sourceEntries.forEach(entry => {
      // Create new entry based on source
      const newEntry = { ...entry, dayOfWeek: copyTargetDay };
      // Ignore overlap for now during bulk copy, or we could validate each
      addTimetableEntry(newEntry);
    });
    
    setCopyModalOpen(false);
  };

  const getNextClass = () => {
    const now = new Date();
    const today = DAYS_OF_WEEK[(now.getDay() + 6) % 7]; // 0 is Sunday in JS, but Monday in our array
    const currentTimeStr = now.toTimeString().substring(0, 5); // "HH:MM"

    // Search today
    const todaySchedule = schedule[today] || [];
    for (const cls of todaySchedule) {
      if (cls.enabled && cls.startTime > currentTimeStr) {
        return { ...cls, isToday: true };
      }
    }

    // Search next days
    let dayIdx = DAYS_OF_WEEK.indexOf(today);
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAYS_OF_WEEK[(dayIdx + i) % 7];
      const nextDaySchedule = schedule[nextDay] || [];
      const firstClass = nextDaySchedule.find(c => c.enabled);
      if (firstClass) return { ...firstClass, isToday: false };
    }
    return null;
  };

  const nextClass = getNextClass();
  const isEmpty = Object.values(schedule).every(arr => !arr || arr.length === 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="text-violet-500"/> My Timetable</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your weekly classes and reminders.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => handleEnableNotifications()} className="text-xs">
            {notificationsPermission === 'granted' ? <Bell className="w-4 h-4 mr-2 text-emerald-500"/> : <BellOff className="w-4 h-4 mr-2 text-slate-400"/>}
            {notificationsPermission === 'granted' ? 'Notifications On' : 'Enable Notifications'}
          </Button>
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex items-center">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('weekly')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" variant="gradient" onClick={() => openAddModal(selectedDay)}>
            <Plus className="w-4 h-4 mr-1" /> Add Class
          </Button>
        </div>
      </div>

      {notificationsPermission === 'denied' && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Browser notifications are blocked. Please enable them in your browser settings to receive class reminders.
        </div>
      )}

      {/* Next Class Banner */}
      {nextClass && (
        <Card className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-md flex justify-between items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Next Class {nextClass.isToday ? 'Today' : `on ${nextClass.dayOfWeek}`}
            </div>
            <div className="font-bold text-lg">{nextClass.subjectName || subjects.find(s => s.id === nextClass.subjectId)?.name}</div>
            <div className="text-sm opacity-90">{nextClass.startTime} - {nextClass.endTime} {nextClass.room ? `• ${nextClass.room}` : ''}</div>
          </div>
        </Card>
      )}

      {isEmpty ? (
        <div className="text-center py-20 text-slate-500 flex flex-col items-center">
          <CalendarDays className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Your timetable is empty</h3>
          <p className="text-sm max-w-sm mb-6">Add your scheduled classes to get automated reminders and easily mark attendance.</p>
          <Button onClick={() => openAddModal()} variant="outline"><Plus className="w-4 h-4 mr-2"/> Add First Class</Button>
        </div>
      ) : (
        <>
          {view === 'list' && (
            <div className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                      selectedDay === day 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                    <span className="ml-2 text-xs opacity-60">{(schedule[day] || []).length}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{selectedDay} Schedule</h3>
                <Button variant="ghost" size="sm" onClick={() => setCopyModalOpen(true)} className="text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy Day
                </Button>
              </div>

              <div className="space-y-3">
                {(schedule[selectedDay] || []).length === 0 ? (
                  <div className="text-center py-10 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm">
                    No classes scheduled for {selectedDay}.
                  </div>
                ) : (
                  (schedule[selectedDay] || []).map(entry => {
                    const subName = entry.subjectName || subjects.find(s => s.id === entry.subjectId)?.name;
                    return (
                      <Card key={entry.id} className={`p-4 transition-opacity ${entry.enabled ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-base flex items-center gap-2">
                              {subName}
                              {!entry.enabled && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">Disabled</span>}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                <Clock className="w-3.5 h-3.5" /> {entry.startTime} - {entry.endTime}
                              </span>
                              {entry.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {entry.room}</span>}
                              {entry.faculty && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {entry.faculty}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <button 
                              onClick={() => toggleNotification(entry.id)}
                              className={`p-2 rounded-full transition-colors ${entry.notificationsEnabled ? 'text-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}
                              title="Toggle Reminder"
                            >
                              {entry.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </button>
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              <button onClick={() => openEditModal(entry)} className="p-1.5 text-slate-500 hover:text-blue-500 rounded-lg hover:bg-white dark:hover:bg-slate-700"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => toggleTimetableEntry(entry.id)} className={`p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 ${entry.enabled ? 'text-emerald-500' : 'text-slate-500'}`} title="Enable/Disable">
                                {entry.enabled ? <span className="text-xs font-bold px-1">ON</span> : <span className="text-xs font-bold px-1">OFF</span>}
                              </button>
                              <button onClick={() => { if(window.confirm('Delete this class?')) deleteTimetableEntry(entry.id) }} className="p-1.5 text-slate-500 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {view === 'weekly' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-32 border-r border-slate-200 dark:border-slate-800">Day</th>
                    <th className="px-4 py-3 font-semibold">Classes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {DAYS_OF_WEEK.map(day => (
                    <tr key={day}>
                      <td className="px-4 py-4 font-medium border-r border-slate-100 dark:border-slate-800/50 align-top">{day}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {(schedule[day] || []).length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No classes</span>
                          ) : (
                            (schedule[day] || []).map(entry => (
                              <div key={entry.id} className={`p-2 rounded-lg border text-xs min-w-[140px] ${entry.enabled ? 'bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:border-violet-800/50 text-violet-900 dark:text-violet-100' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 grayscale'}`}>
                                <div className="font-bold mb-1 truncate">{entry.subjectName || subjects.find(s => s.id === entry.subjectId)?.name}</div>
                                <div className="flex justify-between items-center opacity-80">
                                  <span>{entry.startTime}-{entry.endTime}</span>
                                  {entry.notificationsEnabled && <Bell className="w-3 h-3" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Class" : "Add Class"}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="space-y-2">
            <Label>Subject *</Label>
            {subjects.length > 0 ? (
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400"
                value={formData.subjectId} 
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
              >
                <option value="">Select a subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : (
              <Input 
                placeholder="Subject name" 
                value={formData.subjectName} 
                onChange={e => setFormData({...formData, subjectName: e.target.value})} 
                required 
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day of Week *</Label>
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-950"
                value={formData.dayOfWeek} 
                onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
              >
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer h-10">
                <input 
                  type="checkbox" 
                  checked={formData.notificationsEnabled} 
                  onChange={e => setFormData({...formData, notificationsEnabled: e.target.checked})} 
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                Reminder (15m before)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room / Location</Label>
              <Input placeholder="e.g. Room 304" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Faculty Name</Label>
              <Input placeholder="e.g. Dr. Smith" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Save Class</Button>
          </div>
        </form>
      </Modal>

      {/* Copy Schedule Modal */}
      <Modal isOpen={copyModalOpen} onClose={() => setCopyModalOpen(false)} title="Copy Schedule">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Copy all classes from one day to another.</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>From</Label>
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={copySourceDay} 
                onChange={e => setCopySourceDay(e.target.value)}
              >
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <Label>To</Label>
              <select 
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                value={copyTargetDay} 
                onChange={e => setCopyTargetDay(e.target.value)}
              >
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setCopyModalOpen(false)}>Cancel</Button>
            <Button type="button" variant="gradient" onClick={handleCopySchedule}>Copy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
