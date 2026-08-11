import {
  initializeApp,
} from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getAuth,
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
//
// Default Firebase app.
//
// Used by:
// - Staff Login
// - Kitchen
// - Admin
// - Billing
// - Table Management
//
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
// CUSTOMER FIRESTORE
// =========================================
//
// IMPORTANT:
//
// This Firestore instance belongs to the
// customer Firebase app.
//
// Therefore requests made with this
// instance use customerAuth credentials.
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