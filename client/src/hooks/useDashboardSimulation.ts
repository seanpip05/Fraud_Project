// src/hooks/useDashboardSimulation.ts

import { useState, useEffect } from 'react';

// הגדרת הטיפוסים הראשיים (כפי שדנו קודם)
export interface GraphDataPoint {
  time: string;
  requests: number;
  blocked: number;
}

const initialData: GraphDataPoint[] = [
  { time: '10:00:00', requests: 5, blocked: 0 },
  { time: '10:00:02', requests: 12, blocked: 0 },
  { time: '10:00:04', requests: 8, blocked: 0 },
  // ... נתונים נוספים לצורך איתחול
];

// זהו ה-Hook המותאם אישית שמחזיר את כל הנתונים והפונקציות
export const useDashboardSimulation = () => {
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [data, setData] = useState<GraphDataPoint[]>(initialData);

  // לולאת הסימולציה: מייצרת נתונים מזויפים כל 2 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newEntry: GraphDataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          requests: Math.floor(Math.random() * 100),
          // לוגיקת החסימה: יש חסימות רק כשהמגן דולק
          blocked: isProtected ? Math.floor(Math.random() * 90) : 0 
        };
        const newData = [...prevData, newEntry];
        if (newData.length > 10) newData.shift(); // שומרים על גרף קריא
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isProtected]); // תלוי בסטטוס המגן

  return { 
    data,              // הנתונים לגרף
    isProtected,       // סטטוס ההגנה הנוכחי
    setIsProtected     // הפונקציה לעדכון סטטוס ההגנה
  };
};