# 📊 SmartAttend — Attendance Management & Calculator System

SmartAttend is a modern, premium web application built to help students efficiently track, manage, and calculate their academic attendance. With real-time status badges, a "What-If" simulator, and automated suggestions, the app takes the guesswork out of bunking classes and maintaining attendance criteria.

---

## 🌟 Core Features

- **📊 Comprehensive Dashboard**: Get an overview of your overall attendance percentage, cumulative standing, and active subjects with beautiful progress indicators.
- **⚡ Quick Actions**: Mark yourself **Present** or **Absent** in a single click directly from the dashboard.
- **🧠 Smart Analytics & Calculations**:
  - **Safe Bunks**: Calculates exactly how many consecutive classes you can safely skip (bunk) without falling below your minimum target attendance.
  - **Classes Needed**: If your attendance drops, the app calculates how many consecutive classes you must attend to recover and reach your target.
- **🔮 "What-If" Simulator**: Input mock values to preview what your attendance and status will look like if you attend or miss a specified number of upcoming classes.
- **💾 Local Persistence**: State is managed via **Zustand** with persistent storage, ensuring your attendance data remains intact even after closing the browser or refreshing the page.
- **🌓 Dark Mode & Theme Support**: Supports system theme matching as well as manually toggled light and dark modes.
- **📱 Fully Responsive**: A seamless mobile-first user experience tailored for phones, tablets, and desktops.

---

## 🛠️ Technology Stack

- **Core**: React 18, Vite (for blazing fast build times)
- **Language**: JavaScript / TypeScript
- **State Management**: Zustand (with Persist Middleware)
- **Styling**: Tailwind CSS & PostCSS
- **Navigation**: React Router DOM (v6)

---

## 📐 Mathematical Formulas Used

SmartAttend automatically handles attendance projection using these algorithms:

### 1. Attendance Percentage
$$\text{Percentage} = \left( \frac{\text{Attended Classes}}{\text{Total Classes}} \right) \times 100$$

### 2. Safe Bunks Calculation
Calculates the maximum number of classes you can skip without dropping below the target threshold ($M$):
$$\text{Safe Bunks} = \lfloor \frac{\text{Attended Classes}}{\text{Target Ratio}} \rfloor - \text{Total Classes}$$
*(Where $\text{Target Ratio} = \frac{\text{Minimum Required Percentage}}{100}$)*

### 3. Classes Needed Calculation
Calculates the consecutive number of classes you must attend to raise your attendance back to the target ($M$):
$$\text{Classes Needed} = \lceil \frac{(\text{Target Ratio} \times \text{Total Classes}) - \text{Attended Classes}}{1 - \text{Target Ratio}} \rceil$$
