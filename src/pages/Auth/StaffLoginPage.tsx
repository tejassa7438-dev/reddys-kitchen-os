import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { auth } from "../../services/firebase";

interface LocationState {
  from?: string;
}

// =========================================
// CHECK STAFF AUTHENTICATION
// =========================================

function isStaffUser(): boolean {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  // Anonymous customers are NOT staff.
  if (user.isAnonymous) {
    return false;
  }

  // Staff must be authenticated using
  // Firebase Email/Password.
  return user.providerData.some(
    (provider) =>
      provider.providerId === "password"
  );
}

// =========================================
// STAFF LOGIN PAGE
// =========================================

function StaffLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as LocationState | null;

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  // =======================================
  // WAIT FOR FIREBASE AUTH STATE
  // =======================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (
            user &&
            !user.isAnonymous &&
            user.providerData.some(
              (provider) =>
                provider.providerId ===
                "password"
            )
          ) {
            navigate(
              locationState?.from ||
                "/admin",
              {
                replace: true,
              }
            );

            return;
          }

          setCheckingAuth(false);
        }
      );

    return unsubscribe;
  }, [
    navigate,
    locationState?.from,
  ]);

  // =======================================
  // ALREADY LOGGED IN
  // =======================================

  if (
    !checkingAuth &&
    isStaffUser()
  ) {
    return (
      <Navigate
        to={
          locationState?.from ||
          "/admin"
        }
        replace
      />
    );
  }

  // =======================================
  // LOGIN
  // =======================================

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      // -----------------------------------
      // Verify that this is actually a
      // staff/email-password account.
      // -----------------------------------

      if (
        credential.user.isAnonymous ||
        !credential.user.providerData.some(
          (provider) =>
            provider.providerId ===
            "password"
        )
      ) {
        setError(
          "This account is not authorized as staff."
        );

        return;
      }

      // -----------------------------------
      // Firebase authentication is now
      // established.
      // -----------------------------------

      navigate(
        locationState?.from ||
          "/admin",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Staff login error:",
        error
      );

      setError(
        "Invalid staff email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // CHECKING AUTH
  // =======================================

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">
            🍽
          </div>

          <p className="text-gray-400">
            Checking staff authentication...
          </p>
        </div>
      </div>
    );
  }

  // =======================================
  // UI
  // =======================================

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            🍽
          </div>

          <h1 className="text-3xl font-bold text-red-500">
            REDDY'S KITCHEN
          </h1>

          <p className="text-gray-400 mt-2">
            Staff Login
          </p>

        </div>

        {/* Login Card */}

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-xl"
        >

          {/* Email */}

          <label
            htmlFor="staff-email"
            className="block text-sm font-semibold text-gray-300"
          >
            Staff Email
          </label>

          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="username"
            autoFocus
            required
            className="mt-2 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            placeholder="staff@example.com"
          />

          {/* Password */}

          <label
            htmlFor="staff-password"
            className="block text-sm font-semibold text-gray-300 mt-5"
          >
            Password
          </label>

          <input
            id="staff-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
            required
            className="mt-2 w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            placeholder="••••••••"
          />

          {/* Error */}

          {error && (
            <div className="mt-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 py-3.5 rounded-xl font-bold transition"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        {/* Back */}

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
          className="block mx-auto mt-6 text-gray-400 hover:text-white transition"
        >
          ← Back to Customer Menu
        </button>

      </div>

    </div>
  );
}

export default StaffLoginPage;