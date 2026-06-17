import React from 'react';
import { motion } from 'framer-motion';
import { Plus, GraduationCap } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-32 h-32 rounded-full bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-8"
      >
        <GraduationCap className="w-16 h-16 text-violet-500" />
      </motion.div>
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold tracking-tight mb-3"
      >
        Start tracking your attendance
      </motion.h2>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-500 dark:text-slate-400 max-w-sm mb-8"
      >
        Add your first subject to begin managing your classes, calculating safe bunks, and predicting future attendance.
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" variant="gradient" onClick={onAdd} className="rounded-full shadow-lg shadow-violet-500/25 px-8">
          <Plus className="mr-2 h-5 w-5" />
          Add Subject
        </Button>
      </motion.div>
    </div>
  );
}
