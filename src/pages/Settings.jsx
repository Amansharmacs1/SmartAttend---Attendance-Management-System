import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { Input, Label } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  Download, Upload, Trash2, Moon, Sun, Laptop, 
  User, Calendar, Clock, Plus, Trash, GraduationCap 
} from 'lucide-react';

export function Settings() {
  const { 
    theme, setTheme, subjects, importData, resetData,
    schedule, profile, updateProfile, updateSchedule 
  } = useStore();

  const [isResetOpen, setIsResetOpen] = useState(false);

  // Profile states
  const [profName, setProfName] = useState(profile?.name || '');
  const [profCollege, setProfCollege] = useState(profile?.college || '');
  const [profSemester, setProfSemester] = useState(profile?.semester || '');

  // Timetable builder states
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeTabDay, setActiveTabDay] = useState('Monday');
  const [addSchedSubjectId, setAddSchedSubjectId] = useState(subjects[0]?.id || '');
  const [addSchedTime, setAddSchedTime] = useState('09:00');

  const handleExport = () => {
    const data = JSON.stringify({ subjects, schedule, profile }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartattend-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && (data.subjects || data.schedule || data.profile)) {
          importData(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetData();
    setIsResetOpen(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: profName,
      college: profCollege,
      semester: profSemester
    });
    alert('Profile updated successfully!');
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!addSchedSubjectId) {
      alert('Please select a subject.');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      subjectId: addSchedSubjectId,
      time: addSchedTime
    };

    const currentDaySchedule = schedule[activeTabDay] || [];
    const updatedDaySchedule = [...currentDaySchedule, newItem].sort((a, b) => a.time.localeCompare(b.time));

    updateSchedule({
      ...schedule,
      [activeTabDay]: updatedDaySchedule
    });
  };

  const handleDeleteSchedule = (day, itemId) => {
    const updatedDaySchedule = (schedule[day] || []).filter(item => item.id !== itemId);
    updateSchedule({
      ...schedule,
      [day]: updatedDaySchedule
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-violet-500" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profName">Student Name</Label>
                <Input 
                  id="profName"
                  value={profName} 
                  onChange={e => setProfName(e.target.value)} 
                  placeholder="e.g. Aman Sharma"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profCollege">College / University</Label>
                <Input 
                  id="profCollege"
                  value={profCollege} 
                  onChange={e => setProfCollege(e.target.value)} 
                  placeholder="e.g. IIT Delhi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profSemester">Semester</Label>
                <Input 
                  id="profSemester"
                  value={profSemester} 
                  onChange={e => setProfSemester(e.target.value)} 
                  placeholder="e.g. Semester 4"
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance & Management Group */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-violet-500" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2 rounded-2xl"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-5 w-5" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2 rounded-2xl"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-5 w-5" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2 rounded-2xl"
                  onClick={() => setTheme('system')}
                >
                  <Laptop className="h-5 w-5" />
                  System
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Export your subjects, schedule, and attendance logs to keep a backup or transfer to other devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleExport} className="w-full rounded-xl">
                  <Download className="h-4 w-4 mr-2" /> Export Backup
                </Button>
                <div className="relative w-full">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full pointer-events-none rounded-xl">
                    <Upload className="h-4 w-4 mr-2" /> Import Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Weekly Timetable Scheduler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-500" />
            Weekly Class Timetable Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Day Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-4 border-slate-100 dark:border-slate-800">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveTabDay(day)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTabDay === day 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List classes for active day */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400">Scheduled for {activeTabDay}</h3>
              {(!schedule[activeTabDay] || schedule[activeTabDay].length === 0) ? (
                <div className="py-10 text-center border border-dashed rounded-2xl text-slate-500 dark:text-slate-450 text-xs">
                  No classes scheduled for {activeTabDay}.
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule[activeTabDay].map(item => {
                    const sub = subjects.find(s => s.id === item.subjectId);
                    if (!sub) return null;
                    
                    return (
                      <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <div>
                            <span className="font-bold text-sm">{sub.name}</span>
                            <span className="text-xs text-slate-500 ml-4 flex items-center gap-1 inline-flex">
                              <Clock className="w-3.5 h-3.5" /> {item.time}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDeleteSchedule(activeTabDay, item.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add schedule item form */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-500" />
                Add Class to {activeTabDay}
              </h3>
              {subjects.length === 0 ? (
                <p className="text-xs text-slate-500">Please add subjects first before building your schedule.</p>
              ) : (
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedSub">Select Subject</Label>
                    <select 
                      id="schedSub"
                      value={addSchedSubjectId || (subjects[0]?.id || '')} 
                      onChange={e => setAddSchedSubjectId(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-800 dark:bg-black/50 text-slate-800 dark:text-slate-100"
                    >
                      <option value="" disabled>-- Select Subject --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedTime">Class Time</Label>
                    <Input 
                      id="schedTime"
                      type="time" 
                      value={addSchedTime} 
                      onChange={e => setAddSchedTime(e.target.value)} 
                      required 
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full rounded-xl">
                    Add Scheduled Class
                  </Button>
                </form>
              )}
            </div>

          </div>

        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-650 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-4 font-medium">
            Permanently delete all your attendance logs, timetable schedule, and subject records. This cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => setIsResetOpen(true)} className="rounded-xl">
            <Trash2 className="h-4 w-4 mr-2" /> Reset All Data
          </Button>
        </CardContent>
      </Card>

      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset All Data?">
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">
            This will permanently delete all your tracked subjects, generated calendar logs, class schedules, and custom settings.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsResetOpen(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleReset} className="rounded-xl">Yes, delete everything</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
