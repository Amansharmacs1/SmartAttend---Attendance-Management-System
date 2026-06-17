import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input, Label } from './ui/Input';
import { Button } from './ui/Button';
import { useStore } from '../store/useStore';

const COLORS = ['#aa3bff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export function AddSubjectModal({ isOpen, onClose }) {
  const addSubject = useStore((state) => state.addSubject);
  const [name, setName] = useState('');
  const [minAttendance, setMinAttendance] = useState('75');
  const [attendedClasses, setAttendedClasses] = useState('0');
  const [totalClasses, setTotalClasses] = useState('0');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    addSubject({
      name: name.trim(),
      minAttendance: Number(minAttendance),
      attendedClasses: Number(attendedClasses) || 0,
      totalClasses: Number(totalClasses) || 0,
      color,
    });
    
    setName('');
    setMinAttendance('75');
    setAttendedClasses('0');
    setTotalClasses('0');
    setColor(COLORS[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Subject">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAttendance">Target (%)</Label>
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
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COLORS.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="attendedClasses">Classes Attended</Label>
            <Input
              id="attendedClasses"
              type="number"
              min="0"
              value={attendedClasses}
              onChange={(e) => setAttendedClasses(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalClasses">Total Classes</Label>
            <Input
              id="totalClasses"
              type="number"
              min="0"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>More Colors</Label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLORS.slice(4).map((c) => (
              <button
                key={c}
                type="button"
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent hover:scale-105'}`}
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
