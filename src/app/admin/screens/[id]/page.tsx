'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { useDoc } from '@/firebase/use-doc';
import { useToast } from '@/hooks/use-toast';
import type { PlaylistAssignment, Screen } from '@/lib/types';
import { playlistConverter, screenConverter, type Playlist as FirePlaylist } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, doc, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AdminHeader } from '../../_components/admin-header';

const screenFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Screen name must be at least 2 characters.',
  }),
});

const assignmentFormSchema = z.object({
    playlistId: z.string().min(1, { message: 'Please select a playlist.'}),
    dayOfWeek: z.array(z.number()).min(1, { message: 'Please select at least one day.'}),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format. Use HH:MM'}),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format. Use HH:MM'}),
}).refine(data => data.startTime < data.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
});


const days = [
  { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' }
];

export default function ScreenEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();

  const isNew = params.id === 'new';
  const screenId = isNew ? null : (params.id as string);

  const screenRef =
    firestore && user && screenId
      ? doc(firestore, 'screens', screenId).withConverter(screenConverter)
      : null;
  const { data: screenDoc, loading: screenLoading } = useDoc<Screen>(screenRef);
  
  const playlistsQuery = user && firestore
    ? query(
        collection(firestore, 'playlists').withConverter(playlistConverter),
        where('userId', '==', user.uid)
      )
    : null;
  const { data: playlists, loading: playlistsLoading } = useCollection<FirePlaylist>(playlistsQuery);

  const [assignments, setAssignments] = useState<PlaylistAssignment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  
  const screenForm = useForm<z.infer<typeof screenFormSchema>>({
    resolver: zodResolver(screenFormSchema),
    defaultValues: { name: '' },
  });

  const assignmentForm = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      playlistId: '',
      dayOfWeek: [],
      startTime: '09:00',
      endTime: '17:00'
    },
  });

  useEffect(() => {
    if (screenDoc?.exists()) {
      const data = screenDoc.data();
      screenForm.reset({ name: data.name });
      setAssignments(data.assignments || []);
    }
  }, [screenDoc, screenForm]);


  const loading = screenLoading || playlistsLoading;

  async function onScreenSubmit(values: z.infer<typeof screenFormSchema>) {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const screenData = {
      name: values.name,
      userId: user.uid,
      assignments: assignments,
    };

    try {
      if (isNew) {
        const newDocRef = await addDoc(collection(firestore, 'screens'), {
            ...screenData,
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Screen created!' });
        router.push(`/admin/screens/${newDocRef.id}`);
      } else {
        await setDoc(screenRef!, screenData, { merge: true });
        toast({ title: 'Screen updated!' });
      }
    } catch (error) {
      console.error('Error saving screen', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the screen.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onAssignmentSubmit(values: z.infer<typeof assignmentFormSchema>) {
    setAssignments([...assignments, values]);
    setIsAssignmentDialogOpen(false);
    assignmentForm.reset();
  }
  
  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  }

  const getPlaylistName = (id: string) => playlists?.find(p => p.id === id)?.name || 'Unknown Playlist';

  return (
    <>
      <AdminHeader />
      <div className="p-6">
        <Form {...screenForm}>
          <form onSubmit={screenForm.handleSubmit(onScreenSubmit)}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => router.push('/admin/screens')}>
                  <ArrowLeft />
                </Button>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{isNew ? 'Create Screen' : 'Edit Screen'}</h2>
                  <p className="text-muted-foreground">Manage the screen name and playlist schedule.</p>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                   <Card>
                    <CardHeader>
                      <CardTitle>Screen Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={screenForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Screen Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Lobby Display" {...field} disabled={isSubmitting} />
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
                            <CardTitle>Playlist Schedule</CardTitle>
                            <CardDescription>Assign playlists to run on this screen at specific times and days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                               {assignments.length > 0 ? (
                                    assignments.map((assignment, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                                            <div className="flex-grow space-y-1">
                                                <p className="font-semibold">{getPlaylistName(assignment.playlistId)}</p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {assignment.startTime} - {assignment.endTime}</div>
                                                    <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {assignment.dayOfWeek.map(d => days.find(day => day.id === d)?.label).join(', ')}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeAssignment(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                               ) : (
                                <p className="text-muted-foreground text-center py-8">No playlists scheduled for this screen.</p>
                               )}
                            </div>
                             <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="mt-4 w-full"><Plus className="mr-2 h-4 w-4"/> Add Assignment</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Schedule</DialogTitle>
                                    </DialogHeader>
                                    <Form {...assignmentForm}>
                                        <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-6">
                                            <FormField control={assignmentForm.control} name="playlistId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Playlist</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a playlist" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {playlists?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={assignmentForm.control} name="dayOfWeek" render={() => (
                                                <FormItem>
                                                    <FormLabel>Days to run</FormLabel>
                                                    <div className="flex flex-wrap gap-2">
                                                        {days.map(day => (
                                                            <FormField key={day.id} control={assignmentForm.control} name="dayOfWeek" render={({ field }) => (
                                                                <FormItem key={day.id} className="flex flex-row items-start space-x-2 space-y-0">
                                                                     <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(day.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                ? field.onChange([...(field.value || []), day.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== day.id))
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{day.label}</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <div className="grid grid-cols-2 gap-4">
                                                 <FormField control={assignmentForm.control} name="startTime" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Time</FormLabel>
                                                        <FormControl><Input type="time" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={assignmentForm.control} name="endTime" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Time</FormLabel>
                                                        <FormControl><Input type="time" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                                <Button type="submit">Add to Schedule</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
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
