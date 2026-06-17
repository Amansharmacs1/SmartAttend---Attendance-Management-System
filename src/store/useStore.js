import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to generate weekday dates backwards from June 17, 2026
function getPastWeekdays(count, startFromDate = new Date(2026, 5, 17)) {
  const dates = [];
  let curr = new Date(startFromDate);
  while (dates.length < count) {
    const day = curr.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    curr.setDate(curr.getDate() - 1);
  }
  return dates;
}

// Generate seeded logs for DSA (11 attended out of 13)
const dsaDates = getPastWeekdays(13);
const dsaLogs = dsaDates.map((date, idx) => {
  let status = 'present';
  let notes = 'Attended regular lecture';
  if (idx === 4) {
    status = 'duty_leave';
    notes = 'Attended Inter-College Tech Fest';
  } else if (idx === 2) {
    status = 'absent';
    notes = 'Missed class (Sick leave)';
  } else if (idx === 8) {
    status = 'absent';
    notes = 'Missed class due to traffic delay';
  }
  return {
    id: `dsa-log-${idx}`,
    date,
    status,
    notes
  };
});

// Generate seeded logs for FEFL (10 attended out of 14)
const feflDates = getPastWeekdays(14);
const feflLogs = feflDates.map((date, idx) => {
  let status = 'present';
  let notes = 'Attended regular lecture';
  if (idx === 5) {
    status = 'duty_leave';
    notes = 'On Duty (Sports Selection)';
  } else if (idx === 1) {
    status = 'absent';
    notes = 'Missed class (Rain/Weather)';
  } else if (idx === 6) {
    status = 'absent';
    notes = 'Missed class (Overslept)';
  } else if (idx === 10) {
    status = 'absent';
    notes = 'Missed class (Medical checkup)';
  } else if (idx === 13) {
    status = 'absent';
    notes = 'Missed class';
  }
  return {
    id: `fefl-log-${idx}`,
    date,
    status,
    notes
  };
});

const initialSubjects = [
  {
    name: "DSA",
    minAttendance: 75,
    attendedClasses: 11, // 10 present + 1 duty_leave
    totalClasses: 13,
    color: "#3b82f6",
    id: "06e21150-20a2-4296-a7fe-6f9632f4c100",
    createdAt: 1781687687967,
    updatedAt: 1781687749666,
    logs: dsaLogs
  },
  {
    name: "FEFL",
    minAttendance: 75,
    attendedClasses: 10, // 9 present + 1 duty_leave
    totalClasses: 14,
    color: "#ef4444",
    id: "9ee763b5-5746-4314-ac9f-5afb88e8ec51",
    createdAt: 1781687699800,
    updatedAt: 1781687778632,
    logs: feflLogs
  }
];

const initialSchedule = {
  Monday: [
    { id: 'sched-1', subjectId: '06e21150-20a2-4296-a7fe-6f9632f4c100', time: '10:00' }, // DSA
    { id: 'sched-2', subjectId: '9ee763b5-5746-4314-ac9f-5afb88e8ec51', time: '13:00' }  // FEFL
  ],
  Tuesday: [
    { id: 'sched-3', subjectId: '9ee763b5-5746-4314-ac9f-5afb88e8ec51', time: '11:00' }  // FEFL
  ],
  Wednesday: [
    { id: 'sched-4', subjectId: '06e21150-20a2-4296-a7fe-6f9632f4c100', time: '10:00' }, // DSA
    { id: 'sched-5', subjectId: '9ee763b5-5746-4314-ac9f-5afb88e8ec51', time: '14:00' }  // FEFL
  ],
  Thursday: [
    { id: 'sched-6', subjectId: '06e21150-20a2-4296-a7fe-6f9632f4c100', time: '11:00' }  // DSA
  ],
  Friday: [
    { id: 'sched-7', subjectId: '06e21150-20a2-4296-a7fe-6f9632f4c100', time: '09:00' }, // DSA
    { id: 'sched-8', subjectId: '9ee763b5-5746-4314-ac9f-5afb88e8ec51', time: '12:00' }  // FEFL
  ],
  Saturday: [],
  Sunday: []
};

const initialProfile = {
  name: "Aman Sharma",
  college: "Indian Institute of Technology",
  semester: "Semester 4"
};

