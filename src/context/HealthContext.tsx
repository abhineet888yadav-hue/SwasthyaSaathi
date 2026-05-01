import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';

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

interface UserProfile {
  goal: string;
  motivation: string;
  studyPreference: string;
}

interface HealthContextType {
  metrics: HealthMetrics;
  history: HealthMetrics[];
  profile: UserProfile;
  updateMetrics: (newMetrics: Partial<HealthMetrics>) => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  addHistoryRecord: (record: HealthMetrics) => void;
  isLoading: boolean;
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

const STORAGE_KEYS = {
  METRICS: 'saathi_metrics',
  HISTORY: 'saathi_history',
  PROFILE: 'saathi_profile'
};

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetrics>(defaultMetrics);
  const [history, setHistory] = useState<HealthMetrics[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ goal: "General Excellence", motivation: "Balanced", studyPreference: "Interactive" });
  const [isLoading, setIsLoading] = useState(true);

  // Sync with LocalStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

        if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedProfile) setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error("Local context initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateMetrics = useCallback((newMetrics: Partial<HealthMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics };
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...newProfile };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addHistoryRecord = useCallback((record: HealthMetrics) => {
    const recordWithDate = { ...record, date: new Date().toISOString() };
    setMetrics(recordWithDate);
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(recordWithDate));
    
    setHistory(prev => {
      const updatedHistory = [recordWithDate, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const value = useMemo(() => ({ 
    metrics, 
    history, 
    profile,
    isLoading,
    updateMetrics, 
    updateProfile,
    addHistoryRecord 
  }), [metrics, history, profile, isLoading, updateMetrics, updateProfile, addHistoryRecord]);

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
