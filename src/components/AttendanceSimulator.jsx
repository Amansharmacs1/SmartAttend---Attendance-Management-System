import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input, Label } from './ui/Input';
import { calculatePercentage, getStatusText } from '../utils/calculations';
import { Badge } from './ui/Badge';

export function AttendanceSimulator({ subject }) {
  const [attendNext, setAttendNext] = useState('');
  const [missNext, setMissNext] = useState('');

  const attendCount = Number(attendNext) || 0;
  const missCount = Number(missNext) || 0;

  const futureAttended = subject.attendedClasses + attendCount;
  const futureTotal = subject.totalClasses + attendCount + missCount;

  const futurePercentage = calculatePercentage(futureAttended, futureTotal);
  const status = getStatusText(futurePercentage, subject.minAttendance);

  const statusColor = 
    status === 'SAFE' ? 'success' :
    status === 'WARNING' ? 'warning' :
    'destructive';

  return (
    <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-inner">
      <CardHeader>
        <CardTitle className="text-lg">What If Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-emerald-600 dark:text-emerald-400">Attend Next</Label>
            <Input 
              type="number" 
              min="0"
              value={attendNext} 
              onChange={(e) => setAttendNext(e.target.value)} 
              placeholder="0 classes"
              className="border-emerald-200 focus-visible:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-red-600 dark:text-red-400">Miss Next</Label>
            <Input 
              type="number" 
              min="0"
              value={missNext} 
              onChange={(e) => setMissNext(e.target.value)} 
              placeholder="0 classes"
              className="border-red-200 focus-visible:ring-red-500"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-950 p-4 border flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 font-medium">Future Attendance</div>
            <div className="text-3xl font-black mt-1">{futureTotal === 0 ? '--' : `${futurePercentage}%`}</div>
          </div>
          <div className="text-right">
            <Badge variant={statusColor} className="mb-2">{status}</Badge>
            <div className="text-xs text-slate-400 font-medium">{futureAttended} / {futureTotal} Classes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
