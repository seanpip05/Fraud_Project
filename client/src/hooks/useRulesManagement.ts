import { useState } from 'react';

// טיפוסים זהים ל-UI (כוחו של TypeScript)
export interface SystemRule {
  id: number;
  attackType: 'Brute Force' | 'SQL Injection' | 'Tampering';
  name: string;
  isActive: boolean;
  threshold: number;
  timeWindow: number; // in seconds
  action: 'BLOCK' | 'ALERT' | 'LOG_ONLY';
}

// נתונים מזויפים (Mock Data) - מעכשיו המקור היחיד לנתונים
const MOCK_INITIAL_RULES: SystemRule[] = [
  { 
    id: 1, 
    attackType: 'Brute Force', 
    name: 'Rate Limit: 5 attempts/min', 
    isActive: true, 
    threshold: 5, 
    timeWindow: 60, 
    action: 'BLOCK' 
  },
  { 
    id: 2, 
    attackType: 'Brute Force', 
    name: 'Weak Password Blacklist', 
    isActive: true, 
    threshold: 0, 
    timeWindow: 0, 
    action: 'BLOCK' 
  },
  { 
    id: 3, 
    attackType: 'SQL Injection', 
    name: 'Dangerous Character Filter', 
    isActive: false, 
    threshold: 1, 
    timeWindow: 0, 
    action: 'ALERT' 
  },
];

export const useRulesManagement = () => {
  const [rules, setRules] = useState<SystemRule[]>(MOCK_INITIAL_RULES);
  const [isLoading, setIsLoading] = useState(false);

  // פונקציה לעדכון מצב החוק (ON/OFF)
  const handleToggle = (id: number) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };
  
  // פונקציה לשמירה אמיתית (תתחבר ל-API)
  const saveChanges = async () => {
    setIsLoading(true);
    // לוגיקה אמיתית: קריאת API PUT/POST
    console.log("Saving rules to backend:", rules.map(r => ({ id: r.id, isActive: r.isActive })));
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // סימולציית זמן שמירה
    setIsLoading(false);
    alert('Changes saved successfully to the system!');
  };
  
  // בדיקה אם המערך הנוכחי שונה מהמערך המקורי שנטען
  const hasChanges = JSON.stringify(rules.map(r => ({ id: r.id, isActive: r.isActive }))) !== 
                     JSON.stringify(MOCK_INITIAL_RULES.map(r => ({ id: r.id, isActive: r.isActive })));

  return { 
    rules, 
    isLoading,
    hasChanges,
    handleToggle, 
    saveChanges 
  };
};