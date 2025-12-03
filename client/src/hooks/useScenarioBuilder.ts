import { useState } from 'react';

// הגדרת סוגי ההתקפה (יהיה שימושי גם ב-Backend)
export const ATTACK_TYPES = {
  'Brute Force': {
    description: 'Testing protection against credential guessing.',
    fields: [
      { id: 'rps', label: 'Requests per Second (RPS)', type: 'number', helper: 'Max simultaneous login attempts per second.' },
      { id: 'attempts', label: 'Total Attempts', type: 'number', helper: 'Total number of login attempts to perform.' },
    ],
  },
  'SQL Injection': {
    description: 'Testing defenses against malicious database queries.',
    fields: [
      { id: 'payload', label: 'SQL Payload', type: 'text', helper: 'The specific malicious query string to inject.' },
      { id: 'entryPoint', label: 'Target Field', type: 'text', helper: 'The form field name to inject into.' },
    ],
  },
} as const; // הגדרת האובייקט כקבוע כדי ש-TS ידע את הערכים

export type AttackTypeKey = keyof typeof ATTACK_TYPES;

export interface AttackScenario {
  id: number;
  name: string;
  type: AttackTypeKey;
  params: { [key: string]: any };
  createdBy: string;
  lastRun: string;
}

const MOCK_SCENARIOS: AttackScenario[] = [
  { 
    id: 1, 
    name: 'Aggressive Login Test', 
    type: 'Brute Force', 
    params: { rps: 20, attempts: 1000 }, 
    createdBy: 'Admin', 
    lastRun: '2025-11-28' 
  },
  { 
    id: 2, 
    name: 'Basic SQL Blind', 
    type: 'SQL Injection', 
    params: { payload: "' OR 1=1 --" }, 
    createdBy: 'Operator', 
    lastRun: 'N/A' 
  },
];


export const useScenarioBuilder = () => {
  const [selectedAttackType, setSelectedAttackType] = useState<AttackTypeKey>('Brute Force');
  const [scenarioName, setScenarioName] = useState('');
  const [formParams, setFormParams] = useState<{ [key: string]: any }>({});
  const [scenarios, setScenarios] = useState<AttackScenario[]>(MOCK_SCENARIOS);
  const [isSaving, setIsSaving] = useState(false);

  const handleTabChange = (newValue: AttackTypeKey) => {
    setSelectedAttackType(newValue);
    setFormParams({}); // איפוס פרמטרים
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name.');
      return;
    }
    setIsSaving(true);
    // סימולציית שמירה ל-Backend (יקרה קריאת API POST)
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const newScenario: AttackScenario = {
        id: Date.now(),
        name: scenarioName.trim(),
        type: selectedAttackType,
        params: formParams,
        createdBy: 'Admin',
        lastRun: 'N/A'
    };
    setScenarios([...scenarios, newScenario]);
    setScenarioName('');
    setFormParams({});
    setIsSaving(false);
    alert(`Scenario "${newScenario.name}" saved successfully!`);
  };

  return { 
    scenarios,
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSaveScenario
  };
};