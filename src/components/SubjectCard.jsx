import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { calculatePercentage, getStatusText, getEmoji } from '../utils/calculations';
import { Check, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function SubjectCard({ subject }) {
  const { markPresent, markAbsent } = useStore();
  const percentage = calculatePercentage(subject.attendedClasses, subject.totalClasses);
  const status = getStatusText(percentage, subject.minAttendance);
  const emoji = getEmoji(percentage);

  const statusColor = 
    status === 'SAFE' ? 'text-emerald-500 bg-emerald-500/10' :
    status === 'WARNING' ? 'text-amber-500 bg-amber-500/10' :
    'text-red-500 bg-red-500/10';

  const progressColor = 
    status === 'SAFE' ? 'bg-emerald-500' :
    status === 'WARNING' ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <Card className="relative overflow-hidden group hover:shadow-2xl hover:border-white/40 transition-all duration-300">
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: subject.color || '#aa3bff' }}
      />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold truncate pr-4">
            {subject.name}
          </CardTitle>
          <div className="text-2xl">{emoji}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className={statusColor}>
            {status}
          </Badge>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Target: {subject.minAttendance}%
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight">
                {percentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {subject.attendedClasses} / {subject.totalClasses} Classes
              </span>
            </div>
            <Link to={`/subject/${subject.id}`}>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <Progress value={percentage} indicatorColor={progressColor} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              variant="success" 
              className="w-full flex items-center justify-center gap-2 rounded-xl py-6"
              onClick={() => markPresent(subject.id)}
            >
              <Check className="h-5 w-5" /> Present
            </Button>
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-2 rounded-xl py-6"
              onClick={() => markAbsent(subject.id)}
            >
              <X className="h-5 w-5" /> Absent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
