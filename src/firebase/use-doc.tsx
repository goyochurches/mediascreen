
"use client";

import { useState, useEffect } from 'react';
import type { DocumentReference, DocumentData, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

export interface UseDocHook<T> {
  data: DocumentSnapshot<T> | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null): UseDocHook<T> {
  const [data, setData] = useState<DocumentSnapshot<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (ref === null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(ref,
      (doc: DocumentSnapshot<T>) => {
        setData(doc);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error in useDoc:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // The ref dependency is now an object, so we stringify it to prevent re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref ? ref.path : null]);

  return { data, loading, error };
}
