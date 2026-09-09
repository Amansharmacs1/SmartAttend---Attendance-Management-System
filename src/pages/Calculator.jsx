import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Target, Info } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Calculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');
  const [requiredPercentage, setRequiredPercentage] = useState('75');

  const total = parseInt(totalClasses) || 0;
  const attended = parseInt(attendedClasses) || 0;
  const target = parseFloat(requiredPercentage) || 0;

  // Validation
  const isInvalidAttended = attended > total;
  const isInvalidTarget = target <= 0 || target > 100;
  
  let currentPercentage = 0;
  let classesNeeded = 0;
  let bunkableClasses = 0;

  if (total > 0 && !isInvalidAttended && !isInvalidTarget) {
    currentPercentage = (attended / total) * 100;
    
    // Classes required to attend
    if (currentPercentage < target) {
      if (target === 100) {
        classesNeeded = 'All future classes';
      } else {
        const targetRatio = target / 100;
        // (attended + x) / (total + x) >= targetRatio
        // attended + x >= targetRatio * total + targetRatio * x
        // x - targetRatio * x >= targetRatio * total - attended
        // x (1 - targetRatio) >= targetRatio * total - attended
        // x >= (targetRatio * total - attended) / (1 - targetRatio)
        const req = (targetRatio * total - attended) / (1 - targetRatio);
        classesNeeded = Math.ceil(req);
        if (classesNeeded < 0) classesNeeded = 0;
      }
    }

    // Bunkable classes
    if (currentPercentage >= target) {
      const targetRatio = target / 100;
      // attended / (total + y) >= targetRatio
      // attended >= targetRatio * total + targetRatio * y
      // attended - targetRatio * total >= targetRatio * y
      // y <= (attended - targetRatio * total) / targetRatio
      const max = (attended - targetRatio * total) / targetRatio;
      bunkableClasses = Math.floor(max);
      if (bunkableClasses < 0) bunkableClasses = 0;
    }
  }

  const handleReset = () => {
    setTotalClasses('');
    setAttendedClasses('');
    setRequiredPercentage('75');
  };

  const isBelowTarget = currentPercentage < target;
  const currentPctRounded = Number(currentPercentage.toFixed(2));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <CalcIcon className="w-8 h-8 text-violet-500" />
        <h1 className="text-2xl font-bold">Attendance Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.div 
          className="md:col-span-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6 h-full border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Enter Details</h2>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="totalClasses">Total Classes Conducted</Label>
                <Input
                  id="totalClasses"
                  type="number"
                  min="0"
                  placeholder="e.g. 40"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendedClasses">Classes Attended</Label>
                <Input
                  id="attendedClasses"
                  type="number"
                  min="0"
                  max={total || 0}
                  placeholder="e.g. 30"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(e.target.value)}
                  className={isInvalidAttended ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {isInvalidAttended && (
                  <p className="text-xs text-red-500 mt-1">Attended classes cannot exceed total classes.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredPercentage">Required Percentage (%)</Label>
                <Input
                  id="requiredPercentage"
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 75"
                  value={requiredPercentage}
                  onChange={(e) => setRequiredPercentage(e.target.value)}
                  className={isInvalidTarget ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {isInvalidTarget && (
                  <p className="text-xs text-red-500 mt-1">Target must be between 1 and 100.</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          className="md:col-span-7"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 h-full flex flex-col justify-center border-slate-200 dark:border-slate-800 shadow-md">
            {total === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <Info className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No data yet</h3>
                <p className="text-sm max-w-xs mx-auto">Enter total and attended classes to see your attendance prediction.</p>
              </div>
            ) : isInvalidAttended || isInvalidTarget ? (
              <div className="text-center py-12 flex flex-col items-center text-red-500">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-80" />
                <p>Please fix the validation errors to see results.</p>
              </div>
            ) : (
              <div className="space-y-8 w-full max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Attendance</p>
                  <div className={`text-6xl font-black ${isBelowTarget ? 'text-red-500' : 'text-emerald-500'}`}>
                    {currentPctRounded}%
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white z-10" 
                    style={{ left: `${target}%` }}
                    title={`Target: ${target}%`}
                  />
                  <div 
                    className={`h-full transition-all duration-1000 ${isBelowTarget ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 px-1 font-medium">
                  <span>0%</span>
                  <span className="flex items-center gap-1" style={{ marginLeft: `${target - 50}%` }}><Target className="w-3 h-3" /> Target {target}%</span>
                  <span>100%</span>
                </div>

                <div className={`p-5 rounded-2xl border ${isBelowTarget ? 'bg-red-50/50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20' : 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${isBelowTarget ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                      {isBelowTarget ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      {isBelowTarget ? (
                        <>
                          <h4 className="font-bold text-slate-900 dark:text-white">You are below the target</h4>
                          <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                            You must attend <strong className="text-red-600 dark:text-red-400 font-bold">{classesNeeded}</strong> consecutive future classes to reach {target}%.
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-900 dark:text-white">You are on track!</h4>
                          <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                            You can safely bunk <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{bunkableClasses}</strong> upcoming classes while staying at or above {target}%.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
