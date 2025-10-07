"use client";

import { notFound, useParams } from 'next/navigation';
import MediaViewer from '@/components/media-viewer';

export default function ScreenDisplayPage() {
  const params = useParams();
  const screenId = params.screenId as string;

  if (!screenId) {
    // This can happen briefly on initial render, before router is ready.
    return <div className="bg-black w-screen h-screen"></div>;
  }
  
  // The logic has been moved to MediaViewer to support real-time updates.
  return (
    <div className="bg-black w-screen h-screen">
      <MediaViewer screenId={screenId} />
    </div>
  );
}
