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
  apiKey: 'AIzaSyAs_ilNfv55xA35y4tY4fbbAopMBnMI8A8',
  authDomain: 'lds-project-97d49.firebaseapp.com',
  databaseURL: 'https://lds-project-97d49-default-rtdb.firebaseio.com',
  projectId: 'lds-project-97d49',
  storageBucket: 'lds-project-97d49.firebasestorage.app',
  messagingSenderId: '67203703590',
  appId: '1:67203703590:web:f954a08fb1577f1959d7e7',
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
