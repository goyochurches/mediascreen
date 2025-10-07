"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Monitor, ListVideo, Image as ImageIcon, Loader2 } from "lucide-react";
import { useCollection } from "@/firebase/use-collection";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where } from "firebase/firestore";
import { AdminHeader } from "./_components/admin-header";
import { useAuth } from "@/firebase/auth/use-user";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user } = useAuth();

  const screensQuery = user && firestore ? query(collection(firestore, 'screens'), where('userId', '==', user.uid)) : null;
  const playlistsQuery = user && firestore ? query(collection(firestore, 'playlists'), where('userId', '==', user.uid)) : null;
  const mediaItemsQuery = user && firestore ? query(collection(firestore, 'mediaItems'), where('userId', '==', user.uid)) : null;

  const { data: screens, loading: screensLoading } = useCollection(screensQuery);
  const { data: playlists, loading: playlistsLoading } = useCollection(playlistsQuery);
  const { data: mediaItems, loading: mediaItemsLoading } = useCollection(mediaItemsQuery);
  
  const loading = screensLoading || playlistsLoading || mediaItemsLoading;

  const stats = [
    {
      title: "Screens",
      value: screens?.length ?? 0,
      icon: Monitor,
      description: "Total configured display screens.",
    },
    {
      title: "Playlists",
      value: playlists?.length ?? 0,
      icon: ListVideo,
      description: "Total media playlists.",
    },
    {
      title: "Content Items",
      value: mediaItems?.length ?? 0,
      icon: ImageIcon,
      description: "Total images and videos in the library.",
    },
  ];

  return (
    <>
      <AdminHeader />
      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName || 'Admin'}!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your MediaScreen setup.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the navigation on the left to manage your screens, playlists, and media content. You can schedule different playlists for different times of day on each screen.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
