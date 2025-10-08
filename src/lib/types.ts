import { FirestoreDataConverter } from 'firebase/firestore'

export type UserProfile = {
  displayName: string
  email: string
}

export type MediaItem = {
  id: string
  title: string
  type: 'image' | 'video'
  url: string
  /** Duration in seconds for images */
  duration?: number
  /** ID of the user who owns this item */
  userId: string
  createdAt: any // Firestore ServerTimestamp
}

export type Playlist = {
  id: string
  name: string
  mediaItemIds: string[]
  /** ID of the user who owns this item */
  userId: string
  createdAt: any // Firestore ServerTimestamp
}

export type PlaylistAssignment = {
  // no 'id' needed here as it's a sub-object
  playlistId: string
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  dayOfWeek: number[] // Array of days
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export type Screen = {
  id: string
  name: string
  assignments: PlaylistAssignment[]
  /** ID of the user who owns this item */
  userId: string
  createdAt: any // Firestore ServerTimestamp
}

// Internal type for viewer component
export type PopulatedAssignment = Omit<PlaylistAssignment, 'playlistId'> & {
  media: MediaItem[]
}

export const mediaItemConverter: FirestoreDataConverter<
  Omit<MediaItem, 'id' | 'userId'>
> = {
  toFirestore(item) {
    return item
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return {
      title: data.title,
      type: data.type,
      url: data.url,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    }
  },
}
