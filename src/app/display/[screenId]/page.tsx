"use client";

import MediaViewer from '@/components/media-viewer';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ScreenDisplayPage() {
  const params = useParams();
  const screenId = params.screenId as string;
  const [isFullScreen, setIsFullScreen] = useState(false);

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch((error) => console.error('Error entering fullscreen:', error));
    }
  };

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
