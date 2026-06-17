import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculatePercentage, calculateSafeBunks, calculateClassesNeeded, getStatusText } from '../utils/calculations';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { AttendanceSimulator } from '../components/AttendanceSimulator';
import { ArrowLeft, Check, X, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects, markPresent, markAbsent, updateSubject, deleteSubject } = useStore();
  const subject = subjects.find(s => s.id === id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMin, setEditMin] = useState('');

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
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

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ backgroundColor: subject.color }}>
          {subject.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-slate-500 font-medium">Target: {subject.minAttendance}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button size="lg" variant="success" onClick={() => markPresent(subject.id)} className="w-full">
                <Check className="w-5 h-5 mr-2" /> Present
              </Button>
              <Button size="lg" variant="destructive" onClick={() => markAbsent(subject.id)} className="w-full">
                <X className="w-5 h-5 mr-2" /> Absent
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className={safeBunks > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200" : "bg-red-50 dark:bg-red-500/10 border-red-200"}>
            <CardContent className="pt-6">
              {safeBunks > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Safe Bunks Available</h3>
                  <p className="text-sm text-emerald-600/80 mb-3">You can afford to miss classes and stay above target.</p>
                  <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{safeBunks} classes</div>
                </div>
              ) : neededClasses > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Classes Needed</h3>
                  <p className="text-sm text-red-600/80 mb-3">Attend consecutive classes to reach your target.</p>
                  <div className="text-4xl font-black text-red-600 dark:text-red-400">{neededClasses} classes</div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-1">On the Edge</h3>
                  <p className="text-sm text-amber-600/80 mb-3">You cannot miss any more classes to stay on target.</p>
                  <div className="text-4xl font-black text-amber-600 dark:text-amber-400">0 classes</div>
                </div>
              )}
            </CardContent>
          </Card>

          <AttendanceSimulator subject={subject} />
        </div>
      </div>

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

    </motion.div>
  );
}
