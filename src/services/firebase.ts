import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Auth, Persistence, getAuth, initializeAuth, signInAnonymously } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

declare const process: {
  env?: Record<string, string | undefined>;
};

type FirebaseRuntime = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let runtime: FirebaseRuntime | null | undefined;

type ReactNativePersistenceFactory = (
  storage: typeof ReactNativeAsyncStorage,
) => Persistence;

function readEnv(name: string): string {
  const env = process.env ?? {};

  if (name === 'EXPO_PUBLIC_FIREBASE_API_KEY') {
    return env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? '';
  }
  if (name === 'EXPO_PUBLIC_FIREBASE_APP_ID') {
    return env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? '';
  }
  if (name === 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') {
    return env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '';
  }
  if (name === 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') {
    return env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '';
  }
  if (name === 'EXPO_PUBLIC_FIREBASE_PROJECT_ID') {
    return env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '';
  }
  if (name === 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET') {
    return env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? '';
  }

  return '';
}

export function getFirebaseRuntime(): FirebaseRuntime | null {
  if (runtime !== undefined) {
    return runtime;
  }

  const config = {
    apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    appId: readEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
    authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    messagingSenderId: readEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  };

  const hasConfig = Object.values(config).every(Boolean);
  if (!hasConfig) {
    runtime = null;
    return runtime;
  }

  try {
    const app = getApps()[0] ?? initializeApp(config);
    const getReactNativePersistence = (
      FirebaseAuth as unknown as {
        getReactNativePersistence?: ReactNativePersistenceFactory;
      }
    ).getReactNativePersistence;

    let auth: Auth;
    try {
      auth = getReactNativePersistence
        ? initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        })
        : getAuth(app);
    } catch {
      auth = getAuth(app);
    }

    runtime = {
      app,
      auth,
      db: getFirestore(app),
    };
  } catch {
    runtime = null;
  }

  return runtime;
}

export function isFirebaseEnabled(): boolean {
  return getFirebaseRuntime() !== null;
}

export async function ensureAnonymousUserId(): Promise<string | null> {
  const firebase = getFirebaseRuntime();
  if (!firebase) return null;

  const existingUid = firebase.auth.currentUser?.uid;
  if (existingUid) return existingUid;

  const credential = await signInAnonymously(firebase.auth);
  return credential.user.uid;
}
