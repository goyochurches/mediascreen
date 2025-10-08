'use client'

import type { Screen } from '@/lib/types'
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import {
  FirestoreDataConverter,
  getFirestore,
  type Firestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let firebaseApp: FirebaseApp
let auth: Auth
let firestore: Firestore

function initialize() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    firebaseApp = getApps()[0]
  }
  auth = getAuth(firebaseApp)
  firestore = getFirestore(firebaseApp, '(default)')

  return { firebaseApp, auth, firestore }
}

export function initializeFirebase() {
  return initialize()
}

export const screenConverter: FirestoreDataConverter<Screen> = {
  toFirestore(screen: Screen) {
    return {
      name: screen.name,
      assignments: screen.assignments,
      userId: screen.userId,
      createdAt: screen.createdAt,
    }
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      assignments: data.assignments,
      userId: data.userId,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    }
  },
}

// FirestoreDataConverter for Playlist
export type Playlist = {
  id: string
  name: string
  mediaItemIds: string[]
  userId: string
  createdAt: Date
}

export const playlistConverter: FirestoreDataConverter<Playlist> = {
  toFirestore(playlist: Playlist) {
    return {
      name: playlist.name,
      mediaItemIds: playlist.mediaItemIds,
      userId: playlist.userId,
      createdAt: playlist.createdAt,
    }
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      mediaItemIds: data.mediaItemIds,
      userId: data.userId,
      createdAt: data.createdAt.toDate(),
    }
  },
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth as useFirebaseAuth,
  useFirestore,
} from './provider'

export { useAuth } from './auth/use-user'
export { FirebaseClientProvider } from './client-provider'
export { useCollection } from './use-collection'
export { useDoc } from './use-doc'
