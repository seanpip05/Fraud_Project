import { useState, useEffect } from 'react';

// טיפוסים לדוח סימולציה
export interface SimulationReport {
  id: number;
  scenarioName: string;
  attackType: string;
  runDate: string;
  duration: string;
  status: 'Completed' | 'Failed' | 'Canceled';
  riskScore: number; // 0 (Good Defense) to 100 (Critical Vulnerability)
  blockedRate: number; // Percentage of requests blocked
}

// נתונים מזויפים
const MOCK_REPORTS: SimulationReport[] = [
  {
    id: 101,
    scenarioName: 'Aggressive Login Test',
    attackType: 'Brute Force',
    runDate: '2025-11-28 14:30:00',
    duration: '2 min 15 sec',
    status: 'Completed',
    riskScore: 25, 
    blockedRate: 98.2,
  },
  {
    id: 102,
    scenarioName: 'SQL Bypass Attempt 1',
    attackType: 'SQL Injection',
    runDate: '2025-11-28 15:05:45',
    duration: '0 min 30 sec',
    status: 'Completed',
    riskScore: 95, 
    blockedRate: 1.5,
  },
  {
    id: 103,
    scenarioName: 'Slow Brute Force (Stealth)',
    attackType: 'Brute Force',
    runDate: '2025-11-29 09:10:10',
    duration: '5 min 00 sec',
    status: 'Completed',
    riskScore: 55, 
    blockedRate: 50.0,
  },
];

export const useReportsHistory = () => {
  const [reports, setReports] = useState<SimulationReport[]>(MOCK_REPORTS);
  const [filters, setFilters] = useState({ name: '', dateFrom: '' });
  const [isLoading, setIsLoading] = useState(false);

  // פונקציה דמה לטעינת נתונים (תתחבר ל-API)
  useEffect(() => {
    // בעתיד: קריאת API GET /api/reports
    // setIsLoading(true);
    // setTimeout(() => { setReports(MOCK_REPORTS); setIsLoading(false); }, 500);
  }, []);

  // פונקציה לטיפול בפילטרים (כרגע רק בצד הלקוח)
  const applyFilters = () => {
    setIsLoading(true);
    let filtered = MOCK_REPORTS.filter(report => {
      const nameMatch = filters.name === '' || report.scenarioName.toLowerCase().includes(filters.name.toLowerCase());
      // פילטר תאריך מורכב יותר, נתעלם ממנו כרגע ב-Mock
      return nameMatch;
    });
    setReports(filtered);
    setIsLoading(false);
  };
  
  // פונקציה דמה להצגת לוגים
  const handleViewLogs = (id: number, name: string) => {
    alert(`Viewing detailed logs for Simulation #${id}: ${name}`);
    // בעתיד: navigate('/logs/' + id);
  };

  return { 
    reports, 
    filters,
    isLoading,
    setFilters,
    applyFilters,
    handleViewLogs 
  };
};