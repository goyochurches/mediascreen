"use client";

import MediaViewer from '@/components/media-viewer';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase/provider';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function ScreenDisplayPage() {
  const params = useParams();
  const screenId = params.screenId as string;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const firestore = useFirestore();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((error) => console.error('Error entering fullscreen:', error));
    }
  };

  // Keep local state in sync with actual fullscreen status
  useEffect(() => {
    const onChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Try to enter fullscreen automatically on page load.
  // If the browser blocks it due to missing user gesture, the fallback button remains.
  useEffect(() => {
    // Small delay to allow mounting/route ready
    const id = setTimeout(() => {
      if (!document.fullscreenElement) {
        enterFullScreen();
      }
    }, 100);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.exitFullscreen();
          setIsFullScreen(false);
        }
      };

      window.addEventListener('keydown', handleEscape);

      return () => {
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isFullScreen]);

  // Presence tracking: create a session and send heartbeats
  useEffect(() => {
    if (!firestore || !screenId) return;

    let interval: number | null = null;
    let currentSessionId: string | null = null;

    const startSession = async () => {
      try {
        const sessionsCol = collection(firestore, 'displaySessions');
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
        const res = await addDoc(sessionsCol, {
          screenId,
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'open',
          userAgent: ua,
        });
        currentSessionId = res.id;
        setSessionId(res.id);

        // Heartbeat every 15s
        interval = window.setInterval(async () => {
          try {
            if (!currentSessionId) return;
            await setDoc(
              doc(firestore, 'displaySessions', currentSessionId),
              { updatedAt: serverTimestamp(), status: 'open' },
              { merge: true }
            );
          } catch (e) {
            console.error('Heartbeat error', e);
          }
        }, 15000);

        // On unload, mark as closed
        const onUnload = async () => {
          try {
            if (!currentSessionId) return;
            await setDoc(
              doc(firestore, 'displaySessions', currentSessionId),
              { status: 'closed', closedAt: serverTimestamp(), updatedAt: serverTimestamp() },
              { merge: true }
            );
          } catch (e) {
            // ignore
          }
        };
        window.addEventListener('beforeunload', onUnload);
        window.addEventListener('pagehide', onUnload);

        return () => {
          window.removeEventListener('beforeunload', onUnload);
          window.removeEventListener('pagehide', onUnload);
        };
      } catch (e) {
        console.error('Failed to start display session', e);
      }
    };

    const cleanup = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    const unsubPromise = startSession();
    return () => {
      cleanup();
      // best-effort mark closed on unmount
      if (firestore && currentSessionId) {
        setDoc(
          doc(firestore, 'displaySessions', currentSessionId),
          { status: 'closed', closedAt: serverTimestamp(), updatedAt: serverTimestamp() },
          { merge: true }
        ).catch(() => {});
      }
    };
  }, [firestore, screenId]);

  if (!screenId) {
    // This can happen briefly on initial render, before router is ready.
    return <div className="bg-black w-screen h-screen"></div>;
  }
  
  // The logic has been moved to MediaViewer to support real-time updates.
  return (
    <div className="bg-black w-screen h-screen">
      <MediaViewer screenId={screenId} />
      {!isFullScreen && (
        <button
          onClick={enterFullScreen}
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black text-white text-xl"
        >
          Click to enter full screen
        </button>
      )}
    </div>
  );
}
