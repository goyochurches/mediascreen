"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { playlistConverter, screenConverter } from '@/firebase';
import { useAuth } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/use-collection";
import { useToast } from "@/hooks/use-toast";
import type { Playlist, Screen } from "@/lib/types";
import { Timestamp, collection, deleteDoc, doc, query, where } from "firebase/firestore";
import { Edit, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "../_components/admin-header";

export default function ScreensPage() {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Apply FirestoreDataConverter to fix type issues
  const screensQuery = user && firestore
    ? query(
        collection(firestore, 'screens').withConverter(screenConverter),
        where('userId', '==', user.uid)
      )
    : null;

  const playlistsQuery = user && firestore
    ? query(
        collection(firestore, 'playlists').withConverter(playlistConverter),
        where('userId', '==', user.uid)
      )
    : null;
  
  const { data: screens, loading: screensLoading } = useCollection<Omit<Screen, 'id' | 'userId' | 'createdAt'>>(screensQuery);
  const { data: playlists, loading: playlistsLoading } = useCollection<Omit<Playlist, 'id' | 'userId' | 'createdAt'>>(playlistsQuery);

  const loading = screensLoading || playlistsLoading;

  const getPlaylistName = (id: string) => playlists?.find(p => p.id === id)?.name || 'Unknown';

  const handleDeleteScreen = async (screenId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "screens", screenId));
      toast({ title: "Screen deleted successfully." });
    } catch (error) {
      console.error("Error deleting screen:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the screen." });
    }
  };
  
  // Ensure proper scheme and domain concatenation
  const yourDomain = typeof window !== 'undefined' 
    ? `${window.location.hostname === 'localhost' ? 'http' : 'https'}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
    : '';

  return (
    <>
      <AdminHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Screens</h2>
            <p className="text-muted-foreground">
              Manage your display screens and their schedules.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/screens/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Screen
            </Link>
          </Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Screen URL</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                     <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : screens && screens.length > 0 ? (
                screens.map((screen) => (
                  <TableRow key={screen.id}>
                    <TableCell className="font-medium">{screen.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {screen.assignments.length > 0 ? screen.assignments.map((assignment, index) => (
                          <Badge key={index} variant="secondary" className="font-normal">
                            {getPlaylistName(assignment.playlistId)} ({assignment.startTime} - {assignment.endTime})
                          </Badge>
                        )) : <span className="text-muted-foreground text-sm">No assignments</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{`${yourDomain}/display/${screen.id}`}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`${yourDomain}/display/${screen.id}`)}
                        >
                          Copy
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActiveDisplaysBadge screenId={screen.id} />
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" asChild>
                         <Link href={`/admin/screens/${screen.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Screen</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete Screen</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              screen and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteScreen(screen.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No screens found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function ActiveDisplaysBadge({ screenId }: { screenId: string }) {
  const firestore = useFirestore();
  const threshold = Timestamp.fromDate(new Date(Date.now() - 45_000)); // last 45s
  const q = firestore
    ? query(
        collection(firestore, 'displaySessions'),
        where('screenId', '==', screenId),
        where('status', '==', 'open'),
        where('updatedAt', '>=', threshold),
      )
    : null;
  const { data } = useCollection<any>(q);
  const count = data?.length ?? 0;
  return (
    <Badge variant={count > 0 ? 'default' : 'secondary'}>
      {count} active
    </Badge>
  );
}
