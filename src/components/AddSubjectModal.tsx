import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input, Label } from './ui/Input';
import { Button } from './ui/Button';
import { useStore } from '../store/useStore';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#aa3bff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export function AddSubjectModal({ isOpen, onClose }: AddSubjectModalProps) {
  const addSubject = useStore((state) => state.addSubject);
  const [name, setName] = useState('');
  const [minAttendance, setMinAttendance] = useState('75');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addSubject({
      name: name.trim(),
      minAttendance: Number(minAttendance),
      attendedClasses: 0,
      totalClasses: 0,
      color,
    });
    
    setName('');
    setMinAttendance('75');
    setColor(COLORS[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Subject">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            placeholder="e.g. Data Structures"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minAttendance">Target Attendance (%)</Label>
          <Input
            id="minAttendance"
            type="number"
            min="1"
            max="100"
            value={minAttendance}
            onChange={(e) => setMinAttendance(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Card Color</Label>
          <div className="flex flex-wrap gap-2 pt-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-slate-900 dark:border-white' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient">
            Create Subject
          </Button>
        </div>
      </form>
    </Modal>
  );
}
