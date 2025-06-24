"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "../../components/SupabaseAuthProvider";

const Auth = () => {
  const { supabase, session, loading: authLoading } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 254) {
      return "Email is too long";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (password.length > 128) {
      return "Password is too long";
    }
    // Check for common weak patterns
    if (password.toLowerCase() === password) {
      return "Password should contain at least one uppercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password should contain at least one number";
    }
    return "";
  };

  const sanitizeInput = (input) => {
    // Remove leading/trailing whitespace
    let sanitized = input.trim();
    // Remove any null bytes or other potentially dangerous characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    return sanitized;
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleEmailChange = (e) => {
    const sanitizedEmail = sanitizeInput(e.target.value);
    setEmail(sanitizedEmail);
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const sanitizedPassword = sanitizeInput(e.target.value);
    setPassword(sanitizedPassword);
    // Clear password error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  // google Identity Services script
  useEffect(() => {
    // ff auth is still loading or session exists dont need to show form or load GSI
    if (authLoading || session) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
      setFormLoading(false);
    };
    script.onerror = () => {
      setMessage(
        "Failed to load Google Sign-In script. Please check your network."
      );
      setFormLoading(false);
    };
    document.head.appendChild(script);

    // Clean up script on unmount
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [authLoading, session]); // if authLoading or session changes

  const initializeGoogleSignIn = () => {
    // check if google.accounts.id is available
    if (
      typeof window.google === "undefined" ||
      !window.google.accounts ||
      !window.google.accounts.id
    ) {
      console.warn(
        "Google Identity Services script not fully loaded or available."
      );
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        // fired when Google returns an ID token
        if (response.credential) {
          setMessage("Signing in with Google...");
          setFormLoading(true);
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (error) {
            setMessage(`Google sign-in error: ${error.message}`);
            console.error("Google sign-in error:", error);
          } else {
            // Success handled by SupabaseAuthProvider's onAuthStateChange listener
            setMessage("Successfully signed in with Google! Redirecting...");
          }
          setFormLoading(false);
        } else {
          setMessage("Google sign-in cancelled or failed to get credential.");
          console.error("Google sign-in failed: No credential received.");
        }
      },
    });

    // show google Sign-In button
    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large", type: "standard", shape: "pill" }
    );
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setMessage("Please fix the errors above before submitting.");
      return;
    }

    setFormLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(), // Normalize email to lowercase
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
      console.error("Login error:", error);
    } else {
      setMessage("Successfully logged in! Redirecting...");
    }
    setFormLoading(false);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setMessage("Please fix the errors above before submitting.");
      return;
    }

    setFormLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase(), // Normalize email to lowercase
      password,
    });

    if (error) {
      setMessage(`Sign up failed: ${error.message}`);
      console.error("Sign up error:", error);
    } else {
      setMessage("Check your email for the confirmation link!");
    }
    setFormLoading(false);
  };

  // show loading if the global auth loading is active or a session already exists
  if (authLoading || session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-inter">
        <p className="text-xl text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  // Render the auth form only if not loading and no session
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in or Sign up
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to your Supabase powered app!
          </p>
        </div>
        {message && (
          <div
            className={`p-3 rounded-md text-center ${
              message.includes("success") ||
              message.includes("Successfully") ||
              message.includes("Check your email")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                maxLength={254}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                maxLength={128}
              />
            </div>
          </div>

          {/* Error messages */}
          {errors.email && (
            <div className="text-red-600 text-sm mt-1">{errors.email}</div>
          )}
          {errors.password && (
            <div className="text-red-600 text-sm mt-1">{errors.password}</div>
          )}

          <div>
            <button
              type="submit"
              onClick={handleEmailSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={formLoading}
            >
              Sign In
            </button>
          </div>
          <div>
            <button
              type="submit"
              onClick={handleEmailSignUp}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={formLoading}
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between">
          <div className="w-full border-t border-gray-300"></div>
          <div className="px-4 text-sm text-gray-500">OR</div>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In button container */}
        <div className="mt-6 flex justify-center">
          <div id="googleSignInButton"></div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
