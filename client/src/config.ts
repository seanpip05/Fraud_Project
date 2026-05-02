/**
 * מרכז הגדרות ה-API של המערכת.
 * בשימוש ב-Docker, ה-Frontend ניגש ל-localhost (המחשב המארח)
 * כי הקוד רץ בדפדפן של המשתמש.
 */

// כתובת שרת הניהול (SOC Backend)
export const SOC_API_BASE = "http://localhost:8080/api";

// כתובת שרת הקורבן (Victim Server)
export const VICTIM_API_BASE = "http://localhost:8081/api";

// עזרים לנתיבים ספציפיים
export const ENDPOINTS = {
    LOGIN: `${SOC_API_BASE}/auth/login`,
    RULES: `${SOC_API_BASE}/rules`,
    SCENARIOS: `${SOC_API_BASE}/scenarios`,
    SIMULATIONS: `${SOC_API_BASE}/simulations`,
    VICTIM_ANALYTICS: `${VICTIM_API_BASE}/analytics`,
    VICTIM_TARGET: `${VICTIM_API_BASE}/target`
};
