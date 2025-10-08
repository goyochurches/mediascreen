'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { useToast } from '@/hooks/use-toast';
import { mediaItemConverter, type MediaItem } from '@/lib/types';
import {
  addDoc,
  collection,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { Image as ImageIcon, Loader2, PlusCircle, Video } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { AdminHeader } from '../_components/admin-header';

export default function ContentPage() {
  const firestore = useFirestore();
  const { user } = useAuth();

const mediaItemsQuery = useMemo(() => {
  if (user && firestore) {
    return query(
      collection(firestore, 'mediaItems').withConverter(mediaItemConverter),
      where('userId', '==', user.uid)
    );
  }
  return null;
}, [user, firestore]);

  const { data: mediaItems, loading } = useCollection<
    Omit<MediaItem, 'id' | 'userId'>
  >(mediaItemsQuery);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddMedia = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'image' | 'video';
    const url = formData.get('url') as string;

    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add media.',
      });
      setIsSubmitting(false);
      return;
    }

    const newMedia: Omit<MediaItem, 'id'> = {
      title,
      type,
      url,
      userId: user.uid,
    };
    if (newMedia.type === 'image') {
      newMedia.duration = 5;
    }

    try {
      const collectionRef = collection(firestore, 'mediaItems');
      await addDoc(collectionRef, {
        ...newMedia,
        createdAt: serverTimestamp(),
      });

      setOpen(false);
      toast({
        title: 'Media Added',
        description: `"${newMedia.title}" has been added to the library.`,
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not add the media item. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Content Library</h2>
            <p className="text-muted-foreground">
              Manage all your images and videos.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Media
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Media</DialogTitle>
                <DialogDescription>
                  Add a new image or video to your library by providing a URL.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMedia} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    className="col-span-3"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    name="type"
                    required
                    defaultValue="image"
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    name="url"
                    className="col-span-3"
                    placeholder="https://example.com/media.jpg"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add to Library
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : mediaItems && mediaItems.length > 0 ? (
                mediaItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.type === 'image' ? (
                        <Image
                          src={item.url}
                          alt={item.title}
                          width={64}
                          height={36}
                          className="rounded-md object-cover aspect-video"
                        />
                      ) : (
                        <div className="w-16 h-9 flex items-center justify-center bg-muted rounded-md">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Video className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-xs">
                      {item.url}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No content found.
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
