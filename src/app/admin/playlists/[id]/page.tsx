'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { useDoc } from '@/firebase/use-doc';
import { useToast } from '@/hooks/use-toast';
import type { MediaItem, Playlist } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, query, QueryDocumentSnapshot, serverTimestamp, setDoc, where } from 'firebase/firestore';
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Video
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AdminHeader } from '../../_components/admin-header';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Playlist name must be at least 2 characters.',
  }),
});

export default function PlaylistEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();

  const isNew = params.id === 'new';
  const playlistId = isNew ? null : (params.id as string);

  const playlistConverter = {
    toFirestore: (data: Omit<Playlist, 'id'>) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
      snapshot.data() as Omit<Playlist, 'id'>,
  };

  const playlistRef =
    firestore && user && playlistId
      ? doc(firestore, 'playlists', playlistId).withConverter(playlistConverter)
      : null;
  const { data: playlistDoc, loading: playlistLoading } = useDoc<
    Omit<Playlist, 'id'>
  >(playlistRef);

  const mediaItemConverter = {
    toFirestore: (data: Omit<MediaItem, 'id' | 'createdAt'>) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
      snapshot.data() as Omit<MediaItem, 'id' | 'createdAt'>,
  };
  
  const mediaItemsQuery =
    user && firestore
      ? query(
          collection(firestore, 'mediaItems').withConverter(mediaItemConverter),
          where('userId', '==', user.uid)
        )
      : null;
  const { data: mediaItems, loading: mediaLoading } = useCollection<
    Omit<MediaItem, 'id' | 'createdAt'>
  >(mediaItemsQuery);

  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (playlistDoc?.exists()) {
      const data = playlistDoc.data();
      form.reset({ name: data.name });
      setSelectedMedia(data.mediaItemIds || []);
    }
  }, [playlistDoc, form]);

  const loading = playlistLoading || mediaLoading;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const playlistData = {
      name: values.name,
      userId: user.uid,
      mediaItemIds: selectedMedia,
    };

    try {
      if (isNew) {
        const newDocRef = await addDoc(collection(firestore, 'playlists'), {
          ...playlistData,
           createdAt: serverTimestamp(),
        });
        toast({ title: 'Playlist created!' });
        router.push(`/admin/playlists/${newDocRef.id}`);
      } else {
        await setDoc(playlistRef!, playlistData, { merge: true });
        toast({ title: 'Playlist updated!' });
      }
    } catch (error) {
      console.error('Error saving playlist', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save the playlist.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleMediaSelect = (mediaId: string, checked: boolean) => {
    setSelectedMedia((prev) =>
      checked ? [...prev, mediaId] : prev.filter((id) => id !== mediaId)
    );
  };
  
  const orderedSelectedMedia = selectedMedia
    .map(id => mediaItems?.find(m => m.id === id))
    .filter((item): item is MediaItem => !!item);

  return (
    <>
      <AdminHeader />
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                 </Button>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {isNew ? 'Create Playlist' : 'Edit Playlist'}
                  </h2>
                  <p className="text-muted-foreground">
                    Manage the items and order for this playlist.
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Playlist Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Playlist Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Morning Loop"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <Card>
                    <CardHeader>
                      <CardTitle>Playlist Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orderedSelectedMedia.length > 0 ? (
                           orderedSelectedMedia.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md">
                               <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                               {item.type === 'image' ? (
                                <Image src={item.url} alt={item.title} width={80} height={45} className="rounded-md object-cover aspect-video" />
                               ) : (
                                <div className="w-20 h-[45px] flex items-center justify-center bg-muted rounded-md">
                                    <Video className="w-6 h-6 text-muted-foreground" />
                                </div>
                               )}
                               <div className="flex-grow">
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                               </div>
                               <Button variant="ghost" size="icon" onClick={() => handleMediaSelect(item.id, false)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                            </div>
                           ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No items in this playlist yet.</p>
                        )}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="mt-4 w-full">
                                <Plus className="mr-2 h-4 w-4"/> Add Media
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add media to your playlist</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-4">
                                {mediaItems?.map(item => (
                                    <div key={item.id} className="relative group">
                                        <label htmlFor={item.id} className="cursor-pointer">
                                            {item.type === 'image' ? (
                                                <Image src={item.url} alt={item.title} width={200} height={112} className="rounded-md object-cover aspect-video"/>
                                            ) : (
                                                <div className="w-full aspect-video flex items-center justify-center bg-muted rounded-md">
                                                    <Video className="w-8 h-8 text-muted-foreground"/>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <p className="text-white text-center text-sm p-2">{item.title}</p>
                                            </div>
                                             <div className="absolute top-2 right-2">
                                                <Checkbox id={item.id} checked={selectedMedia.includes(item.id)} onCheckedChange={(checked) => handleMediaSelect(item.id, !!checked)} />
                                             </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                   </Card>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </>
  );
}
