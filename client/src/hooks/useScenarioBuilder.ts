import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// הגדרת סוגי ההתקפה המורחבת (5 סוגים)
export const ATTACK_TYPES = {
  'Brute Force': {
    description: 'Testing protection against credential guessing (e.g., trying 1000 passwords).',
    fields: [
      { id: 'rps', label: 'Requests per Second (RPS)', type: 'number', helper: 'Max simultaneous login attempts per second.' },
      { id: 'duration', label: 'Duration (Seconds)', type: 'number', helper: 'How long the attack should run.' },
      { id: 'payload', label: 'Payload', type: 'text', helper: 'Base payload for login, e.g., user=admin.' },
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
  type: string; // The backend returns string, we might need mapping
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
      // Check if updating or creating
      const url = editingId ? `http://localhost:8080/api/scenarios/${editingId}` : 'http://localhost:8080/api/scenarios';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        alert(editingId ? `Scenario updated successfully!` : `Scenario saved successfully!`);
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

  const handleEditScenario = (scenario: AttackScenario) => {
    setEditingId(scenario.id);
    setScenarioName(scenario.name);

    // Reverse map from backend type to UI key
    const typeKey = (Object.keys(ATTACK_TYPES) as AttackTypeKey[]).find(
        key => mapToBackendType(key) === scenario.type
    );
    if (typeKey) {
      setSelectedAttackType(typeKey);
    }

    setFormParams(scenario.params || {});

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteScenario = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this scenario?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/scenarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Scenario deleted successfully!");
        fetchScenarios();
      } else {
        alert("Failed to delete scenario.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Network error while deleting scenario.");
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
    handleDeleteScenario
  };
};