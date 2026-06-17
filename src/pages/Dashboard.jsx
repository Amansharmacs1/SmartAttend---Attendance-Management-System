import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SubjectCard } from '../components/SubjectCard';
import { EmptyState } from '../components/EmptyState';
import { AddSubjectModal } from '../components/AddSubjectModal';
import { Button } from '../components/ui/Button';
import { Plus, Search, PieChart, BookOpen, AlertTriangle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { calculatePercentage, getStatusText } from '../utils/calculations';
import { motion } from 'framer-motion';

export function Dashboard() {
  const subjects = useStore((state) => state.subjects);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalClasses = subjects.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const attendedClasses = subjects.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallPercentage = calculatePercentage(attendedClasses, totalClasses);

  const safeCount = subjects.filter(s => getStatusText(calculatePercentage(s.attendedClasses, s.totalClasses), s.minAttendance) === 'SAFE').length;
  const criticalCount = subjects.filter(s => getStatusText(calculatePercentage(s.attendedClasses, s.totalClasses), s.minAttendance) === 'CRITICAL').length;

  if (subjects.length === 0) {
    return (
      <>
        <EmptyState onAdd={() => setIsAddModalOpen(true)} />
        <AddSubjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <PieChart className="w-5 h-5" />
            <span className="font-medium text-sm">Overall</span>
          </div>
          <div className="text-4xl font-black">{totalClasses === 0 ? '--' : `${overallPercentage}%`}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium text-sm">Subjects</span>
          </div>
          <div className="text-4xl font-bold">{subjects.length}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <PieChart className="w-5 h-5" />
            <span className="font-medium text-sm">Safe</span>
          </div>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{safeCount}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium text-sm">Critical</span>
          </div>
          <div className="text-4xl font-bold text-red-600 dark:text-red-400">{criticalCount}</div>
        </motion.div>
      </div>

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

      <AddSubjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
