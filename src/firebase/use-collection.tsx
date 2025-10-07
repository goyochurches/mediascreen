
"use client";

import { useState, useEffect } from 'react';
import type { Query, DocumentData, QuerySnapshot, FirestoreError } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

export interface UseCollectionHook<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T extends DocumentData>(query: Query<T> | null): UseCollectionHook<T> {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (query === null) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(query, 
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error in useCollection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // The query dependency is now an object, so we stringify it to prevent re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query ? JSON.stringify(query) : null]);

  return { data, loading, error };
}
