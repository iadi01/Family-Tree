import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC95qBVUMb-fz12rFqyLFlX0owRNwR7NDs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "family-tree-org.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "family-tree-org",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "family-tree-org.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029563830388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029563830388:web:3e57120cf0f50e218a8121",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WZBTDYPFS8",
};

// Safe singleton initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

const PHOTOS_COLLECTION = "family_photos";
const CHILDREN_DOC_REF = () => doc(db, "family_data", "children");

/**
 * Save a family member's photo directly into Firestore.
 * Stored as a lightweight, compressed photo (100% free on Spark plan, no credit card or Blaze required!).
 */
export async function uploadFamilyPhoto(memberId: string, base64Photo: string): Promise<string> {
  const photoDocRef = doc(db, PHOTOS_COLLECTION, memberId);
  await setDoc(photoDocRef, {
    photo: base64Photo,
    updatedAt: Date.now(),
  });
  return base64Photo;
}

/**
 * Remove/reset custom photo for a family member
 */
export async function removeFamilyPhoto(memberId: string): Promise<void> {
  const photoDocRef = doc(db, PHOTOS_COLLECTION, memberId);
  await deleteDoc(photoDocRef);
}

/**
 * Real-time listener for all family photos across all devices
 */
export function subscribeToPhotos(
  onUpdate: (photos: Record<string, string>) => void,
): () => void {
  return onSnapshot(
    collection(db, PHOTOS_COLLECTION),
    (snapshot) => {
      const photos: Record<string, string> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && typeof data.photo === "string") {
          photos[d.id] = data.photo;
        }
      });
      onUpdate(photos);
    },
    (err) => {
      console.error("Firestore photos listener error:", err);
    },
  );
}

export type CustomChild = {
  id: string;
  name: string;
  relation: string;
  img?: string;
};

/**
 * Real-time listener for custom added children
 */
export function subscribeToChildren(
  onUpdate: (childrenMap: Record<string, CustomChild[]>) => void,
): () => void {
  return onSnapshot(
    CHILDREN_DOC_REF(),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Record<string, any>;
        const result: Record<string, CustomChild[]> = {};
        for (const [key, value] of Object.entries(data)) {
          if (key !== "updatedAt" && Array.isArray(value)) {
            result[key] = value as CustomChild[];
          }
        }
        onUpdate(result);
      } else {
        onUpdate({});
      }
    },
    (err) => {
      console.error("Firestore children listener error:", err);
    },
  );
}

/**
 * Add a custom child under a parent branch and save to Firestore
 */
export async function saveCustomChild(
  parentId: string,
  child: CustomChild,
): Promise<void> {
  const docSnap = await getDoc(CHILDREN_DOC_REF());
  const existing = docSnap.exists() ? (docSnap.data()[parentId] as CustomChild[]) || [] : [];
  const updated = [...existing, child];

  await setDoc(
    CHILDREN_DOC_REF(),
    {
      [parentId]: updated,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}
