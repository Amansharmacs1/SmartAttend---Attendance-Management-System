import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocalDateString } from '../utils/calculations';

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

export const useStore = create(
  persist(
    (set) => ({
      subjects: [],
      schedule: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] },
      profile: { name: '', college: '', semester: '' },
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
        const date = customDate || getLocalDateString(); // YYYY-MM-DD in local time
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
        const date = customDate || getLocalDateString();
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
        const date = customDate || getLocalDateString();
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
