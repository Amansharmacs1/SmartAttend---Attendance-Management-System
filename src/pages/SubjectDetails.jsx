import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculatePercentage, calculateSafeBunks, calculateClassesNeeded, getStatusText, getLocalDateString } from '../utils/calculations';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { AttendanceSimulator } from '../components/AttendanceSimulator';
import { 
  ArrowLeft, Check, X, Edit2, Trash2, Calendar, Plus, 
  History, Clock, Award, Ban, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    subjects, markPresent, markAbsent, markDutyLeave, updateSubject, deleteSubject,
    addLog, updateLog, deleteLog
  } = useStore();
  
  const subject = subjects.find(s => s.id === id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMin, setEditMin] = useState('');

  // Log custom class form states
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [logStatus, setLogStatus] = useState('present');
  const [logNotes, setLogNotes] = useState('');

  // Edit log notes states
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingNotesText, setEditingNotesText] = useState('');
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);

  if (!subject) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  const percentage = calculatePercentage(subject.attendedClasses, subject.totalClasses);
  const safeBunks = calculateSafeBunks(subject.attendedClasses, subject.totalClasses, subject.minAttendance);
  const neededClasses = calculateClassesNeeded(subject.attendedClasses, subject.totalClasses, subject.minAttendance);
  const status = getStatusText(percentage, subject.minAttendance);

  const handleEditOpen = () => {
    setEditName(subject.name);
    setEditMin(subject.minAttendance.toString());
    setIsEditOpen(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    updateSubject(subject.id, {
      name: editName,
      minAttendance: Number(editMin)
    });
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteSubject(subject.id);
      navigate('/');
    }
  };

  const handleLogPastClass = (e) => {
    e.preventDefault();
    if (!logDate) return;
    addLog(subject.id, logDate, logStatus, logNotes.trim());
    setLogNotes('');
    setLogStatus('present');
  };

  const openEditNotesModal = (log) => {
    setEditingLogId(log.id);
    setEditingNotesText(log.notes || '');
    setIsEditNotesOpen(true);
  };

  const handleSaveNotes = () => {
    updateLog(subject.id, editingLogId, { notes: editingNotesText.trim() });
    setIsEditNotesOpen(false);
    setEditingLogId(null);
  };

  // Calendar Heatmap logic
  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); 
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')} className="pl-2">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleEditOpen}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title block */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ backgroundColor: subject.color }}>
          {subject.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-slate-500 font-medium">Target Criteria: {subject.minAttendance}%</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Overview and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="text-5xl font-black">{percentage}%</div>
                <Badge variant={status === 'SAFE' ? 'success' : status === 'WARNING' ? 'warning' : 'destructive'} className="text-sm px-3 py-1">
                  {status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Attended: {subject.attendedClasses}</span>
                  <span>Total: {subject.totalClasses}</span>
                </div>
                <Progress 
                  value={percentage} 
                  indicatorColor={status === 'SAFE' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'} 
                  className="h-3"
                />
              </div>

              {/* Three action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button size="lg" variant="success" onClick={() => markPresent(subject.id)} className="flex-1">
                  <Check className="w-5 h-5 mr-2" /> Present
                </Button>
                <Button size="lg" variant="destructive" onClick={() => markAbsent(subject.id)} className="flex-1">
                  <X className="w-5 h-5 mr-2" /> Absent
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => markDutyLeave(subject.id)} 
                  className="flex-1 border-violet-200 hover:border-violet-300 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 dark:hover:bg-violet-950/20"
                >
                  <Award className="w-5 h-5 mr-2" /> Duty Leave
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar visualizer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  Attendance Calendar
                </CardTitle>
                <span className="text-xs font-bold text-slate-500">{currentMonthName}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {WEEKDAYS.map(w => (
                    <div key={w} className="font-semibold text-slate-400 py-1">{w}</div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="min-h-[3.75rem]" />;
                    
                    const dayLogs = (subject.logs || []).filter(l => l.date === day.dateStr);
                    const attendedCount = dayLogs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
                    const missedCount = dayLogs.filter(l => l.status === 'absent').length;
                    const cancelledCount = dayLogs.filter(l => l.status === 'cancelled').length;
                    
                    const hasLogs = dayLogs.length > 0;
                    
                    let cellClass = "min-h-[3.75rem] rounded-xl flex flex-col items-center justify-between p-1.5 relative group cursor-pointer transition-all border ";
                    
                    if (hasLogs) {
                      cellClass += "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80";
                    } else {
                      cellClass += "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900";
                    }
                    
                    const tooltipText = hasLogs
                      ? `${day.dateStr}:\n` + dayLogs.map(l => `- ${l.status.toUpperCase().replace('_', ' ')}${l.notes ? ` (${l.notes})` : ''}`).join('\n')
                      : day.dateStr;

                    return (
                      <div 
                        key={day.dateStr} 
                        className={cellClass}
                        title={tooltipText}
                      >
                        <span className={`font-bold text-xs ${hasLogs ? 'text-slate-900 dark:text-white font-black' : 'text-slate-450'}`}>{day.dayNum}</span>
                        
                        {hasLogs && (
                          <div className="flex flex-wrap items-center justify-center gap-1 w-full mt-1">
                            {attendedCount > 0 && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 leading-none" title="Attended">
                                ✓{attendedCount}
                              </span>
                            )}
                            {missedCount > 0 && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 leading-none" title="Missed">
                                ✗{missedCount}
                              </span>
                            )}
                            {cancelledCount > 0 && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-500 leading-none" title="Cancelled">
                                C{cancelledCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Calendar Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" /> Present
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500" /> Absent
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-violet-500" /> Duty Leave
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-400" /> Cancelled
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Logs List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-violet-500" />
                Class History Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!subject.logs || subject.logs.length === 0) ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-450 text-sm">
                  No attendance history logged yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {subject.logs.map((log) => {
                    const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    });
                    
                    return (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{formattedDate}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                              log.status === 'absent' ? 'bg-red-500/10 text-red-500' :
                              log.status === 'duty_leave' ? 'bg-violet-500/10 text-violet-500' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {log.status === 'present' ? 'Present' :
                               log.status === 'absent' ? 'Absent' :
                               log.status === 'duty_leave' ? 'Duty Leave' : 'Cancelled'}
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-450 italic flex items-center gap-1">
                              <FileText className="w-3 h-3 flex-shrink-0" /> "{log.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Quick toggles */}
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                            <button 
                              title="Set Present" 
                              onClick={() => updateLog(subject.id, log.id, { status: 'present' })}
                              className={`p-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${log.status === 'present' ? 'text-emerald-500 font-bold bg-emerald-500/5' : 'text-slate-400'}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              title="Set Absent" 
                              onClick={() => updateLog(subject.id, log.id, { status: 'absent' })}
                              className={`p-1 text-xs border-l border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 ${log.status === 'absent' ? 'text-red-500 font-bold bg-red-500/5' : 'text-slate-400'}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              title="Set Duty Leave" 
                              onClick={() => updateLog(subject.id, log.id, { status: 'duty_leave' })}
                              className={`p-1 text-xs border-l border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 ${log.status === 'duty_leave' ? 'text-violet-500 font-bold bg-violet-500/5' : 'text-slate-400'}`}
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              title="Set Cancelled" 
                              onClick={() => updateLog(subject.id, log.id, { status: 'cancelled' })}
                              className={`p-1 text-xs border-l border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 ${log.status === 'cancelled' ? 'text-slate-500 font-bold bg-slate-500/5' : 'text-slate-400'}`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-blue-500" onClick={() => openEditNotesModal(log)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => deleteLog(subject.id, log.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Calculations, Simulator, Log Past Class Form */}
        <div className="space-y-6">
          
          {/* Safe bunks / classes needed card */}
          <Card className={safeBunks > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-250" : "bg-red-50 dark:bg-red-500/10 border-red-255"}>
            <CardContent className="pt-6">
              {safeBunks > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Safe Bunks Available</h3>
                  <p className="text-sm text-emerald-600/80 mb-3">You can afford to skip classes and stay above criteria.</p>
                  <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{safeBunks} classes</div>
                </div>
              ) : neededClasses > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Classes Needed</h3>
                  <p className="text-sm text-red-600/80 mb-3">Attend consecutive classes to recover your attendance.</p>
                  <div className="text-4xl font-black text-red-600 dark:text-red-400">{neededClasses} classes</div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-1">On the Edge</h3>
                  <p className="text-sm text-amber-600/80 mb-3">You cannot miss any class to maintain target.</p>
                  <div className="text-4xl font-black text-amber-600 dark:text-amber-400">0 classes</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Log custom past class form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-500" />
                Log Past Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogPastClass} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logDate">Class Date</Label>
                  <Input 
                    id="logDate"
                    type="date" 
                    value={logDate} 
                    onChange={e => setLogDate(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logStatus">Attendance Status</Label>
                  <select 
                    id="logStatus"
                    value={logStatus} 
                    onChange={e => setLogStatus(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-black/50 transition-all text-slate-850 dark:text-slate-100"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="duty_leave">Duty Leave</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logNotes">Notes (Optional)</Label>
                  <Input 
                    id="logNotes"
                    placeholder="e.g. sick leave, midterm, lab class" 
                    value={logNotes} 
                    onChange={e => setLogNotes(e.target.value)} 
                  />
                </div>

                <Button type="submit" variant="gradient" className="w-full h-11 rounded-xl">
                  Log Attendance Record
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* "What-If" simulator */}
          <AttendanceSimulator subject={subject} />

        </div>

      </div>

      {/* Edit Subject Settings Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Subject">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="space-y-2">
            <Label>Subject Name</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Target Attendance (%)</Label>
            <Input type="number" min="1" max="100" value={editMin} onChange={e => setEditMin(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Log Notes Modal */}
      <Modal isOpen={isEditNotesOpen} onClose={() => setIsEditNotesOpen(false)} title="Edit Session Notes">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editingNotesText">Session Notes</Label>
            <Input 
              id="editingNotesText" 
              placeholder="Enter notes (reason for absence, duty leave details etc.)" 
              value={editingNotesText} 
              onChange={e => setEditingNotesText(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditNotesOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSaveNotes}>Save Notes</Button>
          </div>
        </div>
      </Modal>

    </motion.div>
  );
}
