import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      subjects: [],
      theme: 'system',
      
      addSubject: (subjectData) => set((state) => {
        const newSubject = {
          ...subjectData,
          id: crypto.randomUUID(),
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
        subjects: state.subjects.filter(sub => sub.id !== id)
      })),
      
      markPresent: (id) => set((state) => ({
        subjects: state.subjects.map(sub => 
          sub.id === id ? { 
            ...sub, 
            attendedClasses: sub.attendedClasses + 1,
            totalClasses: sub.totalClasses + 1,
            updatedAt: Date.now()
          } : sub
        )
      })),
      
      markAbsent: (id) => set((state) => ({
        subjects: state.subjects.map(sub => 
          sub.id === id ? { 
            ...sub, 
            totalClasses: sub.totalClasses + 1,
            updatedAt: Date.now()
          } : sub
        )
      })),
      
      setTheme: (theme) => set({ theme }),
      
      importData: (data) => set((state) => ({
        ...state,
        ...data
      })),
      
      resetData: () => set({ subjects: [] })
    }),
    {
      name: 'smartattend-storage', 
    }
  )
);