export const useStore = create(
  persist(
    (set) => ({
      subjects: initialSubjects,
      schedule: initialSchedule,
      profile: initialProfile,
      theme: 'system',
      
      addSubject: (subjectData) => set((state) => {
        const id = crypto.randomUUID();
        const attended = subjectData.attendedClasses || 0;
        const total = subjectData.totalClasses || 0;
        const logs = [];
        
        if (total > 0) {
          const dates = getPastWeekdays(total);
          for (let i = 0; i < total; i++) {
            const status = i < attended ? 'present' : 'absent';
            logs.push({
              id: `${id}-log-${i}`,
              date: dates[i],
              status,
              notes: 'Initialized class record'
            });
          }
        }
        
        const newSubject = {
          ...subjectData,
          id,
          logs,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { subjects: [...state.subjects, newSubject] };
      }),
      
      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map(sub => 
          sub.id === id ? { ...sub, ...updates, updatedAt: Date.now() } : sub
        )
      })),
      
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(sub => sub.id !== id),
        schedule: Object.keys(state.schedule).reduce((acc, day) => {
          acc[day] = state.schedule[day].filter(item => item.subjectId !== id);
          return acc;
        }, {})
      })),
      
      markPresent: (id, customDate) => set((state) => {
        const date = customDate || new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        const newLog = {
          id: crypto.randomUUID(),
          date,
          status: 'present',
          notes: 'Marked present'
        };
        return {
          subjects: state.subjects.map(sub => {
            if (sub.id !== id) return sub;
            const logs = [newLog, ...(sub.logs || [])].sort((a, b) => b.date.localeCompare(a.date));
            const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
            const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
            return {
              ...sub,
              logs,
              attendedClasses,
              totalClasses,
              updatedAt: Date.now()
            };
          })
        };
      }),
      
      markAbsent: (id, customDate) => set((state) => {
        const date = customDate || new Date().toLocaleDateString('en-CA');
        const newLog = {
          id: crypto.randomUUID(),
          date,
          status: 'absent',
          notes: 'Marked absent'
        };
        return {
          subjects: state.subjects.map(sub => {
            if (sub.id !== id) return sub;
            const logs = [newLog, ...(sub.logs || [])].sort((a, b) => b.date.localeCompare(a.date));
            const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
            const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
            return {
              ...sub,
              logs,
              attendedClasses,
              totalClasses,
              updatedAt: Date.now()
            };
          })
        };
      }),

      markDutyLeave: (id, customDate) => set((state) => {
        const date = customDate || new Date().toLocaleDateString('en-CA');
        const newLog = {
          id: crypto.randomUUID(),
          date,
          status: 'duty_leave',
          notes: 'Marked as Duty Leave'
        };
        return {
          subjects: state.subjects.map(sub => {
            if (sub.id !== id) return sub;
            const logs = [newLog, ...(sub.logs || [])].sort((a, b) => b.date.localeCompare(a.date));
            const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
            const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
            return {
              ...sub,
              logs,
              attendedClasses,
              totalClasses,
              updatedAt: Date.now()
            };
          })
        };
      }),

      addLog: (subjectId, logDate, status, notes) => set((state) => {
        const newLog = {
          id: crypto.randomUUID(),
          date: logDate,
          status,
          notes: notes || ''
        };
        return {
          subjects: state.subjects.map(sub => {
            if (sub.id !== subjectId) return sub;
            const logs = [newLog, ...(sub.logs || [])].sort((a, b) => b.date.localeCompare(a.date));
            const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
            const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
            return {
              ...sub,
              logs,
              attendedClasses,
              totalClasses,
              updatedAt: Date.now()
            };
          })
        };
      }),

      updateLog: (subjectId, logId, updates) => set((state) => ({
        subjects: state.subjects.map(sub => {
          if (sub.id !== subjectId) return sub;
          const logs = (sub.logs || []).map(l => l.id === logId ? { ...l, ...updates } : l);
          const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
          const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
          return {
            ...sub,
            logs,
            attendedClasses,
            totalClasses,
            updatedAt: Date.now()
          };
        })
      })),

      deleteLog: (subjectId, logId) => set((state) => ({
        subjects: state.subjects.map(sub => {
          if (sub.id !== subjectId) return sub;
          const logs = (sub.logs || []).filter(l => l.id !== logId);
          const attendedClasses = logs.filter(l => l.status === 'present' || l.status === 'duty_leave').length;
          const totalClasses = logs.filter(l => l.status !== 'cancelled').length;
          return {
            ...sub,
            logs,
            attendedClasses,
            totalClasses,
            updatedAt: Date.now()
          };
        })
      })),
      
      setTheme: (theme) => set({ theme }),
      
      importData: (data) => set((state) => {
        const importedSubjects = (data.subjects || []).map(sub => {
          // Ensure subjects have logs
          const logs = sub.logs || [];
          if (logs.length === 0 && sub.totalClasses > 0) {
            const dates = getPastWeekdays(sub.totalClasses);
            for (let i = 0; i < sub.totalClasses; i++) {
              const status = i < sub.attendedClasses ? 'present' : 'absent';
              logs.push({
                id: `${sub.id || crypto.randomUUID()}-log-${i}`,
                date: dates[i],
                status,
                notes: 'Imported class record'
              });
            }
          }
          return {
            ...sub,
            logs,
            id: sub.id || crypto.randomUUID()
          };
        });
        return {
          subjects: importedSubjects,
          schedule: data.schedule || state.schedule,
          profile: data.profile || state.profile
        };
      }),
      
      resetData: () => set({ 
        subjects: [],
        schedule: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
        profile: { name: '', college: '', semester: '' }
      }),

      updateProfile: (profileUpdates) => set((state) => ({
        profile: { ...state.profile, ...profileUpdates }
      })),

      updateSchedule: (schedule) => set({ schedule })
    }),
    {
      name: 'smartattend-storage', 
    }
  )
);
