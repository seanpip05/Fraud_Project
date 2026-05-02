import { useState, useEffect, useCallback } from 'react';

// טיפוס לוג התקפה כפי שמגיע מה-API של שרת הקורבן
export interface AttackLogEntry {
  id: number;
  clientIp: string;
  method: string;
  endpoint: string;
  payload: string;
  timestamp: string;
  responseStatus: number;
  riskScore: number;
}

// סשן התקפה מקובץ — מייצג "מתקפה שלמה" (סצנריו שהורץ)
export interface AttackSession {
  sessionId: string;
  clientIp: string;
  endpoint: string;
  startTime: string;
  endTime: string;
  totalRequests: number;
  blockedRequests: number;
  blockedRate: number;
  maxRiskScore: number;
  statusBreakdown: { [key: number]: number }; // e.g. { 200: 5, 429: 1, 403: 14 }
  logs: AttackLogEntry[];
}

const VICTIM_API = 'http://localhost:8081/api/analytics';

/**
 * קיבוץ לוגים ל"סשנים" (מתקפות).
 * כל קבוצת לוגים מאותו IP + endpoint שהפרש הזמן ביניהם קטן מ-60 שניות
 * נחשבת כמתקפה אחת שלמה.
 */
function groupLogsIntoSessions(logs: AttackLogEntry[]): AttackSession[] {
  if (logs.length === 0) return [];

  // מיון לפי זמן (מהישן לחדש) כדי לקבץ נכון
  const sorted = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const sessions: AttackSession[] = [];
  let currentGroup: AttackLogEntry[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const timeDiff = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
    const sameIp = curr.clientIp === prev.clientIp;
    const sameEndpoint = curr.endpoint === prev.endpoint;

    // אם עברו יותר מ-60 שניות בין בקשות, או שונה IP/endpoint — סשן חדש
    if (!sameIp || !sameEndpoint || timeDiff > 60_000) {
      sessions.push(buildSession(currentGroup, sessions.length));
      currentGroup = [curr];
    } else {
      currentGroup.push(curr);
    }
  }

  // סשן אחרון
  if (currentGroup.length > 0) {
    sessions.push(buildSession(currentGroup, sessions.length));
  }

  // מיון — הסשן החדש ביותר קודם
  return sessions.reverse();
}

function buildSession(logs: AttackLogEntry[], index: number): AttackSession {
  const blocked = logs.filter(l => l.responseStatus >= 400);
  const statusBreakdown: { [key: number]: number } = {};
  logs.forEach(l => {
    statusBreakdown[l.responseStatus] = (statusBreakdown[l.responseStatus] || 0) + 1;
  });

  return {
    sessionId: `ATK-${String(index + 1).padStart(4, '0')}`,
    clientIp: logs[0].clientIp,
    endpoint: logs[0].endpoint,
    startTime: logs[0].timestamp,
    endTime: logs[logs.length - 1].timestamp,
    totalRequests: logs.length,
    blockedRequests: blocked.length,
    blockedRate: logs.length > 0 ? (blocked.length / logs.length) * 100 : 0,
    maxRiskScore: Math.max(...logs.map(l => l.riskScore)),
    statusBreakdown,
    logs: [...logs].reverse(), // חדש קודם בתצוגה הפנימית
  };
}

export const useReportsHistory = () => {
  const [allLogs, setAllLogs] = useState<AttackLogEntry[]>([]);
  const [sessions, setSessions] = useState<AttackSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AttackSession[]>([]);
  const [filters, setFilters] = useState({ ip: '', dateFrom: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);

  // טעינת לוגים מה-API של שרת הקורבן
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${VICTIM_API}/logs`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data: AttackLogEntry[] = await response.json();
      setAllLogs(data);
      const grouped = groupLogsIntoSessions(data);
      setSessions(grouped);
      setFilteredSessions(grouped);
    } catch (err) {
      console.error('Failed to fetch attack logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // פילטרים בצד הלקוח
  const applyFilters = () => {
    let result = [...sessions];

    if (filters.ip) {
      result = result.filter(s => s.clientIp.includes(filters.ip));
    }

    if (filters.dateFrom) {
      result = result.filter(s => s.startTime >= filters.dateFrom);
    }

    if (filters.status) {
      const statusCode = parseInt(filters.status);
      if (!isNaN(statusCode)) {
        result = result.filter(s => s.statusBreakdown[statusCode] !== undefined);
      }
    }

    setFilteredSessions(result);
  };

  // ייצוא סשן שלם ל-CSV
  const exportSession = (sessionId: string) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) return;
    downloadCsv(session.logs, `${sessionId}_attack_report.csv`);
  };

  // ייצוא כל הסשנים המסוננים ל-CSV
  const exportAllLogs = () => {
    const allFilteredLogs = filteredSessions.flatMap(s => s.logs);
    downloadCsv(allFilteredLogs, `full_attack_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return {
    sessions: filteredSessions,
    totalLogs: allLogs.length,
    filters,
    isLoading,
    setFilters,
    applyFilters,
    exportSession,
    exportAllLogs,
    refreshLogs: fetchLogs,
  };
};

// פונקציית עזר לייצור והורדת קובץ CSV
function downloadCsv(data: AttackLogEntry[], filename: string) {
  const headers = ['ID', 'Client IP', 'Method', 'Endpoint', 'Payload', 'Timestamp', 'Response Status', 'Risk Score'];
  const rows = data.map(log => [
    log.id,
    log.clientIp,
    log.method,
    log.endpoint,
    `"${(log.payload || '').replace(/"/g, '""')}"`,
    log.timestamp,
    log.responseStatus,
    log.riskScore,
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}