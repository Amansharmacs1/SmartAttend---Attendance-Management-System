import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SubjectCard } from '../components/SubjectCard';
import { EmptyState } from '../components/EmptyState';
import { AddSubjectModal } from '../components/AddSubjectModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Label } from '../components/ui/Input';
import { calculatePercentage, getStatusText } from '../utils/calculations';
import { motion } from 'framer-motion';
import { 
  Plus, Search, PieChart as PieIcon, BookOpen, AlertTriangle, 
  Calendar, Clock, Check, X, Award, Edit3, GraduationCap, TrendingUp, BarChart4
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';

export function Dashboard() {
  const subjects = useStore((state) => state.subjects);
  const schedule = useStore((state) => state.schedule) || {};
  const profile = useStore((state) => state.profile) || { name: '', college: '', semester: '' };
  
  const { 
    markPresent, markAbsent, markDutyLeave, updateProfile, 
    updateLog, deleteLog 
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Profile edit fields
  const [profName, setProfName] = useState(profile.name || '');
  const [profCollege, setProfCollege] = useState(profile.college || '');
  const [profSemester, setProfSemester] = useState(profile.semester || '');

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalClasses = subjects.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const attendedClasses = subjects.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallPercentage = calculatePercentage(attendedClasses, totalClasses);

  const safeCount = subjects.filter(s => getStatusText(calculatePercentage(s.attendedClasses, s.totalClasses), s.minAttendance) === 'SAFE').length;
  const criticalCount = subjects.filter(s => getStatusText(calculatePercentage(s.attendedClasses, s.totalClasses), s.minAttendance) === 'CRITICAL').length;

  // Timetable for today
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = DAYS_OF_WEEK[new Date().getDay()];
  const todayClasses = schedule[todayDayName] || [];
  
  const todayDateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: profName,
      college: profCollege,
      semester: profSemester
    });
    setIsProfileModalOpen(false);
  };

  const openProfileModal = () => {
    setProfName(profile.name || '');
    setProfCollege(profile.college || '');
    setProfSemester(profile.semester || '');
    setIsProfileModalOpen(true);
  };

  // Recharts calculations
  const getLineData = () => {
    const data = [];
    const daysToTrack = 10;
    
    // Get past 10 days YYYY-MM-DD
    const dates = [];
    for (let i = daysToTrack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('en-CA'));
    }
    
    dates.forEach(date => {
      let cumAttended = 0;
      let cumTotal = 0;
      
      subjects.forEach(sub => {
        const logsUpToDate = (sub.logs || []).filter(l => l.date <= date);
        const attended = logsUpToDate.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
        const total = logsUpToDate.filter(l => l.status !== 'cancelled').length;
        cumAttended += attended;
        cumTotal += total;
      });
      
      const pct = cumTotal === 0 ? 0 : Number(((cumAttended / cumTotal) * 100).toFixed(1));
      const label = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      data.push({
        date: label,
        Overall: pct
      });
    });
    
    return data;
  };

  const getBarData = () => {
    return subjects.map(sub => {
      const percentage = calculatePercentage(sub.attendedClasses, sub.totalClasses);
      return {
        name: sub.name,
        Current: percentage,
        Target: sub.minAttendance
      };
    });
  };

  const getPieData = () => {
    let present = 0;
    let absent = 0;
    let dutyLeave = 0;
    
    subjects.forEach(sub => {
      (sub.logs || []).forEach(l => {
        if (l.status === 'present') present++;
        else if (l.status === 'absent') absent++;
        else if (l.status === 'duty_leave') dutyLeave++;
      });
    });
    
    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#ef4444' },
      { name: 'Duty Leave', value: dutyLeave, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  };

  if (subjects.length === 0) {
    return (
      <>
        <EmptyState onAdd={() => setIsAddModalOpen(true)} />
        <AddSubjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </>
    );
  }

  const lineData = getLineData();
  const barData = getBarData();
  const pieData = getPieData();

  return (
    <div className="space-y-8 pb-20">
      {/* Profile and Quick Statistics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{profile.name || 'Student Name'}</h3>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{profile.college || 'College/University'}</p>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-bold mt-0.5">{profile.semester || 'Semester'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={openProfileModal}>
              <Edit3 className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Standing</span>
            <span className={`font-bold px-2 py-0.5 rounded-full ${overallPercentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {overallPercentage >= 75 ? 'Good' : 'Needs Action'}
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold text-xs tracking-wider uppercase">Overall</span>
            </div>
            <div className="text-4xl font-black">{totalClasses === 0 ? '--' : `${overallPercentage}%`}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold text-xs tracking-wider uppercase">Subjects</span>
            </div>
            <div className="text-4xl font-bold">{subjects.length}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
              <span className="font-semibold text-xs tracking-wider uppercase">Safe</span>
            </div>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{safeCount}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-md flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold text-xs tracking-wider uppercase">Critical</span>
            </div>
            <div className="text-4xl font-bold text-red-600 dark:text-red-400">{criticalCount}</div>
          </motion.div>
        </div>

      </div>

      {/* Today's Schedule Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-500" />
            <h2 className="font-bold text-lg">Today's Schedule ({todayDayName})</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Quick Mark Attendance</span>
        </div>

        {todayClasses.length === 0 ? (
          <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            🎉 No classes scheduled for today! Enjoy your day off.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map((item) => {
              const sub = subjects.find(s => s.id === item.subjectId);
              if (!sub) return null;
              
              const todayLog = (sub.logs || []).find(l => l.date === todayDateStr);

              return (
                <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-12 rounded-full" style={{ backgroundColor: sub.color }} />
                    <div>
                      <div className="font-bold text-sm">{sub.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.time}
                      </div>
                    </div>
                  </div>

                  {todayLog ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        todayLog.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                        todayLog.status === 'absent' ? 'bg-red-500/10 text-red-500' :
                        todayLog.status === 'duty_leave' ? 'bg-violet-500/10 text-violet-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {todayLog.status === 'present' ? <Check className="w-3 h-3" /> :
                         todayLog.status === 'absent' ? <X className="w-3 h-3" /> :
                         <Award className="w-3 h-3" />}
                        {todayLog.status === 'present' ? 'Present' :
                         todayLog.status === 'absent' ? 'Absent' :
                         todayLog.status === 'duty_leave' ? 'Duty Leave' : 'Cancelled'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-[10px] text-slate-400 hover:text-red-500"
                        onClick={() => deleteLog(sub.id, todayLog.id)}
                      >
                        Undo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button 
                        size="sm" 
                        variant="success" 
                        className="h-8 rounded-lg px-3 text-xs"
                        onClick={() => markPresent(sub.id)}
                      >
                        Present
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 rounded-lg px-3 text-xs"
                        onClick={() => markAbsent(sub.id)}
                      >
                        Absent
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 rounded-lg px-2 text-xs border-violet-200 text-violet-500 hover:bg-violet-50 dark:border-violet-900/50 dark:text-violet-400 dark:hover:bg-violet-950/20"
                        onClick={() => markDutyLeave(sub.id)}
                      >
                        OD
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Trend Line Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            10-Day Attendance Trend (%)
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Overall" 
                  stroke="url(#lineColor)" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject wise target comparison Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-violet-500" />
            Subject vs Target Attendance (%)
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="Current" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {subjects.map((sub, idx) => (
                    <Cell key={`cell-${idx}`} fill={sub.color || '#aa3bff'} />
                  ))}
                </Bar>
                <Bar dataKey="Target" fill="#e2e8f0" radius={[6, 6, 0, 0]}>
                  {subjects.map((sub, idx) => (
                    <Cell key={`cell-tgt-${idx}`} fill="rgba(148, 163, 184, 0.2)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats Distribution Pie Chart (If space and data allows) */}
        {pieData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col md:col-span-2 items-center justify-center"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 self-start">
              <PieIcon className="w-5 h-5 text-violet-500" />
              Overall Attendance Distribution (Classes)
            </h3>
            <div className="h-56 w-full md:w-1/2 text-xs flex justify-around items-center">
              <div className="h-full w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{entry.name}: <strong className="font-bold">{entry.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Search and Subjects Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search subjects..." 
              className="pl-10 h-12 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="lg" variant="gradient" className="rounded-2xl w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> Add Subject
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, idx) => (
            <motion.div 
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <SubjectCard subject={subject} />
            </motion.div>
          ))}
        </div>

        {filteredSubjects.length === 0 && search && (
          <div className="text-center py-20 text-slate-500">
            No subjects found matching "{search}"
          </div>
        )}
      </div>

      <AddSubjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Profile Edit Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profName">Student Name</Label>
            <Input
              id="profName"
              placeholder="e.g. Aman Sharma"
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profCollege">College / University</Label>
            <Input
              id="profCollege"
              placeholder="e.g. Indian Institute of Technology"
              value={profCollege}
              onChange={(e) => setProfCollege(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profSemester">Semester</Label>
            <Input
              id="profSemester"
              placeholder="e.g. Semester 4"
              value={profSemester}
              onChange={(e) => setProfSemester(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
