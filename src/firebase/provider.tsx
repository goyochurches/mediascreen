'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeFirebase } from './index';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseContextValue>({
    firebaseApp: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    // initializeFirebase is imported from './index'
    const firebaseServices = initializeFirebase();
    setServices(firebaseServices);
  }, []);

  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().firebaseApp;
}

export const useAuth = (): Auth | null => {
  return useFirebase().auth;
}

export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
}
