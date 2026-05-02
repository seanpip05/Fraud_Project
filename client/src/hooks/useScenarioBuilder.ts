import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { SOC_API_BASE } from '../config';
// יצירת מערך עוגנים (Marks) למחוון ה-RPS כדי לחייב קפיצות של 1, 5, 10...
const rpsMarks: { value: number; label?: string }[] = [{ value: 1, label: '1' }];

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
  const { showSuccess, showError, showWarning } = useSnackbar();
  const navigate = useNavigate();
  const [selectedAttackType, setSelectedAttackType] = useState<AttackTypeKey>('Brute Force');
  const [scenarioName, setScenarioName] = useState('');
  const [formParams, setFormParams] = useState<{ [key: string]: any }>({ rps: 10, duration: 30, payload: "user=admin&pass={{RANDOM}}" });
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch scenarios from backend
  const fetchScenarios = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${SOC_API_BASE}/scenarios`, {
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
      showWarning('Please enter a scenario name.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId
          ? `${SOC_API_BASE}/scenarios/${editingId}`
          : `${SOC_API_BASE}/scenarios`;

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
        showSuccess(`Scenario ${editingId ? 'updated' : 'saved'} successfully!`);
      } else {
        const err = await response.json();
        showError(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
      showError('Network error while saving scenario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunScenario = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${SOC_API_BASE}/simulations/run/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showSuccess('⚔️ Simulation started! Redirecting to Dashboard...');
        fetchScenarios();
        // ניווט אוטומטי לדשבורד כדי לראות את התקפה בזמן אמת
        setTimeout(() => navigate('/'), 800);
      } else {
        const err = await response.json();
        showError(`Failed to start: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error running scenario:", error);
      showError('Network error while starting simulation.');
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
    if (!token) return;
    try {
      const response = await fetch(`${SOC_API_BASE}/scenarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchScenarios();
      } else {
        showError('Failed to delete scenario.');
      }
    } catch (e) {
      console.error(e);
      showError('Network error during deletion.');
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