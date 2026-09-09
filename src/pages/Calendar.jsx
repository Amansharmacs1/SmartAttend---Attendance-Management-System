import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { getLocalDateString } from '../utils/calculations';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addDays, parseISO
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Check, X, Award, Info, Plus
} from 'lucide-react';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const subjects = useStore(state => state.subjects);
  const schedule = useStore(state => state.schedule);
  const { addLog, updateLog, deleteLog } = useStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isAddAttModalOpen, setIsAddAttModalOpen] = useState(false);

  // Filters
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Prepare logs map: date string (YYYY-MM-DD) -> array of logs
  const logsByDate = {};
  subjects.forEach(sub => {
    if (filterSubject !== 'all' && sub.id !== filterSubject) return;
    
    (sub.logs || []).forEach(log => {
      if (filterStatus !== 'all' && log.status !== filterStatus) return;
      
      if (!logsByDate[log.date]) logsByDate[log.date] = [];
      logsByDate[log.date].push({
        ...log,
        subjectId: sub.id,
        subjectName: sub.name,
        color: sub.color
      });
    });
  });

  const onDateClick = (day) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  const openAddAttendanceForDate = (date) => {
    setAddAttForm({
      ...addAttForm,
      date: format(date, 'yyyy-MM-dd')
    });
    setIsAddAttModalOpen(true);
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <h2 className="text-lg sm:text-xl font-bold w-32 sm:w-40 text-center sm:text-left">{format(currentDate, 'MMMM yyyy')}</h2>
        <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs">Today</Button>
      </div>
      <Button variant="gradient" size="sm" className="w-full sm:w-auto" onClick={() => openAddAttendanceForDate(new Date())}>
        <Plus className="w-4 h-4 mr-1"/> Add Attendance
      </Button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-[10px] sm:text-xs text-slate-500 py-1 sm:py-2 uppercase tracking-wider">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateStr = format(cloneDay, 'yyyy-MM-dd');
        const dayLogs = logsByDate[dateStr] || [];
        
        const present = dayLogs.filter(l => l.status === 'present').length;
        const absent = dayLogs.filter(l => l.status === 'absent').length;
        const duty = dayLogs.filter(l => l.status === 'duty_leave').length;
        const cancelled = dayLogs.filter(l => l.status === 'cancelled').length;

        // Determine dominant color if any
        let bgClass = "bg-white dark:bg-slate-900";
        if (dayLogs.length > 0) {
          if (absent > 0 && present === 0) bgClass = "bg-red-50 dark:bg-red-950/30";
          else if (present > 0 && absent === 0) bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
          else bgClass = "bg-blue-50 dark:bg-blue-950/30"; // Mixed
        }

        days.push(
          <div
            key={day}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[70px] sm:min-h-[100px] border border-slate-100 dark:border-slate-800 p-1 sm:p-2 cursor-pointer transition-all hover:border-violet-300 dark:hover:border-violet-700
              ${!isSameMonth(day, monthStart) ? 'opacity-40 bg-slate-50 dark:bg-slate-900' : bgClass}
              ${isToday(day) ? 'ring-2 ring-violet-500 ring-inset' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-violet-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {formattedDate}
              </span>
            </div>
            
            {dayLogs.length > 0 ? (
              <div className="flex flex-col gap-1 mt-2">
                {present > 0 && <div className="text-[10px] font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1 sm:px-1.5 rounded truncate"><span className="hidden sm:inline">P: </span> {present}</div>}
                {absent > 0 && <div className="text-[10px] font-medium text-red-600 bg-red-100 dark:bg-red-900/40 px-1 sm:px-1.5 rounded truncate"><span className="hidden sm:inline">A: </span> {absent}</div>}
                {duty > 0 && <div className="text-[10px] font-medium text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-1 sm:px-1.5 rounded truncate"><span className="hidden sm:inline">OD: </span> {duty}</div>}
                {cancelled > 0 && <div className="text-[10px] font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/40 px-1 sm:px-1.5 rounded truncate"><span className="hidden sm:inline">C: </span> {cancelled}</div>}
              </div>
            ) : (
              <div className="mt-4 text-[10px] text-slate-400 text-center hidden sm:block opacity-0 group-hover:opacity-100">No records</div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">{rows}</div>;
  };

  // Day Details Modal
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayLogs = selectedDateStr ? logsByDate[selectedDateStr] || [] : [];
  const dayName = selectedDate ? format(selectedDate, 'EEEE') : '';
  const scheduledClasses = schedule[dayName] || [];

  // Add Attendance Form
  const [addAttForm, setAddAttForm] = useState({
    date: getLocalDateString(),
    subjectId: '',
    status: 'present',
    notes: ''
  });

  const handleAddAttendance = (e) => {
    e.preventDefault();
    if (!addAttForm.subjectId) return;
    
    // Check if it's a future date
    const selectedDt = new Date(addAttForm.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDt > today) {
      alert("Cannot mark attendance for a future date.");
      return;
    }

    // Check duplicate
    const sub = subjects.find(s => s.id === addAttForm.subjectId);
    if (sub) {
      const existing = (sub.logs || []).find(l => l.date === addAttForm.date);
      if (existing) {
        if (window.confirm("An attendance record already exists for this date. Update it?")) {
          updateLog(addAttForm.subjectId, existing.id, { status: addAttForm.status, notes: addAttForm.notes });
        } else {
          return;
        }
      } else {
        addLog(addAttForm.subjectId, addAttForm.date, addAttForm.status, addAttForm.notes);
      }
    }
    setIsAddAttModalOpen(false);
  };

  // Populate scheduled classes for selected date in Add Modal
  const selectedAddDateObj = addAttForm.date ? new Date(addAttForm.date) : new Date();
  const selectedAddDayName = format(selectedAddDateObj, 'EEEE');
  const scheduledForDate = schedule[selectedAddDayName] || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="text-violet-500"/> Attendance Calendar</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select 
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="duty_leave">Duty Leave</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card className="p-6">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-red-500"></div> Absent</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-violet-500"></div> Duty Leave</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Cancelled</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 border border-slate-300 rounded-full bg-slate-50"></div> No Record</div>
        </div>
      </Card>

      {/* Day Details Modal */}
      <Modal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} title={selectedDate ? format(selectedDate, 'MMMM d, yyyy (EEEE)') : 'Details'}>
        <div className="space-y-6">
          
          <div>
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Attendance Records</h3>
            {dayLogs.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No attendance records for this date.</p>
            ) : (
              <div className="space-y-2">
                {dayLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: log.color }} />
                      {log.subjectName}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        log.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                        log.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        log.status === 'duty_leave' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                      <button onClick={() => {
                        if(window.confirm('Delete this record?')) deleteLog(log.subjectId, log.id);
                      }} className="text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Scheduled Classes</h3>
            {scheduledClasses.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No classes scheduled.</p>
            ) : (
              <div className="space-y-2">
                {scheduledClasses.map((cls, idx) => {
                  const subName = cls.subjectName || subjects.find(s => s.id === cls.subjectId)?.name;
                  return (
                    <div key={idx} className="flex justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <div>
                        <div className="font-medium text-sm">{subName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{cls.startTime} - {cls.endTime}</div>
                      </div>
                      {!dayLogs.some(l => l.subjectId === cls.subjectId) && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                          setAddAttForm({
                            date: selectedDateStr,
                            subjectId: cls.subjectId,
                            status: 'present',
                            notes: ''
                          });
                          setIsDayModalOpen(false);
                          setIsAddAttModalOpen(true);
                        }}>
                          Mark
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => { setIsDayModalOpen(false); openAddAttendanceForDate(selectedDate); }} variant="gradient" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Record
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Attendance Modal */}
      <Modal isOpen={isAddAttModalOpen} onClose={() => setIsAddAttModalOpen(false)} title="Add/Update Attendance">
        <form onSubmit={handleAddAttendance} className="space-y-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={addAttForm.date} onChange={e => setAddAttForm({...addAttForm, date: e.target.value})} required max={getLocalDateString()} />
          </div>
          
          <div className="space-y-2">
            <Label>Subject / Class *</Label>
            <select 
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-950"
              value={addAttForm.subjectId} 
              onChange={e => setAddAttForm({...addAttForm, subjectId: e.target.value})}
              required
            >
              <option value="">Select subject...</option>
              {scheduledForDate.length > 0 && <optgroup label={`Scheduled on ${selectedAddDayName}`}>
                {scheduledForDate.map(cls => (
                  <option key={`sch-${cls.subjectId}`} value={cls.subjectId}>
                    {cls.subjectName || subjects.find(s => s.id === cls.subjectId)?.name} ({cls.startTime})
                  </option>
                ))}
              </optgroup>}
              <optgroup label="All Subjects">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <div className="grid grid-cols-4 gap-2">
              {['present', 'absent', 'duty_leave', 'cancelled'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAddAttForm({...addAttForm, status})}
                  className={`p-2 rounded-xl border text-xs font-medium capitalize flex flex-col items-center justify-center gap-1 transition-colors ${
                    addAttForm.status === status
                      ? (status === 'present' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                         status === 'absent' ? 'bg-red-100 border-red-500 text-red-700' :
                         status === 'duty_leave' ? 'bg-violet-100 border-violet-500 text-violet-700' :
                         'bg-orange-100 border-orange-500 text-orange-700')
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  {status === 'present' ? <Check className="w-4 h-4"/> : 
                   status === 'absent' ? <X className="w-4 h-4"/> : 
                   status === 'duty_leave' ? <Award className="w-4 h-4"/> : <Info className="w-4 h-4"/>}
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Input placeholder="e.g. Late by 10 mins" value={addAttForm.notes} onChange={e => setAddAttForm({...addAttForm, notes: e.target.value})} />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddAttModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Save Attendance</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
