import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

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

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetrics>(defaultMetrics);
  const [history, setHistory] = useState<HealthMetrics[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ goal: "General Excellence", motivation: "Balanced", studyPreference: "Interactive" });
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    let unsubscribeHistory: () => void = () => {};
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch Profile
          const profilePath = `users/${user.uid}`;
          let profileDoc;
          try {
            profileDoc = await getDoc(doc(db, 'users', user.uid));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, profilePath);
          }

          if (profileDoc && profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          }

          // Listen for History
          const historyPath = `users/${user.uid}/history`;
          const historyRef = collection(db, 'users', user.uid, 'history');
          const q = query(historyRef, orderBy('date', 'desc'), limit(50));
          
          unsubscribeHistory = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => doc.data() as HealthMetrics);
            setHistory(records);
            if (records.length > 0) {
              setMetrics(records[0]);
            }
            setIsLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, historyPath);
            setIsLoading(false);
          });
        } catch (err) {
          console.error("Firestore initialization error:", err);
          setIsLoading(false);
        }
      } else {
        setHistory([defaultMetrics]);
        setMetrics(defaultMetrics);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeHistory();
    };
  }, []);

  const updateMetrics = useCallback(async (newMetrics: Partial<HealthMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics };
      // If logged in, we could potentially update the latest record or wait for explicit log
      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (newProfile: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (user) {
      const updated = { ...profile, ...newProfile };
      const profilePath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
        setProfile(updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, profilePath);
      }
    } else {
      setProfile(prev => ({ ...prev, ...newProfile }));
    }
  }, [profile]);

  const addHistoryRecord = useCallback(async (record: HealthMetrics) => {
    const user = auth.currentUser;
    const recordWithDate = { ...record, date: new Date().toISOString() };
    
    if (user) {
      const historyPath = `users/${user.uid}/history`;
      try {
        await addDoc(collection(db, 'users', user.uid, 'history'), recordWithDate);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, historyPath);
      }
    } else {
      setMetrics(recordWithDate);
      setHistory(prev => [recordWithDate, ...prev].slice(0, 50));
    }
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
