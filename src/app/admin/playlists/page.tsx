"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Loader2, Trash2 } from "lucide-react";
import { useCollection } from "@/firebase/use-collection";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import type { Playlist } from "@/lib/types";
import { AdminHeader } from "../_components/admin-header";
import { useAuth } from "@/firebase/auth/use-user";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";


export default function PlaylistsPage() {
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const playlistsQuery = user && firestore ? query(collection(firestore, 'playlists'), where('userId', '==', user.uid)) : null;

  const { data: playlists, loading } = useCollection<Omit<Playlist, 'id' | 'userId' | 'createdAt'>>(playlistsQuery);

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "playlists", playlistId));
      toast({ title: "Playlist deleted successfully." });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the playlist." });
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Playlists</h2>
            <p className="text-muted-foreground">
              Create and manage your media playlists.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/playlists/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Playlist
            </Link>
          </Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : playlists && playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <TableRow key={playlist.id}>
                    <TableCell className="font-medium">{playlist.name}</TableCell>
                    <TableCell>{playlist.mediaItemIds.length} items</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                         <Link href={`/admin/playlists/${playlist.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Playlist</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete Playlist</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              playlist and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlaylist(playlist.id)}>
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
                  <TableCell colSpan={3} className="h-24 text-center">
                    No playlists found.
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
