import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { Download, Upload, Trash2, Moon, Sun, Laptop } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export function Settings() {
  const { theme, setTheme, subjects, importData, resetData } = useStore();
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify({ subjects }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartattend-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.subjects && Array.isArray(data.subjects)) {
          importData({ subjects: data.subjects });
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetData();
    setIsResetOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-6 w-6" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-6 w-6" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setTheme('system')}
            >
              <Laptop className="h-6 w-6" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Export your attendance data to a JSON file to transfer between devices or keep a backup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Export JSON
            </Button>
            <div className="relative w-full">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full pointer-events-none">
                <Upload className="h-4 w-4 mr-2" /> Import JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Permanently delete all your attendance data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => setIsResetOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Reset All Data
          </Button>
        </CardContent>
      </Card>

      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Are you absolutely sure?">
        <div className="space-y-4">
          <p className="text-slate-500">
            This action cannot be undone. This will permanently delete all your subjects and attendance records from this device.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>Yes, delete everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
