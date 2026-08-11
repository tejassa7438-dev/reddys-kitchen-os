import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "../../services/firebase";

interface Props {
  children: ReactNode;
}

// =========================================
// CHECK STAFF USER
// =========================================

function isStaffUser(
  user: User | null
): boolean {
  if (!user) {
    return false;
  }

  // Anonymous customers are NOT staff.
  if (user.isAnonymous) {
    return false;
  }

  // Staff must use Firebase Email/Password.
  return user.providerData.some(
    (provider) =>
      provider.providerId === "password"
  );
}

// =========================================
// PROTECTED ROUTE
// =========================================

function ProtectedRoute({
  children,
}: Props) {
  const location = useLocation();

  const [user, setUser] =
    useState<User | null>(
      auth.currentUser
    );

  const [checking, setChecking] =
    useState(true);

  // =======================================
  // FIREBASE AUTH STATE
  // =======================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setChecking(false);
        }
      );

    return unsubscribe;
  }, []);

  // =======================================
  // CHECKING AUTH
  // =======================================

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="text-4xl mb-4">
            🍽
          </div>

          <p className="text-gray-400">
            Checking staff access...
          </p>

        </div>
      </div>
    );
  }

  // =======================================
  // NOT STAFF
  // =======================================

  if (!isStaffUser(user)) {
    return (
      <Navigate
        to="/staff-login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  // =======================================
  // STAFF VERIFIED
  // =======================================

  return <>{children}</>;
}

export default ProtectedRoute;