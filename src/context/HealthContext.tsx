import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface HealthMetrics {
  date: string;
  sleepHours: string;
  sleepTime?: string;
  mood: string;
  studyHours: string;
  burnoutRisk: string;
  sleepProgress: number;
  moodProgress: number;
  studyProgress: number;
  burnoutProgress: number;
  healthTip?: string;
  status: "Safe" | "At Risk" | "Problem Detected";
  recommendations: string[];
}

interface HealthContextType {
  metrics: HealthMetrics;
  history: HealthMetrics[];
  updateMetrics: (newMetrics: Partial<HealthMetrics>) => void;
  addHistoryRecord: (record: HealthMetrics) => void;
}

const defaultMetrics: HealthMetrics = {
  date: new Date().toISOString(),
  sleepHours: "7.5h",
  sleepTime: "Good",
  mood: "Positive",
  studyHours: "4.2h",
  burnoutRisk: "Low",
  sleepProgress: 75,
  moodProgress: 85,
  studyProgress: 60,
  burnoutProgress: 15,
  healthTip: "Stay hydrated and take short breaks every 45 minutes of study to maintain focus.",
  status: "Safe",
  recommendations: ["Maintain current sleep schedule", "Keep studying with regular breaks"]
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetrics>(defaultMetrics);
  const [history, setHistory] = useState<HealthMetrics[]>([defaultMetrics]);

  const updateMetrics = useCallback((newMetrics: Partial<HealthMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  }, []);

  const addHistoryRecord = useCallback((record: HealthMetrics) => {
    setMetrics(record);
    setHistory(prev => [record, ...prev].slice(0, 50)); // Keep last 50 records
  }, []);

  const value = useMemo(() => ({ metrics, history, updateMetrics, addHistoryRecord }), [metrics, history, updateMetrics, addHistoryRecord]);

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
