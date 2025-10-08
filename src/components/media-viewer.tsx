
"use client";

import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { useDoc } from '@/firebase/use-doc';
import type { MediaItem, Playlist, PopulatedAssignment, Screen } from '@/lib/types';
import { collection, doc, Firestore, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface MediaViewerProps {
  screenId: string;
}

// Custom hook to stabilize Firestore queries
function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

const MediaViewer = ({ screenId }: MediaViewerProps) => {
  const firestore = useFirestore() as Firestore;
  const [screenNotFound, setScreenNotFound] = useState(false);
  const [screenOwnerId, setScreenOwnerId] = useState<string | null>(null);

  const screenRef = useMemoFirebase(() => {
    if (!firestore || !screenId) return null;
    return doc(firestore, 'screens', screenId).withConverter<Omit<Screen, 'id'>>({
      toFirestore: (data) => data as any,
      fromFirestore: (snapshot) => snapshot.data() as Omit<Screen, 'id'>,
    });
  }, [firestore, screenId]);

  const { data: screen, loading: screenLoading } = useDoc<Omit<Screen, 'id'>>(screenRef);


  useEffect(() => {
    if (screenLoading) return;
    if (screen && screen.exists()) {
      setScreenOwnerId(screen.data().userId);
      setScreenNotFound(false);
    } else {
      setScreenNotFound(true);
    }
  }, [screen, screenLoading]);


  const playlistsRef = useMemoFirebase(() => {
    if (!firestore || !screenOwnerId) return null;
    return query(
      collection(firestore, 'playlists').withConverter<Omit<Playlist, 'id'>>({
        toFirestore: (data) => data as any,
        fromFirestore: (snapshot) => snapshot.data() as Omit<Playlist, 'id'>,
      }),
      where('userId', '==', screenOwnerId)
    );
  }, [firestore, screenOwnerId]);

  const mediaItemsRef = useMemoFirebase(() => {
    if (!firestore || !screenOwnerId) return null;
    return query(
      collection(firestore, 'mediaItems').withConverter<Omit<MediaItem, 'id'>>({
        toFirestore: (data) => data as any,
        fromFirestore: (snapshot) => snapshot.data() as Omit<MediaItem, 'id'>,
      }),
      where('userId', '==', screenOwnerId)
    );
  }, [firestore, screenOwnerId]);

  const { data: playlists, loading: playlistsLoading } = useCollection<Omit<Playlist, 'id'>>(playlistsRef);
  const { data: mediaItems, loading: mediaItemsLoading } = useCollection<Omit<MediaItem, 'id'>>(mediaItemsRef);

  const [assignments, setAssignments] = useState<PopulatedAssignment[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<MediaItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (screenLoading || !screen || !screen.exists() || playlistsLoading || mediaItemsLoading) {
      return;
    }

    if (!playlists || !mediaItems) {
      return;
    }

    const screenData = screen.data();
    if (!screenData) return;

    const populatedAssignments = screenData.assignments.map(assignment => {
      const playlist = playlists.find(p => p.id === assignment.playlistId);
      if (!playlist) return null;

      const populatedMedia = playlist.mediaItemIds
        .map(id => mediaItems.find(m => m.id === id))
        .filter((item): item is MediaItem => item !== undefined);

      // Omit playlistId to match PopulatedAssignment type
      const { playlistId: _omit, ...rest } = assignment;
      return {
        ...rest,
        media: populatedMedia,
      };
    }).filter((assignment): assignment is PopulatedAssignment => assignment !== null);

    setAssignments(populatedAssignments);

  }, [screen, playlists, mediaItems, screenLoading, playlistsLoading, mediaItemsLoading]);


  // Function to determine the active playlist based on schedule
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      // In a real app, you might want to handle timezones properly.
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const activeAssignment = assignments.find(a =>
        a.dayOfWeek.includes(currentDay) &&
        currentTime >= a.startTime &&
        currentTime < a.endTime
      );

      const newPlaylist = activeAssignment ? (activeAssignment.media.filter(Boolean) as MediaItem[]) : [];

      setActivePlaylist(currentPlaylist => {
        const currentIds = currentPlaylist.map(i => i.id).join(',');
        const newIds = newPlaylist.map(i => i.id).join(',');

        if (currentIds !== newIds) {
          console.log("Playlist has changed. Updating view.");
          setCurrentItemIndex(0);
          return newPlaylist;
        }
        return currentPlaylist;
      });
    };

    // Initial check
    checkSchedule();

    // Set up an interval to check for schedule changes (e.g., time crossing into a new slot)
    const scheduleInterval = setInterval(checkSchedule, 30000); // Check every 30 seconds

    return () => {
      clearInterval(scheduleInterval);
    };
  }, [assignments]);


  const goToNextItem = () => {
    if (activePlaylist.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentItemIndex(prevIndex => (prevIndex + 1) % activePlaylist.length);
      setIsFading(false);
    }, 500); // Must match CSS fade duration
  };

  const currentItem = activePlaylist[currentItemIndex];

  // Effect for handling auto-progression of images
  useEffect(() => {
    if (activePlaylist.length === 0 || !currentItem) return;

    if (currentItem.type === 'image') {
      const duration = (currentItem.duration || 5) * 1000;
      const timer = setTimeout(goToNextItem, duration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItemIndex, activePlaylist, currentItem]);

  const handleVideoError = () => {
    console.error(`Failed to load video: ${currentItem?.url}`);
    goToNextItem();
  };

  const isLoading = screenLoading || (screenOwnerId && (playlistsLoading || mediaItemsLoading));

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/80 text-2xl font-sans bg-black p-8 text-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
        <div>
          <p className='text-3xl font-bold mb-2 text-white'>{screen?.data()?.name || 'Screen'}</p>
          <p className="text-xl text-muted-foreground">Preparing your content...</p>
        </div>
      </div>
    )
  }

  if (screenNotFound) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/80 text-2xl font-sans bg-black p-8 text-center">
        <p className='text-4xl font-bold mb-2 text-white'>Screen Not Found</p>
        <p>The screen ID might be incorrect or it has been removed.</p>
      </div>
    );
  }

  if (activePlaylist.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/80 text-2xl font-sans bg-black p-8 text-center">
        <p className='text-4xl font-bold mb-2 text-white'>{screen?.data()?.name || 'Screen'}</p>
        <p>No content scheduled for this time.</p>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
        key={currentItem.id}
      >
        {currentItem.type === 'image' && (
          <Image
            src={currentItem.url}
            alt={currentItem.title}
            fill
            className="object-contain"
            priority={currentItemIndex === 0}
            data-ai-hint="background"
          />
        )}
        {currentItem.type === 'video' && (
          <video
            src={currentItem.url}
            autoPlay
            muted // Autoplay with sound is often blocked by browsers
            onEnded={goToNextItem}
            onError={handleVideoError}
            className="w-full h-full object-contain"
            playsInline // Important for iOS
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
