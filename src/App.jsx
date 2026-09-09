import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SubjectDetails } from './pages/SubjectDetails';
import { Settings } from './pages/Settings';
import { Calendar } from './pages/Calendar';
import { Timetable } from './pages/Timetable';
import { Calculator } from './pages/Calculator';
import { useStore } from './store/useStore';
import { setupNotificationRecalculation } from './utils/notifications';

export default function App() {
  // Initialize notification recalculation
  useEffect(() => {
    setupNotificationRecalculation(useStore);
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subject/:id" element={<SubjectDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
