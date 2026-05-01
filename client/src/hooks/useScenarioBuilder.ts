import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// יצירת מערך עוגנים (Marks) למחוון ה-RPS כדי לחייב קפיצות של 1, 5, 10...
const rpsMarks = [{ value: 1, label: '1' }];
for (let i = 5; i <= 100; i += 5) {
  rpsMarks.push({ value: i, label: i % 20 === 0 ? i.toString() : undefined });
}

// הגדרת סוגי ההתקפה המורחבת (5 סוגים)
export const ATTACK_TYPES = {
  'Brute Force': {
    description: 'Testing protection against credential guessing (e.g., trying 1000 passwords).',
    fields: [
      { id: 'rps', label: 'Requests per Second (RPS)', type: 'slider', min: 1, max: 100, step: null, marks: rpsMarks, helper: 'Max simultaneous login attempts per second.' },
      { id: 'duration', label: 'Duration (Seconds)', type: 'slider', min: 5, max: 120, step: 5, helper: 'How long the attack should run.' },
      { id: 'payload', label: 'Payload', type: 'text', helper: 'Use {{RANDOM}} to inject dynamic random numbers (e.g., user=admin&pass={{RANDOM}})' },
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

// הוספת מיפוי למפתחות ה-Enum ב-Java Backend
const mapToBackendType = (type: AttackTypeKey): string => {
  const mapping: Record<AttackTypeKey, string> = {
    'Brute Force': 'BRUTE_FORCE',
    'SQL Injection': 'SQL_INJECTION',
    'Tampering': 'TAMPERING',
    'XSS': 'XSS',
    'Logic Flaw': 'LOGIC_FLAW'
  };
  return mapping[type];
};

export interface AttackScenario {
  id: number;
  name: string;
  type?: string;
  attackType?: { name: string; severity?: string };
  params: { [key: string]: any };
  createdBy: any;
  lastRun: string;
}

export const useScenarioBuilder = () => {
  const { token } = useAuth();
  const [selectedAttackType, setSelectedAttackType] = useState<AttackTypeKey>('Brute Force');
  const [scenarioName, setScenarioName] = useState('');
  const [formParams, setFormParams] = useState<{ [key: string]: any }>({ rps: 10, duration: 30, payload: "user=admin" });
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch scenarios from backend
  const fetchScenarios = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/scenarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("FETCHED SCENARIOS DATA:", data);
        setScenarios(data);
      } else {
        console.error("Failed to fetch scenarios");
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [token]);

  const handleTabChange = (newValue: AttackTypeKey) => {
    setSelectedAttackType(newValue);
    setFormParams({});
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim() || !token) {
      alert('Please enter a scenario name.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId
          ? `http://localhost:8080/api/scenarios/${editingId}`
          : 'http://localhost:8080/api/scenarios';

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: scenarioName.trim(),
          type: mapToBackendType(selectedAttackType),
          params: formParams
        })
      });

      if (response.ok) {
        setScenarioName('');
        setFormParams({});
        setEditingId(null);
        fetchScenarios(); // Refresh list
        alert(`Scenario ${editingId ? 'updated' : 'saved'} successfully!`);
      } else {
        const err = await response.json();
        alert(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Network error while saving scenario.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunScenario = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8080/api/simulations/run/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Simulation started successfully!");
        fetchScenarios(); // Refresh to update lastRun field
      } else {
        const err = await response.json();
        alert(`Failed to start: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error running scenario:", error);
      alert("Network error while starting simulation.");
    }
  };

  const handleEditScenario = (scenario: AttackScenario) => {
    setEditingId(scenario.id);
    setScenarioName(scenario.name);

    // איתור סוג התקיפה מתוך מאגר המידע
    const typeName = scenario.attackType?.name || scenario.type;
    const typeKey = (Object.keys(ATTACK_TYPES) as AttackTypeKey[]).find(
        key => mapToBackendType(key) === typeName
    );

    setSelectedAttackType(typeKey || 'Brute Force');
    setFormParams(scenario.params || {});
  };

  const handleDeleteScenario = async (id: number) => {
    if (!token || !window.confirm("Are you sure you want to delete this scenario?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/scenarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchScenarios();
      } else {
        alert("Failed to delete scenario.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error during deletion.");
    }
  };

  const clearEditMode = () => {
    setEditingId(null);
    setScenarioName('');
    setFormParams({});
    setSelectedAttackType('Brute Force');
  };

  return {
    scenarios,
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    isLoading,
    editingId,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSaveScenario,
    handleRunScenario,
    handleEditScenario,
    handleDeleteScenario,
    clearEditMode
  };
};