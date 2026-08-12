import {
  initializeApp,
} from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInAnonymously,
} from "firebase/auth";

import {
  getFunctions,
} from "firebase/functions";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

  apiKey:
    import.meta.env
      .VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env
      .VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env
      .VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env
      .VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env
      .VITE_FIREBASE_APP_ID,

};


// =========================================
// STAFF / ADMIN APP
// =========================================

const app =
  initializeApp(
    firebaseConfig
  );


// =========================================
// STAFF / ADMIN FIRESTORE
// =========================================

export const db =
  getFirestore(
    app
  );


// =========================================
// STAFF / ADMIN AUTH
// =========================================
//
// Used by:
// - Staff Login
// - Kitchen
// - Admin
// - Billing
// - Table Management
//
// =========================================

export const auth =
  getAuth(
    app
  );


// =========================================
// STAFF / ADMIN FUNCTIONS
// =========================================

export const functions =
  getFunctions(
    app
  );


// =========================================
// CUSTOMER APP
// =========================================
//
// Separate Firebase app instance.
//
// Same Firebase project.
// Separate authentication state.
//
// IMPORTANT:
// This prevents customer anonymous auth
// from logging out staff/admin auth.
//
// =========================================

const customerApp =
  initializeApp(
    firebaseConfig,
    "customer-app"
  );


// =========================================
// CUSTOMER AUTH
// =========================================

export const customerAuth =
  getAuth(
    customerApp
  );


// =========================================
// CUSTOMER AUTH PERSISTENCE
// =========================================
//
// IMPORTANT:
//
// Keep the anonymous customer session in
// browser local storage.
//
// This prevents a new anonymous UID from
// being created every time the customer
// moves between Menu / Cart / Checkout.
//
// =========================================

const customerPersistence =
  setPersistence(
    customerAuth,
    browserLocalPersistence
  );


// =========================================
// CUSTOMER FIRESTORE
// =========================================
//
// Requests made using customerDb use the
// customerAuth credentials.
//
// =========================================

export const customerDb =
  getFirestore(
    customerApp
  );


// =========================================
// CUSTOMER AUTHENTICATION
// =========================================

export async function ensureCustomerAuth(): Promise<string> {

  // ---------------------------------------
  // Wait for persistence initialization
  // ---------------------------------------

  await customerPersistence;


  // ---------------------------------------
  // Existing customer session
  // ---------------------------------------

  if (
    customerAuth.currentUser
  ) {

    return customerAuth
      .currentUser
      .uid;

  }


  // ---------------------------------------
  // Create anonymous customer session
  // ---------------------------------------

  const credential =
    await signInAnonymously(
      customerAuth
    );


  return credential.user.uid;

}