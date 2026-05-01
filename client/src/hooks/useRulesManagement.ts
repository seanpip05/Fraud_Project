import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface SystemRule {
  id: number;
  attackType: string;
  name: string;
  isActive: boolean;
  threshold: number;
  timeWindow: number; // in seconds
  action: 'BLOCK' | 'ALERT' | 'LOG_ONLY';
}

export const useRulesManagement = () => {
  const { token } = useAuth();
  const [rules, setRules] = useState<SystemRule[]>([]);
  const [originalRules, setOriginalRules] = useState<SystemRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRules = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/rules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data);
        setOriginalRules(data);
      } else {
        console.error("Failed to fetch rules");
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const handleToggle = (id: number) => {
    setRules(prevRules =>
        prevRules.map(rule =>
            rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
        )
    );
  };

  const saveChanges = async () => {
    if (!token) return;
    setIsLoading(true);

    // Find rules that have been modified (isActive changed)
    const modifiedRules = rules.filter(rule => {
      const original = originalRules.find(r => r.id === rule.id);
      return original && original.isActive !== rule.isActive;
    });

    try {
      for (const rule of modifiedRules) {
        await fetch(`http://localhost:8080/api/rules/${rule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(rule)
        });
      }
      alert('Changes saved successfully to the system!');
      fetchRules(); // Refresh
    } catch (error) {
      console.error("Error saving rules:", error);
      alert('Failed to save changes.');
    } finally {
      setIsLoading(false);
    }
  };

  const createRule = async (newRule: Omit<SystemRule, 'id'>) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRule)
      });
      if (response.ok) {
        fetchRules();
      } else {
        const err = await response.json();
        alert(`Failed to create rule: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating rule:", error);
      alert('Network error while creating rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRule = async (id: number, updatedRule: Omit<SystemRule, 'id'>) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedRule)
      });
      if (response.ok) {
        fetchRules();
      } else {
        const err = await response.json();
        alert(`Failed to update rule: ${err.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating rule:", error);
      alert('Network error while updating rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async (id: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchRules();
      } else {
        alert("Failed to delete rule.");
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      alert('Network error while deleting rule.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compare simple array diff for isActive to enable/disable save button
  const hasChanges = JSON.stringify(rules.map(r => r.isActive)) !==
      JSON.stringify(originalRules.map(r => r.isActive));

  return {
    rules,
    isLoading,
    hasChanges,
    handleToggle,
    saveChanges,
    createRule,
    updateRule,
    deleteRule
  };
};