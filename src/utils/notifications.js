export function isNotificationSupported() {
  return 'Notification' in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  const permission = await Notification.requestPermission();
  return permission;
}

export function getNotificationStatus() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

const scheduledTimers = new Map(); // id -> timeoutId

export function scheduleNotifications(schedule, subjects) {
  if (getNotificationStatus() !== 'granted') return;

  // Clear existing timers
  for (const timeoutId of scheduledTimers.values()) {
    clearTimeout(timeoutId);
  }
  scheduledTimers.clear();

  const now = new Date();
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = DAYS_OF_WEEK[now.getDay()];

  const todayClasses = schedule[todayDayName] || [];

  todayClasses.forEach(item => {
    if (!item.enabled || !item.notificationsEnabled) return;
    
    // Parse start time (e.g. "09:00" or "14:30")
    if (!item.startTime) return;
    const [hours, minutes] = item.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const classTime = new Date();
    classTime.setHours(hours, minutes, 0, 0);

    const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000); // 15 mins before
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    // Only schedule if reminder time is in the future and today
    if (timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000) {
      const subject = subjects.find(s => s.id === item.subjectId);
      const subjectName = subject ? subject.name : item.subjectName;

      const timeoutId = setTimeout(() => {
        showNotification(
          'Upcoming Class',
          `Your ${subjectName} class starts in 15 minutes.${item.room ? ` Room: ${item.room}` : ''}`
        );
      }, timeUntilReminder);

      scheduledTimers.set(item.id, timeoutId);
    }
  });
}

function showNotification(title, body) {
  if (getNotificationStatus() === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg'
    });
  }
}

export function setupNotificationRecalculation(store) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const state = store.getState();
      scheduleNotifications(state.schedule, state.subjects);
    }
  });

  let lastDay = new Date().getDay();
  setInterval(() => {
    const currentDay = new Date().getDay();
    if (currentDay !== lastDay) {
      lastDay = currentDay;
      const state = store.getState();
      scheduleNotifications(state.schedule, state.subjects);
    }
  }, 60 * 60 * 1000);
}
