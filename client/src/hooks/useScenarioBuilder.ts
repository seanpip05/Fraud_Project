import { useState } from 'react';

// הגדרת סוגי ההתקפה המורחבת (5 סוגים)
export const ATTACK_TYPES = {
  'Brute Force': {
    description: 'Testing protection against credential guessing (e.g., trying 1000 passwords).',
    fields: [
      { id: 'rps', label: 'Requests per Second (RPS)', type: 'number', helper: 'Max simultaneous login attempts per second.' },
      { id: 'attempts', label: 'Total Attempts', type: 'number', helper: 'Total number of login attempts to perform.' },
    ],
  },
  'SQL Injection': {
    description: 'Testing defenses against malicious database queries (e.g., using OR 1=1 --).',
    fields: [
      { id: 'payload', label: 'SQL Payload', type: 'text', helper: 'The specific malicious query string to inject.' },
      { id: 'entryPoint', label: 'Target Field', type: 'text', helper: 'The form field name to inject into.' },
    ],
  },
  'Tampering': {
    description: 'Testing unauthorized modification of data parameters (e.g., changing price).',
    fields: [
        { id: 'endpoint', label: 'Target API Endpoint', type: 'text', helper: 'E.g., /api/checkout/purchase' },
        { id: 'paramKey', label: 'Parameter Key to Tamper', type: 'text', helper: 'E.g., "price"' },
        { id: 'newValue', label: 'New Value', type: 'text', helper: 'The value to inject (e.g., "0.01")' },
    ],
  },
  'XSS': {
    description: 'Testing input validation against Cross-Site Scripting (e.g., injecting <script> tags).',
    fields: [
        { id: 'payload', label: 'XSS Payload (JS)', type: 'text', helper: 'The script to inject into a comment/profile field.' },
        { id: 'context', label: 'Context Type', type: 'text', helper: 'Where the payload will be injected (e.g., Comment field).' },
    ],
  },
  'Logic Flaw': {
    description: 'Testing business logic weaknesses (e.g., redeeming a coupon multiple times).',
    fields: [
        { id: 'endpoint', label: 'Target Function Endpoint', type: 'text', helper: 'E.g., /api/redeem-coupon' },
        { id: 'rate', label: 'Requests per Second', type: 'number', helper: 'How fast to hit the endpoint.' },
    ],
  },
} as const;

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
    setFormParams({}); 
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name.');
      return;
    }
    setIsSaving(true);
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